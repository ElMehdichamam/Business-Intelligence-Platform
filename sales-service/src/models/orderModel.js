const pool = require("../config/db");

// GET ALL CUSTOMER

const getAllOrders = async () =>{
    const [orders] = await pool.query("select * from orders");
    return orders
}
// GET SPECIFIC customer 
const getOrderById = async (id) =>{
    const [order] = await pool.query("select * from orders where id = ?",[id]);
    return order
}
// CREATE A PRODUCT
const createOrder = async (customer_id) =>{
    const [order] = await pool.query("insert into orders (customer_id) values (?)",[customer_id]);
    return order
}
// UPDATE A PRODUCT 
const updateOrder = async (order_id,customer_id) =>{
    const [order] = await pool.query("update orders set customer_id = ?  where order_id = ?",[customer_id,order_id]);
    return order
}
// REMOVE A PRODUCT
const removeOrder = async (order_id) => {
    const [order] = await pool.query("Delete From orders where order_id = ? ",[order_id]);
    return order
}

module.exports = {getAllOrders,getOrderById,createOrder,updateOrder,removeOrder}