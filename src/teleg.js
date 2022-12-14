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
    fs.readFile(path.join(__dirname, "./../db.json"), (err, data) => {
      if (err) throw err;
      let a = JSON.parse(data);
      urls = a;
      urls.forEach((el) => {
        let message = `${new Date(el.date)}
                        \ntrade_coinhub : ${el.trade_coinhub}% 
                        \ncoinhub_trade : ${el.coinhub_trade}%
                        \npossible_amount : ${el.possible_amount}MNT
                        \nprofit : ${el.profit}MNT`;
        // send message
        bot.sendMessage(chatId, message);
      });
    });
  });
};

const sendNotif = (msg) => {
  const target = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatid}&text=${msg}`;
  //console.log(target);
  https.get(target, (res) => {
    console.log("notification telegram sent");
  });
};

module.exports = { raven, sendNotif };
