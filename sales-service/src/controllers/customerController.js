const categoryModel = require("../models/customerModel");

// GET ORDER

const getAllCustomers = async (req,res) =>{
    try {
        const customer = await categoryModel.getAllCustomers();
        
        if(!customer || customer.length === 0) return res.status(404).json({message:"Customer Not Found"});
        res.status(200).json(customer)
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const getCustomerById = async (req,res) =>{
    try {
        const customer = await categoryModel.getCustomerById(req.params.id);

        if(!customer || customer.length === 0) return res.status(404).json({ message : "Customer Not Found"});
        res.status(200).json(customer);
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const createCustomer = async (req,res) => {
    try {
        const {name} = req.body;

        const customer = await categoryModel.createCustomer(name);
        if(!customer || customer.affectedRows === 0) return res.status(404).json({ message : "Customer Not Found"});
        res.status(200).json(customer);
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const updateCustomer = async (req,res) => {
    try {

        const {name} = req.body;
        const {id} = req.params;

        const customer = await categoryModel.updateCustomer(id,name);

        if(!customer || customer.affectedRows === 0) return res.status(404).json({ message : "Customer Not Found"});
        res.status(200).json(customer);

    } catch (error) {
        return res.status(500).json({
            message:error.message
        });

    }
}

const removeCustomer = async (req,res) => {
    try {
        const {id} = req.params;

        const customer = await categoryModel.removeCustomer(id);
        if(!customer || customer.affectedRows === 0) return res.status(404).json({message:"Customer Not Found"});
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });

    }
}

module.exports = {getAllCustomers,getCustomerById,createCustomer,updateCustomer,removeCustomer}