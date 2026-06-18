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
alert(error.message);
return;
}

const {
data:{user}
}
=
await supabase.auth.getUser();

await supabase
.from('documents')
.insert({
title:title,
storage_path:filename,
owner_id:user.id
});

alert(
'Upload Success'
);

}
