const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Get a setting by key.
 * @param {string} key
 * @returns {Promise<any>} the value, or null if not found
 */
settingsSchema.statics.get = async function (key) {
  const doc = await this.findOne({ key }).lean();
  return doc ? doc.value : null;
};

/**
 * Upsert a setting.
 * @param {string} key
 * @param {any} value
 */
settingsSchema.statics.set = async function (key, value) {
  return this.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model("Settings", settingsSchema);
