const productModel = require("../models/productModel");

// GET PRODUCT 
const getAllProdcuts = async (req,res) =>{
    try {
        const products = await productModel.getAllProducts();

        if(!products || products.length === 0) return res.status(404).json({message:"Category Not Found"});
        res.status(200).json(products)
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

// GET SPECIFIC PRODUCT WITH SPECIFIC ID

const getProductById = async (req , res) =>{
    try {
        const product = await productModel.getProductById(req.params.id);

        if(!product || product.length === 0) return res.status(404).json({message:"Category Not Found"});
        res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }

}

// CREATE CATEGORY 
const createProduct = async (req,res) =>{
    try{
        const { name, price , category_id , stock } = req.body;

        const product = await productModel.createProduct(name,price,category_id,stock);
        if(product.affectedRows === 0) return res.status(404).json({message : "Category Not found"});
        res.status(201).json({message:"Product Created Succusfully"});
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const updateProduct = async (req,res) =>{
    try {
        const {name,price,stock} = req.body;
        const {id} = req.params;

        const product = await productModel.updateProduct(id,name);
        if(product.affectedRows === 0) return res.status(404).json({message : "Category Not found"});
        res.status(201).json({message : "Category Updated Succusfully"})
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const removeProduct = async (req,res) =>{
    try {
        const {id} = req.params;
        const product = await productModel.removeProduct(id);
        if(product.affectedRows === 0) return res.status(404).json({message : "Category Not found"});
        res.status(201).json({message:"Product deleted succusfully"})
    } catch (error) {
        return res.status(500).json({
            message:error.message
        }); 
    }
}

module.exports = {getAllProdcuts, getProductById , createProduct , updateProduct , removeProduct}