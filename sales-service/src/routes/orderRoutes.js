const express = require("express");

const ordersController= require("../controllers/orderController");

const Router = express.Router();

Router.get("/", ordersController.getAllOrders);
Router.get("/:id" , ordersController.getOrderById);
Router.post("/", ordersController.createOrder);
Router.put("/:id", ordersController.updateOrder);
Router.delete("/:id" , ordersController.removeOrder);

module.exports = Router;