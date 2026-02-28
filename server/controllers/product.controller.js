const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all products (paginated, filterable)
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, search, category, brand, minPrice, maxPrice, sort } =
    req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.categoryId = cat._id;
  }

  if (brand) {
    filter.brand = { $regex: `^${brand}$`, $options: "i" };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const skip = (page - 1) * limit;

  // Build sort object
  let sortObj = {};
  if (sort) {
    const sortFields = sort.split(",");
    sortFields.forEach((field) => {
      if (field.startsWith("-")) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("categoryId", "name slug")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("categoryId", "name slug")
    .lean();

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.json({ success: true, data: { product } });
});

// @desc    Create product (admin)
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, categoryId, brand, stock, rating } =
    req.body;

  // Verify category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(400, "Invalid category ID");
  }

  // Upload images to cloudinary
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "perfume-shop",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      images.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    categoryId,
    brand,
    stock: Number(stock || 0),
    rating: Number(rating || 0),
    images,
  });

  await product.populate("categoryId", "name slug");

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product },
  });
});

// @desc    Update product (admin)
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updateData = { ...req.body };
  if (updateData.price) updateData.price = Number(updateData.price);
  if (updateData.stock) updateData.stock = Number(updateData.stock);
  if (updateData.rating) updateData.rating = Number(updateData.rating);

  // Upload new images if provided
  if (req.files && req.files.length > 0) {
    const images = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "perfume-shop",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      images.push({ url: result.secure_url, publicId: result.public_id });
    }
    updateData.images = [...product.images, ...images];
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("categoryId", "name slug");

  res.json({
    success: true,
    message: "Product updated successfully",
    data: { product },
  });
});

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Delete images from cloudinary
  for (const image of product.images) {
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: "Product deleted successfully" });
});

// ========== CATEGORY CONTROLLERS ==========

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  res.json({ success: true, data: { categories } });
});

// @desc    Create category (admin)
// @route   POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  const existing = await Category.findOne({
    $or: [{ name }, { slug }],
  });
  if (existing) {
    throw new ApiError(400, "Category with this name or slug already exists");
  }

  const category = await Category.create({ name, slug });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category },
  });
});

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if products exist in this category
  const productCount = await Product.countDocuments({
    categoryId: category._id,
  });
  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category with ${productCount} products`
    );
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Category deleted successfully" });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  deleteCategory,
};
