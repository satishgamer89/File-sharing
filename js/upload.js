import { supabase }
from './supabase.js';

export async function uploadFile(
file,
title
){

const {
data:{user}
}
=
await supabase.auth.getUser();

const formData = new FormData();

formData.append("file", file);
formData.append("title", title);
formData.append("owner_id", user.id);

const response = await fetch(
  "https://file-sharing-shyo.onrender.com/upload",
  {
    method: "POST",
    body: formData
  }
);

const result = await response.json();

if (!result.success) {
  return {
    success: false,
    message: result.message
  };
}

const filename = result.fileName;

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