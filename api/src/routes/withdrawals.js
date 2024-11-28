const express = require("express");
// const { Withdrawal } = require("../models/schemas");
const { Withdrawal, AllUser, Balance } = require("../models/schemas"); 
const router = express.Router();

// Get all withdrawals
router.get("/", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find();
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific withdrawal by ID
router.get("/:id", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new withdrawal
router.post("/", async (req, res) => {
  try {
    const { userID, balance, toWithdraw, status } = req.body;
    const withdrawal = new Withdrawal({
      userID,
      balance,
      toWithdraw,
      status,
      createdAt: new Date(),
    });

    await withdrawal.save();
    res.status(201).json(withdrawal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a withdrawal by ID
router.put("/:id", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    const { status } = req.body;
    // Check if status is "approved" or "rejected" to update user's balance and toWithdraw
    if (status === "approved" || status === "rejected") {
        // Find the user in the allUsers table and update balance and toWithdraw to 0.0
        const user = await AllUser.findOne({ userID: withdrawal.userID });
        const balnces = await Balance.findOne({ userID: withdrawal.userID });
        if (user) {
        //   user.balance = 0.0;  // Set user's balance to 0
          user.toWithdraw = 0.0;  // Set user's toWithdraw to 0
          balnces.toWithdraw = 0.0
          await user.save();  // Save updated user data
          await balnces.save();  // Save updated user data
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      }
    res.json(withdrawal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a withdrawal by ID
router.delete("/:id", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findByIdAndDelete(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
