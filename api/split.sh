#!/bin/bash

# Check if the full code file exists
if [ ! -f "full_code.js" ]; then
    echo "Error: full_code.js not found!"
    exit 1
fi

# Create necessary directories
mkdir -p src/models src/routes

# Create database connection file
echo "Creating database connection..."
cat > src/db.js <<EOL
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/taskmanager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;
EOL

# Create schemas file
echo "Creating database schemas..."
cat > src/models/schemas.js <<EOL
const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  wallet: String,
  balance: { type: Number, default: 0 },
});

// Task Schema
const TaskSchema = new mongoose.Schema({
  description: String,
  reward: Number,
  media: String,
});

// Task Submission Schema
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

module.exports = { User, Task, TaskSubmission };
EOL

# Create user routes
echo "Creating user routes..."
cat > src/routes/users.js <<EOL
const express = require("express");
const { User } = require("../models/schemas");

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Create a new user
router.post("/", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});

// Update a user
router.put("/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});

// Delete a user
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
EOL

# Create task routes
echo "Creating task routes..."
cat > src/routes/tasks.js <<EOL
const express = require("express");
const { Task } = require("../models/schemas");

const router = express.Router();

// Get all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Create a new task
router.post("/", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
});

// Update a task
router.put("/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

// Delete a task
router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
EOL

# Create task submission routes
echo "Creating task submission routes..."
cat > src/routes/taskSubmissions.js <<EOL
const express = require("express");
const { TaskSubmission } = require("../models/schemas");

const router = express.Router();

// Get all task submissions
router.get("/", async (req, res) => {
  const submissions = await TaskSubmission.find();
  res.json(submissions);
});

// Create a new task submission
router.post("/", async (req, res) => {
  const submission = new TaskSubmission(req.body);
  await submission.save();
  res.status(201).json(submission);
});

// Update a task submission
router.put("/:id", async (req, res) => {
  const submission = await TaskSubmission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(submission);
});

// Delete a task submission
router.delete("/:id", async (req, res) => {
  await TaskSubmission.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
EOL

# Create server file
echo "Creating server file..."
cat > src/server.js <<EOL
const express = require("express");
const mongoose = require("./db");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");
const taskSubmissionRoutes = require("./routes/taskSubmissions");

const app = express();
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/task-submissions", taskSubmissionRoutes);

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
EOL

# Notify user
echo "Code split completed! Files created in the src/ directory."
