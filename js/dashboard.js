import { supabase } from "./supabase.js";
import { uploadFile } from "./upload.js";

console.log("Dashboard JS loaded");

// --------------------
// Check Session
// --------------------

const {
  data: { session },
} = await supabase.auth.getSession();

console.log("Session:", session);

if (!session) {
  window.location = "login.html";
}

document.getElementById("userEmail").innerText =
  session.user.email;

// --------------------
// Logout
// --------------------

document
  .getElementById("logoutBtn")
  .addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location = "login.html";
  });

// --------------------
// Load Documents
// --------------------

// --------------------
// Toast Notification
// --------------------

function showToast(message, type = "success") {

const toast = document.getElementById("toast");

toast.innerText = message;

toast.className = "toast " + type;

toast.classList.add("show");

setTimeout(() => {

toast.classList.remove("show");

}, 3000);

}

// --------------------
// Custom Delete Dialog
// --------------------

function confirmDelete(message){

return new Promise((resolve)=>{

const modal =
document.getElementById("deleteModal");

document.getElementById("deleteMessage").innerText =
message;

modal.classList.add("show");

document.getElementById("cancelDelete").onclick = ()=>{

modal.classList.remove("show");

resolve(false);

};

document.getElementById("confirmDelete").onclick = ()=>{

modal.classList.remove("show");

resolve(true);

};

});

}

function formatFileSize(bytes){

if(!bytes) return "0 KB";

const sizes = ["Bytes","KB","MB","GB"];

const i = Math.floor(Math.log(bytes) / Math.log(1024));

return (
(bytes / Math.pow(1024,i)).toFixed(2) +
" " +
sizes[i]
);

}

loadDocuments();

// --------------------
// Search Documents
// --------------------

document
.getElementById("searchInput")
.addEventListener("input", function () {

const search =
this.value.toLowerCase();

const cards =
document.querySelectorAll(".document-card");

cards.forEach(card => {

const title =
card.dataset.title || "";

if(title.includes(search)){

card.style.display = "";

}else{

card.style.display = "none";

}

});

});

async function loadDocuments() {
  console.log("Inside loadDocuments()");

  const response = await fetch(
"https://file-sharing-shyo.onrender.com/upload/documents"
);

const result = await response.json();

if (!result.success) {
    console.log(result.message);
    return;
}

const data = result.documents;

  const container = document.getElementById("documents");
  const fragment = document.createDocumentFragment();
  
  container.innerHTML = `
  <div id="loading" class="loading-state">
  ⏳ Loading your documents...
  </div>
  `;
  

container.innerHTML = "";
  document.getElementById("docCount").innerText = data.length;

  // Calculate total storage
let totalBytes = 0;

data.forEach(doc => {
    totalBytes += doc.file_size || 0;
});

let storageText;

if(totalBytes < 1024){

storageText = totalBytes + " B";

}
else if(totalBytes < 1024 * 1024){

storageText =
(totalBytes / 1024).toFixed(1) + " KB";

}
else if(totalBytes < 1024 * 1024 * 1024){

storageText =
(totalBytes / (1024 * 1024)).toFixed(2) + " MB";

}
else{

storageText =
(totalBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";

}

document.getElementById("storageUsed").innerText =
storageText;

  await Promise.all(
data.map(async (doc) => {
    console.log("Processing:", doc);

    const div = document.createElement("div");

    div.className = "document-card";

    const signedUrl = doc.signedUrl;

const extension = doc.storage_path
.split(".")
.pop()
.toLowerCase();

let previewHTML = "";

if(["jpg","jpeg","png","gif","webp"].includes(extension)){

previewHTML = `
<img
loading="lazy"
decoding="async"
src="${signedUrl}"
class="file-thumb"
alt="Preview">
`;

}

else if(extension==="pdf"){

previewHTML = `
<div class="file-icon pdf-icon">📕</div>
`;

}

else if(["doc","docx"].includes(extension)){

previewHTML = `
<div class="file-icon word-icon">📘</div>
`;

}

else if(["xls","xlsx"].includes(extension)){

previewHTML = `
<div class="file-icon excel-icon">📗</div>
`;

}

else if(["ppt","pptx"].includes(extension)){

previewHTML = `
<div class="file-icon ppt-icon">📙</div>
`;

}

else if(["mp4","mov","avi"].includes(extension)){

previewHTML = `
<div class="file-icon video-icon">🎥</div>
`;

}

else if(["mp3","wav"].includes(extension)){

previewHTML = `
<div class="file-icon audio-icon">🎵</div>
`;

}

else if(["zip","rar","7z"].includes(extension)){

previewHTML = `
<div class="file-icon zip-icon">📦</div>
`;

}

else{

previewHTML = `
<div class="file-icon">📄</div>
`;

}

div.innerHTML = `
${previewHTML}

<div class="document-info">

<div class="document-title">
${doc.title}
</div>

<div class="document-meta">

<span class="doc-category">
${doc.category || "Document"}
</span>

<span class="doc-size">
${formatFileSize(doc.file_size)}
</span>

</div>

</div>

<div class="document-actions">

<a
class="preview-btn"
href="${signedUrl}"
target="_blank">
👁 Preview
</a>

<a
class="download-btn"
href="${signedUrl}"
download>
⬇ Download
</a>

<button
class="delete-btn">
🗑 Delete
</button>

</div>

`;

    container.appendChild(div);
    console.log(container.innerHTML);
    div.dataset.title = doc.title.toLowerCase();
    
div.querySelector(".delete-btn")
.addEventListener("click", async () => {

const ok = confirm("Delete this document?");

if(!ok) return;

/*const { error: storageError } =
await supabase.storage
.from("private-docs")
.remove([doc.storage_path]);

if(storageError){
alert(storageError.message);
return;
}*/

const response = await fetch(
"https://file-sharing-shyo.onrender.com/upload",
{
    method: "DELETE",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({

        documentId: doc.id,
        fileId: doc.file_id,
        fileName: doc.storage_path

    })
});

const result = await response.json();

if(!result.success){

    alert(result.message);
    return;

}

div.remove();

});

})
);

}
// --------------------
// Upload
// --------------------

document
  .getElementById("uploadBtn")
  .addEventListener("click", async () => {
    // --------------------
// Search Documents
// --------------------
    const file =
      document.getElementById("fileInput").files[0];

    const title =
      document.getElementById("title").value;

    if (!file) {
      alert("Select file");
      return;
    }

    const result =
await uploadFile(file, title);

if(result.success){

showToast(result.message,"success");

document.getElementById("title").value = "";
document.getElementById("fileInput").value = "";

  // Temporary
await loadDocuments();

}else{

showToast(result.message,"error");

}
  });
