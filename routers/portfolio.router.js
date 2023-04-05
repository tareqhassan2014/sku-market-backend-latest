const protect = require("../middleware/protect");
const router = require("express").Router();

const {
    createPortfolio,
    getPortfolios,
    addProductToPortfolio,
    deletePortfolio,
    deleteAllPortfolio,
    portfolioBulkWrite,
    getEmptySkus,
    portfolioTable,
    removeProductFromPortfolio,
} = require("../controllers/portfolio.controller");

router.use(protect);

router
    .route("/")
    .get(getPortfolios)
    .post(createPortfolio)
    .delete(deleteAllPortfolio);

router.route("/empty").get(getEmptySkus);
router.route("/product").post(addProductToPortfolio).delete(removeProductFromPortfolio);
router.route("/product/bulk").post(portfolioBulkWrite);
router.route("/:id").delete(deletePortfolio).get(portfolioTable);

module.exports = router;
