// Módulos nativos
const fs = require("fs/promises");
const crypto = require("crypto");
// Clase CartManager
class CartManager {
  constructor(filePathCarts, filePathProducts) {
    this.filePathCarts = filePathCarts;
    this.filePathProducts = filePathProducts;
  }
  // Métodos privados de lectura/escritura
  async #readFileCarts() {
    try {
      const data = await fs.readFile(this.filePathCarts, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }
  async #readFileProducts() {
    try {
      const data = await fs.readFile(this.filePathProducts, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }
  async #writeFileCarts(carts) {
    try {
      await fs.writeFile(this.filePathCarts, JSON.stringify(carts, null, 2));
    } catch (error) {
      console.error("Error al escribir el archivo:", error);
    }
  }
  async #generateId() {
    return crypto.randomUUID();
  }
  //* CREAR CARRITO NUEVO - POST
  async createCart(req, res) {
    try {
      const newCartData = req.body;
      const requiredFields = {
        products: "object",
      };
      const missingFields = Object.keys(requiredFields).filter(
        (field) => newCartData[field] === undefined
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Campos requeridos faltantes: ${missingFields.join(", ")}`,
        });
      }
      for (const [field, type] of Object.entries(requiredFields)) {
        if (typeof newCartData[field] !== type) {
          return res
            .status(400)
            .json({ error: `el campo '${field}' debe ser de tipo ${type}` });
        }
      }
      // Validar que los productos existan en products.json
      const carts = await this.#readFileCarts();
      const products = await this.#readFileProducts();
      for (const productAdded of newCartData.products) {
        const productMatch = products.find(
          (u) => String(u.id) === String(productAdded.id) || null
        );
        if (!productMatch) {
          return res.status(404).json({
            error: `Id ${productAdded.id} incorrecto, no se encuentra en los productos disponibles.`,
          });
        }
      }
      const newAddedCart = {
        id: await this.#generateId(),
        products: newCartData.products.map((p) => ({
          id: p.id,
          quantity: 1,
        })),
      };
      carts.push(newAddedCart);
      await this.#writeFileCarts(carts);
      return res.status(200).json({
        message: "Carrito agregado correctamente",
        newAddedCart,
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
  //* BUSCAR CARRITO POR ID - LEER - GET
  async getCartById(req, res) {
    try {
      const cartId = req.params.cid;
      if (!cartId) {
        return res.status(400).json({ error: "Falta el ID del carrito" });
      }
      const carts = await this.#readFileCarts();
      const cart = carts.find((u) => String(u.id) === String(cartId) || null);
      if (!cart) {
        return res
          .status(404)
          .json({ error: "Carrito no encontrado, id incorrecto" });
      }
      const checkCartAvailability = (cart) => {
        let response = {
          cart,
          message: "",
          status: true,
        };
        return response;
      };
      const response = checkCartAvailability(cart);
      return res.status(200).json({
        message: "Carrito encontrado correctamente",
        response,
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
  //* AGREGAR PRODUCTO NUEVO - POST
  async addProductToCart(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const carts = await this.#readFileCarts();
      const products = await this.#readFileProducts();
      // Buscar carrito
      const cartMatch = carts.find(
        (u) => String(u.id) === String(cartId) || null
      );
      if (!cartMatch) {
        return res.status(404).json({
          error: `Id ${cartId} incorrecto, no se encuentra el carrito.`,
        });
      }
      if (!cartMatch.products) cartMatch.products = [];
      // Buscar producto
      const productMatch = products.find(
        (u) => String(u.id) === String(productId) || null
      );
      if (!productMatch) {
        return res.status(404).json({
          error: `Id ${productId} incorrecto, no se encuentra el producto.`,
        });
      }
      // Agregar o incrementar producto en carrito
      const productMatchToAdd = cartMatch.products.find(
        (u) => String(u.id) === String(productId) || null
      );
      if (!productMatchToAdd) {
        cartMatch.products.push({
          id: productId,
          quantity: 1,
        });
      } else {
        productMatchToAdd.quantity += 1;
      }
      await this.#writeFileCarts(carts);
      return res.status(200).json({
        message: "Producto agregado al carrito correctamente",
        cart: cartMatch,
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
module.exports = CartManager;
