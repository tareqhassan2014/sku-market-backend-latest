const mongoose = require("mongoose");
const { ShipmentStatus } = require("../util/ShipmentStatus");

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
    },
    deliveryDays: {
      type: Number,
      required: [true, "Delivery Days are Required"],
    },
    deliverySchedule: {
      startDate: {
        type: Date,
        required: [true, "Start Date is required"],
      },
      endDate: {
        type: Date,
        required: [true, "End Date is required"],
      },
    },
    shipmentNumber: {
      type: Number,
      required: [true, "Shipment Number (AWB) is required"],
    },
    shipmentDocument: {
      type: String,
      required: [true, "Shipment Document (PDF) is required"],
    },
    status: {
      type: String,
      enum: ShipmentStatus,
      default: ShipmentStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

const Shipment = mongoose.model("Shipment", shipmentSchema);

module.exports = Shipment;
