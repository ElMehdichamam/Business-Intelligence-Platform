require("dotenv").config();

const app = require("./app");

// Connect Database
require("./config/db");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Upload Service running on port ${PORT}`);
});