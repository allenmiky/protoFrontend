// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 1️⃣ CORS setup: allow your Vercel frontend
app.use(cors({
  origin: "https://protodo-4bpjkxxbi-allenmikys-projects.vercel.app", // frontend URL
  credentials: true
}));

// 2️⃣ Body parser
app.use(express.json());

// 3️⃣ Sample in-memory data (replace with DB in production)
let users = [
  { id: 1, email: "test@example.com", password: "123456" }
];
let boards = [];
let tasks = [];

// -------- Auth Routes --------
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  // In real app, generate JWT token here
  res.json({ message: "Login successful", token: "fake-jwt-token" });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email))
    return res.status(400).json({ message: "Email already exists" });

  const newUser = { id: users.length + 1, email, password };
  users.push(newUser);
  res.json({ message: "User registered", user: newUser });
});

// -------- Board Routes --------
app.post("/api/boards", (req, res) => {
  const { name } = req.body;
  const board = { id: boards.length + 1, name, archived: false };
  boards.push(board);
  res.json(board);
});

app.delete("/api/boards/:id", (req, res) => {
  const id = parseInt(req.params.id);
  boards = boards.filter(b => b.id !== id);
  res.json({ message: "Board deleted" });
});

app.put("/api/boards/:id/archive", (req, res) => {
  const id = parseInt(req.params.id);
  const board = boards.find(b => b.id === id);
  if (!board) return res.status(404).json({ message: "Board not found" });
  board.archived = true;
  res.json(board);
});

// -------- Task Routes --------
app.get("/api/tasks/:boardId", (req, res) => {
  const boardId = parseInt(req.params.boardId);
  const boardTasks = tasks.filter(t => t.boardId === boardId);
  res.json(boardTasks);
});

app.post("/api/tasks", (req, res) => {
  const task = { id: tasks.length + 1, ...req.body };
  tasks.push(task);
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.json({ message: "Task deleted" });
});

app.put("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  Object.assign(task, req.body);
  res.json(task);
});

// -------- Start Server --------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
