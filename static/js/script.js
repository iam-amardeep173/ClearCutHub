// Toggle Mobile Menu
document.getElementById('mobile-menu').addEventListener('click', () => {
  const navLinks = document.getElementById('nav-links');
  navLinks.classList.toggle('active');
});

// Sticky Navbar on Scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('sticky');
  } else {
    navbar.classList.remove('sticky');
  }
});

// Smooth Scrolling for Internal Links
document.querySelectorAll('a[href^="/"]').forEach(link => {
  link.addEventListener('click', function (e) {
    if (this.getAttribute('href') !== '#') {
      e.preventDefault();
      const href = this.getAttribute('href');
      window.location.href = href;
    }
  });
});


// Form Validation and Feedback
document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector('.contact-form');
  
  form.addEventListener('submit', function(event) {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!name || !email || !message) {
      alert("Please fill in all the fields.");
      event.preventDefault();
    }
  });

  // Animation for Submit Button
  const submitButton = document.querySelector('.contact-form button');
  
  submitButton.addEventListener('mouseover', function() {
    submitButton.style.transform = "scale(1.1)";
  });

  submitButton.addEventListener('mouseleave', function() {
    submitButton.style.transform = "scale(1)";
  });
});

//footer  link 

  // Optional Modal Close
  document.getElementById('modalClose')?.addEventListener('click', () => {
    document.getElementById('footerModal').classList.add('hidden');
  });


// Uncomment to enable a dark mode switch:
// document.getElementById('darkToggle').addEventListener('click', toggleDarkMode);
function showDetail(title, text) {
  const modal = document.getElementById('featureModal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalText').textContent = text;
  modal.style.display = 'flex';

  // Optional: Scroll lock
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('featureModal');
  modal.style.display = 'none';

  // Re-enable scroll
  document.body.style.overflow = 'auto';
}

// Close modal if clicked outside content
window.addEventListener('click', function (event) {
  const modal = document.getElementById('featureModal');
  if (event.target === modal) {
    closeModal();
  }
});
