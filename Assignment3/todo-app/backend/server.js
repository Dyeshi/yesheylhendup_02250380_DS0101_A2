const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

/* =========================
   SAFE MODE (NO CRASH DB)
========================= */

let pool = null;

if (
  process.env.DB_HOST &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_NAME &&
  process.env.DB_PORT
) {
  try {
    const { Pool } = require("pg");

    pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: String(process.env.DB_PASSWORD),
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    console.log("✅ PostgreSQL config loaded");
  } catch (err) {
    console.log("⚠️ DB not available, switching to memory mode");
  }
}

/* =========================
   MEMORY STORAGE (FALLBACK)
========================= */

let tasks = [];
let id = 1;

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: pool ? "connected mode" : "memory mode",
  });
});

/* =========================
   GET TASKS
========================= */

app.get("/tasks", async (req, res) => {
  try {
    if (pool) {
      const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
      return res.json(result.rows);
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CREATE TASK
========================= */

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (pool) {
      const result = await pool.query(
        "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
        [title]
      );
      return res.json(result.rows[0]);
    }

    const newTask = { id: id++, title, completed: false };
    tasks.push(newTask);
    res.json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE TASK
========================= */

app.put("/tasks/:id", async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { completed } = req.body;

    if (pool) {
      const result = await pool.query(
        "UPDATE tasks SET completed=$1 WHERE id=$2 RETURNING *",
        [completed, taskId]
      );
      return res.json(result.rows[0]);
    }

    const task = tasks.find((t) => t.id == taskId);
    if (task) task.completed = completed;

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE TASK
========================= */

app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id: taskId } = req.params;

    if (pool) {
      await pool.query("DELETE FROM tasks WHERE id=$1", [taskId]);
      return res.sendStatus(204);
    }

    tasks = tasks.filter((t) => t.id != taskId);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

module.exports = app;