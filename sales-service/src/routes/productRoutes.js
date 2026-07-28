const express = require("express");

const productControllers= require("../controllers/productController");

const Router = express.Router();

Router.get("/", productControllers.getAllProdcuts);
Router.get("/:id" , productControllers.getProductById);
Router.post("/", productControllers.createProduct);
Router.put("/:id", productControllers.updateProduct);
Router.delete("/:id" , productControllers.removeProduct);

module.exports = Router;