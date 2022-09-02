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
    console.log("msg", msg.chat.id);
    let urls = [];
    const chatId = msg.chat.id;
    fs.readFile(path.join(__dirname, "./../db.json"), (err, data) => {
      console.log("err", err);
      if (err) throw err;
      let a = JSON.parse(data);
      urls = a;
      let message = `today gold price is ${urls[0].last_price}`;

      // send message
      bot.sendMessage(chatId, message);
    });
  });
};

const sendNotif = (msg) => {
  const target = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatid}&text=${msg}`;
  console.log(target);
  https.get(target, (res) => {
    console.log("notification telegram sent");
  });
};

module.exports = { raven, sendNotif };
