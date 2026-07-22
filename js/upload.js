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

return result;
}
