// Módulos nativos
const fs = require("fs/promises");
const crypto = require("crypto");
// Clase ProductManager
class ProductManager {
  constructor(filePathProducts) {
    this.filePathProducts = filePathProducts;
  }
  // Métodos privados de lectura/escritura
  async #readFileProducts() {
    try {
      const data = await fs.readFile(this.filePathProducts, "utf-8");
      return JSON.parse(data);
      console.log("Contenido products.json:", data);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }
  async #writeFileProducts(products) {
    try {
      await fs.writeFile(
        this.filePathProducts,
        JSON.stringify(products, null, 2)
      );
    } catch (error) {
      console.error("Error al escribir el archivo:", error);
    }
  }
  async #generateId() {
    return crypto.randomUUID();
  }

  //* LEER TODOS los PRODUCTOS - LEER - GET
  async getAllProducts(req, res) {
    try {
      const products = await this.#readFileProducts();
      const checkAllProducts = (products) => {
        let response = {
          products,
        };
        return response;
      };
      const response = checkAllProducts(products);
      return res.json(response);
    } catch (error) {
      console.error("Error al buscar los productos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  //* BUSCAR PRODUCTO POR ID - LEER - GET
  async getProductById(req, res) {
    try {
      const productId = req.params.pid;
      if (!productId) {
        return res.status(400).json({ error: "Falta el ID del producto" });
      }
      const products = await this.#readFileProducts();
      const product = products.find(
        (u) => String(u.id) === String(productId) || null
      );
      if (!product) {
        return res
          .status(404)
          .json({ error: "Producto no encontrado, id incorrecto" });
      }
      const checkProductAvailability = (product) => {
        let response = {
          product,
          message: "",
          status: true,
        };
        return response;
      };
      const response = checkProductAvailability(product);
      return res.status(200).json({
        message: "Producto encontrado correctamente",
        response,
      });
    } catch (error) {
      console.error("Error al buscar el producto especificado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  //* CREAR PRODUCTO NUEVO - POST
  async createProduct(req, res) {
    try {
      const newProductData = req.body;
      // Validación de campos requeridos y tipos
      const requiredFields = {
        title: "string",
        description: "string",
        code: "string",
        price: "number",
        status: "boolean",
        stock: "number",
        category: "string",
        thumbnails: "object",
      };
      const missingFields = Object.keys(requiredFields).filter(
        (field) => newProductData[field] === undefined
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Campos requeridos faltantes: ${missingFields.join(", ")}`,
        });
      }
      for (const [field, type] of Object.entries(requiredFields)) {
        if (typeof newProductData[field] !== type) {
          return res
            .status(400)
            .json({ error: `el campo '${field}' debe ser de tipo ${type}` });
        }
      }
      // Guardar producto
      const products = await this.#readFileProducts();
      const newAddedProduct = {
        id: await this.#generateId(),
        ...newProductData,
      };
      products.push(newAddedProduct);
      await this.#writeFileProducts(products);
      return res.status(200).json({
        message: "Producto agregado correctamente",
        newAddedProduct,
      });
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  //* ACTUALIZAR PRODUCTO EXISTENTE - POST
  async updateProduct(req, res) {
    try {
      const productId = req.params.pid;
      const updatedProductData = req.body;
      const requiredFields = {
        title: "string",
        description: "string",
        code: "string",
        price: "number",
        status: "boolean",
        stock: "number",
        category: "string",
        thumbnails: "object",
      };
      if (!productId) {
        return res.status(400).json({ error: "Falta el ID del producto" });
      }
      const products = await this.#readFileProducts();
      const product = products.find(
        (u) => String(u.id) === String(productId) || null
      );
      if (!product) {
        return res
          .status(404)
          .json({ error: "Producto no encontrado, id incorrecto" });
      }
      for (const [field, newContent] of Object.entries(updatedProductData)) {
        if (field == "id") {
          return res.status(400).json({
            error: `el campo id no debe enviarse`,
          });
        }
        if (typeof newContent !== requiredFields[field]) {
          return res.status(400).json({
            error: `el campo '${field}' debe ser de tipo ${requiredFields[field]}`,
          });
        }
        product[field] = newContent;
      }
      await this.#writeFileProducts(products);
      return res.status(200).json({
        message: "Producto actualizado correctamente",
        product,
      });
    } catch (error) {
      console.error("Error al buscar el producto especificado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
  //* ELIMINAR PRODUCTO - DELETE
  async deleteProduct(req, res) {
    try {
      const productId = req.params.pid;
      if (!productId) {
        return res.status(400).json({ error: "Falta el ID del producto" });
      }
      const products = await this.#readFileProducts();
      const productIndex = products.findIndex(
        (u) => String(u.id) === String(productId) || null
      );
      if (productIndex === -1) {
        return res
          .status(404)
          .json({ error: "Producto no encontrado, id incorrecto" });
      }
      const deletedProduct = products[productIndex];
      products.splice(productIndex, 1);
      await this.#writeFileProducts(products);
      return res.status(200).json({
        message: "Producto eliminado correctamente",
        deletedProduct,
      });
    } catch (error) {
      console.error("Error al buscar el producto especificado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
module.exports = ProductManager;
