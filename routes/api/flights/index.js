
const { Router } = require("express");
const { requireAuthentication } = require("@utopia-airlines-wss/common/middleware");

const router = Router();

const { flightController } = require("../../../controller");

router.route("/")
  .get(flightController.getAll)
  .all(requireAuthentication({ roles: ["ADMIN"] }))
  .post(flightController.create);

router.route("/:id")
  .get(flightController.getById)
  .all(requireAuthentication({ roles: ["ADMIN"] }))
  .put(flightController.updateById)
  .delete(flightController.deleteById);

module.exports = router;