const catchAsyncErrors = require("../lib/catchAsyncErrors");
const Shipment = require("../models/shipment.model");
const Order = require("../models/order.model");
const AppError = require("../util/appError");
const { OrderStatus } = require("../util/OrderStatus");

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

// TODO : AUTHORIZATION CHECKS

// create a shipment
createShipment = catchAsyncErrors(async (req, res, next) => {
  const data = req.body;
  const today = new Date();

  try {
    const orderResult = await Order.findById(
      { _id: data.orderId },
      { status: 1 }
    );

    if (orderResult.status != OrderStatus.ACCEPTED) {
      return next(new AppError("Order status is not accepted yet", 400));
    }

    const shipment = await Shipment.create({
      order: data.orderId,
      deliveryDays: data.deliveryDays,
      deliverySchedule: {
        startDate: today,
        endDate: today.addDays(data.deliveryDays),
      },
      shipmentNumber: data.shipmentNumber,
      shipmentDocument: req.file.filename,
    });

    res.status(201).json({
      status: "success",
      shipment,
    });
  } catch {
    return next(new AppError("Invalid data provided", 400));
  }
});

// get shipment by id
getShipment = catchAsyncErrors(async (req, res, next) => {
  const shipmentId = req.params.id;

  try {
    const shipment = await Shipment.findById(shipmentId);

    res.status(200).json({
      status: "success",
      shipment,
    });
  } catch {
    return next(new AppError("Error getting shipment", 400));
  }
});

// update the shipment status
updateShipmentStatus = catchAsyncErrors(async (req, res, next) => {
  const shipmentId = req.params.id;

  try {
    const status = req.body.status;
    await Shipment.findByIdAndUpdate(shipmentId, { status });

    res.status(200).json({
      status: "success",
    });
  } catch {
    return next(new AppError("Error updating shipment status", 400));
  }
});

// delete the shipment
deleteShipment = catchAsyncErrors(async (req, res, next) => {
  const shipmentId = req.params.id;

  try {
    await Shipment.findByIdAndDelete(shipmentId);

    res.status(200).json({
      status: "success",
    });
  } catch {
    return next(new AppError("Error deleting shipment", 400));
  }
});

module.exports = [
  createShipment,
  getShipment,
  updateShipmentStatus,
  deleteShipment,
];
