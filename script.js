// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// --- NEW: Custom Cursor Logic ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Animate outline for smooth trailing effect
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 250, fill: "forwards" });
    });

    // Expand cursor on interactive elements
    const hoverElements = document.querySelectorAll('a, button, .hover-trigger');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-hover'));
    });
}

// --- NEW: Scroll Reveal Animation Logic ---
const revealElements = document.querySelectorAll('.gs-reveal');

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px" // Triggers slightly before element enters view
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
            observer.unobserve(entry.target); // Reveal only once
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if(mobileMenuBtn && closeMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
        document.body.style.overflow = 'hidden'; 
    });

    const closeMenu = () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        document.body.style.overflow = 'auto';
    };

    closeMenuBtn.addEventListener('click', closeMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
}

// Active State for Sidebar Navigation
const mainContent = document.getElementById('main-content');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
const sidebarProfile = document.getElementById('sidebar-profile');
const distanceFill = document.getElementById('distanceFill');
const distanceRuler = document.getElementById('distanceRuler');
const distanceMarker = document.getElementById('distanceMarker');
const distanceValue = document.getElementById('distanceValue');

const updateDistanceRuler = () => {
    if (!mainContent || !distanceFill || !distanceRuler || !distanceMarker || !distanceValue) return;

    const maxScroll = mainContent.scrollHeight - mainContent.clientHeight;
    const progress = maxScroll > 0 ? mainContent.scrollTop / maxScroll : 0;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const meters = (clampedProgress * 10).toFixed(1);

    distanceFill.style.width = `${clampedProgress * 100}%`;
    distanceMarker.style.left = `${clampedProgress * 100}%`;
    distanceValue.textContent = `${meters}m`;
    distanceRuler.style.opacity = clampedProgress > 0.98 ? '1' : '0.95';
};

if(mainContent && sections && navLinks) {
    let rulerRaf = null;

    const onMainScroll = () => {
        if (rulerRaf) {
            cancelAnimationFrame(rulerRaf);
        }

        rulerRaf = requestAnimationFrame(() => {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // Offset calculation to detect active section comfortably
                if (mainContent.scrollTop >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('text-accent');
                link.classList.add('text-studio-400');
                if (current && link.getAttribute('href').includes(current)) {
                    link.classList.remove('text-studio-400');
                    link.classList.add('text-accent');
                }
            });

            // Show/hide profile picture in sidebar based on scroll position
            if (sidebarProfile) {
                // Once we scroll past ~400px (past the home section photo), fade in the small profile
                if (mainContent.scrollTop > 400) {
                    sidebarProfile.classList.remove('opacity-0', 'translate-x-[-20px]', 'pointer-events-none');
                    sidebarProfile.classList.add('opacity-100', 'translate-x-0');
                } else {
                    sidebarProfile.classList.add('opacity-0', 'translate-x-[-20px]', 'pointer-events-none');
                    sidebarProfile.classList.remove('opacity-100', 'translate-x-0');
                }
            }

            updateDistanceRuler();
        });
    };

    mainContent.addEventListener('scroll', onMainScroll, { passive: true });

    window.addEventListener('resize', updateDistanceRuler);

    updateDistanceRuler();
}
