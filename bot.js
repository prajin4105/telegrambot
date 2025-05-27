import TelegramBot from 'node-telegram-bot-api';
import { readFileSync } from 'fs';

const TELEGRAM_TOKEN = '7054318996:AAFtEbm2eVw1ithLNRZXcbrq6v13l5ChAW8';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const commandConfig = JSON.parse(readFileSync('./bot.json'));

for (const cmd of commandConfig.commands) {
  const handler = await import(cmd.code);
  bot.onText(new RegExp(`^/${cmd.name}(?:\\s(.*))?$`), (msg, match) => {
    handler.default(bot, msg, match);
  });
}

// === commands/start.js ===
export default async function (bot, msg) {
  const chatId = msg.chat.id;

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Get Free Token (via Ad)', url: 'https://shrinkme.ink/O3h5gM9' }],
        [{ text: '💎 Buy Premium', url: 'https://your-premium-url.com' }]
      ]
    }
  };
  bot.sendMessage(chatId, '👋 Welcome! Choose an option to proceed:', opts);
}
