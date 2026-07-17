import { supabase }
from './supabase.js';

export async function uploadFile(
file,
title
){

const filename =
Date.now() +
'-' +
file.name;

const { error } =
await supabase
.storage
.from('private-docs')
.upload(
filename,
file
);

if(error){

return{
success:false,
message:error.message
};

}

const {
data:{user}
}
=
await supabase.auth.getUser();

// Detect category automatically
const extension =
file.name
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

const { error: dbError } =
await supabase
.from('documents')
.insert({

title:title,

storage_path:filename,

owner_id:user.id,

category:category,

file_size:file.size

});

if(dbError){

return{
success:false,
message:dbError.message
};

}

return{

success:true,
message:"Upload Success"

};

}