const Invoice = require("../models/invoice.model");
const catchAsyncErrors = require("../util/catchAsyncErrors");
const AppError = require("../util/appError");
const crypto = require("crypto");
const subscriptionInvoice = require("../util/template/subscriptionInvoice");

// Create a new Invoice
exports.createNew = catchAsyncErrors(async(req, res, next) => {
	const randomNumber = crypto.randomBytes(4).toString('hex');
  const invoice_id = 'INV-'+randomNumber;
  
  const data = {
  	invoice_id,
  	userId: req.user._id,
  	purpose: 'subscription',
  	companyName: 'ItsProAli',
  };

  subscriptionInvoice({
  	invoice_id
  });

  return res.status(201).json({
		success: true,
		message: "Invoice Created"
	});

	const invoiceData = await Invoice.create(data);
	res.status(201).json({
		success: true,
		message: "New Invoice Created",
		data: invoiceData,
	})
});

// Get All Subscription Invoice for a user
exports.getSubscriptionInvoice = catchAsyncErrors(async(req, res, next) => {
	const data = await Invoice.find({ userId: req.user._id, purpose: 'subscription' });

	res.status(200).json({
		success: true,
		data
	})
});