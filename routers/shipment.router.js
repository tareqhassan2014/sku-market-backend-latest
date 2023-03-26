const {
  createShipment,
  getShipment,
  updateShipmentStatus,
  deleteShipment,
} = require("../controllers/shipment.controller");
const protect = require("../middleware/protect");

const router = require("express").Router();

router.route("/create").post(protect, createShipment);
router.route("/get/:id").get(protect, getShipment);
router.route("/updateStatus/:id").patch(protect, updateShipmentStatus);

// export router
module.exports = router;
