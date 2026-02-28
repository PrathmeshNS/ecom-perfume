const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get user cart
// @route   GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id }).populate(
    "items.productId",
    "name price images stock brand"
  );

  if (!cart) {
    cart = { userId: req.user._id, items: [] };
  }

  res.json({ success: true, data: { cart } });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      userId: req.user._id,
      items: [{ productId, quantity }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        throw new ApiError(400, `Only ${product.stock} items available`);
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
  }

  await cart.populate("items.productId", "name price images stock brand");

  res.json({
    success: true,
    message: "Item added to cart",
    data: { cart },
  });
});

// @desc    Remove item from cart
// @route   POST /api/cart/remove
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await cart.save();
  await cart.populate("items.productId", "name price images stock brand");

  res.json({
    success: true,
    message: "Item removed from cart",
    data: { cart },
  });
});

// @desc    Update item quantity
// @route   PUT /api/cart/update
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} items available`);
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.productId", "name price images stock brand");

  res.json({
    success: true,
    message: "Cart updated",
    data: { cart },
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user._id });
  res.json({ success: true, message: "Cart cleared" });
});

module.exports = { getCart, addToCart, removeFromCart, updateCartItem, clearCart };
