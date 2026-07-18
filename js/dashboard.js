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

loadDocuments();

async function loadDocuments() {
  console.log("Inside loadDocuments()");

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  console.log(data, error);

  if (error) {
    console.log(error);
    return;
  }

  const container = document.getElementById("documents");

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

  for (const doc of data) {
    console.log("Processing:", doc);

    const div = document.createElement("div");

    div.className = "document-card";

    const { data: signedData } = await supabase.storage
      .from("private-docs")
      .createSignedUrl(doc.storage_path, 3600);

const extension = doc.storage_path
.split(".")
.pop()
.toLowerCase();

let previewHTML = "";

if(["jpg","jpeg","png","gif","webp"].includes(extension)){

previewHTML = `
<img
src="${signedData.signedUrl}"
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
href="${signedData.signedUrl}"
target="_blank">
👁 Preview
</a>

<a
class="download-btn"
href="${signedData.signedUrl}"
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
    div.dataset.title = doc.title.toLowerCase();
    
div.querySelector(".delete-btn")
.addEventListener("click", async () => {

const ok = confirm("Delete this document?");

if(!ok) return;

const { error: storageError } =
await supabase.storage
.from("private-docs")
.remove([doc.storage_path]);

if(storageError){
alert(storageError.message);
return;
}

const { error: dbError } =
await supabase
.from("documents")
.delete()
.eq("id", doc.id);

if(dbError){
alert(dbError.message);
return;
}

div.remove();

});
  }
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

setTimeout(()=>{

location.reload();

},1000);

}else{

showToast(result.message,"error");

}
  });