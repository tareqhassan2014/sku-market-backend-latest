const Subscription = require("../models/subscription.model");
const catchAsyncErrors = require("../util/catchAsyncErrors");
const AppError = require("../util/appError");

const currentYear = new Date().getFullYear();

// Create a New Subscription for an User
exports.createSubscription = catchAsyncErrors(async(req, res, next) => {
  const {
    plan,
    month,
    plan_type,
  } = req.body;

  const prev = await Subscription.findOne({userId: req.user._id})
    .sort({createdAt: -1})
    .limit(1);

  // if(prev && prev.month === month && prev.year === currentYear) {
  //   return next(new AppError("Already Subscribed this month", 400));
  // }

  const newData = {
    month: month,
    userId: req.user._id,
    plan: plan || prev?.plan,
    plan_type: plan_type,
    prev_balance: prev?.ending_balance,
  }
  const result = await Subscription.create(newData);

  res.status(201).json({
    success: true,
    message: "Subscription Successful",
    data: result,
  })
});

// Get Subscription Details
exports.getSubscription = catchAsyncErrors(async(req, res, next) => {
  const subscription = await Subscription.find({userId: req.user._id, plan_status: {$ne: 'inactive'}})
    .sort({ createdAt: -1 })
    .limit(12);

  res.status(200).json({
    success: true,
    data: subscription,
  })
});

// Make a payment
exports.makePayment = catchAsyncErrors(async(req, res, next) => {
  const { _id, amount, date = Date.now(), transaction_id = "SKU-123" } = req.body;
  
  const info = { transaction_id, cost: amount, date};
  const data = await Subscription.findById(_id);

  data.payments.push(info);
  data.total_payment = data.total_payment + amount;
  data.ending_balance = data.ending_balance - amount;

  if(data.ending_balance <= 0.1) {
    console.log(data.ending_balance, date);
    data.plan_status = 'active';
  }

  data.save();

  // const result = await Subscription.updateOne(
  //     { _id },
  //     { 
  //       $push: { 'payments': data },
  //       $inc: { 'total_payment': amount, 'ending_balance': -amount },
  //     },
  //     { runValidators: true }
  //   );


  res.status(200).json({
    success: true,
    message: "Payment Successful",
  })
});
