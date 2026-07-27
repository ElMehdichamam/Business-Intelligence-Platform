const express = require("express");

const categoryControllers= require("../controllers/categoryController");

const Router = express.Router();

Router.get("/", categoryControllers.getCategory);
Router.get("/:id" , categoryControllers.getCategoryById);
Router.post("/", categoryControllers.createCategory);
Router.put("/:id", categoryControllers.updateCategory);
Router.delete("/:id" , categoryControllers.removeCategory);

module.exports = Router;