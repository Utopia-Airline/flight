const { Router } = require("express");
const router = Router();

router.use("/flights", require("./flights"));

module.exports = router;