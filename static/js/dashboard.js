// Hide loading spinner after page load
window.addEventListener('load', function() {
    document.getElementById('spinner').style.display = 'none';
  });
  
  // Filter tools based on user input
  document.getElementById('tool-filter').addEventListener('input', function(e) {
    let filter = e.target.value.toLowerCase();
    let tools = document.querySelectorAll('.tool-box');
    
    tools.forEach(tool => {
      let toolText = tool.textContent.toLowerCase();
      if (toolText.includes(filter)) {
        tool.style.display = 'block';
      } else {
        tool.style.display = 'none';
      }
    });
  });
  
  // Hamburger button toggle
  document.getElementById('hamburger').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
  });
  