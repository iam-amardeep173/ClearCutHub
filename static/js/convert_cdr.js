document.addEventListener('DOMContentLoaded', function () {
  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('file_input');
  const fileList = document.getElementById('fileList');
  const convertForm = document.getElementById('convertForm');
  const spinner = document.getElementById('spinner');
  const downloadLinks = document.getElementById('downloadLinks');
  const convertFormat = document.getElementById('convertFormat');

  // Handle drag & drop
  dropArea.addEventListener('click', () => fileInput.click());

  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('bg-indigo-100');
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('bg-indigo-100');
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('bg-indigo-100');
    fileInput.files = e.dataTransfer.files;
    showFileList();
  });

  fileInput.addEventListener('change', showFileList);

  function showFileList() {
    fileList.innerHTML = '';
    Array.from(fileInput.files).forEach(file => {
      const li = document.createElement('li');
      li.classList.add("flex", "items-center", "gap-2");

      const icon = document.createElement('img');
      icon.src = '/static/images/cdr-icon.png'; // Make sure this image exists
      icon.alt = 'CDR';
      icon.classList.add("w-6", "h-6");

      const filename = document.createElement('span');
      filename.textContent = file.name;

      li.appendChild(icon);
      li.appendChild(filename);
      fileList.appendChild(li);
    });
  }

  convertForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const selectedFormat = convertFormat.value;
    if (!selectedFormat) {
      alert("Please select a conversion format.");
      return;
    }

    const files = fileInput.files;
    if (!files.length) {
      alert("Please upload at least one .cdr file.");
      return;
    }

    spinner.classList.remove('hidden');
    downloadLinks.classList.add('hidden');
    fileList.classList.remove('hidden');

    const formData = new FormData();
    formData.append('convertFormat', selectedFormat);
    Array.from(files).forEach(file => formData.append('files', file));

    fetch('/convert-cdr', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      spinner.classList.add('hidden');
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error || "Conversion failed."); });
      }

      // Handle file download
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Handle download filename logic
      const isZip = blob.type === 'application/zip';
      a.download = isZip ? 'converted_files.zip' : `converted_file.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Optional: Show success message
      downloadLinks.classList.remove('hidden');
      downloadLinks.innerHTML = `<p class="text-green-600 font-medium">Conversion complete. Download started automatically.</p>`;
    })
    .catch(error => {
      spinner.classList.add('hidden');
      console.error(error);
      alert("Error: " + error.message);
    });
  });
});


