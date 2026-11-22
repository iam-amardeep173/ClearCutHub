document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('wordToPdfForm');
    const fileInput = document.getElementById('word_file');
    const spinner = document.getElementById('spinner');
    const resultContainer = document.getElementById('resultContainer');
    const downloadLink = document.getElementById('downloadLink');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (fileInput.files.length === 0) {
            alert('Please select a Word file to convert.');
            return;
        }

        const formData = new FormData();
        formData.append('word_file', fileInput.files[0]);

        spinner.classList.remove('hidden');
        resultContainer.classList.add('hidden');

        try {
            const response = await fetch('/convert-word-to-pdf', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.download_link) {
                const fileUrl = data.download_link;

                // Trigger auto-download
                const a = document.createElement('a');
                a.href = fileUrl;
                a.download = ''; // Trigger browser download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Show fallback download link
                downloadLink.href = fileUrl;
                downloadLink.target = '_blank';
                downloadLink.textContent = 'Click here if download didn’t start';
                resultContainer.classList.remove('hidden');
            } else {
                alert(data.error || 'File conversion failed.');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            spinner.classList.add('hidden');
        }
    });
});


