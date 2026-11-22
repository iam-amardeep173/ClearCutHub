document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("pdfToWordForm");
    const fileInput = document.getElementById("pdf_file");
    const spinner = document.getElementById("spinner");
    const resultContainer = document.getElementById("resultContainer");
    const downloadLink = document.getElementById("downloadLink");
    const dropZone = document.querySelector(".drop-zone");
    const fileName = document.getElementById("fileName");

    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      dropZone.classList.add("bg-indigo-100");
    });

    dropZone.addEventListener("dragleave", function () {
      dropZone.classList.remove("bg-indigo-100");
    });

    dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      dropZone.classList.remove("bg-indigo-100");
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        fileName.textContent = "Selected: " + files[0].name;
      }
    });

    fileInput.addEventListener("change", function () {
      if (fileInput.files.length > 0) {
        fileName.textContent = "Selected: " + fileInput.files[0].name;
      }
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const file = fileInput.files[0];
      if (!file || !file.name.endsWith(".pdf")) {
        alert("Please upload a valid PDF file.");
        return;
      }

      spinner.classList.remove("hidden");
      resultContainer.classList.add("hidden");

      const formData = new FormData();
      formData.append("pdf_file", file);

      try {
        const response = await fetch("/convert-pdf-to-word", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Conversion failed");

        downloadLink.href = data.download_link;
        downloadLink.textContent = "Click here if download didn’t start";
        resultContainer.classList.remove("hidden");

        // Auto trigger download
        const a = document.createElement("a");
        a.href = data.download_link;
        a.download = "converted.docx";
        document.body.appendChild(a);
        a.click();
        a.remove();

      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        spinner.classList.add("hidden");
      }
    });
  });

  