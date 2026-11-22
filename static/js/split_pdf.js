let selectedPages = []; // Store selected pages

// Preview uploaded PDF pages
function previewPages() {
    const fileInput = document.getElementById('pdfInput');
    if (!fileInput.files.length) {
        alert("Please upload a PDF file.");
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('/preview-pages', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }

        const previewContainer = document.getElementById('previewContainer');
        previewContainer.innerHTML = ''; // Clear old previews
        selectedPages = [];

        data.pages.forEach(page => {
            const img = document.createElement('img');
            img.src = page.image_url;
            img.dataset.pageNumber = page.page_number - 1; // 0-indexed for backend
            img.classList.add('cursor-pointer', 'transition-opacity', 'duration-300', 'border', 'border-transparent', 'hover:border-indigo-500', 'rounded', 'opacity-0');

            // Fade-in effect when the image is loaded
            img.onload = () => {
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
            };

            // Toggle selection
            img.onclick = () => {
                const pageNum = parseInt(img.dataset.pageNumber);
                img.classList.toggle('ring-4');
                img.classList.toggle('ring-red-500');
                if (selectedPages.includes(pageNum)) {
                    selectedPages = selectedPages.filter(p => p !== pageNum);
                } else {
                    selectedPages.push(pageNum);
                }
            };

            previewContainer.appendChild(img);
        });
    })
    .catch(err => {
        alert("Error previewing PDF: " + err.message);
    });
}

// Delete selected pages and trigger download
function deleteSelectedPages() {
    if (selectedPages.length === 0) {
        alert("Please select pages to delete.");
        return;
    }

    fetch('/delete-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: selectedPages })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }

        const downloadLinkContainer = document.getElementById('downloadLinkContainer');
        const downloadLink = document.getElementById('downloadLink');

        downloadLink.href = data.download_link;
        downloadLink.download = 'split_document.pdf';
        downloadLinkContainer.classList.remove('hidden');

        // Optional: auto-download the file
        setTimeout(() => {
            downloadLink.click();
        }, 500);
    })
    .catch(err => {
        alert("Error deleting pages: " + err.message);
    });
}

