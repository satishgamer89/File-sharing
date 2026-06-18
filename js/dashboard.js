import { supabase }
from './supabase.js';

const {
data: { session }
}
=
await supabase.auth.getSession();

if(!session){

window.location =
'login.html';

}

document.getElementById(
'userEmail'
).innerText =
session.user.email;

document.getElementById(
'logoutBtn'
).addEventListener(
'click',
async ()=>{

await supabase.auth.signOut();

window.location =
'login.html';

});

loadDocuments();

async function loadDocuments(){

const { data,error } =
await supabase
.from('documents')
.select('*')
.order('created_at',{
ascending:false
});

if(error){
console.log(error);
return;
}

const container =
document.getElementById('documents');

container.innerHTML = '';

for(const doc of data){

const div =
document.createElement('div');

const {
data: signedData
}
=
await supabase
.storage
.from('private-docs')
.createSignedUrl(
doc.storage_path,
3600
);

div.innerHTML = `
<p>
<b>${doc.title}</b>
</p>

<a href="${
signedData.signedUrl
}" target="_blank">
Open File
</a>

<hr>
`;

container.appendChild(div);

}

}


import { uploadFile }
from './upload.js';

document
.getElementById(
'uploadBtn'
)
.addEventListener(
'click',
async ()=>{

const file =
document
.getElementById(
'fileInput'
)
.files[0];

const title =
document
.getElementById(
'title'
)
.value;

if(!file){

alert(
'Select file'
);

return;

}

await uploadFile(
file,
title
);

location.reload();

});
