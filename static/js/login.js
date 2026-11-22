document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const emailInput = form.querySelector('input[name="email"]');
  const passwordInput = form.querySelector('input[name="password"]');
  const spinner = document.getElementById('spinner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll('.error-msg').forEach(el => el.remove());

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let hasError = false;

    // Client-side validation
    if (!validateEmail(email)) {
      showError(emailInput, 'Please enter a valid email address.');
      hasError = true;
    }

    if (password.length < 6) {
      showError(passwordInput, 'Password must be at least 6 characters.');
      hasError = true;
    }

    if (hasError) return;

    // Show spinner
    spinner?.classList.remove('hidden');

    try {
      const formData = new FormData(form);
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      });

      const data = await response.json();
      spinner?.classList.add('hidden');

      if (data.success) {
        window.location.href = '/';
      } else if (data.errors) {
        data.errors.forEach(error => {
          const inputElement = form.querySelector(`[name="${error.field}"]`);
          if (inputElement) showError(inputElement, error.message);
        });
      } else {
        alert('Login failed. Please try again.');
      }

    } catch (error) {
      spinner?.classList.add('hidden');
      console.error('Login error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  });

  function showError(inputElement, message) {
    const error = document.createElement('div');
    error.className = 'error-msg text-sm text-red-500 mt-1';
    error.textContent = message;
    inputElement?.parentElement?.appendChild(error);
    inputElement.focus();
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
