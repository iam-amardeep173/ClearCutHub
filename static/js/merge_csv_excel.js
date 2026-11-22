// document.addEventListener('DOMContentLoaded', function () {
//   const dropZone = document.getElementById('dropZone');
//   const fileInput = document.getElementById('mergeFiles');
//   const filePreview = document.getElementById('filePreview');
//   const form = document.getElementById('mergeForm');
//   const fileTypeInput = document.getElementById('fileType');

//  // Initialize SheetJS
//   const XLSX = window.XLSX;
  
//   dropZone.addEventListener('click', () => fileInput.click());

//   dropZone.addEventListener('dragover', (e) => {
//     e.preventDefault();
//     dropZone.classList.add('bg-gray-100');
//   });

//   dropZone.addEventListener('dragleave', () => {
//     dropZone.classList.remove('bg-gray-100');
//   });

//   dropZone.addEventListener('drop', (e) => {
//     e.preventDefault();
//     dropZone.classList.remove('bg-gray-100');
//     const files = e.dataTransfer.files;
//     fileInput.files = files;
//     previewFiles(files);
//   });

//   fileInput.addEventListener('change', () => {
//     previewFiles(fileInput.files);
//   });

//   function getFileIcon(name) {
//     return name.endsWith('.csv') ? '📄 CSV' :
//            name.endsWith('.xlsx') ? '📊 Excel' : '📁 File';
//   }

//   function previewFiles(files) {
//     filePreview.innerHTML = '';
//     for (const file of files) {
//       const sizeMB = file.size / (1024 * 1024);
//       if (sizeMB > MAX_SIZE_MB) {
//         filePreview.innerHTML += `<p class="text-red-600">❌ ${file.name} too large (${sizeMB.toFixed(1)}MB)</p>`;
//       } else {
//         filePreview.innerHTML += `<p class="text-green-700">${getFileIcon(file.name)} - ${file.name} (${sizeMB.toFixed(2)} MB)</p>`;
//       }
//     }
//   }

//   form.addEventListener('submit', async function (e) {
//     e.preventDefault();

//     const files = fileInput.files;
//     let oversize = false;
//     for (const file of files) {
//       if (file.size > MAX_SIZE_MB * 1024 * 1024) {
//         oversize = true;
//         break;
//       }
//     }

//     if (oversize) {
//       alert("One or more files exceed the 1GB limit.");
//       return;
//     }

//     const formData = new FormData(form);

//     try {
//       const response = await fetch('/merge-csv-excel', {
//         method: 'POST',
//         body: formData
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         alert("Error: " + (err.error || response.statusText));
//         return;
//       }

//       const blob = await response.blob();
//       const fileType = fileTypeInput.value;
//       const extension = fileType === 'excel' ? '.xlsx' : '.csv';

//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.style.display = 'none';
//       a.href = url;
//       a.download = 'merged_file' + extension;

//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       alert("Upload failed: " + error.message);
//     }
//   });
// });



document.getElementById('mergeFiles').addEventListener('change', handleFiles);
document.getElementById('dropZone').addEventListener('dragover', event => {
  event.preventDefault();
  document.getElementById('dropZone').classList.add('bg-blue-50');
});
document.getElementById('dropZone').addEventListener('dragleave', () => {
  document.getElementById('dropZone').classList.remove('bg-blue-50');
});
document.getElementById('dropZone').addEventListener('drop', event => {
  event.preventDefault();
  document.getElementById('dropZone').classList.remove('bg-blue-50');
  handleFiles({ target: { files: event.dataTransfer.files } });
});
document.getElementById('browseBtn').addEventListener('click', () => {
  document.getElementById('mergeFiles').click();
});

document.getElementById('mergeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const files = Array.from(document.getElementById('mergeFiles').files);
  if (!files.length) {
    document.getElementById('uploadError').classList.remove('hidden');
    document.getElementById('uploadError').innerText = 'No files selected.';
    return;
  }
  await handleFiles({ target: { files } }, true);
});

async function handleFiles(event, isSubmit = false) {
  const files = Array.from(event.target.files);
  const preview = document.getElementById('filePreview');
  const errorBox = document.getElementById('uploadError');
  preview.innerHTML = '';
  errorBox.classList.add('hidden');
  errorBox.innerHTML = '';

  // File preview rendering
  // File preview rendering (clean list, no buttons)
const fileList = document.createElement('ul');
fileList.className = 'space-y-1';

files.forEach((file, index) => {
  const li = document.createElement('li');
  li.className = 'flex justify-between items-center bg-gray-100 p-2 rounded';
  li.setAttribute('data-index', index);
  li.innerHTML = `
    <span class="truncate">${file.name}</span>
    <div class="text-sm space-x-2 text-blue-600 cursor-pointer">
      <span class="move-up">↑</span>
      <span class="move-down">↓</span>
      <span class="remove">Remove</span>
    </div>
  `;
  fileList.appendChild(li);
});



  preview.appendChild(fileList);

  // Add move functionality
  addMoveHandlers(fileList, files);

  // Skip processing unless called from form submit
  if (!isSubmit) return;

  try {
    const { mergedData, skippedFiles, allHeaders } = await processFiles(files);

    if (mergedData.length === 0) {
      preview.innerHTML += '<p class="text-red-500">No valid data found in uploaded files.</p>';
      return;
    }

    const outputType = document.getElementById('fileType').value;
    if (outputType === 'csv') {
      const csv = Papa.unparse([allHeaders, ...mergedData]);
      downloadCSV(csv, 'merged_data.csv');
    } else {
      downloadExcel([allHeaders, ...mergedData], 'merged_data.xlsx');
    }

    preview.innerHTML += '<p class="text-green-700 font-semibold">Files merged successfully!</p>';

    if (skippedFiles.length > 0) {
      errorBox.classList.remove('hidden');
      errorBox.innerHTML = '<strong>Skipped Files:</strong><ul>' +
        skippedFiles.map(msg => `<li>${msg}</li>`).join('') + '</ul>';
    }
  } catch (error) {
    errorBox.classList.remove('hidden');
    errorBox.innerHTML = `Error: ${error.message}`;
  }
}

function addMoveHandlers(list, filesArray) {
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    const index = parseInt(li.getAttribute('data-index'));

    if (e.target.classList.contains('move-up') && index > 0) {
      [filesArray[index - 1], filesArray[index]] = [filesArray[index], filesArray[index - 1]];
    } else if (e.target.classList.contains('move-down') && index < filesArray.length - 1) {
      [filesArray[index], filesArray[index + 1]] = [filesArray[index + 1], filesArray[index]];
    } else if (e.target.classList.contains('remove')) {
      filesArray.splice(index, 1);
    } else {
      return;
    }

    // Re-render preview with updated files
    handleFiles({ target: { files: new FileListWrapper(filesArray) } });
  });
}

function FileListWrapper(filesArray) {
  const dataTransfer = new DataTransfer();
  filesArray.forEach(f => dataTransfer.items.add(f));
  return dataTransfer.files;
}

async function processFiles(files) {
  let mergedData = [];
  let allHeadersSet = new Set();
  let skippedFiles = [];
  let dataCollection = [];

  for (let file of files) {
    try {
      const { data, headersRaw } = await readFile(file);

      if (!headersRaw || headersRaw.length === 0) {
        skippedFiles.push(`${file.name} – missing headers`);
        continue;
      }

      const normalizedHeaders = headersRaw.map(h => h?.toString().trim().toLowerCase());
      allHeadersSet = new Set([...allHeadersSet, ...normalizedHeaders]);

      dataCollection.push({ file, data, headersRaw, normalizedHeaders });
    } catch (err) {
      skippedFiles.push(`${file.name} – ${err.message}`);
    }
  }

  const allHeaders = Array.from(allHeadersSet);
  for (const { file, data, headersRaw, normalizedHeaders } of dataCollection) {
    const headerMap = {};
    normalizedHeaders.forEach((h, idx) => headerMap[h] = idx);

    for (let row of data) {
      let alignedRow = allHeaders.map(colName => {
        const idx = headerMap[colName];
        return typeof idx === 'number' ? row[idx] : '';
      });
      mergedData.push(alignedRow);
    }
  }

  return { mergedData, allHeaders, skippedFiles };
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const ext = file.name.split('.').pop().toLowerCase();

    reader.onload = event => {
      let data, headersRaw;
      if (ext === 'csv') {
        const parsed = Papa.parse(event.target.result, { skipEmptyLines: true });
        if (parsed.data.length < 2) return reject(new Error('No data found'));
        headersRaw = parsed.data[0];
        data = parsed.data.slice(1);
      } else if (ext === 'xlsx') {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsed = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (parsed.length < 2) return reject(new Error('No data found'));
        headersRaw = parsed[0];
        data = parsed.slice(1);
      } else {
        return reject(new Error('Unsupported file format'));
      }

      resolve({ data, headersRaw });
    };

    reader.onerror = () => reject(new Error('File read error'));

    if (ext === 'csv') {
      reader.readAsText(file);
    } else if (ext === 'xlsx') {
      reader.readAsBinaryString(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadExcel(data, filename) {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Merged');
  XLSX.writeFile(workbook, filename);
}
