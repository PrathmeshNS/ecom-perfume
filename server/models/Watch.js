const mongoose = require("mongoose");

const watchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Watch name is required"],
      trim: true,
      maxlength: 200,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    tags: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    releaseDate: {
      type: Date,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

watchSchema.index({ name: "text", brand: "text", description: "text" });
watchSchema.index({ brand: 1 });
watchSchema.index({ price: 1 });
watchSchema.index({ categoryId: 1 });
watchSchema.index({ rating: 1 });
watchSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Watch", watchSchema);
