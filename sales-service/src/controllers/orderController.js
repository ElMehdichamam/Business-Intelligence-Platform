const categoryModel = require("../models/orderModel");

// GET ORDER

const getAllOrders = async (req,res) =>{
    try {
        const orders = await categoryModel.createOrder();
        if(!orders || orders.length === 0) return res.status(404).json({message:"Order Not Found"});
        res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const getOrderById = async (req,res) =>{
    try {
        const order = await categoryModel.getOrderById(req.params.id);
        if(!order || order.length === 0) return res.status(404).json({ message : "Order Not Found"});
        res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const createOrder = async (req,res) => {
    try {
        const {customer_id} = req.body;

        const order = await categoryModel.createOrder(customer_id);
        if(!order || order.affectedRows === 0) return res.status(404).json({ message : "Order Not Found"});
        res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const updateOrder = async (req,res) => {
    try {
        const {customer_id} = req.body;
        const {order_id} = req.params;

        const order = await categoryModel.updateOrder(order_id,customer_id);
        if(!order || order.affectedRows === 0) return res.status(404).json({ message : "Order Not Found"});
        res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const removeOrder = async (req,res) => {
    try {
        const {order_id} = req.params;
        const order = await categoryModel.removeOrder(order_id);
        if(!order || order.affectedRows === 0) return res.status(404).json({message:"Order Not Found"});
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

module.exports = {getAllOrders,getOrderById,createOrder,updateOrder,removeOrder}