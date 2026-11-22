document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('mergePdfForm');
    const fileInput = document.getElementById('pdf_files');
    const fileList = document.getElementById('fileList');
    const dropzone = document.getElementById('dropzone');
    const spinner = document.getElementById('spinner');
    const resultContainer = document.getElementById('resultContainer');
    const downloadLink = document.getElementById('downloadLink');

    let selectedFiles = [];

    function isDuplicate(file) {
        return selectedFiles.some(f => f.name === file.name && f.size === file.size);
    }

    fileInput.addEventListener('change', function () {
        const newFiles = Array.from(fileInput.files).filter(f => f.type === 'application/pdf' && !isDuplicate(f));
        selectedFiles = [...selectedFiles, ...newFiles];
        fileInput.value = '';
        renderFileList();
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('bg-indigo-100');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('bg-indigo-100');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('bg-indigo-100');
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf' && !isDuplicate(file));
        selectedFiles = [...selectedFiles, ...droppedFiles];
        renderFileList();
    });

    function renderFileList() {
        fileList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = "flex items-center justify-between bg-gray-100 p-2 rounded";

            const isFirst = index === 0;
            const isLast = index === selectedFiles.length - 1;

            li.innerHTML = `
                <span class="text-sm text-gray-700 truncate w-1/2">${file.name}</span>
                <div class="space-x-2 flex items-center">
                    <button class="move-up text-blue-500 text-sm ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}" data-index="${index}" ${isFirst ? 'disabled' : ''}>↑</button>
                    <button class="move-down text-blue-500 text-sm ${isLast ? 'opacity-30 cursor-not-allowed' : ''}" data-index="${index}" ${isLast ? 'disabled' : ''}>↓</button>
                    <button class="remove text-red-500 text-sm" data-index="${index}">Remove</button>
                </div>
            `;

            fileList.appendChild(li);
        });
    }

    fileList.addEventListener('click', function (e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        if (e.target.classList.contains('remove')) {
            selectedFiles.splice(index, 1);
        } else if (e.target.classList.contains('move-up') && index > 0) {
            [selectedFiles[index - 1], selectedFiles[index]] = [selectedFiles[index], selectedFiles[index - 1]];
        } else if (e.target.classList.contains('move-down') && index < selectedFiles.length - 1) {
            [selectedFiles[index], selectedFiles[index + 1]] = [selectedFiles[index + 1], selectedFiles[index]];
        }
        renderFileList();
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (selectedFiles.length < 2) {
            alert('Please select at least two PDF files to merge.');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('pdf_files[]', file);
        });

        spinner.classList.remove('hidden');
        resultContainer.classList.add('hidden');

        try {
            const response = await fetch('/merge-pdf-files', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                alert('Merging failed: ' + errorText);
                return;
            }

            const blob = await response.blob();
            const fileUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = fileUrl;
            a.setAttribute('download', 'merged.pdf');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(fileUrl);

            downloadLink.href = fileUrl;
            resultContainer.classList.remove('hidden');

            selectedFiles = [];
            renderFileList();
            fileInput.value = '';
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            spinner.classList.add('hidden');
        }
    });
});

