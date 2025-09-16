const express = require("express");
const router = express.Router();
const path = require("path");
const CartManager = require("../managers/CartManager");

const productsFile = path.join(__dirname, "../data/products.json");
const cartsFile = path.join(__dirname, "../data/carts.json");

const newCart = new CartManager(cartsFile, productsFile);

// Rutas de carritos
router.post("/", (req, res) => newCart.createCart(req, res));
router.get("/:cid", (req, res) => newCart.getCartById(req, res));
router.post("/:cid/product/:pid", (req, res) =>
  newCart.addProductToCart(req, res)
);

module.exports = router;
