const pool = require("../config/db");

// GET ALL PRODUCTS

const getAllProducts = async (req,res) =>{
    const [product] = await pool.query("select * from products");
    return product
}
// GET SPECIFIC PRODUCT 
const getProductById = async (req,res) =>{
    const [product] = await pool.query("select * from products where id = ?",[id]);
    return product
}
// CREATE A PRODUCT
const createProduct = async (name,price,category_id,stock) =>{
    const [product] = await pool.query("insert into products (product_name,product_price,category_id,stock) values (?,?,?,?)",[name,price,category_id,stock]);
    return product
}
// UPDATE A PRODUCT 
const updateProduct = async (id,name,price,stock) =>{
    const [product] = await pool.query("update products set product_name = ? , product_price = ? , stock = ? where product_id = ?",[id,name,price,stock]);
    return product
}
// REMOVE A PRODUCT
const removeProduct = async (id) => {
    const [product] = pool.query("Delete From products where product_id = ? ",[id]);
    return product
}

module.exports = {getAllProducts,getProductById,createProduct,updateProduct,removeProduct}