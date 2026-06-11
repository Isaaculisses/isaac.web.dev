document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // Intersection Observer for Scroll Reveals
    // ==========================================================================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Unobserve after revealing to prevent repeating animation
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // offset to trigger slightly before coming fully into viewport
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    // ==========================================================================
    // Mobile Navigation Menu Toggle
    // ==========================================================================
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('site-nav');
    const navItems = document.querySelectorAll('.nav-link');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when links are clicked
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }


    // ==========================================================================
    // Header Shrink / Styling on Scroll
    // ==========================================================================
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
            header.style.boxShadow = '0 10px 30px rgba(28, 26, 23, 0.02)';
        } else {
            header.style.padding = '1.5rem 0';
            header.style.boxShadow = 'none';
        }
    });


    // ==========================================================================
    // Contact Form Submission (Mock)
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Set state to loading
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span>';
            formFeedback.textContent = '';
            formFeedback.className = 'form-feedback';

            // Simulate server request
            setTimeout(() => {
                // Success path
                formFeedback.textContent = 'Thank you. Your message has been received.';
                formFeedback.classList.add('success');
                contactForm.reset();
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // Clear message after 5 seconds
                setTimeout(() => {
                    formFeedback.style.opacity = 0;
                    setTimeout(() => {
                        formFeedback.textContent = '';
                        formFeedback.style.opacity = 1;
                        formFeedback.className = 'form-feedback';
                    }, 300);
                }, 5000);

            }, 1500);
        });
    }

});
