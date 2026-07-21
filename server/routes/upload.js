const express = require("express");
const multer = require("multer");
const router = express.Router();

const uploadController = require("../Controllers/uploadController");

const upload = multer({
    storage: multer.memoryStorage()
});

router.post(
    "/",
    upload.single("file"),
    uploadController.uploadFile
);

router.get(
    "/download/:fileName",
    uploadController.getDownloadUrl
);

module.exports = router;