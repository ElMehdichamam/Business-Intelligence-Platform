const pool = require("../config/db");

// GET ALL CATEGORIES
const getAllCategories = async (req,res) => {

    try {
    const [categorie] = await pool.query("select * from categories");
    if(categorie.length === 0){
        return res.status(404).json({
            message:"Categorie Not Found"
        });
    }
    return res.status(200).json({
        message:"Categorie Has been Founded Succesufully",
        categorie
    })
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
  
};
// GET SPECIFIC CATEGORIE
const getCategoriesById = async (req,res) =>{
    try {
        const {id} = req.params;

        const [categorie] = await pool.query("select * from categories where id = ?" , [id] ) ;

        if(categorie.length === 0){
            return res.status(404).json({
                message:"Categorie Not Found"
            });
        }
        return res.status(200).json({
            message:"Categorie Has been Founded Succesufully",
            categorie
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}
// create A categorie
const createCategories = async (req,res) =>{

    try {
        const {name} = req.body;
        const [category] = await pool.query("insert into categories (name) values (?) ", [name]);
        res.status(201).json({
            message:"Categorie Created Succesfully",
            category
        });
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }

}

// Update Categorie

const updateCategory = async (req,res) =>{
    try {

    const {name} = req.body;
    const  {id} = req.params;

    if(!id){
        return res.status(404).json({
            message:"Id Not found"
        });
    }

    const [category] = await pool.query("UPDATE categories set name = ? where id = ?",[name,id]);
    
    if (category.affectedRows === 0) {
        return res.status(404).json({
            message: "Category not found"
        });
    }
    return res.status(200).json({
        message:"Categorie Updated Succusfully",
        category
    });
    } catch (error) {

        return res.status(500).json({
            message:error.message
        });
    }

}

const deleteCatogory = async (req,res) =>{
    try {
        const {id} = req.params;
        if(!id){
            return res.status(404).json({
                message:"Id Not found"
            });
        }
        const [category] = await pool.query("Delete FROM categories where id = ?",[id]);
        res.status(200).json({
            message:"Category deleted Succusfully"
        });
        if (category.affectedRows === 0) {
            return res.status(404).json({
                message: "Category not found"
        });
}
    } catch (error) {
        return res.status(500).json({
            message:error.message
        });
    }
}

module.exports = {getAllCategories,getCategoriesById,createCategories,updateCategory,deleteCatogory}