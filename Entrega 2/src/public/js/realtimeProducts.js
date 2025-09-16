document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    const productList = document.getElementById("product-list");
    const form = document.getElementById("add-product-form");

    socket.on("updateProducts", (products) => {
        productList.innerHTML = "";
        products.forEach(p => {
            const li = document.createElement("li");
            li.innerHTML = `${p.title} - $${p.price} <button onclick="deleteProduct('${p.id}')">Eliminar</button>`;
            productList.appendChild(li);
        });
    });
    
    socket.on("errorMessage", (msg) => {
        alert("Error: " + msg);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = {
            title: form.title.value,
            price: parseFloat(form.price.value),
            description: form.description.value,
            code: form.code.value,
            status: true,
            stock: form.stock.value,
            category: form.category.value,
            thumbnails: []
        };
        socket.emit("newProduct", data);
        form.reset();
    });

    // Nueva función de eliminar
    window.deleteProduct = function (id) {
        socket.emit("deleteProduct", id);
    };
});