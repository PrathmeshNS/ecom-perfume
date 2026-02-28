const Settings = require("../models/Settings");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const cloudinary = require("../config/cloudinary");

const PAYMENT_QR_KEY = "paymentQR";

// @desc    Upload / replace payment QR code image
// @route   POST /api/admin/settings/payment-qr
const uploadPaymentQR = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "QR image file is required");
  }

  // Delete previous QR from cloudinary if exists
  const existing = await Settings.get(PAYMENT_QR_KEY);
  if (existing?.publicId) {
    await cloudinary.uploader
      .destroy(existing.publicId)
      .catch(() => {}); // ignore if already gone
  }

  // Upload new QR to cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ecom/settings", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  const value = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await Settings.set(PAYMENT_QR_KEY, value);

  res.json({
    success: true,
    message: "Payment QR code uploaded successfully",
    data: { paymentQR: value },
  });
});

// @desc    Delete payment QR code image
// @route   DELETE /api/admin/settings/payment-qr
const deletePaymentQR = asyncHandler(async (req, res) => {
  const existing = await Settings.get(PAYMENT_QR_KEY);

  if (existing?.publicId) {
    await cloudinary.uploader.destroy(existing.publicId).catch(() => {});
  }

  await Settings.deleteOne({ key: PAYMENT_QR_KEY });

  res.json({
    success: true,
    message: "Payment QR code removed",
  });
});

// @desc    Get payment QR code (public — used by checkout)
// @route   GET /api/settings/payment-qr
const getPaymentQR = asyncHandler(async (req, res) => {
  const value = await Settings.get(PAYMENT_QR_KEY);

  res.json({
    success: true,
    data: { paymentQR: value },
  });
});

module.exports = { uploadPaymentQR, deletePaymentQR, getPaymentQR };
