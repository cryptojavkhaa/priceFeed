const TelegramBot = require("node-telegram-bot-api");
const https = require("https");
require("dotenv").config();
//get your own telegram bot token from botFather
const token = process.env.TELEGRAM_TOKEN;
const chatid = process.env.TELEGRAM_CHAT_ID;
const fs = require("fs");
const path = require("path");

//create bot use pooling
const bot = new TelegramBot(token, { polling: true });

const raven = () => {
  bot.onText(/\/cek/, (msg) => {
    let urls = [];
    const chatId = msg.chat.id;
    fs.readFileSync(path.join(__dirname, "../db.json"), (err, data) => {
      if (err) throw err;
      let a = JSON.parse(data);
      urls = a;
      let message = `harga emas hari inin adalah ${urls[0].harga_terakhir}`;

      // send message
      bot.sendMessage(chatId, message);
    });
  });
};

const sendNotif = (msg) => {
  const target = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatid}&text=${msg}`;
  https.get(target, (res) => {
    console.log("notif telegram sent");
  });
};

module.exports = { raven, sendNotif };
