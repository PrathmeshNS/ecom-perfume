const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create order from cart
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { addressId, address: newAddress, transactionId } = req.body;

  // Get cart
  const cart = await Cart.findOne({ userId: req.user._id }).populate(
    "items.productId"
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Resolve address
  let address;
  if (addressId) {
    const user = await User.findById(req.user._id);
    const savedAddress = user.addresses.id(addressId);
    if (!savedAddress) {
      throw new ApiError(400, "Address not found");
    }
    address = savedAddress.toObject();
    delete address._id;
  } else if (newAddress) {
    address = newAddress;
  } else {
    throw new ApiError(400, "Address is required");
  }

  // Build order items and validate stock
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.productId;
    if (!product) {
      throw new ApiError(400, "Product not found in cart");
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.name}. Available: ${product.stock}`
      );
    }

    orderItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
    });

    totalAmount += product.price * item.quantity;
  }

  // Reduce stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  // Create order
  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    totalAmount,
    address,
    status: "pending",
    paymentStatus: "pending",
    transactionId: transactionId || "",
  });

  // Clear cart
  await Cart.findOneAndDelete({ userId: req.user._id });

  await order.populate("items.productId", "name images brand");

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: { order },
  });
});

// @desc    Get user orders
// @route   GET /api/orders
const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId: req.user._id })
      .populate("items.productId", "name images brand price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ userId: req.user._id }),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user._id,
  })
    .populate("items.productId", "name images brand price")
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.json({ success: true, data: { order } });
});

// ========== ADMIN ORDER CONTROLLERS ==========

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { status, paymentStatus } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("userId", "name email")
      .populate("items.productId", "name images brand price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id
const updateOrder = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();
  await order.populate("userId", "name email");
  await order.populate("items.productId", "name images brand price");

  res.json({
    success: true,
    message: "Order updated successfully",
    data: { order },
  });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrder,
};
