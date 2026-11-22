document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("uploadForm");
  const spinner = document.getElementById("spinner");
  const resultContainer = document.getElementById("resultContainer");
  const downloadLink = document.getElementById("downloadLink");
  const fileSizeText = document.getElementById("fileSize");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Clear previous result
    resultContainer.classList.add("hidden");
    fileSizeText.textContent = "";
    downloadLink.href = "#";

    const formData = new FormData(form);

    const selectedOption = formData.get("option");
    if (selectedOption === "target_size") {
      const size = formData.get("target_size");
      if (!size || isNaN(size) || size <= 0) {
        alert("Please enter a valid target size.");
        return;
      }

      // Convert to KB if user selected MB
      const unit = formData.get("size_unit");
      if (unit === "MB") {
        formData.set("target_size_kb", parseFloat(size) * 3072);
      } else {
        formData.set("target_size_kb", parseFloat(size));
      }
    }

    spinner.classList.remove("hidden");

    try {
      const response = await fetch("/process-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      spinner.classList.add("hidden");

      if (response.ok && result.download_link) {
        downloadLink.href = result.download_link;
        fileSizeText.textContent = `📦 Final Size: ${result.size_kb} KB`;
        resultContainer.classList.remove("hidden");
      } else {
        alert(result.error || "Something went wrong. Try again.");
      }
    } catch (error) {
      spinner.classList.add("hidden");
      alert("🚫 Network error or server is down.");
    }
  });
});


