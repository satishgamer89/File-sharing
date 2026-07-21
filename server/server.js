require("dotenv").config();

const express = require("express");
const cors = require("cors");
const b2 = require("./config/b2");

const uploadRoutes = require("./routes/upload");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/upload", uploadRoutes);

app.get("/", (req, res) => {
    res.send("✅ Family Vault API Running");
});

app.get("/test-b2", async (req, res) => {

    try {

        await b2.authorize();

        res.json({
            success: true,
            message: "✅ Connected to Backblaze B2"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});