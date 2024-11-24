// Database Setup
const mongoose = require("mongoose");
const express = require("express");
const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/taskmanager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  wallet: String,
  balance: { type: Number, default: 0 },
});

const TaskSchema = new mongoose.Schema({
  description: String,
  reward: Number,
  media: String,
});

const TaskSubmissionSchema = new mongoose.Schema({
  taskId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  proofText: String,
  proofMedia: String,
  status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
});

// Models
const User = mongoose.model("User", UserSchema);
const Task = mongoose.model("Task", TaskSchema);
const TaskSubmission = mongoose.model("TaskSubmission", TaskSubmissionSchema);

// API Routes

// Users CRUD
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});

app.put("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Tasks CRUD
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Task Submissions CRUD
app.get("/task-submissions", async (req, res) => {
  const submissions = await TaskSubmission.find();
  res.json(submissions);
});

app.post("/task-submissions", async (req, res) => {
  const submission = new TaskSubmission(req.body);
  await submission.save();
  res.status(201).json(submission);
});

app.put("/task-submissions/:id", async (req, res) => {
  const submission = await TaskSubmission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(submission);
});

app.delete("/task-submissions/:id", async (req, res) => {
  await TaskSubmission.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
