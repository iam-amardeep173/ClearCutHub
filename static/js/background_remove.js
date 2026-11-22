document.addEventListener("DOMContentLoaded", function() {
    const backgroundModeSelect = document.getElementById('backgroundMode');
    const colorPickerDiv = document.getElementById('colorPickerDiv');
    const bgImageDiv = document.getElementById('bgImageDiv');
    const colorPicker = document.getElementById('colorPicker');
    const colorDisplay = document.getElementById('colorDisplay');

    // Show the correct input fields based on background mode
    backgroundModeSelect.addEventListener('change', function() {
        const selectedMode = this.value;
        if (selectedMode === 'color') {
            colorPickerDiv.classList.remove('hidden');
            bgImageDiv.classList.add('hidden');
        } else if (selectedMode === 'image') {
            bgImageDiv.classList.remove('hidden');
            colorPickerDiv.classList.add('hidden');
        } else {
            colorPickerDiv.classList.add('hidden');
            bgImageDiv.classList.add('hidden');
        }
    });

    // Update color display when color is selected
    colorPicker.addEventListener('input', function () {
        colorDisplay.style.backgroundColor = colorPicker.value;
    });

    // Form submission + spinner + result display
    const uploadForm = document.getElementById('uploadForm');
    const spinner = document.getElementById('spinner');
    const resultContainer = document.getElementById('resultContainer');
    const resultImage = document.getElementById('resultImage');
    const downloadLink = document.getElementById('downloadLink');

    uploadForm.addEventListener('submit', function(event) {
        event.preventDefault();

        spinner.classList.remove('hidden');

        const formData = new FormData(uploadForm);

        fetch('/remove-bg', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not OK');
            return response.blob();
        })
        .then(imageBlob => {
            spinner.classList.add('hidden');
            const imageUrl = URL.createObjectURL(imageBlob);
            resultImage.src = imageUrl;
            resultContainer.classList.remove('hidden');
            downloadLink.href = imageUrl;
        })
        .catch(error => {
            console.error('Error:', error);
            spinner.classList.add('hidden');
            alert('Failed to process the image. Please try again.');
        });
    });
});
