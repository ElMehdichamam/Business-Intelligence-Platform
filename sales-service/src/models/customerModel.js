const pool = require("../config/db");

// GET ALL CUSTOMER

const getAllCustomers = async () =>{
    const [customer] = await pool.query("select * from customers");
    return customer
}
// GET SPECIFIC customer 
const getCustomerById = async (id) =>{
    const [customer] = await pool.query("select * from customers where id = ?",[id]);
    return customer
}
// CREATE A PRODUCT
const createCustomer = async (name) =>{
    const [customer] = await pool.query("insert into customers (customer_name) values (?)",[name]);
    return customer
}
// UPDATE A PRODUCT 
const updateCustomer = async (id,name) =>{
    const [customer] = await pool.query("update customers set customer_name = ?  where customer_id = ?",[id,name]);
    return customer
}
// REMOVE A PRODUCT
const removeCustomer = async (id) => {
    const [customer] = pool.query("Delete From customers where customer_id = ? ",[id]);
    return customer
}

module.exports = {getAllCustomers,getCustomerById,createCustomer,updateCustomer,removeCustomer}