// Load and inject navigation bar
document.addEventListener('DOMContentLoaded', function() {
  fetch('./assets/components/navbar.html')
    .then(response => response.text())
    .then(html => {
      const navContainer = document.createElement('div');
      navContainer.innerHTML = html;
      document.body.insertBefore(navContainer.firstElementChild, document.body.firstChild);

      // Initialize scroll behavior AFTER navbar is in the DOM
      const navbar = document.querySelector('.navbar');
      const navbarToggler = document.querySelector('.navbar-toggler');
      const navbarCollapse = document.querySelector('#navcol-4');
      const scrollThreshold = 50;

      if (navbar) {
        window.addEventListener('scroll', function() {
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
          if (currentScroll > scrollThreshold) {
            navbar.classList.add('navbar-collapsed');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
              navbarToggler.click();
            }
          } else if (currentScroll === 0) {
            navbar.classList.remove('navbar-collapsed');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
              navbarToggler.click();
            }
          }
        });
      }
    })
    .catch(error => console.error('Error loading navbar:', error));
});
