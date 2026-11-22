// Load SortableJS via CDN if not included in HTML
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js";
document.head.appendChild(script);

document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("image_file");
  const previewContainer = document.getElementById("previewContainer");
  const convertForm = document.getElementById("convertForm");
  const downloadSection = document.getElementById("downloadSection");
  const downloadLink = document.getElementById("downloadLink");

  let selectedFiles = [];

  // Drag and drop behavior
  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("bg-purple-100");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("bg-purple-100");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("bg-purple-100");
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener("change", () => handleFiles(fileInput.files));

  function handleFiles(files) {
    const validFiles = Array.from(files).filter(file =>
      file.type === "image/jpeg" || file.type === "image/jpg"
    );
    selectedFiles = selectedFiles.concat(validFiles);
    renderPreviews();
  }

  function renderPreviews() {
    previewContainer.innerHTML = "";

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement("div");
        div.setAttribute("data-filename", file.name);
        div.className = "border rounded p-2 bg-white shadow";
        div.innerHTML = `<img src="${e.target.result}" class="w-full h-auto rounded" />`;
        previewContainer.appendChild(div);
      };
      reader.readAsDataURL(file);
    });

    // Enable sortable after preview render
    new Sortable(previewContainer, {
      animation: 150,
      onEnd: () => {
        const newOrder = Array.from(previewContainer.children).map(
          child => child.getAttribute("data-filename")
        );
        selectedFiles.sort((a, b) => newOrder.indexOf(a.name) - newOrder.indexOf(b.name));
      }
    });
  }

  convertForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      alert("Please select at least one JPG image.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("images", file));

    try {
      const response = await fetch("/jpg-to-pdf", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      downloadLink.href = url;
      downloadLink.download = "converted.pdf";
      downloadSection.classList.remove("hidden");
    } catch (error) {
      alert("An error occurred while converting images.");
      console.error(error);
    }
  });
});


