let pagesData = []; // { type: 'real' | 'blank', page_number?: number, image_url?: string }

// Preview uploaded PDF and render pages
function previewPDFPages() {
  const fileInput = document.getElementById('pdfInput');
  if (!fileInput.files.length) {
    alert('Please upload a PDF file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  fetch('/preview-pages', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);

      pagesData = data.pages.map((page, index) => ({
        type: 'real',
        page_number: index,
        image_url: page.image_url,
      }));

      renderPages();
      initDragAndDrop();
    })
    .catch((err) => alert('Preview error: ' + err.message));
}

// Render preview thumbnails with "Insert Blank Page" button
function renderPages() {
  const container = document.getElementById('previewContainer');
  container.innerHTML = '';

  const blankPageSVG = `
    <svg width="150" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="200" fill="#f9fafb" stroke="#d1d5db" stroke-width="1" rx="4" ry="4"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">
        Blank Page
      </text>
    </svg>
  `;

  pagesData.forEach((page, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center p-2 border rounded bg-gray-50';
    wrapper.dataset.index = index;

    const img = document.createElement('img');
    if (page.type === 'blank') {
      const svgBlob = new Blob([blankPageSVG], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(svgBlob);
    } else {
      img.src = page.image_url;
    }
    img.className = 'w-full max-w-xs border border-gray-300 rounded mb-2';

    const label = document.createElement('div');
    label.className = 'text-sm text-gray-700 font-medium';
    label.innerText = page.type === 'blank' ? 'Blank Page' : `Page ${page.page_number + 1}`;

    const btn = document.createElement('button');
    btn.innerText = 'Insert Blank Page After';
    btn.className = 'mt-2 text-xs text-indigo-600 underline';
    btn.onclick = () => insertBlankPage(index + 1);

    wrapper.appendChild(img);
    wrapper.appendChild(label);
    wrapper.appendChild(btn);

    container.appendChild(wrapper);
  });
}

// Insert blank page at given position
function insertBlankPage(position) {
  pagesData.splice(position, 0, { type: 'blank' });
  renderPages();
  initDragAndDrop();
}

// Initialize drag-and-drop using SortableJS
function initDragAndDrop() {
  const container = document.getElementById('previewContainer');

  Sortable.create(container, {
    animation: 150,
    onEnd: (evt) => {
      const newOrder = [];
      const items = container.querySelectorAll('[data-index]');
      items.forEach((item) => {
        const oldIndex = parseInt(item.dataset.index);
        newOrder.push(pagesData[oldIndex]);
      });
      pagesData = newOrder;
      renderPages();
      initDragAndDrop();
    },
  });
}

// Send the structure to the backend for PDF generation
function generatePDF() {
  const fileInput = document.getElementById('pdfInput');
  if (!fileInput.files.length) {
    alert('Please upload a PDF file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append(
    'structure',
    JSON.stringify(
      pagesData.map((p) => (p.type === 'blank' ? 'blank' : p.page_number))
    )
  );

  fetch('/generate-pdf-with-blank', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) throw new Error(data.error);

      const downloadLink = document.getElementById('downloadLink');
      const container = document.getElementById('downloadLinkContainer');
      downloadLink.href = data.download_link;
      downloadLink.download = 'output_with_blank_pages.pdf';
      container.classList.remove('hidden');

      // Optionally trigger automatic download
      downloadLink.click();
    })
    .catch((err) => alert('Generation error: ' + err.message));
}

// Add event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('previewButton')
    .addEventListener('click', previewPDFPages);

  document
    .getElementById('addBlankPageButton')
    .addEventListener('click', () => insertBlankPage(pagesData.length));

  document
    .getElementById('generatePdfButton')
    .addEventListener('click', generatePDF);
});
