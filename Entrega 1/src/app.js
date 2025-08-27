// Configuración del servidor
const express = require("express");
const app = express(); //* Nuestro server app -> {}.get {}.post {}.put {}.delete {}.use
const PORT = 8080;
// Importar routers
const productsRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");
// Middlewares para parsear JSON y datos de formularios
app.use(express.json()); //* -> body {vacía} {se puede ver}
app.use(express.urlencoded({ extended: true })); //* FORM-DATA -> {} -> {vemos el object}
// Usar routers
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
