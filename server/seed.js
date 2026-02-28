require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

const connectDB = require("./config/db");

const categories = [
  { name: "Men", slug: "men" },
  { name: "Women", slug: "women" },
  { name: "Unisex", slug: "unisex" },
];

const adminUser = {
  name: "Admin",
  email: "pscode@admin.com",
  password: "pscode@08",
  role: "admin",
};

const sampleProducts = [
  {
    name: "Midnight Oud",
    description:
      "A captivating blend of oud, amber, and sandalwood that evokes the mystery of Arabian nights. This luxurious fragrance opens with spiced saffron and settles into a deep, warm base of oud and musk.",
    price: 3499,
    brand: "Luxescent",
    stock: 50,
    rating: 4.5,
    categorySlug: "men",
    images: [],
  },
  {
    name: "Rose Velvet",
    description:
      "An elegant floral perfume featuring Bulgarian rose, jasmine, and peony. Rose Velvet captures the essence of a blooming garden with subtle undertones of vanilla and white musk.",
    price: 2999,
    brand: "Luxescent",
    stock: 35,
    rating: 4.7,
    categorySlug: "women",
    images: [],
  },
  {
    name: "Ocean Breeze",
    description:
      "A fresh and invigorating scent inspired by the sea. Notes of bergamot, sea salt, and driftwood create a clean, aquatic fragrance perfect for everyday wear.",
    price: 1999,
    brand: "Luxescent",
    stock: 100,
    rating: 4.2,
    categorySlug: "unisex",
    images: [],
  },
  {
    name: "Noir Intense",
    description:
      "Bold and commanding, Noir Intense combines dark chocolate, black pepper, and leather for an unforgettable masculine scent. A statement fragrance for the modern gentleman.",
    price: 4299,
    brand: "Luxescent",
    stock: 25,
    rating: 4.8,
    categorySlug: "men",
    images: [],
  },
  {
    name: "Cherry Blossom",
    description:
      "A delicate and feminine perfume with cherry blossom, white tea, and soft musk. This ethereal fragrance captures the fleeting beauty of spring in a bottle.",
    price: 2499,
    brand: "Luxescent",
    stock: 60,
    rating: 4.3,
    categorySlug: "women",
    images: [],
  },
  {
    name: "Amber Elixir",
    description:
      "A warm and sensual fragrance built around precious amber, tonka bean, and vanilla orchid. Amber Elixir is the perfect evening companion — rich, sophisticated, and long-lasting.",
    price: 3799,
    brand: "Luxescent",
    stock: 40,
    rating: 4.6,
    categorySlug: "unisex",
    images: [],
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // Create admin user
    const admin = await User.create(adminUser);
    console.log(`Admin user created: ${admin.email} / admin123`);

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // Create products
    const productsToCreate = sampleProducts.map(
      ({ categorySlug, ...product }) => ({
        ...product,
        categoryId: categoryMap[categorySlug],
      })
    );
    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`Created ${createdProducts.length} products`);

    console.log("\n✅ Seed completed successfully!");
    console.log(`Admin login: ${adminUser.email} / ${adminUser.password}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
