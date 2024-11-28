const express = require("express");
const cors = require('cors');
const mongoose = require("./db");

const allUsersRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");
const taskSubmissionRoutes = require("./routes/taskSubmissions");
const withdrawalRoutes = require("./routes/withdrawals");

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// Routes
app.use("/users", allUsersRoutes);
app.use("/tasks", taskRoutes);
app.use("/task-submissions", taskSubmissionRoutes);
app.use("/withdrawals", withdrawalRoutes);

// Start Server
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
