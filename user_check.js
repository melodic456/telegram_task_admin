const { Telegraf } = require('telegraf');

// Replace this with your bot token
const bot = new Telegraf('8065612727:AAHB0jI0vUF0fUaF2GiQLkyJfQFL3jG6TB4');

// Replace with your chat ID (group or channel)
const chatId = '@habijabi34';
// const chatId = '@gsgzggg_bot';

// Replace with the user ID you want to check
const userId = '7374728124';

// Function to check if a user is in the group or channel
async function checkUserInGroup() {
  try {
    // Getting information about the user in the chat
    const chatMember = await bot.telegram.getChatMember(chatId, userId);
    
    // Log the status of the user in the group/channel
    console.log(chatMember); // This will give detailed info about the user
    
    if (chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator') {
      console.log('User is in the group/channel.');
    } else {
      console.log('User is not in the group/channel.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function to check if the user is in the group/channel
checkUserInGroup();
