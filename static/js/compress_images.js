document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = uploadForm.querySelector('input[type="file"]');
  const dropZone = document.getElementById("dropZone");
  const imagePreview = document.getElementById("imagePreview");
  const spinner = document.getElementById("spinner");
  const resultContainer = document.getElementById("resultContainer");
  const downloadLink = document.getElementById("downloadLink");

  // Drag & drop handler
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("bg-gray-100");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("bg-gray-100");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("bg-gray-100");
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      previewImage(fileInput.files[0]);
    }
  });

  dropZone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      previewImage(fileInput.files[0]);
    }
  });

  function previewImage(file) {
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result;
      imagePreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!fileInput.files.length) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    const selectedOption = uploadForm.querySelector('input[name="option"]:checked').value;

    if (selectedOption === "compress_quality") {
      const quality = document.getElementById("compressionQuality").value;
      formData.append("option", "compress_quality");
      formData.append("compression_quality", quality);
    } else if (selectedOption === "target_size") {
      const targetSize = document.getElementById("targetSize").value;
      if (!targetSize || isNaN(targetSize) || Number(targetSize) <= 0) {
        alert("Please enter a valid target file size in KB.");
        return;
      }
      formData.append("option", "target_size");
      formData.append("target_size_kb", targetSize);
    }

    spinner.classList.remove("hidden");
    resultContainer.classList.add("hidden");
    downloadLink.classList.add("hidden");

    try {
      const response = await fetch("/compress-image/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.download_link) {
        downloadLink.href = result.download_link;
        downloadLink.classList.remove("hidden");
        resultContainer.classList.remove("hidden");

        // Auto-trigger download
        setTimeout(() => {
          downloadLink.click();
        }, 500);
      } else {
        alert(result.error || "Compression failed.");
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
      console.error(error);
    } finally {
      spinner.classList.add("hidden");
    }
  });
});

