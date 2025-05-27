import { generateToken, saveToken, hasValidToken } from '../tokenManager.js';
import { appendRow } from '../sheetService.js';
// Removed: import { google } from 'googleapis';

const SPREADSHEET_ID = '1eNv4Pv72Dz97bVmySaC4uPvCRCComJTVGyzNg9N7AtE';
const SHEET_RANGE = 'Sheet1!A1';

export default async function (bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (hasValidToken(userId)) {
    return bot.sendMessage(chatId, '✅ You already have an active token.');
  }

  const token = generateToken();
  const timestamp = new Date().toISOString();

  try {
    saveToken(userId, token);
    await appendRow(SPREADSHEET_ID, SHEET_RANGE, [userId, token, timestamp]);
    bot.sendMessage(
      chatId,
      `✅ Token generated: \`${token}\`\nValid for 24 hours.`,
      { parse_mode: 'Markdown' }
    );
  } catch (e) {
    console.error('Error in get_token.js:', e);
    bot.sendMessage(chatId, '❌ Error generating token. Try again later.');
  }
}