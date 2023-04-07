const router = require("express").Router();
const protect = require("../middleware/protect");

const { 
	createNew,
	getSubscriptionInvoice,
} = require("../controllers/invoice.controller");

router.route("/create").post(protect, createNew);
router.route("/subscription").get(protect, getSubscriptionInvoice);

module.exports = router;