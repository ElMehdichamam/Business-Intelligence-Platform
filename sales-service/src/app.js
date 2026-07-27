const express = require("express");
const categoriesRoutes = require("./routes/categoryRoutes")
const app = express();

// Middleware
app.use(express.json());
app.use("/categories",categoriesRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("Sales Service Running 🚀");
});

module.exports = app;