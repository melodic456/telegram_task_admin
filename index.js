// tgGnHlyxTWSRQvzM

// const mongo = require('mongodb').MongoClient;
const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
const { Telegraf, session, Extra, Markup, Scenes } = require('telegraf');
const axios = require ("axios");
const ratelimit = require("ratelimit")
const { BaseScene, Stage } = Scenes
const { enter, leave } = Stage
const stage = new Stage()
const rateLimit = require('telegraf-ratelimit')
const {WizardScene} = require("telegraf/scenes");
// const telegram = require("telegraf/src/telegram");
// var bot_token = '6100354506:AAESTtpgg1-OwF8VYNiMbUwcHXHCQEh-lOs'; //YOUR BOT TOKEN HERE
var bot_token = '8065612727:AAHB0jI0vUF0fUaF2GiQLkyJfQFL3jG6TB4'; //YOUR BOT TOKEN HERE
const bot = new Telegraf(bot_token);
let db;
const balance = new BaseScene('balance')
stage.register(balance)
const referal = new BaseScene('refferal')
stage.register(referal)
const withdraw = new BaseScene('withdraw')
stage.register(withdraw)
const wallet = new BaseScene('wallet')
stage.register(wallet)


const onWithdraw = new BaseScene('onWithdraw')
stage.register(onWithdraw)
const broadcast = new BaseScene('broadcast')
stage.register(broadcast)
const refer = new BaseScene('refer')
stage.register(refer)
const mini = new BaseScene('mini')
stage.register(mini)
const chnl = new BaseScene('chnl')
stage.register(chnl)
const removechnl = new BaseScene('removechnl')
stage.register(removechnl)
const paychnl = new BaseScene('paychnl')
stage.register(paychnl)
const bon = new BaseScene('bonus')
stage.register(bon)
const botstat = new BaseScene('botstat')
stage.register(botstat)
const withstat = new BaseScene('withstat')
stage.register(withstat)
const tgid = new BaseScene('tgid')
stage.register(tgid)
const incr = new BaseScene('incr')
stage.register(incr)
const subwallet = new BaseScene('subwallet')
stage.register(subwallet)
const mkey = new BaseScene('mkey')
stage.register(mkey)
const mid = new BaseScene('mid')
stage.register(mid)
const comment = new BaseScene('comment')
stage.register(comment)

// Define and register createTask, taskReward, and taskMedia scenes
const createTask = new BaseScene('createTask');
const taskReward = new BaseScene('taskReward');
const taskMedia = new BaseScene('taskMedia');

stage.register(createTask);
stage.register(taskReward);
stage.register(taskMedia);

// const taskList = new BaseScene('taskList');
// stage.register(taskList);

const taskList = new BaseScene('taskList');
stage.register(taskList);

const taskEdit = new BaseScene('taskEdit');
stage.register(taskEdit);

const taskDelete = new BaseScene('taskDelete');
stage.register(taskDelete);

const submitProof = new Scenes.BaseScene('submitProof');
stage.register(submitProof);
const mediaUploadScene = new Scenes.BaseScene('mediaUploadScene');
stage.register(mediaUploadScene);

const reviewSubmittedTasks = new BaseScene('reviewSubmittedTasks');
stage.register(reviewSubmittedTasks);

// Scene steps for creating a task
// Scene steps for creating a task
// Ensure bot uses session middleware
bot.use(session());
bot.use(stage.middleware())

// Scene steps for creating a task
createTask.enter((ctx) => {
    ctx.session.task = {};  // Initialize task in session instead of scene state
    ctx.reply('Please enter the task description:', Markup.keyboard([['⛔ Cancel']]).resize());
});

createTask.on('text', (ctx) => {
    if (ctx.message.text === '⛔ Cancel') {
        ctx.reply('Task creation canceled.', { reply_markup: { remove_keyboard: true } });
        return ctx.scene.leave();
    }

    ctx.session.task.description = ctx.message.text;
    console.log("Description saved:", ctx.session.task.description); // Log description
    ctx.reply('Please enter the reward amount:', Markup.keyboard([['⛔ Cancel']]).resize());
    return ctx.scene.enter('taskReward');
});

// Scene step for reward amount
taskReward.on('text', (ctx) => {
    if (ctx.message.text === '⛔ Cancel') {
        ctx.reply('Task creation canceled.', { reply_markup: { remove_keyboard: true } });
        return ctx.scene.leave();
    }

    const reward = parseFloat(ctx.message.text);
    if (isNaN(reward)) {
        ctx.reply('Please enter a valid number for the reward.');
        return;
    }

    ctx.session.task.reward = reward;
    console.log("Reward saved:", ctx.session.task.reward); // Log reward
    ctx.reply('Please upload an optional photo or video for the task, or type "skip" to continue without one:');
    return ctx.scene.enter('taskMedia');
});

// Scene step for media upload
taskMedia.on('text', async (ctx) => {
    if (ctx.message.text === '⛔ Cancel') {
        ctx.reply('Task creation canceled.', { reply_markup: { remove_keyboard: true } });
        return ctx.scene.leave();
    } else if (ctx.message.text.toLowerCase() === 'skip') {
        console.log("Final task object before saving:", ctx.session.task); // Log full task object before saving
        await saveTaskTodb(ctx.session.task); // Save the task to the db
        ctx.reply('Task created successfully.', { reply_markup: { remove_keyboard: true } });
        return ctx.scene.leave();
    }

    ctx.reply('Please upload a photo or video, or type "skip" to continue.');
});

taskMedia.on(['photo', 'video'], async (ctx) => {
    const media = ctx.message.photo || ctx.message.video;

    ctx.session.task.media = media;
    console.log("Final task object with media before saving:", ctx.session.task); // Log task object with media
    await saveTaskTodb(ctx.session.task); // Save the task to the db
    ctx.reply('Task created successfully with media.', { reply_markup: { remove_keyboard: true } });
    return ctx.scene.leave();
});

// Helper function to save task to the db
async function saveTaskTodb(task) {
    try {
        if (task.description && task.reward) { // Ensure both description and reward are defined
            await db.collection('tasks').insertOne(task);
            console.log('Task saved successfully:', task);
        } else {
            console.error('Error: Missing task description or reward', task);
        }
    } catch (error) {
        console.error('Error saving task:', error);
    }
}


// Scene to handle interactive task proof submission

// Step 1: Ask for text proof
// const { Telegraf, Markup, Scenes, session } = require('telegraf');

// Create a new scene for collecting proof text
// const submitProof = new Scenes.BaseScene('submitProof');

// Step 1: Collect text proof

async function updateTaskSubmission(taskid, action) {
    try {
      const response = await fetch(`http://195.7.6.213:3001/task-submissions/${taskid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json' // Set appropriate content type if sending data
        },
        body: JSON.stringify({ status: action }) // Only include body if updating data
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      console.error("Error updating task submission:", error);
    }
  }
  
  // Example usage
 

submitProof.enter((ctx) => {
    ctx.reply('Please provide a brief text description for your task proof:');
});

submitProof.on('text', async (ctx) => {
    const proofText = ctx.message.text;
    ctx.session.proof = { text: proofText }; // Save text proof in session
    await ctx.reply('Text proof received.');

    // Ask if the user wants to upload a photo or video proof
    await ctx.reply(
        'Would you like to upload an image or video as additional proof?',
        Markup.inlineKeyboard([
            Markup.button.callback('Yes', 'upload_media'),
            Markup.button.callback('No', 'skip_media'),
        ])
    );
    // Transition to the next part of the process (media upload or skip)
    ctx.scene.enter('mediaUploadScene');
});

// Create a new scene for handling media upload

// Step 2: Handle choice for optional image/video upload
mediaUploadScene.action('upload_media', async (ctx) => {
    await ctx.reply('Please upload an image or video as additional proof, or type "skip" if you change your mind:');
    // Stay in the media upload scene until the user uploads media or skips
});

mediaUploadScene.action('skip_media', async (ctx) => {
    // Save the task proof without media
    await saveTaskProof(ctx.from.id, ctx.session.currentTaskId, ctx.session.proof);
    await checkTaskType(ctx.session.currentTaskId);
    // const submissionId = 'your_submission_id';
    // const newStatus = 'approved'; // Replace with your desired action
    // updateTaskSubmission(ctx.session.currentTaskId, newStatus);
    
    await ctx.reply('Task proof submitted successfully without additional media.');
    return ctx.scene.leave();
});


async function checkTaskType(currentTaskId) {
    try {
        const task = await db.collection('tasks').findOne({ _id: new ObjectId(currentTaskId) });
    //   const task = await db.collection.findOne({ _id: currentTaskId }, { taskType: 1 }); // Project only 'taskType' field
      if (task) {
        console.log(`Task type is: ${task.taskType}`);
        if(task.taskType){
            console.log("here")
            
            return true;
        } else{
            console.log("sdfsdf")
            return "false"
        }
      } else {
        console.log(`No task found with ID: ${currentTaskId}`);
      }
    } catch (error) {
      console.error(error);
    }
  }
// Step 3: Handle photo uploads
submitProof.on('photo', async (ctx) => {
    const photo = ctx.message.photo[0]; // Take the first photo if multiple are sent
    ctx.session.proof.photo = photo;
    await saveTaskProof(ctx.from.id, ctx.session.currentTaskId, ctx.session.proof);
    // await checkTaskType(ctx.session.currentTaskId);
    await ctx.reply('Task proof with photo submitted successfully!');
    return ctx.scene.leave();
});

// Step 4: Handle video uploads
submitProof.on('video', async (ctx) => {
    const video = ctx.message.video;
    ctx.session.proof.video = video;
    await saveTaskProof(ctx.from.id, ctx.session.currentTaskId, ctx.session.proof);
    // await checkTaskType(ctx.session.currentTaskId);
    await ctx.reply('Task proof with video submitted successfully!');
    return ctx.scene.leave();
});

// Handle "skip" if the user changes their mind
submitProof.hears(/skip/i, async (ctx) => {
    await saveTaskProof(ctx.from.id, ctx.session.currentTaskId, ctx.session.proof);
    
    await ctx.reply('Task proof submitted successfully without additional media.');
    return ctx.scene.leave();
});

// Helper function to save task proof
async function saveTaskProof(userId, taskId, proof) {
    try {
        const result = await db.collection('taskProofs').insertOne({
            userId,
            taskId,
            proof,
            'reviewed': false,
            timestamp: new Date()
        });

        const insertedId = result.insertedId;
        console.log('Task proof saved successfully with ID:', insertedId);
        console.log('Task proof saved successfully:', proof);
        const taskType = await checkTaskType(taskId);
        if (taskType.toString() === "true"){
            const submissionId = result.insertedId;
            const newStatus = 'approved'; // Replace with your desired action
            await updateTaskSubmission(submissionId, newStatus);
        }
    } catch (error) {
        console.error('Error saving task proof:', error);
    }
}

// Create the stage and register scenes

reviewSubmittedTasks.enter(async (ctx) => {
    try {
        const submissions = await db.collection('taskProofs').find({ reviewed: false }).toArray();
        
        if (submissions.length === 0) {
            await ctx.reply('No submitted tasks to review.');
            return ctx.scene.leave();
        }
        
        ctx.session.submissions = submissions; // Save submissions to session
        ctx.session.currentSubmissionIndex = 0; // Start with the first submission
        displaySubmission(ctx);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        ctx.reply('Error retrieving submissions. Please try again later.');
        ctx.scene.leave();
    }
});

function displaySubmission(ctx) {
    const index = ctx.session.currentSubmissionIndex;
    const submission = ctx.session.submissions[index];

    let message = `Submission ID: ${submission._id}\nUser ID: ${submission.userId}\nTask ID: ${submission.taskId}\nText Proof: ${submission.proof.text}`;
    
    if (submission.proof.photo) {
        message += `\nPhoto Proof: [attached]`;
    }
    if (submission.proof.video) {
        message += `\nVideo Proof: [attached]`;
    }

    ctx.reply(message, {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Approve', callback_data: `approve:${submission._id}` }],
                [{ text: 'Decline', callback_data: `decline:${submission._id}` }],
                [{ text: 'Next Submission', callback_data: 'nextSubmission' }],
            ],
        },
    });
}

// Handling Approve and Decline Actions

// Handle Approve Task Submission
reviewSubmittedTasks.action(/^approve:(.*)$/, async (ctx) => {
    const submissionId = ctx.match[1];
    const submission = await db.collection('taskProofs').findOne({ _id: new ObjectId(submissionId) });
    
    if (submission) {
        // Retrieve the task reward from the tasks collection
        const task = await db.collection('tasks').findOne({ _id: new ObjectId(submission.taskId) });
        const taskReward = task?.reward ? parseFloat(task.reward) : 0; // Ensure reward is a number, default to 0 if missing

        // Mark the submission as reviewed and approved
        await db.collection('taskProofs').updateOne(
            { _id: submission._id },
            { $set: { reviewed: true, status: 'approved' } }
        );

        // Step 1: Safely update balance in the balance collection
        const userBalanceDoc = await db.collection('balance').findOne({ userID: submission.userId });
        const currentBalance = typeof userBalanceDoc?.balance === 'number' ? userBalanceDoc.balance : parseFloat(userBalanceDoc?.balance) || 0;
        const newBalance = currentBalance + taskReward;

        // Update the balance in the balance collection
        await db.collection('balance').updateOne(
            { userID: submission.userId },
            { $set: { balance: newBalance, toWithdraw: userBalanceDoc?.toWithdraw || 0 } },
            { upsert: true }
        );

        // Step 2: Safely update balance in the allUsers collection
        const userAllUsersDoc = await db.collection('allUsers').findOne({ userID: submission.userId });
        const currentAllUsersBalance = typeof userAllUsersDoc?.balance === 'number' ? userAllUsersDoc.balance : parseFloat(userAllUsersDoc?.balance) || 0;
        const newAllUsersBalance = currentAllUsersBalance + taskReward;

        // Update the balance in the allUsers collection
        await db.collection('allUsers').updateOne(
            { userID: submission.userId },
            { $set: { balance: newAllUsersBalance } },
            { upsert: true }
        );

        // Notify admin and user
        ctx.reply(`Task approved. ${taskReward} added to user ${submission.userId}'s balance.`);
        bot.telegram.sendMessage(submission.userId, 'Your task was approved, and you have been rewarded!');
    }
    handleNextSubmission(ctx);
});







// reviewSubmittedTasks.action(/^approve:(.*)$/, async (ctx) => {
//     const submissionId = ctx.match[1];
//     const submission = await db.collection('taskProofs').findOne({ _id: new ObjectId(submissionId) });
    
//     if (submission) {
//         await db.collection('taskProofs').updateOne({ _id: submission._id }, { $set: { reviewed: true, status: 'approved' } });
//         const userBalance = await db.collection('balance').findOne({ userID: submission.userId });

//         const currentBalance = userBalance?.balance ?? 0;
//         console.log(userBalance)  // Use 0 if balance is null or undefined

//         await db.collection('balance').updateOne(
//             { userID: submission.userId },
//             { $set: { balance: currentBalance + submission.taskReward } }  // Set the new balance directly
//         );

//         // await db.collection('balance').updateOne({ userID: submission.userId }, { $inc: { balance: submission.taskReward } });
//         ctx.reply(`Task approved, ${submission.taskReward} added to user ${submission.userId}.`);
//         bot.telegram.sendMessage(submission.userId, 'Your task was approved and you have been rewarded!');
//     }
//     handleNextSubmission(ctx);
// });

reviewSubmittedTasks.action(/^decline:(.*)$/, async (ctx) => {
    const submissionId = ctx.match[1];
    const submission = await db.collection('taskProofs').findOne({ _id: new ObjectId(submissionId) });
    
    if (submission) {
        await db.collection('taskProofs').updateOne({ _id: submission._id }, { $set: { reviewed: true, status: 'declined' } });
        ctx.reply(`Task declined for user ${submission.userId}.`);
        bot.telegram.sendMessage(submission.userId, 'Your task submission was declined.');
    }
    handleNextSubmission(ctx);
});

reviewSubmittedTasks.action('nextSubmission', (ctx) => {
    ctx.session.currentSubmissionIndex++;
    if (ctx.session.currentSubmissionIndex >= ctx.session.submissions.length) {
        ctx.reply('No more submissions to review.');
        return ctx.scene.leave();
    }
    displaySubmission(ctx);
});

function handleNextSubmission(ctx) {
    ctx.session.currentSubmissionIndex++;
    if (ctx.session.currentSubmissionIndex >= ctx.session.submissions.length) {
        ctx.reply('All submissions reviewed.');
        return ctx.scene.leave();
    }
    displaySubmission(ctx);
}





async function checkUserInGroup(chatId, userId) {
    try {
        const chatMember = await bot.telegram.getChatMember(chatId, userId);

        // Check the status of the user
        if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
            return true;  // The user is a member, admin, or creator
        } else {
            return false; // The user is not a member
        }
    } catch (error) {
        console.error('Error checking user membership:', error);
        return false;
    }
  }

  function extractUsernameFromLink(link) {
    // Check if the link is a valid string and not empty
    if (typeof link !== 'string' || link.trim() === '') {
        console.error('Invalid link provided.');
        return null;
    }

    // Match the part after t.me/
    const match = link.match(/t\.me\/(.+)$/);

    if (match && match[1]) {
        return `@${match[1]}`; // Prepend '@' to the username
    }

    console.error('Invalid Telegram link format.');
    return null; // Return null if the link format is incorrect
}

// View Tasks Button
bot.hears('📝 View Tasks', async (ctx) => {
    try {
        // Fetch all available tasks from the db
        const tasks = await db.collection('tasks').find().toArray();

        // If no tasks are available
        if (tasks.length === 0) {
            return ctx.reply('No tasks available at the moment.');
        }

        // Display tasks for selection
        // tasks.forEach(task => {
        //     ctx.reply(
        //         `Task ID: ${task._id}\nDescription: ${task.description}\nReward: ${task.reward}`,
        //         {
        //             reply_markup: {
        //                 inline_keyboard: [
        //                     [
        //                         { text: 'Complete Task', callback_data: `completeTask:${task._id}` }
        //                     ],
        //                 ],
        //             },
        //         }
        //     );
        // });
//         tasks.forEach(async task => {
//             // const buttonText = task.taskType ? 'Go to Link' : 'Complete Task';
//             // const buttonAction = task.taskType ? task.link : `completeTask:${task._id}`;
        
//             const userId = ctx.from.id; // Get the user ID from the context
//             console.log(userId)
//             const channelLink = task.link; // The channel link from the task
            
//             // Check if the user is a member of the channel
//             const isUserMember = await checkUserInGroup(userId, channelLink);
//             if (isUserMember) {
//                 return; // Skip this task for the user
//             }
//             // const buttonText = task.taskType ? (isUserMember ? 'Go to Link' : 'Join the Channel') : 'Complete Task';
//             // const buttonAction = task.taskType
//             //     ? (isUserMember ? task.link : 'Please Join the Channel') 
//             //     : `completeTask:${task._id}`;
//             // const buttonText = task.taskType ? 'Go to Link' : 'Complete Task';
//             // const buttonAction = task.taskType ? task.link : `completeTask:${task._id}`;
//             // ctx.reply(
//             //     `Task ID: ${task._id}\nDescription: ${task.description}\nReward: ${task.reward}`,
//             //     {
//             //         reply_markup: {
//             //             inline_keyboard: [
//             //                 [
//             //                     { text: buttonText, callback_data: buttonAction }
//             //                 ],
//             //             ],
//             //         },
//             //     }
//             // );
//             const buttonText = task.taskType ? 'Go to Link' : 'Complete Task';
//             const buttonAction = task.taskType 
//                 ? { url: task.link } // If taskType is true, use the URL as the action
//                 : { callback_data: `completeTask:${task._id}` }; // If taskType is false, use callback data
        
//             // Send the task to the user
//             ctx.reply(
//                 `Task ID: ${task._id}\nDescription: ${task.description}\nReward: ${task.reward}`,
//                 {
//                     reply_markup: {
//                         inline_keyboard: [
//                             [
//                                 { text: buttonText, ...buttonAction } // Dynamically add url or callback_data
//                             ],
//                         ],
//                     },
//                 }
//             );
//         });
        
//     } catch (error) {
//         console.log(error);
//         ctx.reply('Error fetching tasks.');
//     }
// });


    tasks.forEach(async (task) => {
        const userId = ctx.from.id; // Get the user ID from the context
        const channelLink = task.link; // The channel link from the task
        // const link = 't.me/habijabi34';
        const username = extractUsernameFromLink(channelLink);
        if (username) {
            console.log(username);  // Output: @habijabi34
            const isUserMember = await checkUserInGroup(username, userId);

        // If the user is already a member, skip showing the task
            if (isUserMember) {
                return; // Skip this task for the user
            }
        } else {
            console.log('Failed to extract username.');
            // return;
        }
        // Check if the user is a member of the channel
        const taskProofCollection = db.collection('taskProofs');
        

        // const existingProof = await TaskProof.findOne({ userId: userId, taskId: mongoose.Types.ObjectId(taskId), status: 'approved' });
        const existingProof = await taskProofCollection.findOne({ userId: userId, taskId: task._id.toString(), status: 'approved' });
        console.log("this is  " + existingProof + "   " + task._id + "  " + userId)
        if (existingProof) {
            // If the user has already completed the task, inform them
            // await ctx.answerCbQuery('You have already completed this task!');
            return;
        }


        // Set button text and action based on task type
        const buttonText = task.taskType ? 'Go to Link' : 'Complete Task';
        const buttonAction = task.taskType 
            ? { url: task.link } // If taskType is true, use the URL as the action
            : { callback_data: `completeTask:${task._id}` }; // If taskType is false, use callback data

        console.log(buttonAction, buttonText)
            // console.log(JSON.stringify(reply_markup, null, 2));
        const inlineKeyboard = [
            [
                { text: buttonText, ...buttonAction }, // Dynamically add url or callback_data
            ],
        ];
        
        // Add the "Check if Joined" button only if task.taskType is true
        if (task.taskType) {
            inlineKeyboard[0].push({ text: 'Check if Joined', callback_data: `checkJoin:${username}:${task._id}` });
        }
        
        // Send the task to the user
        ctx.reply(
            `Task ID: ${task._id}\nDescription: ${task.description}\nReward: ${task.reward}`,
            {
                reply_markup: {
                    inline_keyboard: inlineKeyboard,
                },
            }
        );

        // Send the task to the user
        // ctx.reply(
        //     `Task ID: ${task._id}\nDescription: ${task.description}\nReward: ${task.reward}`,
        //     {
        //         reply_markup: {
        //             inline_keyboard: [
        //                 [
        //                     { text: buttonText, ...buttonAction }, // Dynamically add url or callback_data
        //                     { text: 'Check if Joined', callback_data: `checkJoin:${username}:${task._id}` }
        //                 ],
        //             ],
        //         },
        //     }
        // );
    });
        } catch (error) {
        console.log(error);
        ctx.reply('Error fetching tasks.');
    }
});


async function updateUserBalance(userId, reward) {
    try {
        const balanceCollection = db.collection('balance');
        const allUsersCollection = db.collection('allUsers');
        
        // Find the user's current balance
        const userBalance = await balanceCollection.findOne({ userID: userId });
        const allUserBalance = await allUsersCollection.findOne({ userID: userId });


        if (userBalance) {
            // Add the reward to the existing balance
            await balanceCollection.updateOne(
                { userID: userId },
                { $inc: { balance: reward } }
            );
            
            console.log(`Updated balance for user ${userId}: ${reward}`);
        } else {
            // If the user does not exist, create a new balance entry
            // await balanceCollection.insertOne({ userId: userId, balance: reward });
            console.log(`Created balance entry for user ${userId}: ${reward}`);
        }
        if (allUserBalance){
            await allUsersCollection.updateOne(
                { userID: userId },
                { $inc: { balance: reward } }
            );
            console.log(`Updated balance for allUserBalance ${userId}: ${reward}`);
        } else {
            // If the user does not exist, create a new balance entry
            // await balanceCollection.insertOne({ userId: userId, balance: reward });
            console.log(`Created balance entry for allUserBalance ${userId}: ${reward}`);
        }
    } catch (error) {
        console.error('Error updating user balance:', error);
    }
}


async function getTaskById(taskId) {
    const tasksCollection = db.collection('tasks');
    const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) });
    // await db.collection('taskProofs').findOne({ _id: new ObjectId(submissionId) });
    console.log("this is task:" + task)
    return task;
}

async function insertTaskProof(userId, taskId) {
    try {
        const taskProofsCollection = db.collection('taskProofs');

        // Create a proof entry for the task
        const proofEntry = {
            userId: userId,
            taskId: taskId,
            proof: { text: 'Task Completed' }, // You can add proof details here
            reviewed: true,
            timestamp: new Date(),
            status: 'approved' // Mark as approved
        };

        // Insert the task proof into the collection
        await taskProofsCollection.insertOne(proofEntry);
        console.log(`Task proof inserted for user ${userId}, task ${taskId}`);
    } catch (error) {
        console.error('Error inserting task proof:', error);
    }
}

// Handle callback for 'Check if Joined' button
bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    if (callbackData.startsWith('checkJoin:')) {
        // Extract the username and task ID from the callback data
        const [, username, taskId] = callbackData.split(':');
        console.log(`Checking if user ${userId} is in the channel ${username}`);
        const taskProofCollection = db.collection('taskProofs');
        

        // const existingProof = await TaskProof.findOne({ userId: userId, taskId: mongoose.Types.ObjectId(taskId), status: 'approved' });
        const existingProof = await taskProofCollection.findOne({ userId: userId, taskId: taskId, status: 'approved' });

        if (existingProof) {
            // If the user has already completed the task, inform them
            await ctx.answerCbQuery('You have already completed this task!');
            return;
        }

        // await db.collection("tasks")
        // Check if the user is a member of the channel
        const isUserMember = await checkUserInGroup(username, userId);

        if (isUserMember) {
            await ctx.answerCbQuery('You are a member! Task Completed.'); // Respond to the callback query
            const task = await getTaskById(taskId);
            // console.log(task)
            const reward = task.reward;
            await updateUserBalance(userId, reward);
            await insertTaskProof(userId, taskId);

            // Optionally mark the task as completed in your system
            // You can store that the user has completed this task
            await ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [
                        { text: 'Go to Link', url: `https://t.me/${username}` }, // Update with the link button (if needed)
                        // Optionally remove or replace the "Check if Joined" button here
                    ]
                ]
            });
        } else {
            await ctx.answerCbQuery('You are not a member yet. Please join the channel.'); // Inform the user
        }
    }
});



bot.action(/^completeTask:(.*)$/, async (ctx) => {
    if (!ctx.session) ctx.session = {};
    console.log(ctx)
    const taskId = ctx.match[1];
    console.log(taskId);
    ctx.session.currentTaskId = taskId; // Save selected task ID in session

    // Prompt user for proof submission
    ctx.reply('Please submit your task proof (text, image, or video):');
    ctx.scene.enter('submitProof');
});

// const contactDataWizard = new WizardScene('comment')
let myarray = ["what is this?", "What is that?", "what do you need?"]

// const checkDynamicWizard = new WizardScene('dynamic_check',
//     for (i=0; i++;myarray.length){
//         (ctx) => {
//             ctx.reply(myarray[i]);
//             if(i == 2) {
//                 return ctx.scene.leave();
//             }
//             // ctx.wizard.state.contactData = {};
//             return ctx.wizard.next();
//         },
//     }
//     )

const contactDataWizard = new WizardScene(
  'CONTACT_DATA_WIZARD_SCENE_ID', // first argument is Scene_ID, same as for BaseScene
  (ctx) => {
    ctx.reply('What is your name?', { parse_mode: 'markdown', reply_markup: { inline_keyboard: [[{ text: "⛔ Cancel", callback_data: "cancel" }]]}});
    // bot.telegram.sendMessage(ctx.from.id, "*?? To Check Who Invited You, Click On '✅ Check'*", { parse_mode: 'markdown', reply_markup: { inline_keyboard: [[{ text: "✅ Check", callback_data: "check" }]] } })

    ctx.wizard.state.contactData = {};
    return ctx.wizard.next();
  },
  (ctx) => {
    // validation example

      try {
          if (ctx.update.callback_query.data == "cancel") {
              ctx.reply("Exiting...")
              return ctx.scene.leave();
          }

    if (ctx.message.text.length < 2) {
      ctx.reply('Please enter name for real');
      return;
    }
     } catch (e) {

      }
    ctx.wizard.state.contactData.fio = ctx.message.text;
    ctx.reply('Enter your e-mail');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.contactData.email = ctx.message.text;
    ctx.reply("Thank you for your replies, we'll contact your soon");
    console.log(ctx.wizard.state.contactData);
    return ctx.scene.leave();
  },
);

stage.register(contactDataWizard)

var regex = new RegExp('.*')
const buttonsLimit = {
    window: 1000,
    limit: 1,
    onLimitExceeded: (ctx, next) => {
      if ('callback_query' in ctx.update)
      ctx.answerCbQuery('You`ve pressed Buttons too often, Wait......', true)
        .catch((err) => sendError(err, ctx))
    },
    keyGenerator: (ctx) => {
      return ctx.callbackQuery ? true : false
    }
  }
  bot.use(rateLimit(buttonsLimit))

// bot.use(session())

//CONNECT TO MONGO
// const uri = "mongodb+srv://melodichoq:Melodic1890-@cluster0.tggka0v.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb+srv://melosryz:tgGnHlyxTWSRQvzM@cluster0.lf0wr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    db = await client.db('mytesting');
    bot.telegram.deleteWebhook().then(success => {
        success && console.log('🤖 Bot Has Been SuccessFully Registered')
        bot.launch();
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
      console.log("client should be terminated")
  }

}
run().catch(console.dir);
// mongo.connect('mongodb+srv://DATA1:xixMhPpvLbKh24Ng@cluster0.qnjvk.mongodb.net/myFirstdb?retryWrites=true&w=majority', { useUnifiedTopology: true }, (err, client) => {
//     if (err) {
//         console.log(err);
//     }
//     db = client.db('Demot1');
//     bot.telegram.deleteWebhook().then(success => {
//         success && console.log('🤖 Bot Has Been SuccessFully Registered')
//         bot.launch();
//     })
// })


// send message directly in the bot to a user
// Telegraf.telegram.sendMessage(chatId, text)
bot.telegram.sendMessage(7374728124, "hello there!!")
//  get user sent message text
bot.on('email', async ctx => {
  // if(isWaitingForUser) {
  //   //store message
  // }
    console.log(ctx.message.text)
})
//
//START WITH INVITE LINK
bot.hears(/^\/start (.+[1-9]$)/, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        if (admin.length == 0) {
            db.collection('admindb').insertOne({ admin: "admin", ref: 1, cur: 'INR', paychannel: '@jsjdkkdkdhsjdk', bonus: 0.1, minimum: 1, botstat: 'Active', withstat: 'ON', subwallet: 'NOT SET', MKEY: 'NOT SET', MID: 'NOT SET', channels: [] })
            ctx.replyWithMarkdown(
                '*😅Restart Bot With /start*'
            )
        }
        let currency = admin[0].cur
        let refer = admin[0].ref
        let bots = admin[0].botstat
        let channel = admin[0].channels
        if (bots == 'Active') {
            let data = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
            if (data.length == 0 && ctx.from.id != +ctx.match[1]) { //IF USER IS NOT IN DATA
                db.collection('allUsers').insertOne({ userID: ctx.from.id, balance: 0.00, toWithdraw: 0.00 })
                db.collection('balance').insertOne({ userID: ctx.from.id, balance: 0.00,toWithdraw:0.00 })
                db.collection('pendingUsers').insertOne({ userID: ctx.from.id, inviter: +ctx.match[1] })
                bot.telegram.sendMessage(+ctx.match[1], "<b>🚧 New User On Your Invite Link : <a href='tg://user?id=" + ctx.from.id + "'>" + ctx.from.id + "</a></b>", { parse_mode: 'html' })
            }
            bot.telegram.sendMessage(ctx.from.id,"*©Share Your Contact In Order To Start Using The Bot. This Is Just A Phone Number Verification\n\n⚠️Note : We Will Not Share Your Details With Anyone*",{parse_mode:"markdown",reply_markup:{keyboard: [[{text:"💢 Share Contact",request_contact:true}]],resize_keyboard: true}})
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }

})
//START WITHOUT INVITE LINK
bot.start(async (ctx) => {
    try {
        let data = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        if (admin.length == 0) {
            db.collection('admindb').insertOne({ admin: "admin", ref: 1, cur: 'TK', paychannel: '@habijabi34', bonus: 0.1, minimum: 1, botstat: 'Active', withstat: 'ON', subwallet: 'NOT SET', MKEY: 'NOT SET', MID: 'NOT SET', channels: [] })
            ctx.replyWithMarkdown(
                '*😅Restart Bot With /start*'
            )
        }
        let bots = admin[0].botstat
        if (bots == 'Active') {
            if (data.length == 0) { //IF USER IS NOT IN DATA
                db.collection('allUsers').insertOne({ userID: ctx.from.id, balance: 0 ,toWithdraw:0.00})
                db.collection('balance').insertOne({ userID: ctx.from.id, balance: 0 ,toWithdraw:0.00})
                db.collection('pendingUsers').insertOne({ userID: ctx.from.id })

            }
            let channel = admin[0].channels
            bot.telegram.sendMessage(ctx.from.id,"*©Share Your Contact In Order To Start Using The Bot. This Is Just A Phone Number Verification\n\n⚠️Note : We Will Not Share Your Details With Anyone*",{parse_mode:"markdown",reply_markup:{keyboard: [[{text:"💢 Share Contact",request_contact:true}]],resize_keyboard: true}})
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
bot.on("contact", async(ctx)=> {
  try {
    var cont = ctx.update.message.contact.phone_number
    if (ctx.update.message.forward_from){
      bot.telegram.sendMessage(ctx.from.id,"*⚠️Seems Like This Is Not Your Contact*",{parse_mode:"markdown"})
      db.collection('pendingUsers').insertOne({ userID: ctx.from.id, inviter: "" })
      return
    }
    if(true){
      let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let refer = admin[0].ref
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
                let userdata = await db.collection('pendingUsers').find({ userID: ctx.from.id }).toArray()
                let config = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
                if (('inviter' in userdata[0]) && !('referred' in config[0])) {
                    let bal = await db.collection('balance').find({ userID: userdata[0].inviter }).toArray()
                    let cur = bal[0].balance * 1
                    let ref = refer * 1
                    let final = ref + cur
                    bot.telegram.sendMessage(userdata[0].inviter, "*💰" + refer + " " + currency + " Added To Your Balance*", { parse_mode: 'markdown' })
                    // bot.telegram.sendMessage(ctx.from.id, "*?? To Check Who Invited You, Click On '✅ Check'*", { parse_mode: 'markdown', reply_markup: { inline_keyboard: [[{ text: "✅ Check", callback_data: "check" }]] } })
                    bot.telegram.sendMessage(ctx.from.id, "<b>🚧 You are invited by: <a href='tg://user?id=" + userdata[0].inviter + "'>" + userdata[0].inviter + "</a></b>")
                    db.collection('allUsers').updateOne({ userID: ctx.from.id }, { $set: { inviter: userdata[0].inviter, referred: 'DONE' } }, { upsert: true })
                    db.collection('balance').updateOne({ userID: userdata[0].inviter }, { $set: { balance: final } }, { upsert: true })
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } else {
      ctx.replyWithMarkdown('*⚠️You Are Not Allowed To Use The Bot\n\n☘️Either You Are Not Indian Or This Contact Is Not Yours*')
      db.collection('pendingUsers').insertOne({ userID: ctx.from.id, inviter: "" })
    }
  } catch (err) {
    console.log(err)
  }
})
//BALANCE COMMAND
bot.hears('💰 Balance', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let bots = admin[0].botstat
        console.log(ctx.from.id)
        if (bots == 'Active') {
            let userbalance = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
            let ub = userbalance[0].balance
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🙌🏻 User = ' + ctx.from.first_name + '\n\n💰 Balance = ' + ub.toFixed(3) + ' ' + currency + '\n\n🪢 Invite To Earn More*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})



bot.hears('🙌🏻 Invite', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let refer = admin[0].ref
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🙌🏻 User =* [' + ctx.from.first_name + '](tg://user?id=' + ctx.from.id + ')\n\n*🙌🏻 Your Invite Link = https://t.me/' + ctx.botInfo.username + '?start=' + ctx.from.id + ' \n\n🪢 Invite To ' + refer + ' ' + currency + ' Per Invite*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }

})
//JOINED BUTTON
bot.hears('🟢 Joined', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let refer = admin[0].ref
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
                let userdata = await db.collection('pendingUsers').find({ userID: ctx.from.id }).toArray()
                let config = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
                if (('inviter' in userdata[0]) && !('referred' in config[0])) {
                    let bal = await db.collection('balance').find({ userID: userdata[0].inviter }).toArray()
                    let cur = bal[0].balance * 1
                    let ref = refer * 1
                    let final = ref + cur
                    bot.telegram.sendMessage(userdata[0].inviter, "*💰" + refer + " " + currency + " Added To Your Balance*", { parse_mode: 'markdown' })
                    bot.telegram.sendMessage(ctx.from.id, "*💹 To Check Who Invited You, Click On '✅ Check'*", { parse_mode: 'markdown', reply_markup: { inline_keyboard: [[{ text: "✅ Check", callback_data: "check" }]] } })
                    db.collection('allUsers').updateOne({ userID: ctx.from.id }, { $set: { inviter: userdata[0].inviter, referred: 'DONE' } }, { upsert: true })
                    db.collection('balance').updateOne({ userID: userdata[0].inviter }, { $set: { balance: final } }, { upsert: true })
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }

})
//WALLET BUTTON
bot.hears('🗂 Wallet', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let data = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                if ('wallet' in data[0]) {
                    bot.telegram.sendMessage(ctx.from.id, "<b>💡 Your Currently Set " + currency + " Wallet Is</b>:\n<code>" + data[0].wallet + "</code>\n\n🗂<b> It Will Be Used For Future Withdrawals</b>", { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "🚧 Change " + currency + " Wallet 🚧", callback_data: "wallet" }]] } })
                } else {
                    bot.telegram.sendMessage(ctx.from.id, "<b>💡 Your Currently Set " + currency + " Wallet Is</b>:\n<code>'none'</code>\n\n🗂<b> It Will Be Used For Future Withdrawals</b>", { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "🚧 Set " + currency + " Wallet 🚧", callback_data: "wallet" }]] } })
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
//WITHDRAW COMMAND
bot.hears('💳 Withdraw', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let mini_with = admin[0].minimum
        let currency = admin[0].cur
        let bots = admin[0].botstat
        let withs = admin[0].withstat
        if (bots == 'Active') {
            if (withs == 'ON') {
                let channel = admin[0].channels
                var flag = 0;
                for (i in channel) {
                    let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                    let result = res.status
                    if (result == 'creator' || result == 'administrator' || result == 'member') {
                        flag += 1
                    } else {
                        flag = 0
                    }
                }
                if (flag == channel.length) {
                    let userbalance = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
                    let ub = userbalance[0].balance
                    let data = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
                    if (ub < mini_with) {
                        ctx.replyWithMarkdown(
                            '*⚠️ Must Own AtLeast ' + mini_with + ' ' + currency + ' To Make Withdrawal*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                        )
                    } else if (!data[0].wallet) {
                        ctx.replyWithMarkdown(
                            '*⚠️ Set Your Wallet Using : *`🗂 Wallet`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                        )
                    } else {
                        await bot.telegram.sendMessage(ctx.from.id, "*📤 Enter Amount To Withdraw*", {
                            parse_mode: 'markdown', reply_markup: {
                                keyboard: [['⛔ Cancel']], resize_keyboard: true
                            }
                        })
                        ctx.scene.enter('onWithdraw')
                    }
                } else {
                    mustjoin(ctx)
                }
            } else {
                ctx.replyWithMarkdown('*⛔ Withdrawal Is Currently Off*')
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
bot.hears('⛔ Cancel', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
// STATISTICS OF BOT
bot.hears('📊 Statistics', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let bots = admin[0].botstat
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                let statdata = await db.collection('allUsers').find({ stats: "stats" }).toArray()
                let members = await db.collection('allUsers').find({}).toArray()
                console.log(members, statdata)
                if (statdata.length == 0) {
                    db.collection('allUsers').insertOne({ stats: "stats", value: 0 })
                    ctx.reply(
                        '<b>📊 Bot Live Stats 📊\n\n📤 Total Payouts : 0 ' + currency + '\n\n💡 Total Users: ' + members.length + ' Users\n\n🔎 Coded By: <a href="tg://user?id=1003376875">ROHIT_154</a></b>' , { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                    )
                } else {
                    let payout = statdata[0].value * 1
                    let memb = parseInt(members.length)
                    ctx.reply(
                        '<b>📊 Bot Live Stats 📊\n\n📤 Total Payouts : ' + payout + ' ' + currency + '\n\n💡 Total Users: ' + memb + ' Users\n\n🔎 Coded By: <a href="tg://user?id=1003376875">ROHIT_154</a></b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                    )
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
//ADMIN PANEL
bot.hears('/adminhelp', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let chnl = admin[0].channels
        var final = "\n\t\t\t\t";
        for (i in chnl) {
            final += chnl[i] + "\n\t\t\t\t";
        }
        let paychannel = admin[0].paychannel
        let bonusamount = admin[0].bonus
        let mini_with = admin[0].minimum
        let refer = admin[0].ref
        let stat = admin[0].botstat
        let withst = admin[0].withstat
        let swg = admin[0].subwallet
        let mkey = admin[0].MKEY
        let mid = admin[0].MID
        if (swg == 'NOT SET' && mkey == 'NOT SET' && mid == 'NOT SET') {
            var keys = '❌ NOT SET'
        } else {
            var keys = '✅ SET'
        }
        if (stat == 'Active') {
            var botstt = '✅ Active'
        } else {
            var botstt = '🚫 Disabled'
        }
        if (withst == 'ON') {
            var with_stat = '✅ On'
        } else {
            var with_stat = '🚫 Off'
        }
        if (ctx.from.id == 7374728124) {
            bot.telegram.sendMessage(ctx.from.id,
                "<b>🏡 Hey " + ctx.from.first_name + "\n🤘🏻 Welcome To Admin Panel\n\n💡 Bot Current Stats: \n\t\t\t\t📛 Bot : @" + ctx.botInfo.username + "\n\t\t\t\t🤖 Bot Status: " + botstt + "\n\t\t\t\t📤 Withdrawals : " + with_stat + "\n\t\t\t\t🌲 Channels: " + final + "💰 Refer: " + refer + "\n\t\t\t\t💰 Minimum: " + mini_with + "\n\t\t\t\t💲 Currency: " + currency + "\n\t\t\t\t🎁 Bonus: " + bonusamount + "\n\t\t\t\t📤 Pay Channel: " + paychannel + "\n\t\t\t\t✏️ Paytm Keys :</b> <code>" + keys + "</code> "
                , { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "💰 Change Refer", callback_data: "refer" }, { text: "💰 Change Minimum", callback_data: "minimum" }], [{ text: "🤖 Bot : " + botstt + "", callback_data: "botstat" }], [{ text: "🌲 Change Channels", callback_data: "channels" }, { text: "🎁 Change Bonus", callback_data: "bonus" }], [{ text: "📤 Withdrawals : " + with_stat + "", callback_data: "withstat" }], [{ text: "🚹 User Details", callback_data: "userdetails" }, { text: "🔄 Change Balance", callback_data: "changebal" }], [{ text: "✏️ Paytm Keys : " + keys + "", callback_data: "keys" }], [{ text: "Create Task", callback_data: "createTask" }], [{ text: 'View and Manage Tasks', callback_data: 'taskList' }], [{ text: 'Review Submitted Tasks', callback_data: 'reviewSubmittedTasks' }]] } })
        }
    } catch (error) {
        console.log(error)
    }

})

bot.action('createTask', (ctx) => {
    ctx.deleteMessage();
    ctx.scene.enter('createTask');
  });


// Task List Callback
bot.action('taskList', async (ctx) => {
    ctx.deleteMessage(); // Clear the previous message

    // Fetch tasks from the db
    let tasks = await db.collection('tasks').find().toArray();

    if (tasks.length === 0) {
        ctx.reply("No tasks found.");
        return ctx.scene.leave();
    }

    // Display each task with edit and delete options
    tasks.forEach(task => {
        console.log(task);
        ctx.reply(
            `Task ID: ${task._id}\nDescription: ${task.description}\nReward: ${task.reward}`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Edit', callback_data: `editTask:${task._id}` },
                            { text: 'Delete', callback_data: `deleteTask:${task._id}` },
                        ],
                    ],
                },
            }
        );
    });

    ctx.scene.enter('taskList'); // Enter task list scene
});

// Handle Edit Task Callback
bot.action(/^editTask:(.*)$/, async (ctx) => {
    const taskId = ctx.match[1];
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });

    if (!task) {
        ctx.reply("Task not found.");
        return ctx.scene.leave();
    }

    // Show current task details and prompt for new description
    ctx.reply(`Editing Task:\n\nCurrent Description: ${task.description}\n\nEnter the new description:`);
    ctx.scene.enter('taskEdit', { taskId });
});

// Task Edit Scene
taskEdit.on('text', async (ctx) => {
    const newDescription = ctx.message.text;
    const taskId = ctx.scene.state.taskId;

    // Update task description in the db
    await db.collection('tasks').updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { description: newDescription } }
    );

    ctx.reply("Task description updated.");
    ctx.scene.leave(); // Leave edit scene
    ctx.scene.enter('taskList'); // Re-enter task list scene to view updated tasks
});

// Handle Delete Task Callback
bot.action(/^deleteTask:(.*)$/, async (ctx) => {
    const taskId = ctx.match[1];

    // Delete the task from the db
    await db.collection('tasks').deleteOne({ _id: new ObjectId(taskId) });

    ctx.reply("Task deleted.");
    ctx.scene.leave(); // Leave delete scene
    ctx.scene.enter('taskList'); // Re-enter task list scene to view updated tasks
});
  

bot.action('reviewSubmittedTasks', (ctx) => {
    ctx.deleteMessage(); // Clear the admin panel message
    ctx.scene.enter('reviewSubmittedTasks'); // Enter the scene to review tasks
});


//BONUS BUTTON
bot.hears('🎁 Bonus', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let bonusamount = admin[0].bonus
        let bots = admin[0].botstat
        let currency = admin[0].cur
        if (bots == 'Active') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                let bdata = await db.collection('BonusUsers').find({ userID: ctx.from.id }).toArray()
                var duration_in_hours;
                var time = new Date().toISOString();
                if (bdata.length == 0) {
                    db.collection('BonusUsers').insertOne({ userID: ctx.from.id, bonus: new Date() })
                    duration_in_hours = 24;
                } else {
                    duration_in_hours = ((new Date()) - new Date(bdata[0].bonus)) / 1000 / 60 / 60;
                }
                if (duration_in_hours >= 24) {
                    let userbal = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
                    var cur = userbal[0].balance * 1
                    var balance = cur + bonusamount
                    db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { balance: balance } }, { upsert: true })
                    db.collection('BonusUsers').updateOne({ userID: ctx.from.id }, { $set: { bonus: time } }, { upsert: true })
                    ctx.replyWithMarkdown(
                        '*🎁 Congrats , You Recieved ' + bonusamount + ' ' + currency + '\n\n🔎 Check Back After 24 Hours* '
                    )
                } else {
                    ctx.replyWithMarkdown(
                        '*⛔ You Already Recieved Bonus In Last 24 Hours *'
                    )
                }
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
bot.hears('/broadcast', async (ctx) => {
    if (ctx.from.id == 1003376875) {
        ctx.replyWithMarkdown(
            '*📨 Enter Message To Broadcast*', { reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('broadcast')
    }
})
broadcast.hears(regex, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
            ctx.scene.leave('broadcast')
        } else {
            total = 0
            let users = await db.collection('allUsers').find({}).toArray()
            ctx.replyWithMarkdown(
                '*📣 Broadcast Sent To: ' + users.length + ' Users*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
            users.forEach((element, i) => {
                if (total == 5) {
                    total -= total
                    sleep(5)
                }
                total += 1
                bot.telegram.sendMessage(element.userID, "*📣 Broadcast*\n\n" + ctx.message.text, { parse_mode: 'markdown' }).catch((err) => console.log(err))
            })
            ctx.scene.leave('broadcast')
        }
    } catch (error) {
        console.log(error)
    }
})
wallet.hears(regex, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let channel = admin[0].channels
        var flag = 0;
        for (i in channel) {
            let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
            let result = res.status
            if (result == 'creator' || result == 'administrator' || result == 'member') {
                flag += 1
            } else {
                flag = 0
            }
        }
        if (flag == channel.length) {
            db.collection('allUsers').updateOne({ userID: ctx.from.id }, { $set: { wallet: ctx.message.text } }, { upsert: true })
            if (ctx.message.text == '⛔ Cancel') {
                ctx.replyWithMarkdown(
                    '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
            } else {
                ctx.replyWithMarkdown(
                    '*🗂 Wallet Address Set To: *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
                console.log(/^[a-zA-Z0-9]+$/.test("0xErts"))
            }
        } else {
            mustjoin(ctx)
        }
        ctx.scene.leave('wallet')
    } catch (error) {
        console.log(error)
    }
})
onWithdraw.on('text', async (ctx) => {
    try {
        ctx.scene.leave('onWithdraw')
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let mini_with = admin[0].minimum
        let currency = admin[0].cur
        let pay = admin[0].paychannel
        let bots = admin[0].withstat
        if (bots == 'ON') {
            let channel = admin[0].channels
            var flag = 0;
            for (i in channel) {
                let res = await bot.telegram.getChatMember(channel[i], ctx.from.id)
                let result = res.status
                if (result == 'creator' || result == 'administrator' || result == 'member') {
                    flag += 1
                } else {
                    flag = 0
                }
            }
            if (flag == channel.length) {
                let userbalance = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
                let guy = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
                let inc = await db.collection('allUsers').find({ stats: "stats" }).toArray()
                let toinc = (inc[0].value * 1) + parseInt(ctx.message.text)
                let ub = userbalance[0].balance * 1
                let wallet = guy[0].wallet
                if (ctx.message.text == '⛔ Cancel'){
                  ctx.replyWithMarkdown(

                        '*⛔ Withdrawal Cancelled*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }

                    )
                    ctx.scene.leave('onWithdraw')
                    return 0;
                } else if (isNaN(ctx.message.text)){
                    ctx.replyWithMarkdown(
                        '*⛔ Only Numeric Value Allowed*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                    )
                    ctx.scene.leave('onWithdraw')
                    return 0;
                } else if (ctx.message.text > ub) {
                    ctx.replyWithMarkdown(
                        '*⛔ Entered Amount Is Greater Than Your Balance*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                    )
                    ctx.scene.leave('onWithdraw')
                    return 0;
                } else if (ctx.message.text < mini_with) {
                    ctx.replyWithMarkdown(

                        '*⚠️ Minimum Withdrawal Is ' + mini_with + ' ' + currency + '*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }

                    )
                    ctx.scene.leave('onWithdraw')
                    return 0;
                } else if (ctx.message.text > 10){
                  ctx.replyWithMarkdown(

                        '*⚠️ Maximum Withdrawal Is 10 ' + currency + '*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }

                    )
                    ctx.scene.leave('onWithdraw')
                    return 0;
                } else {
                    bot.telegram.sendMessage(ctx.from.id,"*🤘Withdrawal Confirmation\n\n🔰 Amount : "+ctx.message.text+" "+currency+"\n🗂 Wallet :* `"+wallet+"`\n*✌️Confirm Your Transaction By Clicking On '✅ Approve'*",{parse_mode:'Markdown', reply_markup: {inline_keyboard: [[{text:"✅ Approve",callback_data:"approve"},{text:"❌ Cancel",callback_data:"cancel"}]]}})
                    }
                    db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { toWithdraw: ctx.message.text } }, { upsert: true })
                    ctx.scene.leave('onWithdraw')
                    return 0;
            } else {
                mustjoin(ctx)
            }
        } else {
            ctx.replyWithMarkdown('*⛔ Bot Is Currently Off*')
        }
    } catch (error) {
        console.log(error)
    }
})
bot.action("approve",async(ctx) => {
  try{
    let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
    let mini_with = admin[0].minimum
    let currency = admin[0].cur
    let pay = admin[0].paychannel
    let bots = admin[0].withstat
    let userbalance = await db.collection('balance').find({ userID: ctx.from.id }).toArray()
    let toWith = userbalance[0].toWithdraw * 1
    let balan = userbalance[0].balance * 1
    let guy = await db.collection('allUsers').find({ userID: ctx.from.id }).toArray()
    let inc = await db.collection('allUsers').find({ stats: "stats" }).toArray()
    let toinc = (inc[0].value * 1) + parseInt(toWith)
    let ub = userbalance[0].balance * 1
    let wallet = guy[0].wallet
    if(toWith > balan){
      ctx.deleteMessage()
      ctx.replyWithMarkdown("*❌ Withdrawal Failed*")
    }
    if(toWith == 0){
      ctx.deleteMessage()
      ctx.replyWithMarkdown("*❌No Amount Available For Withdrawal*")
      return 0;
    } else {
        var newbal = parseFloat(ub) - parseFloat(toWith)
        db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { balance: newbal } }, { upsert: true })
        db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { toWithdraw:toWith } }, { upsert: true })
        db.collection('allUsers').updateOne({ userID: ctx.from.id }, { $set: { toWithdraw:toWith, balance: newbal } }, { upsert: true })
        db.collection('withdrawals').insertOne({ userID: ctx.from.id, balance: newbal, toWithdraw: toWith,createdAt: new Date()  })
        db.collection('allUsers').updateOne({ stats: "stats" }, { $set: { value: parseFloat(toinc) } }, { upsert: true })
        ctx.deleteMessage()
        ctx.replyWithMarkdown(
                        "*✅ New Withdrawal Processed ✅\n\n🚀Amount : " + toWith + " " + currency + "\n⛔ Wallet :* `" + wallet + "`\n*💡 Bot: @" + ctx.botInfo.username + "*", {parse_mode:'markdown', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                    )
            bot.telegram.sendMessage(pay, "<b>✅ New Withdrawal Requested ✅\n\n🟢 User : <a href='tg://user?id=" + ctx.from.id + "'>" + ctx.from.id + "</a>\n\n🚀Amount : " + toWith + " " + currency + "\n⛔ Address :</b> <code>" + wallet + "</code>\n\n<b>💡 Bot: @" + ctx.botInfo.username + "</b>", { parse_mode: 'html' })
             let swg = admin[0].subwallet
             let mkey = admin[0].mkey
             let mid = admin[0].mid
             let comment = admin[0].comment
             let amount = toWith
             var url = 'https://job2all.xyz/api/index.php?mid='+mid+'&mkey='+mkey+'&guid='+swg+'&mob='+wallet+'&amount='+amount+'&info='+comment+'';
              axios.post(url)
              .then(res => {
                console.log("Result:\n"+res)

              })
              .catch(error => {
                console.error(error)
              })
             //paytm(wallet, amount, swg, mkey, mid, comment);
    }
    ctx.scene.leave('onWithdraw')
  } catch(err) {
    console.log(err)
  }
})
// bot.action("")

bot.action("cancel",async(ctx)=> {
  try{
     db.collection('balance').updateOne({ userID: ctx.from.id }, { $set: { toWithdraw:0.00 } }, { upsert: true })
     ctx.deleteMessage()
     ctx.replyWithMarkdown(

                        "*❌ Withdrawal Cancelled *", {parse_mode:'markdown', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }

                    )
     ctx.scene.leave('onWithdraw')
  } catch(err) {
    console.log(err)
  }
})
bot.action("new_task_request",async(ctx)=> {
  ctx.scene.enter("CONTACT_DATA_WIZARD_SCENE_ID")
})
refer.hears(/^[+-]?([0-9]*[.])?[0-9]+/i, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            let final = ctx.message.text * 1
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { ref: final } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂New Refer Amount Set To: *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('refer')
    } catch (error) {
        console.log(error)
    }
})
mini.hears(/^[+-]?([0-9]*[.])?[0-9]+/i, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            let final = ctx.message.text * 1
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { minimum: final } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂New Minimum Withdraw Set To: *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('mini')
    } catch (error) {
        console.log(error)
    }
})
bon.hears(/^[+-]?([0-9]*[.])?[0-9]+/i, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            let final = ctx.message.text * 1
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { bonus: final } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂New Daily Bonus Set To: *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('bonus')
    } catch (error) {
        console.log(error)
    }
})
tgid.hears(/^[0-9]+$/, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            let user = parseInt(ctx.message.text)
            let data = await db.collection('allUsers').find({ userID: user }).toArray()
            let used = await db.collection('balance').find({ userID: user }).toArray()
            if (!data[0]) {
                ctx.replyWithMarkdown(
                    '*⛔ User Is Not Registered In Our db *', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
            } else {
                let bal = used[0].balance
                let add = data[0].wallet
                let invite;
                if (!data[0].inviter) {
                    invite = 'Not Invited'
                } else {
                    invite = data[0].inviter
                }
                ctx.reply(
                    '<b>🫂 User : <a href="tg://user?id=' + ctx.message.text + '">' + ctx.message.text + '</a>\n⛔ User Id</b> : <code>' + ctx.message.text + '</code>\n\n<b>💰 Balance : ' + bal + '\n🗂 Wallet : </b><code>' + add + '</code>\n<b>🙌🏻 Inviter : </b><code>' + invite + '</code>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
            }
        }
        ctx.scene.leave('tgid')
    } catch (error) {
        console.log(error)
    }
})
subwallet.hears(regex, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { subwallet: ctx.message.text } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂 Subwallet Guid Set To : *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('subwallet')
    } catch (error) {
        console.log(error)
    }
})
mkey.hears(regex, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { mkey: ctx.message.text } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂 Merchant Key Set To : *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('mkey')
    } catch (error) {
        console.log(error)
    }
})
mid.hears(regex, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { mid: ctx.message.text } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂 Merchant Id Set To : *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('mid')
    } catch (error) {
        console.log(error)
    }
})
comment.hears(regex, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { comment: ctx.message.text } }, { upsert: true })
            ctx.replyWithMarkdown(
                '*🗂 Payment Description Set To : *\n`' + ctx.message.text + '`', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('comments')
    } catch (error) {
        console.log(error)
    }
})
incr.hears(regex, async (ctx) => {
    try {
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            let message = ctx.message.text
            let data = message.split(" ")
            let user = data[0]
            let amount = data[1] * 1
            let already = await db.collection('balance').find({ userID: parseInt(user) }).toArray()
            let bal = already[0].balance * 1
            let final = bal + amount
            db.collection('balance').updateOne({ userID: parseInt(user) }, { $set: { balance: final } }, { upsert: true })
            ctx.reply(
                '<b>💰 Balance Of <a href="tg://user?id=' + user + '">' + user + '</a> Was Increased By ' + amount + '\n\n💰 Final Balance = ' + final + '</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
            bot.telegram.sendMessage(user, "*💰 Admin Gave You A Increase In Balance By " + amount + "*", { parse_mode: 'markdown' })
        }
        ctx.scene.leave('incr')
    } catch (error) {
        console.log(error)
    }
})
chnl.hears(regex, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else if (ctx.message.text[0] == "@") {
            let channel = admin[0].channels
            channel.push(ctx.message.text)
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { channels: channel } }, { upsert: true })
            ctx.reply(
                '<b>🗂 Channel Added To Bot : ' + ctx.message.text + '</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            ctx.replyWithMarkdown(
                '*⛔ Channel User Name Must Start With "@"*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('chnl')
    } catch (error) {
        console.log(error)
    }
})
removechnl.hears(regex, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        var chan = admin[0].channels
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else if (ctx.message.text[0] == "@") {
            if (contains("" + ctx.message.text + "", chan)) {
                var result = arrayRemove(chan, "" + ctx.message.text + "");
                db.collection('admindb').updateOne({ admin: "admin" }, { $set: { channels: result } }, { upsert: true })
                ctx.reply(
                    '<b>🗂 Channel Removed From Bot : ' + ctx.message.text + '</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
            } else {
                ctx.reply(
                    '<b>⛔ Channel Not In Our db</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
                )
            }
        } else {
            ctx.replyWithMarkdown(
                '*⛔ Channel User Name Must Start With "@"*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('removechnl')
    } catch (error) {
        console.log(error)
    }
})
paychnl.hears(regex, async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        if (ctx.message.text == '⛔ Cancel') {
            ctx.replyWithMarkdown(
                '*🏡 Welcome To Main Menu*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else if (ctx.message.text[0] == "@") {
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { paychannel: "" + ctx.message.text + "" } }, { upsert: true })
            ctx.reply(
                '<b>🗂 Pay Channel Set To : ' + ctx.message.text + '</b>', { parse_mode: 'html', reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        } else {
            ctx.replyWithMarkdown(
                '*⛔ Channel User Name Must Start With "@"*', { reply_markup: { keyboard: [['💰 Balance'], ['🙌🏻 Invite', '🎁 Bonus', '🗂 Wallet'], ['💳 Withdraw', '📊 Statistics', '📝 View Tasks']], resize_keyboard: true } }
            )
        }
        ctx.scene.leave('paychnl')
    } catch (error) {
        console.log(error)
    }
})
bot.action('botstat', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let paychannel = admin[0].paychannel
        let bonusamount = admin[0].bonus
        let mini_with = admin[0].minimum
        let refer = admin[0].ref
        let stat = admin[0].botstat
        let withst = admin[0].withstat
        let swg = admin[0].subwallet
        let mkey = admin[0].MKEY
        let mid = admin[0].MID
        let chnl = admin[0].channels
        var final = "\n\t\t\t\t";
        for (i in chnl) {
            final += chnl[i] + "\n\t\t\t\t";
        }
        if (swg == 'NOT SET' && mkey == 'NOT SET' && mid == 'NOT SET') {
            var keys = '❌ NOT SET'
        } else {
            var keys = '✅ SET'
        }
        if (stat == 'Active') {
            var botstt = '🚫 Disabled'
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { botstat: 'Disabled' } }, { upsert: true })
        } else {
            var botstt = '✅ Active'
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { botstat: 'Active' } }, { upsert: true })
        }
        if (withst == 'ON') {
            var with_stat = '✅ On'
        } else {
            var with_stat = '🚫 Off'
        }
        if (ctx.from.id == 1003376875 ) {
            ctx.editMessageText("<b>🏡 Hey " + ctx.from.first_name + "\n🤘🏻 Welcome To Admin Panel\n\n💡 Bot Current Stats: \n\t\t\t\t📛 Bot : @" + ctx.botInfo.username + "\n\t\t\t\t🤖 Bot Status: " + botstt + "\n\t\t\t\t📤 Withdrawals : " + with_stat + "\n\t\t\t\t🌲 Channel:" + final + "\n\t\t\t\t💰 Refer: " + refer + "\n\t\t\t\t💰 Minimum: " + mini_with + "\n\t\t\t\t💲 Currency: " + currency + "\n\t\t\t\t🎁 Bonus: " + bonusamount + "\n\t\t\t\t📤 Pay Channel: " + paychannel + "\n\t\t\t\t✏️ Paytm Keys :</b> <code>" + keys + "</code> "
                , { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "💰 Change Refer", callback_data: "refer" }, { text: "💰 Change Minimum", callback_data: "minimum" }], [{ text: "🤖 Bot : " + botstt + "", callback_data: "botstat" }], [{ text: "🌲 Change Channels", callback_data: "channels" }, { text: "🎁 Change Bonus", callback_data: "bonus" }], [{ text: "📤 Withdrawals : " + with_stat + "", callback_data: "withstat" }], [{ text: "🚹 User Details", callback_data: "userdetails" }, { text: "🔄 Change Balance", callback_data: "changebal" }], [{ text: "✏️ Paytm Keys : " + keys + "", callback_data: "keys" }]] } })
        }
    } catch (error) {
        console.log(error)
    }
})
bot.action('withstat', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        let paychannel = admin[0].paychannel
        let bonusamount = admin[0].bonus
        let mini_with = admin[0].minimum
        let refer = admin[0].ref
        let stat = admin[0].botstat
        let withst = admin[0].withstat
        let swg = admin[0].subwallet
        let mkey = admin[0].MKEY
        let mid = admin[0].MID
        let chnl = admin[0].channels
        var final = "\n\t\t\t\t";
        for (i in chnl) {
            final += chnl[i] + "\n\t\t\t\t";
        }
        if (swg == 'NOT SET' && mkey == 'NOT SET' && mid == 'NOT SET') {
            var keys = '❌ NOT SET'
        } else {
            var keys = '✅ SET'
        }
        if (stat == 'Active') {
            var botstt = '✅ Active'
        } else {
            var botstt = '🚫 Disabled'
        }
        if (withst == 'ON') {
            var with_stat = '🚫 Off'
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { withstat: 'OFF' } }, { upsert: true })
        } else {
            var with_stat = '✅ On'
            db.collection('admindb').updateOne({ admin: "admin" }, { $set: { withstat: 'ON' } }, { upsert: true })
        }
        if (ctx.from.id == 1003376875) {
            ctx.editMessageText("<b>🏡 Hey " + ctx.from.first_name + "\n🤘🏻 Welcome To Admin Panel\n\n💡 Bot Current Stats: \n\t\t\t\t📛 Bot : @" + ctx.botInfo.username + "\n\t\t\t\t🤖 Bot Status: " + botstt + "\n\t\t\t\t📤 Withdrawals : " + with_stat + "\n\t\t\t\t🌲 Channel:" + first + "\n\t\t\t\t💰 Refer: " + refer + "\n\t\t\t\t💰 Minimum: " + mini_with + "\n\t\t\t\t💲 Currency: " + currency + "\n\t\t\t\t🎁 Bonus: " + bonusamount + "\n\t\t\t\t📤 Pay Channel: " + paychannel + "\n\t\t\t\t✏️ Paytm Keys :</b> <code>" + keys + "</code> "
                , { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "💰 Change Refer", callback_data: "refer" }, { text: "💰 Change Minimum", callback_data: "minimum" }], [{ text: "🤖 Bot : " + botstt + "", callback_data: "botstat" }], [{ text: "🌲 Change Channels", callback_data: "channels" }, { text: "🎁 Change Bonus", callback_data: "bonus" }], [{ text: "📤 Withdrawals : " + with_stat + "", callback_data: "withstat" }], [{ text: "🚹 User Details", callback_data: "userdetails" }, { text: "🔄 Change Balance", callback_data: "changebal" }], [{ text: "✏️ Paytm Keys : " + keys + "", callback_data: "keys" }]] } })
        }
    } catch (error) {
        console.log(error)
    }
})
bot.action('refer', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Enter New Refer Bonus Amount*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('refer')
    } catch (error) {
        console.log(error)
    }
})
bot.action('minimum', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Enter New Minimum Withdraw Amount*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('mini')
    } catch (error) {
        console.log(error)
    }
})
bot.action('bonus', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Enter New Daily Bonus Amount*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('bonus')
    } catch (error) {
        console.log(error)
    }
})
bot.action('userdetails', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Enter Users Telegram Id to Check His Info*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('tgid')
    } catch (error) {
        console.log(error)
    }
})
bot.action('keys', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let swg = admin[0].subwallet
        let mkey = admin[0].mkey
        let mid = admin[0].mid
        let com = admin[0].comment
        if (swg == 'NOT SET' && mkey == 'NOT SET' && mid == 'NOT SET') {
            var keys = '❌ NOT SET'
            ctx.editMessageText("*✏️ Your Paytm Keys: \n\n🗝️ Subwallet Guid :* `" + keys + "`\n*🗝️ Merchant Key:* `" + keys + "`\n*🗝️ Merchant Id :* `" + keys + "`\n*💬 Comment :* `" + com + "`", { parse_mode: 'markdown', reply_markup: { inline_keyboard: [[{ text: "✅ SUBWALLET GUID", callback_data: "subwallet" }, { text: "✅ MERCHANT KEY", callback_data: "mkey" }], [{ text: "✅ MERCHANT ID", callback_data: "mid" }, { text: "✅ COMMENT", callback_data: "comment" }]] } })
        } else {
            ctx.editMessageText("*✏️ Your Paytm Keys: \n\n🗝️ Subwallet Guid :* `" + swg + "`\n*🗝️ Merchant Key:* `" + mkey + "`\n*🗝️ Merchant Id :* `" + mid + "`\n*💬 Comment :* `" + com + "`", { parse_mode: 'markdown', reply_markup: { inline_keyboard: [[{ text: "✅ SUBWALLET GUID", callback_data: "subwallet" }, { text: "✅ MERCHANT KEY", callback_data: "mkey" }], [{ text: "✅ MERCHANT ID", callback_data: "mid" }, { text: "✅ COMMENT", callback_data: "comment" }]] } })
        }
    } catch (error) {
        console.log(error)
    }
})
bot.action('subwallet', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send Your Subwallet GUID*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('subwallet')
    } catch (error) {
        console.log(error)
    }
})
bot.action('mkey', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send Your Merchant Key*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('mkey')
    } catch (error) {
        console.log(error)
    }
})
bot.action('mid', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send Your Merchant Id*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('mid')
    } catch (error) {
        console.log(error)
    }
})
bot.action('comment', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send Your Description For Payment*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('comment')
    } catch (error) {
        console.log(error)
    }
})
bot.action('changebal', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send User Telegram Id & Amount\n\n⚠️ Use Format : *`' + ctx.from.id + ' 10`', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('incr')
    } catch (error) {
        console.log(error)
    }
})
bot.action('channels', async (ctx) => {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let chnl = admin[0].channels
        var final = "";
        if (chnl.length == 0) {
            final = "📣 No Channels Set"
        } else {
            for (i in chnl) {
                final += chnl[i] + "\n\t\t\t\t";
            }
        }
        ctx.editMessageText("<b>🏡 Currently Set Channels:\n\t\t\t\t " + final + " </b>", { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: "➕ Add Channels", callback_data: "chnl" }, { text: "➖ Remove Channel", callback_data: "removechnl" }], [{ text: "📤 Pay Channel", callback_data: "paychannel" }]] } })
    } catch (error) {
        console.log(error)
    }
})
bot.action('chnl', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send New Username Of Channel*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('chnl')
    } catch (error) {
        console.log(error)
    }
})
bot.action('removechnl', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send Username Of Channel*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('removechnl')
    } catch (error) {
        console.log(error)
    }
})
bot.action('paychannel', async (ctx) => {
    try {
        ctx.deleteMessage()
        ctx.reply(
            '*💡 Send Username Of Channel*', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('paychnl')
    } catch (error) {
        console.log(error)
    }
})
bot.action('check', async (ctx) => {
    try {
        let userdata = await db.collection('pendingUsers').find({ userID: ctx.from.id }).toArray()
        let invite = userdata[0].inviter
        ctx.editMessageText(
            "<b>💹 You Were Invited By <a href='tg://user?id=" + invite + "'>" + invite + "</a></b>", { parse_mode: 'html' }
        )
    } catch (error) {
        console.log(error)
    }
})
bot.action('wallet', async (ctx) => {
    try {
        ctx.deleteMessage()
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let currency = admin[0].cur
        ctx.reply(
            '*✏️ Now Send Your ' + currency + ' Wallet Address To Use It For Future Withdrawals*\n\n⚠️ _This Wallet Will Be Used For Future Withdrawals !!_', { parse_mode: 'markdown', reply_markup: { keyboard: [['⛔ Cancel']], resize_keyboard: true } }
        )
        ctx.scene.enter('wallet')
    } catch (error) {
        console.log(error)
    }
})

async function mustjoin(ctx) {
    try {
        let admin = await db.collection('admindb').find({ admin: "admin" }).toArray()
        let chnl = admin[0].channels
        var final = '';
        for (i in chnl) {
            final += chnl[i] + "\n";
        }
        ctx.reply(
            "<b>⛔ Must Join All Our Channel</b>\n\n" + final + "\n<b>✅ After Joining, Click On '🟢 Joined'</b>", { parse_mode: 'html', reply_markup: { keyboard: [['🟢 Joined']], resize_keyboard: true } }
        )
    } catch (error) {
        console.log(error)
    }
};
function sleep(in_sec) {
    return new Promise(resolve => setTimeout(resolve, in_sec * 1000));
};
function paytm(wallet, amount, subwallet, mkey, mid, comment) {
     const https = require('https');
     const PaytmChecksum = require('./PaytmChecksum');

     var id = between(10000000, 99999999);
     var order = "ORDERID_" + id

     var paytmParams = {};

     paytmParams["subwalletGuid"] = subwallet;
     paytmParams["orderId"] = order;
     paytmParams["beneficiaryPhoneNo"] = wallet;
     paytmParams["amount"] = parseInt(amount);
     paytmParams["comments"] = comment;

     var post_data = JSON.stringify(paytmParams);

     PaytmChecksum.generateSignature(post_data, mkey).then(function (checksum) {

         var x_mid = mid;
         var x_checksum = checksum;

         var options = {
             hostname: 'dashboard.paytm.com',
             path: '/bpay/api/v1/disburse/order/wallet/gratification',
             port: 443,
            method: 'POST',
            headers: {
                 'Content-Type': 'application/json',
                 'x-mid': x_mid,
                'x-checksum': x_checksum,
                 'Content-Length': post_data.length
            }
         };

         var response = "";
         var post_req = https.request(options, function (post_res) {
             post_res.on('data', function (chunk) {
                 response += chunk;
            });

             post_res.on('end', function () {
                 console.log(response)
             });
         });

         post_req.write(post_data);
         post_req.end();
     });
 };
 function between(min, max) {
     return Math.floor(
         Math.random() * (max - min) + min
     )
 }
function arrayRemove(arr, value) {

     return arr.filter(function (ele) {
         return ele != value;
     });
 }
 function contains(obj, list) {
     var i;
     for (i = 0; i < list.length; i++) {
         if (list[i] === obj) {
             return true;
        }
    }
    return false;
 }


