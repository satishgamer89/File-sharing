const b2 = require("../config/b2");
const { v4: uuid } = require("uuid");
const supabase = require("../config/supabase");

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

const title = req.body.title;
const owner_id = req.body.owner_id;

// Detect category
const extension = req.file.originalname
    .split(".")
    .pop()
    .toLowerCase();

let category = "Other";

if(["jpg","jpeg","png","gif","webp"].includes(extension)){
    category = "Image";
}
else if(extension==="pdf"){
    category = "PDF";
}
else if(["doc","docx"].includes(extension)){
    category = "Word";
}
else if(["xls","xlsx"].includes(extension)){
    category = "Excel";
}
else if(["ppt","pptx"].includes(extension)){
    category = "PowerPoint";
}
else if(["mp4","mov","avi"].includes(extension)){
    category = "Video";
}
else if(["mp3","wav"].includes(extension)){
    category = "Audio";
}
else if(["zip","rar","7z"].includes(extension)){
    category = "Archive";
}

const { error: dbError } = await supabase
.from("documents")
.insert({

    title,

    storage_path: fileName,

    owner_id,

    category,

    file_size: req.file.size

});

if(dbError){

    return res.status(500).json({

        success:false,

        message:dbError.message

    });

}

res.json({

    success:true,

    message:"Upload Success",

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
exports.getDownloadUrl = async (req, res) => {

    try {

        await b2.authorize();

        const response = await b2.getDownloadAuthorization({
            bucketId: process.env.B2_BUCKET_ID,
            fileNamePrefix: req.params.fileName,
            validDurationInSeconds: 3600
        });

        const downloadUrl =
            process.env.B2_DOWNLOAD_URL +
            "/file/" +
            process.env.B2_BUCKET_NAME +
            "/" +
            req.params.fileName +
            "?Authorization=" +
            response.data.authorizationToken;

        res.json({
            success: true,
            url: downloadUrl
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


