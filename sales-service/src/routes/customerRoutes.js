const express = require("express");

const customerController= require("../controllers/customerController");

const Router = express.Router();

Router.get("/", customerController.getAllCustomers);
Router.get("/:id" , customerController.getCustomerById);
Router.post("/", customerController.createCustomer);
Router.put("/:id", customerController.updateCustomer);
Router.delete("/:id" , customerController.removeCustomer);

module.exports = Router;