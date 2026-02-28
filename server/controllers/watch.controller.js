const Watch = require("../models/Watch");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all watches (paginated, filterable, sortable)
// @route   GET /api/watches
const getWatches = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    brand,
    minPrice,
    maxPrice,
    category,
    tags,
    minRating,
    sortBy,
    order,
  } = req.query;

  // Dynamic query building
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  if (brand && brand.length > 0) {
    filter.brand = { $in: brand.map((b) => new RegExp(`^${b}$`, "i")) };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.categoryId = cat._id;
  }

  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }

  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  const skip = (page - 1) * limit;

  // Build sort object
  const sortObj = {};
  sortObj[sortBy] = order === "asc" ? 1 : -1;

  const [watches, total] = await Promise.all([
    Watch.find(filter)
      .populate("categoryId", "name slug")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
    Watch.countDocuments(filter),
  ]);

  // Get distinct brands for filter options
  const brands = await Watch.distinct("brand");

  res.json({
    success: true,
    data: {
      watches,
      brands,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get single watch
// @route   GET /api/watches/:id
const getWatch = asyncHandler(async (req, res) => {
  const watch = await Watch.findById(req.params.id)
    .populate("categoryId", "name slug")
    .lean();

  if (!watch) {
    throw new ApiError(404, "Watch not found");
  }

  res.json({ success: true, data: { watch } });
});

// @desc    Create watch (admin)
// @route   POST /api/watches
const createWatch = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    model,
    description,
    price,
    categoryId,
    tags,
    features,
    rating,
    stock,
    releaseDate,
  } = req.body;

  // Verify category if provided
  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(400, "Invalid category ID");
    }
  }

  // Upload images to cloudinary
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "watch-shop",
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

  // Parse tags and features from comma-separated strings if needed
  const parsedTags =
    typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : tags || [];
  const parsedFeatures =
    typeof features === "string"
      ? features.split(",").map((f) => f.trim()).filter(Boolean)
      : features || [];

  const watch = await Watch.create({
    name,
    brand,
    model: model || "",
    description,
    price: Number(price),
    categoryId: categoryId || undefined,
    tags: parsedTags,
    features: parsedFeatures,
    rating: Number(rating || 0),
    stock: Number(stock || 0),
    releaseDate: releaseDate ? new Date(releaseDate) : undefined,
    images,
  });

  if (watch.categoryId) {
    await watch.populate("categoryId", "name slug");
  }

  res.status(201).json({
    success: true,
    message: "Watch created successfully",
    data: { watch },
  });
});

// @desc    Update watch (admin)
// @route   PUT /api/watches/:id
const updateWatch = asyncHandler(async (req, res) => {
  let watch = await Watch.findById(req.params.id);
  if (!watch) {
    throw new ApiError(404, "Watch not found");
  }

  const updateData = { ...req.body };
  if (updateData.price) updateData.price = Number(updateData.price);
  if (updateData.stock) updateData.stock = Number(updateData.stock);
  if (updateData.rating) updateData.rating = Number(updateData.rating);
  if (updateData.releaseDate)
    updateData.releaseDate = new Date(updateData.releaseDate);

  // Parse tags and features
  if (typeof updateData.tags === "string") {
    updateData.tags = updateData.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof updateData.features === "string") {
    updateData.features = updateData.features.split(",").map((f) => f.trim()).filter(Boolean);
  }

  // Verify category if provided
  if (updateData.categoryId) {
    const category = await Category.findById(updateData.categoryId);
    if (!category) {
      throw new ApiError(400, "Invalid category ID");
    }
  }

  // Upload new images if provided
  if (req.files && req.files.length > 0) {
    const images = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "watch-shop",
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
    updateData.images = [...watch.images, ...images];
  }

  watch = await Watch.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("categoryId", "name slug");

  res.json({
    success: true,
    message: "Watch updated successfully",
    data: { watch },
  });
});

// @desc    Delete watch (admin)
// @route   DELETE /api/watches/:id
const deleteWatch = asyncHandler(async (req, res) => {
  const watch = await Watch.findById(req.params.id);
  if (!watch) {
    throw new ApiError(404, "Watch not found");
  }

  // Delete images from cloudinary
  for (const image of watch.images) {
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }

  await Watch.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: "Watch deleted successfully" });
});

module.exports = {
  getWatches,
  getWatch,
  createWatch,
  updateWatch,
  deleteWatch,
};
