require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");

const { getCurrentUser, errorHandler } = require("@utopia-airlines-wss/common/middleware");

const PORT = process.env.PORT || process.argv[2] || 3001;

const app = express();

app.use(
  morgan("tiny"),
  express.json(),
  cookieSession({
    name: "session",
    httpOnly: true,
    signed: false,
  }),
  getCurrentUser,
  require("./routes"),
  errorHandler
);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
