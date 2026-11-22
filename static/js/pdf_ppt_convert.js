document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const dropArea = document.getElementById("dropArea");
    const fileLabel = document.getElementById("fileLabel");
    const convertForm = document.getElementById("convertForm");
    const spinner = document.getElementById("spinner");
    const downloadSection = document.getElementById("downloadSection");
    const downloadLink = document.getElementById("downloadLink");
    const convertType = document.getElementById("convertType");

    let uploadedFile = null;

    // 💡 Utility: Show Spinner
    const showSpinner = () => {
        spinner.classList.remove("hidden");
    };

    // 💡 Utility: Hide Spinner
    const hideSpinner = () => {
        spinner.classList.add("hidden");
    };

    // 💡 Utility: Reset UI
    const resetUI = () => {
        downloadSection.classList.add("hidden");
        downloadLink.href = "#";
        downloadLink.innerText = "";
        fileLabel.innerText = "Choose a file...";
        uploadedFile = null;
    };

    // ✅ Handle drag events
    ["dragenter", "dragover"].forEach(event => {
        dropArea.addEventListener(event, e => {
            e.preventDefault();
            dropArea.classList.add("border-indigo-500", "bg-indigo-50");
        });
    });

    ["dragleave", "drop"].forEach(event => {
        dropArea.addEventListener(event, e => {
            e.preventDefault();
            dropArea.classList.remove("border-indigo-500", "bg-indigo-50");
        });
    });

    // ✅ Drop file
    dropArea.addEventListener("drop", e => {
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            fileLabel.innerText = files[0].name;
            uploadedFile = files[0];
        }
    });

    // ✅ File input change
    fileInput.addEventListener("change", e => {
        if (e.target.files.length) {
            fileLabel.innerText = e.target.files[0].name;
            uploadedFile = e.target.files[0];
        }
    });

    // ✅ Handle form submit
    convertForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        resetUI();

        // Check for file and conversion type
        if (!uploadedFile || !convertType.value) {
            alert("Please select a file and conversion type.");
            return;
        }

        showSpinner();

        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("convertType", convertType.value);
        console.log("Uploading file:", uploadedFile);
        console.log("Conversion type:", convertType.value);

        try {
            const response = await fetch("/pdf-ppt-converter/convert", {
                method: "POST",
                body: formData,
              });              

            // Handle unsuccessful response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Conversion failed.");
            }

            const blob = await response.blob();
            const fileExt = convertType.value === "pdf-to-ppt" ? "pptx" : "pdf";
            const filename = `converted_file.${fileExt}`;

            const downloadUrl = URL.createObjectURL(blob);
            downloadLink.href = downloadUrl;
            downloadLink.download = filename;
            downloadLink.innerText = `Download ${filename}`;
            downloadSection.classList.remove("hidden");

        } catch (error) {
            alert(`An error occurred during conversion. ${error.message || "Please try again."}`);
            console.error("Conversion Error:", error);
        } finally {
            hideSpinner();
        }
    });
});

