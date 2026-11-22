document.addEventListener('DOMContentLoaded', function () {
    // Selecting elements
    const form = document.querySelector('form');
    const submitBtn = document.querySelector('button[type="submit"]');
    const spinner = document.getElementById('spinner');
    const resultContainer = document.getElementById('resultContainer');
    const downloadLink = document.getElementById('downloadLink');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const languageChange = document.querySelector('.language-change select');

    // Toggle mobile menu
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Show the spinner while processing
        toggleSpinner(true);
        resultContainer.classList.add('hidden');

        const formData = new FormData(form);

        // Sending form data to the server for processing
        unlockPDF(formData)
            .then(response => {
                // Hide spinner after unlocking
                toggleSpinner(false);
                resultContainer.classList.remove('hidden');

                // Create the download link for the unlocked PDF
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = 'unlocked.pdf';
                downloadLink.classList.remove('hidden'); // Make sure the download link is visible
            })
            .catch(error => {
                toggleSpinner(false);
                resultContainer.classList.remove('hidden');
                alert('An error occurred while unlocking the PDF');
            });
    });

    // Handle language change
    languageChange.addEventListener('change', function () {
        const selectedLanguage = languageChange.value;
        changeLanguage(selectedLanguage);
    });

    // Function to simulate language change (for future integration)
    function changeLanguage(language) {
        // Example logic: Replace with actual translation service or functionality
        console.log('Language changed to:', language);
        // You could dynamically load translations based on the selected language here.
    }
});

// Toggle the visibility of the spinner
function toggleSpinner(isVisible) {
    const spinner = document.getElementById('spinner');
    if (isVisible) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

// Simulate PDF unlocking (Replace with actual logic)
function unlockPDF(formData) {
    return new Promise((resolve, reject) => {
        fetch('/pdf-unlock/unlock-pdf', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.download_url) {
                // Redirect the user to the unlocked PDF download URL
                window.location.href = data.download_url;
                resolve(); // Resolve once the download is initiated
            } else {
                reject('Error: ' + data.error);
            }
        })
        .catch(error => reject(error));
    });
}

