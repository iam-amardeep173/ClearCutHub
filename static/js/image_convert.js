document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("image_file");
  const previewContainer = document.getElementById("previewContainer");
  const form = document.getElementById("convertForm");
  const downloadSection = document.getElementById("downloadSection");
  const downloadLink = document.getElementById("downloadLink");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("bg-gray-100");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("bg-gray-100");
  });

  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    showPreviews(fileInput.files);
  });

  fileInput.addEventListener("change", () => {
    showPreviews(fileInput.files);
  });

  function showPreviews(files) {
    previewContainer.innerHTML = "";
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "rounded shadow max-h-48 object-contain";
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const response = await fetch("/image-convert", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Conversion failed");

      const result = await response.json(); // { files: [url1, url2] }

      downloadLink.innerHTML = "";
      result.files.forEach((url, index) => {
        // Create anchor for visible link
        const visibleLink = document.createElement("a");
        visibleLink.href = url;
        visibleLink.target = "_blank";
        visibleLink.download = "";
        visibleLink.textContent = `Download ${index + 1}`;
        visibleLink.className = "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 block my-2";
        downloadLink.appendChild(visibleLink);

        // Auto-trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = ""; // Auto download with original name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });

      downloadSection.classList.remove("hidden");
      window.scrollTo({ top: downloadSection.offsetTop, behavior: "smooth" });

    } catch (err) {
      alert("Error: " + err.message);
    }
  });
});


