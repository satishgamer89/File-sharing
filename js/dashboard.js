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

  for (const doc of data) {
    console.log("Processing:", doc);

    const div = document.createElement("div");

    div.className = "document-card";

    const { data: signedData } = await supabase.storage
      .from("private-docs")
      .createSignedUrl(doc.storage_path, 3600);

div.innerHTML = `

<div class="document-icon">
📄
</div>

<div class="document-title">
${doc.title}
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
    const file =
      document.getElementById("fileInput").files[0];

    const title =
      document.getElementById("title").value;

    if (!file) {
      alert("Select file");
      return;
    }

    await uploadFile(file, title);

    location.reload();
  });