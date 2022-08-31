const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();

// scrape
const browserObjects = require("./src/browser");
const scrapperController = require("./src/pageController");

// index page
const port = process.env.PORT || 3000;
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.use("/", router);
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// launch browser in instance
let browserInstance = browserObjects.startBrowser();
scrapperController(browserInstance);
