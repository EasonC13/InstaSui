import dotenv from "dotenv";
dotenv.config();
const TOKEN = process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
const url = process.env.WEBHOOK_URL || "";

import TelegramBot from "node-telegram-bot-api";

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);
export { bot };

// This informs the Telegram servers of the new webhook.
// bot.setWebHook(`${url}/instaSuiBot`);
