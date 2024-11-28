const { Telegraf } = require('telegraf');

// Replace this with your bot token
const bot = new Telegraf('8065612727:AAHB0jI0vUF0fUaF2GiQLkyJfQFL3jG6TB4');

// // Replace with your chat ID (group or channel)
// const chatId = '@habijabi34';
// // const chatId = '@gsgzggg_bot';

// // Replace with the user ID you want to check
// // const userId = '7374728124';
// const userId = '7517068105';

// // Function to check if a user is in the group or channel
// // async function checkUserInGroup(chatId, userId) {
// //   try {
// //     // Getting information about the user in the chat
// //     const chatMember = await bot.telegram.getChatMember(chatId, userId);
    
// //     // Log the status of the user in the group/channel
// //     console.log(chatMember); // This will give detailed info about the user
// //     const status = chatMember.status
    
// //     // if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
// //     //   console.log('User is in the group/channel.');
// //     // } else {
// //     //   console.log('User is not in the group/channel.');
// //     // }

// //     if (status === 'member' || status === 'administrator' ||
// //       0 status === 'creator') {
// //       return true;  // User is a member
// //   } else {
// //       return false; // User is not a member
// //   }
// //   } catch (error) {
// //     console.error('Error:', error);
// //   }
// // }

// // // Call the function to check if the user is in the group/channel
// // checkUserInGroup();
// // const { Telegraf } = require('telegraf');
// // const bot = new Telegraf('YOUR_BOT_TOKEN');  // Replace with your bot token

// // Function to check if the user is a member of a group
// async function isUserInGroup(chatId, userId) {
//     try {
//         const chatMember = await bot.telegram.getChatMember(chatId, userId);

//         // Check the status of the user
//         if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
//           console.log("true")  
//           return true;  // The user is a member, admin, or creator
//         } else {
//           console.log("false")  
//           return false; // The user is not a member
//         }
//     } catch (error) {
//         console.error('Error checking user membership:', error);
//         return false;
//     }
// }

// // Example usage: Check if a user is a member of a group
// // isUserInGroup(chatId, userId)


// const { Telegraf } = require('telegraf');
// const bot = new Telegraf('YOUR_BOT_TOKEN');  // Replace with your bot token

// Function to send task list interactively
async function sendTaskList(ctx) {
    // Example of task list
    // const tasks = [
    //     { id: 1, description: "Complete Task 1", reward: 10 },
    //     { id: 2, description: "Complete Task 2", reward: 20 },
    // ];

    const tasks = [
      { id: 'task1', description: 'Join the group', reward: 10, taskType: true, link: 't.me/your_channel' }
  ];

    // Generate task buttons
    const keyboard = tasks.map(task => [
        { text: `${task.description} - Reward: ${task.reward}`, callback_data: `completeTask:${task.id}` }
    ]);

    // Send message with inline keyboard
    await ctx.reply("Welcome! Here are your tasks:", {
        reply_markup: {
            inline_keyboard: keyboard,
        },
    });
}

// Function to reward the user for completing a task
async function rewardUser(userId, rewardPoints) {
    // Update the user's reward in your database (e.g., MongoDB, MySQL)
    console.log(`Rewarding ${userId} with ${rewardPoints} points.`);

    // Respond to the user (e.g., show them the total points)
    await bot.telegram.sendMessage(userId, `You've earned ${rewardPoints} points!`);
}

// Handling new users joining the group
bot.on('new_chat_members', async (ctx) => {
    // Get the user who joined
    const newUser = ctx.message.new_chat_members[0];
    console.log(newUser)

    // If the new user is not the bot itself
    // if (newUser.id !== ctx.botInfo.id) {
    //     // Send them a task list
    //     // await sendTaskList(ctx);
    // }
});

// Handling task completion (user clicking on task buttons)
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from.id;

    // Check if the callback data contains a task ID
    if (data.startsWith('completeTask:')) {
        const taskId = data.split(':')[1];
        const task = { id: taskId, reward: 10 };  // Example: Get task from your database

        // Reward the user for completing the task
        await rewardUser(userId, task.reward);

        // Acknowledge the task completion and inform the user
        await ctx.answerCallbackQuery(`You completed Task ${task.id} and earned ${task.reward} points!`);

        // Optionally, send a follow-up message or task list
        await sendTaskList(ctx);
    }
});

// Start the bot
bot.launch();
