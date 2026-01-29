/**
 * Vaper Website JavaScript
 * Handles hamburger menu, product tabs, and carousel functionality
 */

document.addEventListener('DOMContentLoaded', function () {
    // =========================================
    // Mobile Menu (Hamburger)
    // =========================================
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const body = document.body;

    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // =========================================
    // Header Scroll Effect
    // =========================================
    const header = document.querySelector('.header');

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // =========================================
    // Product Tabs
    // =========================================
    // =========================================
    // Product Tabs & Filtering
    // =========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const productGrid = document.querySelector('.products-grid');
    const allProducts = document.querySelectorAll('.product-card');

    function filterProducts(category) {
        // Collect matching products
        const matchingProducts = [];

        allProducts.forEach(card => {
            // Reset animation
            card.style.animationDelay = '0s';
            card.classList.remove('animate-card');

            // Check category
            const categories = card.getAttribute('data-categories').split(' ');
            if (category === 'all' || categories.includes(category)) {
                card.classList.remove('hidden');
                matchingProducts.push(card);
            } else {
                card.classList.add('hidden');
            }
        });

        // Trigger reflow to restart animation safely
        void productGrid.offsetWidth;

        // Apply animation with stagger
        matchingProducts.forEach((card, index) => {
            card.classList.add('animate-card');
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Update active state
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter products
            const tabCategory = this.getAttribute('data-tab');
            filterProducts(tabCategory);
        });
    });

    // Initial load animation
    filterProducts('arrivals');

    // =========================================
    // Best Sellers Carousel - Enhanced Version
    // =========================================
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sellersTrack = document.getElementById('sellersTrack');
    const sellerCards = document.querySelectorAll('.seller-card');
    const paginationContainer = document.getElementById('carouselPagination');
    const sellersCarousel = document.getElementById('sellersCarousel');

    let currentSlide = 0;
    let visibleCards = 4;
    let totalSlides = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let dragThreshold = 50;

    // Calculate visible cards based on screen width
    function updateVisibleCards() {
        const windowWidth = window.innerWidth;
        if (windowWidth <= 380) {
            visibleCards = 1;
        } else if (windowWidth <= 576) {
            visibleCards = 1;
        } else if (windowWidth <= 768) {
            visibleCards = 2;
        } else if (windowWidth <= 1024) {
            visibleCards = 3;
        } else {
            visibleCards = 4;
        }
        totalSlides = Math.ceil(sellerCards.length / visibleCards);
    }

    // Get card width including gap
    function getCardWidth() {
        if (sellerCards.length === 0) return 0;
        const card = sellerCards[0];
        const gap = 28; // Match CSS gap
        return card.offsetWidth + gap;
    }

    // Generate pagination dots
    function generatePaginationDots() {
        if (!paginationContainer) return;

        updateVisibleCards();
        const maxSlide = Math.max(0, sellerCards.length - visibleCards);
        const dotCount = maxSlide + 1;

        paginationContainer.innerHTML = '';

        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'pagination-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            paginationContainer.appendChild(dot);
        }
    }

    // Go to specific slide
    function goToSlide(slideIndex) {
        updateVisibleCards();
        const maxSlide = Math.max(0, sellerCards.length - visibleCards);
        currentSlide = Math.max(0, Math.min(slideIndex, maxSlide));
        updateCarousel();
    }

    // Update carousel position and UI
    function updateCarousel() {
        if (!sellersTrack) return;

        updateVisibleCards();
        const maxSlide = Math.max(0, sellerCards.length - visibleCards);

        if (currentSlide > maxSlide) {
            currentSlide = maxSlide;
        }
        if (currentSlide < 0) {
            currentSlide = 0;
        }

        const offset = currentSlide * getCardWidth();
        sellersTrack.style.transform = `translateX(-${offset}px)`;
        prevTranslate = -offset;
        currentTranslate = -offset;

        // Update button states
        if (prevBtn) {
            prevBtn.classList.toggle('active', currentSlide > 0);
            prevBtn.disabled = currentSlide === 0;
        }
        if (nextBtn) {
            nextBtn.classList.toggle('active', currentSlide < maxSlide);
            nextBtn.disabled = currentSlide >= maxSlide;
        }

        // Update pagination dots
        updatePaginationDots();
    }

    // Update active pagination dot
    function updatePaginationDots() {
        if (!paginationContainer) return;

        const dots = paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Previous button click
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            if (currentSlide > 0) {
                currentSlide--;
                updateCarousel();
            }
        });
    }

    // Next button click
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            updateVisibleCards();
            const maxSlide = Math.max(0, sellerCards.length - visibleCards);
            if (currentSlide < maxSlide) {
                currentSlide++;
                updateCarousel();
            }
        });
    }

    // Touch/Mouse Drag Support
    function touchStart(e) {
        isDragging = true;
        startX = getPositionX(e);
        sellersTrack.style.transition = 'none';
        animationID = requestAnimationFrame(animation);
    }

    function touchMove(e) {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + currentPosition - startX;
    }

    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);

        const movedBy = currentTranslate - prevTranslate;

        // Determine direction and amount
        if (Math.abs(movedBy) > dragThreshold) {
            if (movedBy < 0) {
                // Swiped left - go next
                updateVisibleCards();
                const maxSlide = Math.max(0, sellerCards.length - visibleCards);
                if (currentSlide < maxSlide) {
                    currentSlide++;
                }
            } else {
                // Swiped right - go prev
                if (currentSlide > 0) {
                    currentSlide--;
                }
            }
        }

        sellersTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        updateCarousel();
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    function animation() {
        if (isDragging) {
            sellersTrack.style.transform = `translateX(${currentTranslate}px)`;
            requestAnimationFrame(animation);
        }
    }

    // Add touch/mouse event listeners
    if (sellersCarousel) {
        // Touch events
        sellersCarousel.addEventListener('touchstart', touchStart, { passive: true });
        sellersCarousel.addEventListener('touchmove', touchMove, { passive: true });
        sellersCarousel.addEventListener('touchend', touchEnd);

        // Mouse events for desktop drag
        sellersCarousel.addEventListener('mousedown', touchStart);
        sellersCarousel.addEventListener('mousemove', touchMove);
        sellersCarousel.addEventListener('mouseup', touchEnd);
        sellersCarousel.addEventListener('mouseleave', () => {
            if (isDragging) {
                touchEnd();
            }
        });

        // Prevent context menu on long press
        sellersCarousel.addEventListener('contextmenu', (e) => {
            if (isDragging) {
                e.preventDefault();
            }
        });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', function (e) {
        // Only respond if carousel is in viewport
        if (!sellersCarousel) return;
        const rect = sellersCarousel.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
            if (e.key === 'ArrowLeft') {
                if (currentSlide > 0) {
                    currentSlide--;
                    updateCarousel();
                }
            } else if (e.key === 'ArrowRight') {
                updateVisibleCards();
                const maxSlide = Math.max(0, sellerCards.length - visibleCards);
                if (currentSlide < maxSlide) {
                    currentSlide++;
                    updateCarousel();
                }
            }
        }
    });

    // Update carousel on window resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            generatePaginationDots();
            updateCarousel();
        }, 150);
    });

    // Initial carousel setup
    generatePaginationDots();
    updateCarousel();

    // =========================================
    // Product Card Hover Effects (Touch Devices)
    // =========================================
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('touchstart', function () {
            // Remove active state from other cards
            productCards.forEach(c => c.classList.remove('touch-active'));
            // Add active state to current card
            this.classList.add('touch-active');
        });
    });

    // Remove active state when touching elsewhere
    document.addEventListener('touchstart', function (e) {
        if (!e.target.closest('.product-card')) {
            productCards.forEach(card => card.classList.remove('touch-active'));
        }
    });

    // =========================================
    // Smooth Scroll for Anchor Links
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // =========================================
    // Add to Cart Button Animation
    // =========================================
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Add visual feedback
            this.textContent = 'Added!';
            this.style.backgroundColor = '#27ae60';

            // Reset after 2 seconds
            setTimeout(() => {
                this.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
                    Add to cart
                `;
                this.style.backgroundColor = '';
            }, 2000);
        });
    });

    // =========================================
    // Lazy Loading Images (Optional Enhancement)
    // =========================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // =========================================
    // Category Cards Scroll Animation
    // =========================================
    const categoryCards = document.querySelectorAll('.category-card');

    if ('IntersectionObserver' in window && categoryCards.length > 0) {
        const categoryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.15
        });

        categoryCards.forEach(card => {
            categoryObserver.observe(card);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        categoryCards.forEach(card => {
            card.classList.add('animate-in');
        });
    }

    // =========================================
    // Best Sellers Section Scroll Animation
    // =========================================
    const bestSellersSection = document.querySelector('.best-sellers');
    const sellerCardsForAnim = document.querySelectorAll('.seller-card');

    if ('IntersectionObserver' in window && bestSellersSection) {
        const sellersObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate seller cards with staggered delay
                    sellerCardsForAnim.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-in');
                        }, index * 100);
                    });
                    sellersObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        });

        sellersObserver.observe(bestSellersSection);
    } else {
        // Fallback for browsers without IntersectionObserver
        sellerCardsForAnim.forEach(card => {
            card.classList.add('animate-in');
        });
    }

    // =========================================
    // Action Buttons Click Handlers
    // =========================================
    const actionButtons = document.querySelectorAll('.action-btn');

    actionButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Add visual feedback
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    // =========================================
    // Customer Reviews Scroll Animation
    // =========================================
    const reviewCards = document.querySelectorAll('.review-card');
    const reviewsSection = document.querySelector('.customer-reviews');

    if ('IntersectionObserver' in window && reviewsSection) {
        const reviewsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    reviewCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 150); // Staggered delay
                    });
                    reviewsObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        });

        reviewsObserver.observe(reviewsSection);
    } else {
        // Fallback
        reviewCards.forEach(card => card.classList.add('visible'));
    }
});

// Age verification modal
const ageModal = document.getElementById("ageModal");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

window.addEventListener("load", () => {
    if (localStorage.getItem("ageConfirmed") != "true") {
        ageModal.style.display = "flex";
    } else {
        ageModal.style.display = "none";
    }
});
yesBtn.addEventListener("click", () => {
    localStorage.setItem("ageConfirmed", "true");
    ageModal.style.display = "none";
});

noBtn.addEventListener("click", () => {
    alert("Dostęp zabroniony. Strona tylko dla osób 18+");
    window.close();
    window.location.href = "https://www.google.pl";
});

/* ============================================
   FOOTER
   ============================================ */

const city = document.getElementById("city");
const cont = document.querySelectorAll(".foot-cont-three a");

city.addEventListener("toggle", toggleCont);

city.addEventListener("click", () => {
    city.dispatchEvent(new Event("toggle"));
});

function toggleCont() {
    city.classList.toggle("active");
    cont.forEach((el) => {
        el.style.display = el.style.display === "block" ? "none" : "block";
    });
}

const yearSpan = document.querySelector('#year');
if (yearSpan) {
    yearSpan.innerText = new Date().getFullYear();
}
