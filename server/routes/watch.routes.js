const express = require("express");
const router = express.Router();
const {
  getWatches,
  getWatch,
  createWatch,
  updateWatch,
  deleteWatch,
} = require("../controllers/watch.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const { validateQuery } = require("../middlewares/validate");
const { watchQuerySchema } = require("../validators/watch.validator");
const upload = require("../middlewares/upload");

// Public routes
router.get("/", validateQuery(watchQuerySchema), getWatches);
router.get("/:id", getWatch);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.array("images", 5),
  createWatch
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.array("images", 5),
  updateWatch
);
router.delete("/:id", authenticate, authorize("admin"), deleteWatch);

module.exports = router;
