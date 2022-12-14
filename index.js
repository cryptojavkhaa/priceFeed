const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const cluster = require("./cluster");

// scrape
const browserObject = require("./src/browser");
const scrapperController = require("./src/pageController");
let data = [{ nello: "hello" }];
// cron
const cron = require("node-cron");

// telegram bot
const tele = require("./src/teleg");

// index page
const port = process.env.PORT || 3000;

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.use("/", router);
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// listen bot telegram
tele.raven();

// node cron
cron.schedule("* * * * *", () => {
  console.log("this mean run every minutes");
  // launch browser in instance
  //let browserInstance = browserObject.startBrowser();
  //scrapperController(browserInstance);
  cluster();
});
