document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const passwordInput = form.querySelector('input[name="password"]');
  const spinner = document.getElementById('spinner');
  
  form.addEventListener('submit', function (e) {
    // Prevent default form submission
    e.preventDefault();

    // Basic client-side validation
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Clear previous errors
    form.querySelectorAll('.error-msg').forEach(el => el.remove());

    let hasError = false;

    if (name.length < 2) {
      showError(nameInput, 'Name must be at least 2 characters.');
      hasError = true;
    }

    if (!validateEmail(email)) {
      showError(emailInput, 'Enter a valid email address.');
      hasError = true;
    }

    if (password.length < 6) {
      showError(passwordInput, 'Password must be at least 6 characters.');
      hasError = true;
    }

    if (hasError) {
      return; // If there are validation errors, prevent the form submission
    }

    // Send data via AJAX if no errors
    const formData = new FormData(form);
    spinner.classList.remove('hidden'); // Show the loading spinner

    fetch('/signup', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      spinner.classList.add('hidden'); // Hide the spinner

      if (data.success) {
        // Handle successful signup (e.g., redirect to login page)
        alert('Signup successful!');
        window.location.href = '/login'; // Redirect to login page
      } else {
        // Display server-side validation errors
        handleServerErrors(data.errors);
      }
    })
    .catch(error => {
      spinner.classList.add('hidden'); // Hide the spinner
      alert('An error occurred, please try again later.');
      console.error('Error during signup:', error);
    });
  });

  // Show error function
  function showError(inputElement, message) {
    const error = document.createElement('div');
    error.classList.add('error-msg', 'text-red-500', 'mt-2', 'text-sm');
    error.textContent = message;
    inputElement.parentElement.appendChild(error);
  }

  // Function to handle server-side errors
  function handleServerErrors(errors) {
    if (errors) {
      errors.forEach(error => {
        const inputElement = form.querySelector(`[name="${error.field}"]`);
        if (inputElement) {
          showError(inputElement, error.message);
        }
      });
    }
  }

  // Simple email validation regex
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
