uploadForm.addEventListener('submit', function(event) {
    event.preventDefault();
  
    const formData = new FormData(uploadForm);
  
    document.getElementById('spinner').classList.remove('hidden');
  
    fetch('/resize', {  // ✅ correct endpoint
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Resize failed');
      }
      return response.blob();
    })
    .then(resizedImage => {
      const resizedImageUrl = URL.createObjectURL(resizedImage);
      resultImage.src = resizedImageUrl;
      downloadLink.href = resizedImageUrl;
      resultContainer.classList.remove('hidden');
      document.getElementById('spinner').classList.add('hidden');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to resize image. Please try again.');
      document.getElementById('spinner').classList.add('hidden');
    });
  });
  
//compression of image
  const compressForm = document.getElementById('compressForm');
const compressResultContainer = document.getElementById('compressResultContainer');
const compressResultImage = document.getElementById('compressResultImage');
const compressDownloadLink = document.getElementById('compressDownloadLink');

// Handle the form submission for compression
compressForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(compressForm);
  document.getElementById('compressSpinner').classList.remove('hidden'); // Show the spinner

  fetch('/compress', {
    method: 'POST',
    body: formData
  })
  .then(response => response.blob()) // Expecting a blob response (image)
  .then(compressedImage => {
    const compressedImageUrl = URL.createObjectURL(compressedImage); // Convert blob to URL
    compressResultImage.src = compressedImageUrl; // Display the compressed image
    compressDownloadLink.href = compressedImageUrl; // Set the download link
    compressResultContainer.classList.remove('hidden'); // Show the result container
    document.getElementById('compressSpinner').classList.add('hidden'); // Hide the spinner
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('compressSpinner').classList.add('hidden'); // Hide the spinner if an error occurs
  });
});



