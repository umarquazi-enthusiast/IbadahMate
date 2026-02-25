import express from "express";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./src/server/db.ts";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "ibadahmate_secret_key_123";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
      const result = stmt.run(name, email, hashedPassword);
      const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, name, email, totalReward: 0 } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, totalReward: user.totalReward } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Middleware to verify JWT
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Data Routes
  app.get("/api/records/today", authenticate, (req: any, res) => {
    const date = new Date().toISOString().split("T")[0];
    const record = db.prepare("SELECT * FROM daily_records WHERE userId = ? AND date = ?").get(req.user.id, date);
    res.json(record || { fardPrayers: "{}", naflPrayers: "{}", tilawat: "{}", mamulat: "{}", goodDeeds: "{}", dailyTotal: 0 });
  });

  app.post("/api/records/save", authenticate, (req: any, res) => {
    const { date, fardPrayers, naflPrayers, tilawat, mamulat, goodDeeds, dailyTotal } = req.body;
    const userId = req.user.id;

    const existing: any = db.prepare("SELECT dailyTotal FROM daily_records WHERE userId = ? AND date = ?").get(userId, date);
    const diff = dailyTotal - (existing?.dailyTotal || 0);

    const stmt = db.prepare(`
      INSERT INTO daily_records (userId, date, fardPrayers, naflPrayers, tilawat, mamulat, goodDeeds, dailyTotal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(userId, date) DO UPDATE SET
        fardPrayers = excluded.fardPrayers,
        naflPrayers = excluded.naflPrayers,
        tilawat = excluded.tilawat,
        mamulat = excluded.mamulat,
        goodDeeds = excluded.goodDeeds,
        dailyTotal = excluded.dailyTotal
    `);

    stmt.run(
      userId,
      date,
      JSON.stringify(fardPrayers),
      JSON.stringify(naflPrayers),
      JSON.stringify(tilawat),
      JSON.stringify(mamulat),
      JSON.stringify(goodDeeds),
      dailyTotal
    );

    // Update user total reward
    db.prepare("UPDATE users SET totalReward = totalReward + ? WHERE id = ?").run(diff, userId);

    res.json({ success: true });
  });

  app.get("/api/stats", authenticate, (req: any, res) => {
    const records = db.prepare("SELECT date, dailyTotal FROM daily_records WHERE userId = ? ORDER BY date ASC").all(req.user.id);
    const totals = db.prepare("SELECT totalReward FROM users WHERE id = ?").get(req.user.id);
    res.json({ records, totalReward: totals.totalReward });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
