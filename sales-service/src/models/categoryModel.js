const pool = require("../config/db");

// GET ALL CATEGORIES
const getAllCategories = async () => {
    const [category] = await pool.query("select * from categories");
    return category
};
// GET SPECIFIC CATEGORIE
const getCategoriesById = async (id) =>{
        const [category] = await pool.query("select * from categories where id = ?" , [id] ) ;
        return category
}
// create A categorie
const createCategories = async (name) =>{
        const [category] = await pool.query("insert into categories (name) values (?) ", [name]);
        return category
}

// Update Categorie

const updateCategory = async (id,name) =>{
    const [category] = await pool.query("UPDATE categories set name = ? where id = ?",[name,id]);
    return category
}

const deleteCatogory = async (id) =>{
        const [category] = await pool.query("Delete FROM categories where id = ?",[id]);
        return category
}
module.exports = {getAllCategories,getCategoriesById,createCategories,updateCategory,deleteCatogory}