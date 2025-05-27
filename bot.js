import TelegramBot from 'node-telegram-bot-api';
import { nanoid } from 'nanoid';
import { appendRow, checkExistingToken, removeToken } from './sheetService.js';

const TELEGRAM_TOKEN = '7054318996:AAFtEbm2eVw1ithLNRZXcbrq6v13l5ChAW8';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const SPREADSHEET_ID = '1eNv4Pv72Dz97bVmySaC4uPvCRCComJTVGyzNg9N7AtE';
const SHEET_RANGE = 'Sheet1!A1';

const userTokens = new Map();

// NEW COMMAND: /removetoken (admin only)
bot.onText(/^\/removetoken (\d+)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const adminId = msg.from.id;
  const userIdToRemove = match[1];
  
  // Add your admin ID check here
  // if (adminId !== YOUR_ADMIN_ID) return;
  
  try {
    const removed = await removeToken(SPREADSHEET_ID, userIdToRemove);
    userTokens.delete(userIdToRemove); // Clear from cache
    
    if (removed) {
      await bot.sendMessage(chatId, `✅ Token for user ${userIdToRemove} removed successfully.`);
    } else {
      await bot.sendMessage(chatId, `❌ No token found for user ${userIdToRemove}.`);
    }
  } catch (err) {
    console.error('Remove token error:', err);
    await bot.sendMessage(chatId, '❌ Failed to remove token.');
  }
});

bot.onText(/^\/start(?:\s(verify))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isVerify = match[1] === 'verify';

  // Check cache first
  let hasToken = userTokens.has(userId);
  
  // If not in cache, check sheet
  if (!hasToken) {
    try {
      const existingToken = await checkExistingToken(SPREADSHEET_ID, userId);
      if (existingToken) {
        userTokens.set(userId, existingToken);
        hasToken = true;
      }
    } catch (err) {
      console.error('Sheet read error:', err);
    }
  }

  if (isVerify) {
    if (hasToken) {
      return bot.sendMessage(chatId, '✅ You already have a token. Use it or wait for expiry.');
    }

    const token = nanoid(16);
    const timestamp = new Date().toISOString();
    userTokens.set(userId, { token, timestamp });

    try {
      await appendRow(SPREADSHEET_ID, SHEET_RANGE, [userId, token, timestamp]);
      await bot.sendMessage(chatId, `✅ Token generated and valid for 24 hours.\n🔑 Token: \`${token}\``, { 
        parse_mode: 'Markdown' 
      });
    } catch (err) {
      console.error('Sheet error:', err);
      await bot.sendMessage(chatId, '❌ Failed to save token. Please try again.');
    }
    return;
  }

  if (hasToken) {
    return bot.sendMessage(chatId, '✅ You already have an active token. Use it before requesting a new one.');
  }

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Get Free Token (via Ad)', url: 'https://shrinkme.ink/O3h5gM9' }],
        [{ text: '💎 Buy Premium', url: 'https://your-premium-url.com' }],
      ],
    },
  };
  await bot.sendMessage(chatId, '👋 Welcome! Get started by choosing an option:', opts);
});