const express = require("express");

const categoriesRoutes = require("./routes/categoryRoutes");
const customersRoutes = require("./routes/customerRoutes");
const ordersRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
// Middleware
app.use(express.json());
app.use("/categories",categoriesRoutes);
app.use("/customers",customersRoutes);
app.use("/categories",ordersRoutes);
app.use("/categories",productRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("Sales Service Running 🚀");
});

module.exports = app;