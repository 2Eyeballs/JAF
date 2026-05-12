// Load and inject navigation bar
document.addEventListener('DOMContentLoaded', function() {
  fetch('./assets/components/navbar.html')
    .then(response => response.text())
    .then(html => {
      const navContainer = document.createElement('div');
      navContainer.innerHTML = html;
      document.body.insertBefore(navContainer.firstElementChild, document.body.firstChild);
      
      // Re-initialize Bootstrap components if needed
      if (typeof bootstrap !== 'undefined') {
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
          navbarToggler.addEventListener('click', function() {
            // Bootstrap handles this automatically
          });
        }
      }
    })
    .catch(error => console.error('Error loading navbar:', error));
});
