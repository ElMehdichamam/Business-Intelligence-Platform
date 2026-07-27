const categoryModel = require("../models/categoryModel");

// GET Category
const getCategory = async (req,res) =>{
    try {
        const category = await categoryModel.getAllCategories();

        if(!category || category.lenght === 0) return res.status(404).json({message:"Category Not Found"});
        res.status(200).json(category)
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

// GET SPECIFIC CATEGORY WITH SPECIFIC ID

const getCategoryById = async (req , res) =>{
    try {
        const category = await categoryModel.getCategoriesById(req.params.id);

        if(!category || category.lenght === 0) return res.status(404).json({message:"Category Not Found"});
        res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }

}

// CREATE CATEGORY 
const createCategory = async (req,res) =>{
    try{
        const { name } = req.body;

        const category = categoryModel.createCategories(name);
        if(category.affectedRows === 0) return res.status(404).json({message : "Category Not found"});
        res.status(201).json(category)
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const updateCategory = async (req,res) =>{
    try {
        const {name} = req.body;
        const {id} = req.params;

        const category = categoryModel.updateCategory(id,name);
        if(category.affectedRows === 0) return res.status(404).json({message : "Category Not found"});
        res.status(201).json(category)
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

const removeCategory = async (req,res) =>{
    try {
        const {id} = req.params;
        const category = categoryModel.deleteCatogory(id);
        if(category.affectedRows === 0) return res.status(404).json({message : "Category Not found"});
        res.status(201).json(category)
    } catch (error) {
        return res.status(500).json({
            message:error.message
        }); 
    }
}

module.exports = {getCategory,getCategoryById,createCategory,updateCategory,removeCategory}