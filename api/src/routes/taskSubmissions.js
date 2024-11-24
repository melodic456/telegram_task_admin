const express = require("express");
const { TaskProof, AllUser, Task, Balance } = require("../models/schemas"); // Import TaskProof, AllUser, and Task models

const router = express.Router();

// Get all task submissions
router.get("/", async (req, res) => {
  try {
    const submissions = await TaskProof.find();
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching task submissions:", error);
    res.status(500).json({ error: "Failed to fetch task submissions" });
  }
});

// Create a new task submission
router.post("/", async (req, res) => {
  try {
    const submission = new TaskProof(req.body);
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    console.error("Error creating task submission:", error);
    res.status(400).json({ error: "Failed to create task submission" });
  }
});

// Update a task submission (Approve/Reject with Reward Logic)
router.put("/:id", async (req, res) => {
  const { status } = req.body; // Expect "approved" or "rejected" in the request body

  try {
    // Find the task submission by ID
    const submission = await TaskProof.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: "Task submission not found" });
    }

    console.log("Task Submission:", submission);

    // Retrieve the taskId from the submission
    // const taskId = submission.taskId;
    const taskId = submission.taskId.toString();


    // Find the task by taskId to get the reward amount
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const reward = task.reward; // Task reward amount

    // Find the user in the allUsers collection using userId from the submission
    const user = await AllUser.findOne({ userID: submission.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User Before Update:", user);

    const allBalance = await Balance.findOne({ userID: submission.userId });

    // Update the user's balance based on approval or rejection
    if (status === "approved" || status === "pending") {
      user.balance += reward; // Add the reward to the user's balance
      allBalance.balance += reward;
    } else if (status === "rejected") {
      user.balance -= reward; // Deduct the reward from the user's balance
      allBalance.balance -= reward;
    } else {
      return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'" });
    }

    // Save the updated user balance
    await user.save();
    await allBalance.save();

    console.log("User After Update:", user);

    // Update the task submission status
    submission.status = status;
    await submission.save();

    res.json({
      message: "Task submission updated successfully",
      submission,
      user,
    });
  } catch (error) {
    console.error("Error updating task submission:", error);
    res.status(500).json({ error: "Failed to update task submission" });
  }
});

// Delete a task submission
router.delete("/:id", async (req, res) => {
  try {
    const submission = await TaskProof.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: "Task submission not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task submission:", error);
    res.status(400).json({ error: "Failed to delete task submission" });
  }
});

module.exports = router;




// const express = require("express");
// const { TaskProof, AllUser, Task } = require("../models/schemas"); // Import TaskProof, AllUser, and Task models

// const router = express.Router();

// // Get all task submissions
// router.get("/", async (req, res) => {
//   try {
//     const submissions = await TaskProof.find();
//     res.json(submissions);
//   } catch (error) {
//     console.error("Error fetching task submissions:", error);
//     res.status(500).json({ error: "Failed to fetch task submissions" });
//   }
// });

// // Create a new task submission
// router.post("/", async (req, res) => {
//   try {
//     const submission = new TaskProof(req.body);
//     await submission.save();
//     res.status(201).json(submission);
//   } catch (error) {
//     console.error("Error creating task submission:", error);
//     res.status(400).json({ error: "Failed to create task submission" });
//   }
// });

// // Update a task submission (Approve/Reject with Reward Logic)
// router.put("/:id", async (req, res) => {
//   const { status } = req.body; // Either "approved" or "rejected"

//   try {
//     // Find the task submission by ID
//     const submission = await TaskProof.findById(req.params.id);
//     console.log("this is the " + submission)
//     if (!submission) {
//       return res.status(404).json({ error: "Task submission not found" });
//     }

//     // Retrieve the taskId from the submission
//     const taskId = submission.taskId;

//     // Find the task by taskId to get the reward amount
//     const task = await Task.findById(taskId);

//     if (!task) {
//       return res.status(404).json({ error: "Task not found" });
//     }

//     const reward = task.reward; // Task reward amount

//     // Find the user in the allUsers collection using userId from the submission
//     const user = await AllUser.findOne({ userId: submission.userId });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Update the user's balance based on approval or rejection
//     if (status === "approved") {
//       user.balance += reward; // Add the reward to the user's balance
//     } else if (status === "rejected") {
//       user.balance -= reward; // Deduct the reward from the user's balance
//     } else {
//       return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'" });
//     }

//     // Save the updated user balance
//     await user.save();

//     // Update the task submission status
//     submission.status = status;
//     await submission.save();

//     res.json({
//       message: "Task submission updated successfully",
//       submission,
//       user,
//     });
//   } catch (error) {
//     console.error("Error updating task submission:", error);
//     res.status(400).json({ error: "Failed to update task submission" });
//   }
// });

// // Delete a task submission
// router.delete("/:id", async (req, res) => {
//   try {
//     const submission = await TaskProof.findByIdAndDelete(req.params.id);
//     if (!submission) {
//       return res.status(404).json({ error: "Task submission not found" });
//     }
//     res.status(204).send();
//   } catch (error) {
//     console.error("Error deleting task submission:", error);
//     res.status(400).json({ error: "Failed to delete task submission" });
//   }
// });

// module.exports = router;






// // const express = require("express");
// // const { TaskProof } = require("../models/schemas");

// // const router = express.Router();

// // // Get all task submissions
// // router.get("/", async (req, res) => {
// //   try {
// //     const submissions = await TaskProof.find();
// //     res.json(submissions);
// //   } catch (error) {
// //     console.error("Error fetching task submissions:", error);
// //     res.status(500).json({ error: "Failed to fetch task submissions" });
// //   }
// // });

// // // Create a new task submission
// // router.post("/", async (req, res) => {
// //   try {
// //     const submission = new TaskProof(req.body);
// //     await submission.save();
// //     res.status(201).json(submission);
// //   } catch (error) {
// //     console.error("Error creating task submission:", error);
// //     res.status(400).json({ error: "Failed to create task submission" });
// //   }
// // });

// // // Update a task submission
// // router.put("/:id", async (req, res) => {
// //   try {
// //     const submission = await TaskProof.findByIdAndUpdate(req.params.id, req.body, { new: true });
// //     if (!submission) {
// //       return res.status(404).json({ error: "Task submission not found" });
// //     }
// //     res.json(submission);
// //   } catch (error) {
// //     console.error("Error updating task submission:", error);
// //     res.status(400).json({ error: "Failed to update task submission" });
// //   }
// // });

// // // Delete a task submission
// // router.delete("/:id", async (req, res) => {
// //   try {
// //     const submission = await TaskProof.findByIdAndDelete(req.params.id);
// //     if (!submission) {
// //       return res.status(404).json({ error: "Task submission not found" });
// //     }
// //     res.status(204).send();
// //   } catch (error) {
// //     console.error("Error deleting task submission:", error);
// //     res.status(400).json({ error: "Failed to delete task submission" });
// //   }
// // });

// // module.exports = router;
