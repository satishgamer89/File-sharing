const b2 = require("../config/b2");
const { v4: uuid } = require("uuid");

exports.uploadFile = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file selected"
            });
        }

        await b2.authorize();

const uploadUrl = await b2.getUploadUrl({
    bucketId: process.env.B2_BUCKET_ID
});

const fileName =
uuid() + "-" + req.file.originalname;

const uploadResponse =
await b2.uploadFile({

    uploadUrl:
    uploadUrl.data.uploadUrl,

    uploadAuthToken:
    uploadUrl.data.authorizationToken,

    fileName,

    data:
    req.file.buffer,

    mime:
    req.file.mimetype

});

res.json({

    success: true,

    message: "File uploaded",

    fileId:
    uploadResponse.data.fileId,

    fileName

});

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};