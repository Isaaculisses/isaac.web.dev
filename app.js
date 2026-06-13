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
    // Contact Form Submission (Mock with Rate Limiting)
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    const RATE_LIMIT_COUNT = 5;

    function getSubmissionsCount() {
        try {
            const countStr = sessionStorage.getItem('contact_submission_count');
            return countStr ? parseInt(countStr, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    function recordSubmission() {
        try {
            const count = getSubmissionsCount();
            sessionStorage.setItem('contact_submission_count', count + 1);
        } catch (e) {
            // Fallback if sessionStorage is unavailable
        }
    }

    function checkRateLimit() {
        return getSubmissionsCount() >= RATE_LIMIT_COUNT;
    }

    function updateFormForRateLimit() {
        if (checkRateLimit() && submitBtn && formFeedback) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Limit Reached</span>';
            formFeedback.textContent = 'You have reached the limit of 5 messages per session. Please try again in a new session.';
            formFeedback.className = 'form-feedback error';
            formFeedback.style.opacity = 1;
            return true;
        }
        return false;
    }

    if (contactForm && submitBtn && formFeedback) {
        // Initial check on page load
        updateFormForRateLimit();

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Double check rate limit before processing submission
            if (updateFormForRateLimit()) {
                return;
            }

            // Get input elements
            const nameInput = document.getElementById('form-name');
            const emailInput = document.getElementById('form-email');
            const messageInput = document.getElementById('form-message');

            if (!nameInput || !emailInput || !messageInput) {
                return;
            }

            const rawName = nameInput.value;
            const rawEmail = emailInput.value;
            const rawMessage = messageInput.value;

            // 1. Strict Type-Checking & Length Validation
            if (typeof rawName !== 'string' || typeof rawEmail !== 'string' || typeof rawMessage !== 'string') {
                formFeedback.textContent = 'Invalid input types detected.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.opacity = 1;
                return;
            }

            const name = rawName.trim();
            const email = rawEmail.trim();
            const message = rawMessage.trim();

            if (name.length === 0 || email.length === 0 || message.length === 0) {
                formFeedback.textContent = 'All fields are required.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.opacity = 1;
                return;
            }

            if (name.length > 100) {
                formFeedback.textContent = 'Name must be 100 characters or less.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.opacity = 1;
                return;
            }

            if (email.length > 100) {
                formFeedback.textContent = 'Email must be 100 characters or less.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.opacity = 1;
                return;
            }

            if (message.length > 2000) {
                formFeedback.textContent = 'Message must be 2000 characters or less.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.opacity = 1;
                return;
            }

            // Strict Email Format Checking
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                formFeedback.textContent = 'Please enter a valid email address.';
                formFeedback.className = 'form-feedback error';
                formFeedback.style.opacity = 1;
                return;
            }

            // 2. HTML Sanitization helper for XSS Prevention
            function sanitizeHTML(str) {
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
            }

            const sanitizedName = sanitizeHTML(name);
            const sanitizedEmail = sanitizeHTML(email);
            const sanitizedMessage = sanitizeHTML(message);

            // 3. Client-Side SQL Injection Sanitization helper
            // (Note: Prepared statements / parameterized queries must be used on database query engines)
            function sanitizeSQL(str) {
                return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
                    switch (char) {
                        case "\0": return "\\0";
                        case "\x08": return "\\b";
                        case "\x09": return "\\t";
                        case "\x1a": return "\\z";
                        case "\n": return "\\n";
                        case "\r": return "\\r";
                        case "\"":
                        case "'":
                        case "\\":
                        case "%":
                            return "\\" + char;
                        default:
                            return char;
                    }
                });
            }

            const dbSafeName = sanitizeSQL(sanitizedName);
            const dbSafeEmail = sanitizeSQL(sanitizedEmail);
            const dbSafeMessage = sanitizeSQL(sanitizedMessage);

            // Set state to loading
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span>';
            formFeedback.textContent = '';
            formFeedback.className = 'form-feedback';

            // Simulate server request / API call using fully sanitized and type-checked inputs
            setTimeout(() => {
                // Record the submission
                recordSubmission();

                // Success path
                formFeedback.textContent = 'Thank you. Your message has been received.';
                formFeedback.className = 'form-feedback success';
                contactForm.reset();
                
                // Re-enable submit button or apply rate limit if limit reached
                if (checkRateLimit()) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>Limit Reached</span>';
                    
                    // Clear the success message and show rate limit message after a short delay
                    setTimeout(() => {
                        formFeedback.style.opacity = 0;
                        setTimeout(() => {
                            formFeedback.textContent = 'You have reached the limit of 5 messages per session. Please try again in a new session.';
                            formFeedback.className = 'form-feedback error';
                            formFeedback.style.opacity = 1;
                        }, 300);
                    }, 5000);
                } else {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;

                    // Clear success message after 5 seconds
                    setTimeout(() => {
                        formFeedback.style.opacity = 0;
                        setTimeout(() => {
                            formFeedback.textContent = '';
                            formFeedback.style.opacity = 1;
                            formFeedback.className = 'form-feedback';
                        }, 300);
                    }, 5000);
                }

            }, 1500);
        });
    }

    // ==========================================================================
    // About Section Image Slider
    // ==========================================================================
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        const slides = sliderContainer.querySelectorAll('.about-image');
        const dots = sliderContainer.querySelectorAll('.slider-dot');
        const prevBtn = sliderContainer.querySelector('.prev-btn');
        const nextBtn = sliderContainer.querySelector('.next-btn');
        let currentIndex = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            currentIndex = index;
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let nextIndex = currentIndex - 1;
                if (nextIndex < 0) {
                    nextIndex = slides.length - 1;
                }
                showSlide(nextIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let nextIndex = currentIndex + 1;
                if (nextIndex >= slides.length) {
                    nextIndex = 0;
                }
                showSlide(nextIndex);
            });
        }

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                showSlide(i);
            });
        });
    }

    // ==========================================================================
    // Client-Side Session & Logout Handler (Mock Implementation)
    // ==========================================================================
    async function logoutUser() {
        console.log('Initiating secure logout...');

        // 1. Fire API request to server to destroy the session on the backend.
        // In a live system, this endpoint responds with a Set-Cookie header
        // that clears the HTTP-Only cookie (e.g. auth_token=; Max-Age=0; HttpOnly; Secure; SameSite=Strict)
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            // Log warning but continue local cleanup (fail-safe client-side cleanup)
            console.warn('Backend logout endpoint unreachable or not implemented:', error.message);
        }

        // 2. Client-side storage cleanup (destroy fallbacks)
        try {
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
            localStorage.clear();
            sessionStorage.clear();
        } catch (storageError) {
            console.error('Failed to clear storage:', storageError);
        }

        // 3. Clear non-HTTP-only client-side cookies as a fail-safe
        try {
            document.cookie.split(";").forEach((cookie) => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";
            });
        } catch (cookieError) {
            console.error('Failed to clear client-side cookies:', cookieError);
        }

        console.log('Session destroyed on client. Redirecting to home...');
        // Refresh page or redirect to index
        window.location.href = '/';
    }

    // Expose logoutUser globally so it can be invoked by any click action
    window.secureLogout = logoutUser;

});
