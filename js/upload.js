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

await supabase
.from('documents')
.insert({

title:
title,

storage_path:
filename

});

alert(
'Upload Success'
);

}
