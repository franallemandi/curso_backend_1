// ---------------------
//Importaciones y configuración básica
// ---------------------
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");

const ProductManager = require("./managers/ProductManager");
const productsFile = path.join(__dirname, "data/products.json");
const productManager = new ProductManager(productsFile);

// ---------------------
//Inicialización del servidor y Socket.io
// ---------------------
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ---------------------
// Middlewares
// ---------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ---------------------
// Configuración de Handlebars
// ---------------------
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// ---------------------
// Rutas
// ---------------------
const viewsRouter = require("./routes/views");
app.use("/", viewsRouter);

// ---------------------
// WebSockets (Socket.io)
// ---------------------
io.on("connection", async (socket) => {
  console.log("Cliente conectado");

  // Enviar lista inicial
  const products = await productManager.getProductsList();
  socket.emit("updateProducts", products.products);

  // Agregar productos en tiempo real
  socket.on("newProduct", async (data) => {
    try {
      // Completar campos obligatorios
      const productData = {
        title: data.title,
        description: data.description || "Sin descripción",
        code: data.code,
        price: parseFloat(data.price),
        status: true,
        stock: parseInt(data.stock),
        category: data.category || "General",
        thumbnails: data.thumbnails || []
      };

      await productManager.addProductDirect(productData);

      const updatedProducts = await productManager.getProductsList();
      io.emit("updateProducts", updatedProducts.products);
    } catch (err) {
      console.error("Error al agregar producto:", err.message);
      socket.emit("errorMessage", err.message);
    }
  });

  //Eliminar productos en tiempo real
  socket.on("deleteProduct", async (id) => {
    try {
      await productManager.deleteProductById(id);
      const updatedProducts = await productManager.getProductsList();
      io.emit("updateProducts", updatedProducts.products);
    } catch (err) {
      console.error(err);
    }
  });
});

// ---------------------
// Iniciar servidor
// ---------------------
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
