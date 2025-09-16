const express = require("express");
const router = express.Router();
const path = require("path");
const ProductManager = require("../managers/ProductManager");

const productsFile = path.join(__dirname, "../data/products.json");
const productManager = new ProductManager(productsFile);

// Ruta home
router.get("/", async (req, res) => {
  const productsData = await productManager.getProductsList();
  res.render("home", { products: productsData.products });
});

// Ruta realtimeproducts
router.get("/realtimeproducts", async (req, res) => {
  const productsData = await productManager.getProductsList();
  res.render("realTimeProducts", { products: productsData.products });
});

module.exports = router;
