document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("pdfProtectForm");
    const fileInput = document.getElementById("pdf_file");
    const passwordInput = document.getElementById("password");
    const spinner = document.getElementById("spinner");
    const resultContainer = document.getElementById("resultContainer");
    const downloadLink = document.getElementById("downloadLink");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        resultContainer.classList.add("hidden");
        spinner.classList.remove("hidden");

        const formData = new FormData();
        formData.append("pdf_file", fileInput.files[0]);
        formData.append("password", passwordInput.value);

        try {
            const response = await fetch(form.action || "/protect-pdf", {
                method: "POST",
                body: formData
            });

            const contentType = response.headers.get("Content-Type");

            if (!response.ok) {
                let errorText = "Something went wrong.";
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    errorText = data.error || errorText;
                } else {
                    const text = await response.text();
                    console.error("Server error response:", text);
                }
                throw new Error(errorText);
            }

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                downloadLink.href = data.download_url;
                resultContainer.classList.remove("hidden");
                setTimeout(() => {
                    window.location.href = data.download_url;
                }, 1000);
            } else {
                throw new Error("Unexpected response format.");
            }
        } catch (error) {
            alert("Failed to upload: " + error.message);
            console.error("Error:", error);
        } finally {
            spinner.classList.add("hidden");
        }
    });
});

