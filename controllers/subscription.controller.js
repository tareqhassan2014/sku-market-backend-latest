const Subscription = require("../models/subscription.model");
const catchAsyncErrors = require("../util/catchAsyncErrors");
const AppError = require("../util/appError");

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentDate = new Date();
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


  if(prev && prev?.ending_balance > 0.1) {
    next(new AppError('Please complete your previous payment to upgrade', 400));
  }
  
  // -- Upgrad previous plan if in the same month --
  if(prev && new Date().setMonth(prev.plan_start.getMonth() + 1, 1) > new Date()) {

    prev.plan = plan || prev.plan;
    prev.plan_type = plan_type || prev.plan_type;
    prev.prev_balance = prev?.ending_balance;
    prev.plan_start = Date.now();
    prev.total_payment = 0;
    prev.plan_status = 'pending';

    if(plan_type === 'annually') {
      prev.plan_end = new Date().setFullYear(currentDate.getFullYear() + 1);
    } else {
      prev.plan_end = new Date().setMonth(currentDate.getMonth() + 1);
    }

    await prev.save();

    return res.status(200).json({
      success: true,
      message: "Plan upgraded",
      data: prev,
    });
    // return next(new AppError("Already Subscribed this month", 400));
  }

  const newData = {
    // month: month,
    userId: req.user._id,
    plan: plan || prev?.plan,
    plan_type: plan_type,
    prev_balance: prev?.ending_balance,
    prev_month: prev?.plan_start,
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

  // plan_status: {$ne: 'inactive'}

  const subscriptions = await Subscription.find({userId: req.user._id})
    .sort({ createdAt: -1 })
    .limit(13);

  let lastPlan = subscriptions[0] || {};
  let prev_plans = subscriptions?.slice(1, 13) || [];

  if (new Date(lastPlan.createdAt).getMonth() === new Date().getMonth()) {
    lastPlan = {...subscriptions[0]?._doc, isCurrent: true };
  } else {
    let prev_plans = subscriptions?.slice(0, 12) || [];
  }

  res.status(200).json({
    success: true,
    data: { 
      lastPlan,
      prev_plans,
    },
  })
});

// Make a payment
exports.makePayment = catchAsyncErrors(async(req, res, next) => {
  const { _id, amount, date = Date.now(), transaction_id = "SKU-123" } = req.body;
  const cost = Number(amount);

  const info = { transaction_id, cost, date};
  const data = await Subscription.findById(_id);

  data.payments.push(info);
  data.total_payment = data.total_payment + cost;
  data.ending_balance = data.ending_balance - cost;

  if(data.ending_balance <= 0.1) {
    data.plan_status = 'active';
  }

  await data.save();

  // const result = await Subscription.updateOne(
  //     { _id },
  //     { 
  //       $push: { 'payments': data },
  //       $inc: { 'total_payment': cost, 'ending_balance': -cost },
  //     },
  //     { runValidators: true }
  //   );


  res.status(200).json({
    success: true,
    message: "Payment Successful",
    data
  })
});

// Cancel Subscription
exports.cancelSubscription = catchAsyncErrors(async(req, res, next) => {
  const { _id } = req.body;

  const subscription = await Subscription.findById(_id);

  // ------------ Update Not Applied ------------
  subscription.plan = 'B2B Marketplace';
  subscription.plan_start = Date.now();
  subscription.plan_end = Date.now();
  subscription.total_payment = 0;
  await subscription.save();

  // subscription.plan_status = 'inactive';

  // await subscription.save();

  // const result = await Subscription.create({ userId: req.user._id })

  res.status(200).json({
    success: true,
    message: 'Subscription cancalled',
    // data: result,
  });

});

// Get Previous Activities
exports.getPreviousActivities = catchAsyncErrors(async(req, res, next) => {
  const data = await Subscription.find({ userId: req.user._id })

  res.status(200).json({
    success: true,
    data
  })
});