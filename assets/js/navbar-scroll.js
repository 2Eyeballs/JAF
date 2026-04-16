// Collapse navbar into mobile style on scroll
(function() {
    const navbar = document.querySelector('.navbar');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('#navcol-4');
    const scrollThreshold = 50;
    
    console.log('Navbar Script Loaded');
    console.log('Navbar element:', navbar);
    console.log('Toggler element:', navbarToggler);
    console.log('Collapse element:', navbarCollapse);
    
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > scrollThreshold) {
            // Scrolling down - collapse to mobile style
            navbar.classList.add('navbar-collapsed');
            console.log('Added navbar-collapsed class');
            
            // Close menu if open
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        } else if (currentScroll === 0) {
            // At top - restore full navbar
            navbar.classList.remove('navbar-collapsed');
            console.log('Removed navbar-collapsed class');
            
            // Close menu if open
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        }
    });
})();