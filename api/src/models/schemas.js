const mongoose = require("mongoose");

// Admin Schema for 'admindb'
const AdminSchema = new mongoose.Schema({
  admin: String,
  ref: Number,
  cur: String,
  paychannel: String,
  bonus: Number,
  minimum: Number,
  botstat: String,
  withstat: String,
  subwallet: String,
  MKEY: String,
  MID: String,
  channels: [String],
}, { collection: 'admindb' });

// Task Proofs Schema for 'taskProofs'
const TaskProofSchema = new mongoose.Schema({
  userId: Number,
  taskId: mongoose.Schema.Types.ObjectId,
  proof: { text: String },
  reviewed: Boolean,
  timestamp: Date,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { collection: 'taskProofs' });

// All Users Schema for 'allUsers'
const AllUsersSchema = new mongoose.Schema({
  userID: Number,
  balance: Number,
  toWithdraw: Number,
  wallet: String,
  stats: String, // Optional field for statistics
  value: Number, // Optional field for statistics
}, { collection: 'allUsers' });

// Pending Users Schema for 'pendingUsers'
const PendingUsersSchema = new mongoose.Schema({
  userID: Number,
}, { collection: 'pendingUsers' });

// Balance Schema for 'balance'
const BalanceSchema = new mongoose.Schema({
  userID: Number,
  balance: Number,
  toWithdraw: Number,
}, { collection: 'balance' });

// Tasks Schema for 'tasks'
const TaskSchema = new mongoose.Schema({
  description: String,
  reward: Number,
  taskType: Boolean,
}, { collection: 'tasks' });

// Bonus Users Schema for 'BonusUsers'
const BonusUserSchema = new mongoose.Schema({
  userID: Number,
  bonus: Date,
}, { collection: 'BonusUsers' });

// Models
const Admin = mongoose.model("Admin", AdminSchema);
const TaskProof = mongoose.model("TaskProof", TaskProofSchema);
const AllUser = mongoose.model("AllUser", AllUsersSchema);
const PendingUser = mongoose.model("PendingUser", PendingUsersSchema);
const Balance = mongoose.model("Balance", BalanceSchema);
const Task = mongoose.model("Task", TaskSchema);
const BonusUser = mongoose.model("BonusUser", BonusUserSchema);

module.exports = {
  Admin,
  TaskProof,
  AllUser,
  PendingUser,
  Balance,
  Task,
  BonusUser,
};
