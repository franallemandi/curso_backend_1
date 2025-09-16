const express = require("express");
const router = express.Router();
const path = require("path");
const ProductManager = require("../managers/ProductManager");

const productsFile = path.join(__dirname, "../data/products.json");
const newProduct = new ProductManager(productsFile);

// Rutas de productos
router.get("/", (req, res) => newProduct.getAllProducts(req, res));
router.get("/:pid", (req, res) => newProduct.getProductById(req, res));
router.post("/", (req, res) => newProduct.createProduct(req, res));
router.put("/:pid", (req, res) => newProduct.updateProduct(req, res));
router.delete("/:pid", (req, res) => newProduct.deleteProduct(req, res));

module.exports = router;
