document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("dropArea");
  const fileInput = document.getElementById("file_input");
  const fileList = document.getElementById("fileList");
  const previewSection = document.getElementById("previewSection");
  const form = document.getElementById("convertForm");
  const spinner = document.getElementById("spinner");
  const downloadSection = document.getElementById("downloadSection");
  const downloadLink = document.getElementById("downloadLink");

  // Highlight drop area on drag
  ["dragenter", "dragover"].forEach(evt =>
    dropArea.addEventListener(evt, e => {
      e.preventDefault();
      dropArea.classList.add("bg-indigo-100");
    })
  );

  // Remove highlight
  ["dragleave", "drop"].forEach(evt =>
    dropArea.addEventListener(evt, e => {
      e.preventDefault();
      dropArea.classList.remove("bg-indigo-100");
    })
  );

  // Handle drop
  dropArea.addEventListener("drop", e => {
    fileInput.files = e.dataTransfer.files;
    updateFileList();
  });

  // Open file dialog on click
  dropArea.addEventListener("click", () => fileInput.click());

  // Update file list and preview when selected manually
  fileInput.addEventListener("change", updateFileList);

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    spinner.classList.remove("hidden");
    downloadSection.classList.add("hidden");

    const formData = new FormData(form);
    const outputFormat = formData.get("convertFormat");
    const files = fileInput.files;

    if (!outputFormat || !files.length) {
      alert("Please select output format and at least one WEBP file.");
      spinner.classList.add("hidden");
      return;
    }

    try {
      const res = await fetch("/convert-webp", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Conversion failed. Please try again.");

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "converted_output";

      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadSection.classList.remove("hidden");
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      spinner.classList.add("hidden");
    }
  });

  // Show list of selected files and their previews
  function updateFileList() {
    const files = Array.from(fileInput.files);
    fileList.innerHTML = files.map(f => `<li>${f.name}</li>`).join("");
    previewSection.innerHTML = ""; // Clear previous previews

    files.forEach(file => {
      if (file.type.startsWith('image/webp')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgElement = document.createElement("img");
          imgElement.src = e.target.result;
          imgElement.classList.add("w-24", "h-24", "object-cover");
          previewSection.appendChild(imgElement);
        };
        reader.readAsDataURL(file);
      }
    });

    previewSection.style.display = files.length ? "grid" : "none"; // Show preview section
  }
});


