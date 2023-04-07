const Invoice = require("../models/invoice.model");
const catchAsyncErrors = require("../util/catchAsyncErrors");
const AppError = require("../util/appError");
const crypto = require("crypto");
const subscriptionInvoice = require("../util/invoice/subscriptionInvoice");

// Create a new Invoice
exports.createNew = catchAsyncErrors(async(req, res, next) => {
	const randomNumber = crypto.randomBytes(5).toString('hex');
  const invoice_id = 'INV-'+randomNumber;
  
  // const user = await User.findById(req.user._id);

  // const data = {
  // 	invoice_id,
  // 	userId: req.user._id,
  // 	purpose: 'subscription',
  // 	companyName: user?.companyName,
  // 	currency: user.defaultCurrency?.label,
  // };

	// const invoiceData = new Invoice(data);
	// console.log(invoiceData);

  // subscriptionInvoice({
  // 	invoice_id
  // });

  // return res.status(201).json({
	// 	success: true,
	// 	message: "Invoice Created",
	// 	randomNumber,
	// 	invoiceData,
	// });

	res.status(201).json({
		success: true,
		message: "New Invoice Created",
		// data: invoiceData,
	})
});

// Get All Subscription Invoice for a user
exports.getSubscriptionInvoice = catchAsyncErrors(async(req, res, next) => {
	const page = Number(req.query.page * 1) || 1;
    const limit = Number(req.query.limit * 1) || 10;
    const skip = (page - 1) * limit;

	const query = { userId: req.user._id, purpose: 'subscription' }
	const data = await Invoice.find(query)
		.skip(skip)
        .limit(limit);

	const total = await Invoice.countDocuments(query);

	res.status(200).json({
		success: true,
		total,
		data,
	})
});