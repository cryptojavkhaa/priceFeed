const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");

const port = process.env.PORT || 3000;
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.use("/", router);
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
