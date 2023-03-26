const ShipmentStatus = {
  // When Order Status is ACCEPTED from Buyer (Default Mark)
  PENDING: "PENDING",
  // When Buyer Ships the Order and Attach Documents (Marked by Seller)
  SHIPPED: "SHIPPED",
  // When Order is Delivered by the Shipment Company (Marked by Seller)
  DELIVERED: "DELIVERED",
  // When Buyer Confirms the Delivery (Marked by Buyer)
  CONFIRMED: "CONFIRMED",
  // When Buyer Does not Confirm the Delivery but Order was Marked as Delivered (Marked by Buyer)
  DENIED: "DENIED",
  // (Return to Vendor) When Buyer returns the order to the Seller (Marked by Buyer)
  RTV: "RTV",
  // When Order is Received then Seller after RTV (Marked by Seller)
  RETURNED: "RETURNED",
};

module.exports = {
  ShipmentStatus,
};
