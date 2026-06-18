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
document.getElementById(
'documents'
);

container.innerHTML = '';

data.forEach(doc=>{

const div =
document.createElement(
'div'
);

div.innerHTML = `
<b>${doc.title}</b>
`;

container.appendChild(div);

});

}
