const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/upload", uploadRoutes);

// Home Route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Upload Service is Running"
    });
});

module.exports = app;