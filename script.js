/**
 * Marjo Paguia Portfolio - Master Application Script
 * Full-stack architectural portfolio engine including 3D WebGL viewport,
 * responsive gallery filtering, interactive modal HUDs, theme toggles,
 * and mobile-optimized render presentation.
 */

document.addEventListener('DOMContentLoaded', () => {
    initArchitecturalCursor();
    initPreloader();
    initTheme();
    initMobileMenu();
    initDistanceRuler();
    initScrollReveal();
    initMilestoneCounters();
    initProjectSection();
    init3DRendersSection();
    initModelViewer();
    initArtGallerySection();
    initServiceModal();
    initInquiryModal();
    initCVModal();
    initLightbox();
    initTestimonialsTrack();
    initDynamicYear();
});

// ==========================================================================
// 00. ARCHITECTURAL PRECISION CUSTOM CURSOR
// ==========================================================================
function initArchitecturalCursor() {
    // Only initialize on desktop devices supporting fine hover pointer
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    let dot = document.getElementById('cursor-dot');
    let outline = document.getElementById('cursor-outline');

    if (!dot) {
        dot = document.createElement('div');
        dot.id = 'cursor-dot';
        dot.className = 'cursor-dot hidden md:block';
        dot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dot);
    }
    if (!outline) {
        outline = document.createElement('div');
        outline.id = 'cursor-outline';
        outline.className = 'cursor-outline hidden md:block';
        outline.setAttribute('aria-hidden', 'true');
        document.body.appendChild(outline);
    }

    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;
    let isVisible = false;

    function renderLoop() {
        if (isVisible) {
            // Precision reticle dot tracks mouse with zero input lag
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

            // Drafting inertia interpolation for outer frame (smooth 60fps lerp)
            const ease = 0.22;
            outlineX += (mouseX - outlineX) * ease;
            outlineY += (mouseY - outlineY) * ease;
            outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(renderLoop);
    }

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isVisible) {
            isVisible = true;
            outlineX = mouseX;
            outlineY = mouseY;
            dot.style.opacity = '1';
            outline.style.opacity = '1';
            document.body.classList.add('has-custom-cursor');
        }
    }

    function onMouseEnter() {
        isVisible = true;
        dot.style.opacity = '1';
        outline.style.opacity = '1';
        document.body.classList.add('has-custom-cursor');
    }

    function onMouseLeave() {
        isVisible = false;
        dot.style.opacity = '0';
        outline.style.opacity = '0';
        document.body.classList.remove('has-custom-cursor');
    }

    function onMouseDown() {
        outline.classList.add('cursor-active');
    }

    function onMouseUp() {
        outline.classList.remove('cursor-active');
    }

    // Attach event listeners
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    // Interactive Hover Elements Detection (Delegated for dynamically loaded cards / buttons)
    const hoverSelector = 'a, button, [role="button"], .hover-trigger, .gallery-card, .service-card, .project-card, .model-select-btn, .viz-card, input[type="submit"], input[type="button"], label, .theme-toggle-btn';

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(hoverSelector);
        if (target) {
            outline.classList.add('cursor-hover');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest(hoverSelector);
        if (target) {
            outline.classList.remove('cursor-hover');
        }
    }, { passive: true });

    // Start 60fps render loop
    requestAnimationFrame(renderLoop);
}

// ==========================================================================
// 01. PRELOADER & INITIALIZATION
// ==========================================================================
function initPreloader() {
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderPercent = document.getElementById('loader-percent');

    if (!loader) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress > 100) progress = 100;

        if (loaderBar) loaderBar.style.width = `${progress}%`;
        if (loaderPercent) loaderPercent.textContent = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 400);
            }, 200);
        }
    }, 40);
}

// ==========================================================================
// 02. THEME ENGINE (DARK BLUEPRINT / LIGHT DRAFTING)
// ==========================================================================
const THEME_STORAGE_KEY = 'marjo_portfolio_theme';

function initTheme() {
    const mobileThemeBtn = document.getElementById('mobile-theme-btn');
    const menuThemeBtn = document.getElementById('menu-theme-btn');
    const desktopThemeBtn = document.getElementById('desktop-theme-btn');
    const themeSidebarText = desktopThemeBtn ? desktopThemeBtn.querySelector('span:not(.text-accent)') : null;
    const themeSidebarBadge = desktopThemeBtn ? desktopThemeBtn.querySelector('.text-accent') : null;
    const viewportCard = document.getElementById('model-viewport-card');

    const getStoredTheme = () => {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY);
        } catch (e) {
            return null;
        }
    };

    const applyTheme = (theme, persist = true) => {
        const isLight = theme === 'light';
        if (isLight) {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            document.body.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            document.body.classList.remove('light-mode');
        }

        if (viewportCard) {
            viewportCard.classList.toggle('light', isLight);
            viewportCard.classList.toggle('dark', !isLight);
        }

        if (persist) {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
            } catch (e) {}
        }

        if (themeSidebarText) {
            themeSidebarText.textContent = isLight ? 'Light Mode' : 'Dark Mode';
        }
        if (themeSidebarBadge) {
            themeSidebarBadge.textContent = isLight ? 'LIGHT' : 'DARK';
        }
    };

    const toggleTheme = () => {
        const currentIsLight = document.documentElement.classList.contains('light') || document.body.classList.contains('light-mode');
        applyTheme(currentIsLight ? 'dark' : 'light');
    };

    const savedTheme = getStoredTheme() || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(savedTheme, false);

    if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);
    if (menuThemeBtn) menuThemeBtn.addEventListener('click', toggleTheme);
    if (desktopThemeBtn) desktopThemeBtn.addEventListener('click', toggleTheme);
}

// ==========================================================================
// 03. MOBILE NAVIGATION DRAWER
// ==========================================================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!mobileMenu || !mobileMenuBtn) return;

    const openMenu = () => {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
    };

    mobileMenuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);

    const navLinks = mobileMenu.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });
}

// ==========================================================================
// 04. COMPUTATIONAL DISTANCE RULER & SCROLL METRICS
// ==========================================================================
function initDistanceRuler() {
    const distanceFill = document.getElementById('distanceFill');
    const distanceMarker = document.getElementById('distanceMarker');
    const distanceValue = document.getElementById('distanceValue');
    const ruler = document.getElementById('distanceRuler');
    const track = ruler ? ruler.querySelector('.scroll-meter-track') : null;
    const mainContent = document.getElementById('main-content');

    if (!distanceFill || !distanceValue) return;

    const getScrollMetrics = () => {
        if (mainContent && mainContent.scrollHeight > mainContent.clientHeight) {
            return {
                scrollPos: mainContent.scrollTop,
                maxScroll: mainContent.scrollHeight - mainContent.clientHeight,
                container: mainContent
            };
        }
        const docElem = document.documentElement;
        return {
            scrollPos: window.scrollY || window.pageYOffset || docElem.scrollTop || 0,
            maxScroll: docElem.scrollHeight - window.innerHeight,
            container: window
        };
    };

    const updateRuler = () => {
        const { scrollPos, maxScroll } = getScrollMetrics();

        if (maxScroll <= 0) {
            distanceFill.style.width = '0%';
            if (distanceMarker) distanceMarker.style.left = '0%';
            distanceValue.textContent = '0m';
            return;
        }

        const scrollPct = Math.min(100, Math.max(0, (scrollPos / maxScroll) * 100));

        distanceFill.style.width = `${scrollPct}%`;
        if (distanceMarker) distanceMarker.style.left = `${scrollPct}%`;

        // Scale distance value to an architectural grid axis length (e.g. 0m to 128m)
        const meters = Math.round((scrollPct / 100) * 128.5);
        distanceValue.textContent = `${meters}m`;
    };

    // Listen on both mainContent (the actual scroll container) and window
    if (mainContent) {
        mainContent.addEventListener('scroll', updateRuler, { passive: true });
    }
    window.addEventListener('scroll', updateRuler, { passive: true });
    window.addEventListener('resize', updateRuler, { passive: true });

    // Interactive scrub/click on ruler track to jump directly to scroll position
    if (track) {
        track.addEventListener('click', (e) => {
            const rect = track.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, clickX / rect.width));
            const { maxScroll, container } = getScrollMetrics();
            const targetPos = pct * maxScroll;

            if (container === mainContent) {
                mainContent.scrollTo({ top: targetPos, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    }

    // Initial update and delayed updates after layout settles
    updateRuler();
    setTimeout(updateRuler, 300);
    setTimeout(updateRuler, 1000);
}

// ==========================================================================
// ==========================================================================
// 05. SCROLL REVEAL (BIDIRECTIONAL UP & DOWN REPEATABLE OBSERVER)
// ==========================================================================
function initScrollReveal() {
    const mainContent = document.getElementById('main-content');
    
    // Automatically equip all visualization cards with .gs-reveal and column stagger
    const vizItems = document.querySelectorAll('.viz-item');
    vizItems.forEach((item, idx) => {
        if (!item.classList.contains('gs-reveal')) {
            item.classList.add('gs-reveal');
            const colDelay = (idx % 3) * 80;
            if (colDelay > 0) {
                item.style.transitionDelay = `${colDelay}ms`;
            }
        }
    });

    const revealElements = Array.from(document.querySelectorAll('.gs-reveal')).filter(el => {
        // Keep fixed sidebar permanently visible
        return el.id !== 'desktop-sidebar' && !el.closest('#desktop-sidebar');
    });

    if (!revealElements.length) return;

    // Track scroll direction (UP vs DOWN)
    let lastScrollY = mainContent ? mainContent.scrollTop : window.scrollY;
    let scrollDirection = 'down';

    const getViewportHeight = () => window.innerHeight || document.documentElement.clientHeight;

    // Core element evaluator: checks whether element is on screen or off-screen,
    // and correctly sets its entrance direction (reveal-from-top vs standard reveal from bottom)
    const evaluateElement = (el) => {
        const rect = el.getBoundingClientRect();
        const vHeight = getViewportHeight();

        // Active visible zone: at least 40px enters the visible viewport
        const isInViewport = rect.top < (vHeight - 40) && rect.bottom > 40;

        if (isInViewport) {
            if (!el.classList.contains('is-active')) {
                // If scrolling UP (or entering from upper half), reveal from top.
                // If scrolling DOWN (or entering from lower half), reveal from bottom.
                const isFromTop = scrollDirection === 'up' || ((rect.top + rect.height / 2) < (vHeight / 2));
                if (isFromTop) {
                    el.classList.add('reveal-from-top');
                } else {
                    el.classList.remove('reveal-from-top');
                }

                el.classList.add('is-active');
                el.classList.add('just-revealed');
                setTimeout(() => el.classList.remove('just-revealed'), 500);
            }
        } else {
            // Element is outside the visible viewport: RESET so it re-animates smoothly every time!
            // Hysteresis buffer prevents flickering right at edge boundaries
            if (rect.bottom < -30) {
                // Exited completely off the TOP of the viewport
                if (el.classList.contains('is-active')) {
                    el.classList.remove('is-active');
                }
                // Prime it to slide down from top when user scrolls back UP
                el.classList.add('reveal-from-top');
            } else if (rect.top > vHeight + 30) {
                // Exited completely off the BOTTOM of the viewport
                if (el.classList.contains('is-active')) {
                    el.classList.remove('is-active');
                }
                // Prime it to slide up from bottom when user scrolls DOWN
                el.classList.remove('reveal-from-top');
            }
        }
    };

    // Initial check: only elements in the upper part of the starting viewport activate immediately.
    // Lower sections (projects, services, etc.) stay primed for their entrance scroll animation!
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const vHeight = getViewportHeight();
        if (rect.top < vHeight * 0.7 && rect.bottom > 20) {
            el.classList.add('is-active');
        } else if (rect.bottom <= 0) {
            el.classList.add('reveal-from-top');
        }
    });

    // 1. Native IntersectionObserver for immediate response on boundary crossing
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                evaluateElement(entry.target);
            });
        }, {
            root: null,
            threshold: [0, 0.1, 0.25],
            rootMargin: '10px 0px 10px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    // 2. High-performance scroll listener with requestAnimationFrame
    // Guarantees continuous evaluations on rapid or slow scroll in either direction
    let isScrollTicking = false;
    const handleScroll = () => {
        const currentScrollY = mainContent ? mainContent.scrollTop : window.scrollY;
        const delta = currentScrollY - lastScrollY;

        if (Math.abs(delta) >= 2) {
            scrollDirection = delta > 0 ? 'down' : 'up';
            lastScrollY = Math.max(0, currentScrollY);
        }

        revealElements.forEach(evaluateElement);
        isScrollTicking = false;
    };

    const onScroll = () => {
        if (!isScrollTicking) {
            requestAnimationFrame(handleScroll);
            isScrollTicking = true;
        }
    };

    if (mainContent) {
        mainContent.addEventListener('scroll', onScroll, { passive: true });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
}


// ==========================================================================
// 06. ARCHITECTURAL PROJECTS SECTION & MODAL
// ==========================================================================
function initProjectSection() {
    const filterBtns = document.querySelectorAll('.project-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const emptyState = document.getElementById('project-empty-state');
    const mobileFilterBtn = document.getElementById('project-mobile-filter-btn');
    const mobileFilterDropdown = document.getElementById('project-mobile-filter-dropdown');
    const mobileFilterLabel = document.getElementById('project-mobile-filter-label');
    const mobileFilterCaret = document.getElementById('project-mobile-filter-caret');
    const mobileCount = document.getElementById('project-mobile-count');

    // Filter Logic
    if (filterBtns.length && projectCards.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-typology') || btn.getAttribute('data-filter') || 'all';

                // Synchronize active state across both desktop and mobile buttons
                filterBtns.forEach(b => {
                    const bFilter = b.getAttribute('data-typology') || b.getAttribute('data-filter') || 'all';
                    if (bFilter === filter) {
                        b.classList.add('active');
                        // In mobile dropdown, set active visual styling
                        if (b.closest('#project-mobile-filter-dropdown')) {
                            b.classList.add('bg-studio-900', 'border-studio-700/60', 'text-studio-100');
                            b.classList.remove('bg-transparent', 'border-transparent', 'text-studio-400');
                        }
                    } else {
                        b.classList.remove('active');
                        if (b.closest('#project-mobile-filter-dropdown')) {
                            b.classList.remove('bg-studio-900', 'border-studio-700/60', 'text-studio-100');
                            b.classList.add('bg-transparent', 'border-transparent', 'text-studio-400');
                        }
                    }
                });

                // Update mobile label text
                if (mobileFilterLabel) {
                    const labelText = btn.querySelector('span:first-child')?.textContent?.trim() || `[${filter.toUpperCase()}]`;
                    mobileFilterLabel.textContent = labelText;
                }

                // Close mobile dropdown after selection
                if (mobileFilterDropdown) {
                    mobileFilterDropdown.classList.add('hidden');
                    if (mobileFilterCaret) {
                        mobileFilterCaret.classList.remove('rotate-180');
                    }
                }

                let visibleCount = 0;
                projectCards.forEach(card => {
                    const category = card.getAttribute('data-typology') || card.getAttribute('data-category') || '';
                    const match = filter === 'all' || category.toLowerCase() === filter.toLowerCase() || category.toLowerCase().includes(filter.toLowerCase());

                    if (match) {
                        card.style.display = '';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                if (mobileCount) {
                    mobileCount.textContent = visibleCount;
                }

                if (emptyState) {
                    emptyState.classList.toggle('hidden', visibleCount > 0);
                }
            });
        });
    }

    // Mobile Filter Icon Toggle
    if (mobileFilterBtn && mobileFilterDropdown) {
        mobileFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = mobileFilterDropdown.classList.contains('hidden');
            if (isHidden) {
                mobileFilterDropdown.classList.remove('hidden');
                if (mobileFilterCaret) mobileFilterCaret.classList.add('rotate-180');
            } else {
                mobileFilterDropdown.classList.add('hidden');
                if (mobileFilterCaret) mobileFilterCaret.classList.remove('rotate-180');
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!mobileFilterDropdown.contains(e.target) && !mobileFilterBtn.contains(e.target)) {
                mobileFilterDropdown.classList.add('hidden');
                if (mobileFilterCaret) mobileFilterCaret.classList.remove('rotate-180');
            }
        });
    }

    // Row Navigation Controls for Single-Row Showcase
    const track = document.getElementById('project-grid');
    const rowPrevBtn = document.getElementById('project-row-prev');
    const rowNextBtn = document.getElementById('project-row-next');

    if (track && rowPrevBtn && rowNextBtn) {
        const getScrollStep = () => {
            const firstCard = track.querySelector('.project-card:not([style*="display: none"])');
            return firstCard ? firstCard.offsetWidth + 24 : 380;
        };

        rowPrevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        });

        rowNextBtn.addEventListener('click', () => {
            track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });
    }

    // Mobile and Touch support: Scroll & tap activates full-color vibrancy
    if ('IntersectionObserver' in window) {
        const mobileCardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (window.innerWidth < 768) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                    } else {
                        entry.target.classList.remove('in-view');
                    }
                }
            });
        }, {
            threshold: 0.35
        });

        projectCards.forEach(card => mobileCardObserver.observe(card));
    }

    projectCards.forEach(card => {
        card.addEventListener('touchstart', () => {
            if (window.matchMedia('(hover: none)').matches) {
                projectCards.forEach(c => {
                    if (c !== card) c.classList.remove('touch-active');
                });
                card.classList.toggle('touch-active');
            }
        }, { passive: true });
    });

    // Project Detail Modal
    initProjectModal();
}

const PORTFOLIO_PROJECTS_DATA = {
    airport: {
        id: 'airport',
        title: 'Layag Airport',
        category: 'ARCHITECTURE',
        year: '2024',
        location: 'Sangley Point, Cavite City',
        area: '147 Hectares',
        typology: 'Civic & Aviation Architecture • Terminal Design',
        tools: 'AutoCAD • SketchUp Pro • Enscape • Lumion • Photoshop',
        desc: 'A 147-hectare domestic airport proposal balancing rapid passenger movement, structural sail canopies inspired by coastal maritime heritage, natural passive ventilation, and expansive visual clarity across terminals.',
        features: [
            'Parametric Sail Canopies',
            'Curved Steel Space Frames',
            'Biophilic Departure Concourse',
            'Multi-Modal Transit Interchange',
            'BIM Architectural Drafting'
        ],
        photos: [
            {
                src: 'portfolio/airport/1.webp',
                title: 'Site Master Plan & Terminal Spatial Organization',
                spec: 'PLATE 01 // SITE & LEVEL PLAN'
            },
            {
                src: 'portfolio/airport/2.webp',
                title: 'Architectural Section & Canopy Engineering',
                spec: 'PLATE 02 // STRUCTURAL SECTION'
            },
            {
                src: 'portfolio/airport/3.webp',
                title: 'Concourse & Boarding Gate Spatial Layout',
                spec: 'PLATE 03 // INTERIOR CONCOURSE'
            },
            {
                src: 'portfolio/airport/4.webp',
                title: 'Terminal Facade & Aerodynamic Canopy Structure',
                spec: 'PLATE 04 // EXTERIOR PERSPECTIVE'
            }
        ]
    },
    amping: {
        id: 'amping',
        title: "Amping Children's Hospital",
        category: 'HEALTHCARE',
        year: '2023',
        location: 'Panglao Island, Bohol',
        area: '5 Hectares',
        typology: 'Healthcare Architecture • Pediatric Hospital',
        tools: 'Revit BIM • SketchUp • Lumion Pro • Photoshop',
        desc: 'A 5-hectare pediatric healthcare facility centered on biophilic circulation, child-friendly healing courtyards, natural daylight penetration, and emergency triage zoning.',
        features: [
            'Biophilic Central Healing Atrium',
            'Pediatric Inpatient Unit Zoning',
            'Therapeutic Rooftop Play Garden',
            'Natural Daylight Louver Optimization',
            'Positive Distraction Wayfinding'
        ],
        photos: [
            {
                src: 'portfolio/amping/1.webp',
                title: 'Master Site Development & Healthcare Flow',
                spec: 'PLATE 01 // MASTER SITE PLAN'
            },
            {
                src: 'portfolio/amping/2.webp',
                title: 'Pediatric Inpatient Ward & Circulation Plan',
                spec: 'PLATE 02 // LEVEL FLOOR PLAN'
            },
            {
                src: 'portfolio/amping/3.webp',
                title: 'Central Daylight Healing Atrium & Biophilic Section',
                spec: 'PLATE 03 // SECTIONAL PERSPECTIVE'
            },
            {
                src: 'portfolio/amping/4.webp',
                title: 'Pediatric Clinic & Diagnostic Department Zoning',
                spec: 'PLATE 04 // CLINICAL ZONING'
            },
            {
                src: 'portfolio/amping/5.webp',
                title: 'South Elevation & Sunshading Analysis',
                spec: 'PLATE 05 // EXTERIOR FACADE'
            },
            {
                src: 'portfolio/amping/6.webp',
                title: 'Pediatric Therapy & Patient Care Units',
                spec: 'PLATE 06 // SPECIALIZED CARE WARD'
            },
            {
                src: 'portfolio/amping/7.webp',
                title: 'Emergency & Diagnostic Wing Technical Layout',
                spec: 'PLATE 07 // TECHNICAL ZONING'
            }
        ]
    },
    marahuyo: {
        id: 'marahuyo',
        title: 'Marahuyo Park',
        category: 'PLANNING',
        year: '2024',
        location: 'Calamba Baywalk, Calamba City',
        area: '1.5 Hectares',
        typology: 'Landscape Architecture & Urban Planning',
        tools: 'AutoCAD • SketchUp • Lumion • Photoshop',
        desc: 'An ecological waterfront community park and cultural amphitheater integrating natural topography, native flora terraces, sustainable stormwater bioswales, and panoramic viewing decks overlooking scenic baywalk terrain.',
        features: [
            'Contour-Adaptive Open-Air Amphitheater',
            'Native Flora Terraces & Swales',
            'Elevated Canopy Boardwalk',
            'Permeable Trail Circulation Network'
        ],
        photos: [
            {
                src: 'portfolio/marahuyo/1.webp',
                title: 'Zoning & Pedestrian Boardwalk Network',
                spec: 'PLATE 01 // SITE DEVELOPMENT PLAN'
            }
        ]
    },
    marikina: {
        id: 'marikina',
        title: 'Marikina Riverside Park',
        category: 'PLANNING',
        year: '2024',
        location: 'Marikina Riverbanks, Marikina City',
        area: '2.5 Hectares',
        typology: 'Urban Planning & Flood Resilient Design',
        tools: 'AutoCAD Civil • SketchUp • Lumion • Photoshop',
        desc: 'A climate-adaptive urban linear park revitalization along the Marikina River, featuring tiered floodable retention terraces, active community promenades, multi-modal cycling infrastructure, and native riparian buffers.',
        features: [
            'Tiered Flood-Resilient Embankments',
            'Active Promenade & Bike Trail Network',
            'Riparian Wetland Bio-Filtration',
            'Community Waterfront Plaza'
        ],
        photos: [
            {
                src: 'portfolio/marikina/1.webp',
                title: 'Flood-Resilient Embankment & Terraces',
                spec: 'PLATE 01 // EMBANKMENT SECTION'
            },
            {
                src: 'portfolio/marikina/2.webp',
                title: 'Active Recreation & Multi-Use Trail',
                spec: 'PLATE 02 // PROMENADE PERSPECTIVE'
            },
            {
                src: 'portfolio/marikina/3.webp',
                title: 'Stepped Waterfront Plaza & Riparian Ecology',
                spec: 'PLATE 03 // WATERFRONT PLAZA'
            },
            {
                src: 'portfolio/marikina/4.webp',
                title: 'Riparian Buffer & Architectural Lighting',
                spec: 'PLATE 04 // TWILIGHT RENDER'
            }
        ]
    },
    subdivision: {
        id: 'subdivision',
        title: 'Hinabi Heights Subdivision',
        category: 'RESIDENTIAL',
        year: '2024',
        location: 'Manggahan, General Trias, Cavite',
        area: '3.5 Hectares',
        typology: 'Residential & Community Master Planning',
        tools: 'AutoCAD • SketchUp • Lumion • InDesign',
        desc: 'A 3.5-hectare master-planned residential community organized around neighborhood livability, hierarchical road networks, integrated pocket parks, and architectural guidelines that ensure coherent design continuity.',
        features: [
            'Hierarchical Road & Pedestrian Grid',
            'Central Community Clubhouse & Amenities',
            'Continuous Green Spine Linear Park',
            'Architectural Deed of Restrictions & Standards'
        ],
        photos: [
            {
                src: 'portfolio/subdivision/PAGE 1.webp',
                title: 'Master Plan Overview & Community Zoning',
                spec: 'PLATE 01 // MASTER SITE PLAN'
            },
            {
                src: 'portfolio/subdivision/PAGE 2.webp',
                title: 'Master Site Development & Circulation Plan',
                spec: 'PLATE 02 // SUBDIVISION LAYOUT'
            },
            {
                src: 'portfolio/subdivision/PAGE 3.webp',
                title: 'Community Clubhouse & Green Spine Network',
                spec: 'PLATE 03 // AMENITIES COMPLEX'
            },
            {
                src: 'portfolio/subdivision/PAGE 4.webp',
                title: 'Standard Lot Typologies & Design Guidelines',
                spec: 'PLATE 04 // ARCHITECTURAL GUIDELINES'
            }
        ]
    },
    plaza: {
        id: 'plaza',
        title: 'Jagna De Plaza',
        category: 'PLANNING',
        year: '2024',
        location: 'Población, Jagna, Bohol',
        area: '5,200 sqm',
        typology: 'Civic Space & Heritage Revitalization',
        tools: 'AutoCAD • SketchUp • Lumion • Photoshop',
        desc: 'A 5,200 sqm municipal town plaza revitalization study focused on civic gathering, geometric proportion, coastal heritage integration, and architectural shade structures accommodating cultural celebrations and public assembly.',
        features: [
            'Heritage Gathering Pavilion',
            'Geometric Shaded Arcades',
            'Integrated Civic Water Feature',
            'Native Coastal Landscaping'
        ],
        photos: [
            {
                src: 'portfolio/plaza/plaza.webp',
                title: 'Civic Plaza Revitalization Plan & Pavilion',
                spec: 'PLATE 01 // MASTER PLAN & PERSPECTIVE'
            }
        ]
    }
};

function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-project-modal');
    const projectCards = document.querySelectorAll('.project-card');

    if (!modal) return;

    const titleEl = document.getElementById('proj-modal-title');
    const subtitleEl = document.getElementById('proj-modal-subtitle');
    const catEl = document.getElementById('proj-modal-category');
    const yearEl = document.getElementById('proj-modal-year');
    const descEl = document.getElementById('proj-modal-desc');
    const locationEl = document.getElementById('proj-modal-location');
    const areaEl = document.getElementById('proj-modal-area');
    const typologyEl = document.getElementById('proj-modal-typology-spec');
    const toolsEl = document.getElementById('proj-modal-tools-spec');
    const featuresEl = document.getElementById('proj-modal-features');
    const collageEl = document.getElementById('proj-collage');
    const photoCountEl = document.getElementById('proj-photo-count');
    const prevBtn = document.getElementById('proj-modal-prev-btn');
    const nextBtn = document.getElementById('proj-modal-next-btn');
    const indexBadge = document.getElementById('proj-modal-index-badge');

    // Active Plate Viewport Stage elements
    const activeImg = document.getElementById('proj-active-image');
    const activePlateBadge = document.getElementById('proj-active-plate-badge');
    const stagePrevBtn = document.getElementById('proj-stage-prev-btn');
    const stageNextBtn = document.getElementById('proj-stage-next-btn');
    const plateZoomBtn = document.getElementById('proj-plate-zoom-btn');

    const projectKeys = ['airport', 'amping', 'marahuyo', 'marikina', 'subdivision', 'plaza'];
    let currentProjectIndex = 0;
    let currentPlateIndex = 0;

    projectCards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            const key = card.getAttribute('data-project');
            const foundIdx = projectKeys.indexOf(key);
            openProjectModal(foundIdx >= 0 ? foundIdx : idx);
        });
    });

    const getProjectPhotos = (projectKey) => {
        const p = PORTFOLIO_PROJECTS_DATA[projectKey];
        if (!p || !p.photos) return [];
        return p.photos.filter(photo => !photo.src.includes('/cover/'));
    };

    const setActivePlate = (plateIdx) => {
        const projectKey = projectKeys[currentProjectIndex];
        const p = PORTFOLIO_PROJECTS_DATA[projectKey];
        const plates = getProjectPhotos(projectKey);
        if (!p || !plates.length) return;

        currentPlateIndex = (plateIdx + plates.length) % plates.length;
        const currentPhoto = plates[currentPlateIndex];

        if (activeImg) {
            activeImg.style.opacity = '0.4';
            activeImg.src = currentPhoto.src;
            activeImg.alt = `${p.title} - ${currentPhoto.title}`;
            setTimeout(() => {
                activeImg.style.opacity = '1';
            }, 100);
        }

        if (activePlateBadge) {
            activePlateBadge.textContent = `PLATE ${String(currentPlateIndex + 1).padStart(2, '0')} / ${String(plates.length).padStart(2, '0')}`;
        }

        // Highlight active thumbnail in collage
        if (collageEl) {
            const thumbs = collageEl.querySelectorAll('.proj-thumb-card');
            thumbs.forEach((th, idx) => {
                if (idx === currentPlateIndex) {
                    th.classList.add('active');
                } else {
                    th.classList.remove('active');
                }
            });
        }
    };

    const openProjectModal = (index) => {
        currentProjectIndex = (index + projectKeys.length) % projectKeys.length;
        const projectKey = projectKeys[currentProjectIndex];
        const p = PORTFOLIO_PROJECTS_DATA[projectKey];
        if (!p) return;

        const plates = getProjectPhotos(projectKey);
        currentPlateIndex = 0;

        if (titleEl) titleEl.textContent = p.title;
        if (subtitleEl) subtitleEl.textContent = `${p.category} Architectural Documentation`;
        if (catEl) catEl.textContent = p.category;
        if (yearEl) yearEl.textContent = p.year;
        if (descEl) descEl.textContent = p.desc;
        if (locationEl) {
            locationEl.innerHTML = `<i class="ph ph-map-pin text-accent"></i> <span>${p.location}</span>`;
        }
        if (areaEl) areaEl.textContent = p.area;
        if (typologyEl) typologyEl.textContent = p.typology;
        if (toolsEl) toolsEl.textContent = p.tools;
        if (indexBadge) indexBadge.textContent = `${currentProjectIndex + 1} / ${projectKeys.length} PROJECTS`;

        if (featuresEl && p.features) {
            featuresEl.innerHTML = p.features
                .map(feat => `<span class="px-2 py-0.5 bg-studio-800 text-studio-300 border border-studio-700 text-[10px] font-mono">${feat}</span>`)
                .join('');
        }

        // Photo count badge
        const count = plates.length;
        if (photoCountEl) {
            photoCountEl.textContent = `${count} ${count === 1 ? 'PLATE' : 'PLATES'}`;
        }

        // Stage controls visibility
        if (stagePrevBtn && stageNextBtn) {
            if (count > 1) {
                stagePrevBtn.classList.remove('hidden');
                stagePrevBtn.classList.add('flex');
                stageNextBtn.classList.remove('hidden');
                stageNextBtn.classList.add('flex');
            } else {
                stagePrevBtn.classList.add('hidden');
                stagePrevBtn.classList.remove('flex');
                stageNextBtn.classList.add('hidden');
                stageNextBtn.classList.remove('flex');
            }
        }

        // Populate thumbnails collage
        if (collageEl && plates.length) {
            collageEl.innerHTML = plates.map((photo, idx) => `
                <button type="button" class="proj-thumb-card group relative aspect-video border border-studio-700 bg-studio-900 overflow-hidden text-left cursor-pointer ${idx === 0 ? 'active' : ''}" data-plate-index="${idx}" title="${photo.title}">
                    <img src="${photo.src}" alt="${photo.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between font-mono text-[9px] text-studio-200">
                        <span class="text-accent font-bold">${String(idx + 1).padStart(2, '0')}</span>
                        <span class="truncate text-[8px] text-studio-400 hidden sm:inline ml-1">${photo.spec.replace(/^PLATE\s*\d+\s*\/\/\s*/i, '')}</span>
                    </div>
                </button>
            `).join('');

            // Bind thumbnail click events
            const thumbButtons = collageEl.querySelectorAll('.proj-thumb-card');
            thumbButtons.forEach((btn, idx) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setActivePlate(idx);
                });
            });
        }

        // Set initial plate
        setActivePlate(0);

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    };

    // Stage Next / Prev Plate handlers
    if (stagePrevBtn) {
        stagePrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setActivePlate(currentPlateIndex - 1);
        });
    }

    if (stageNextBtn) {
        stageNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setActivePlate(currentPlateIndex + 1);
        });
    }

    // Lightbox inspection triggers
    const triggerProjectLightbox = () => {
        const projectKey = projectKeys[currentProjectIndex];
        const plates = getProjectPhotos(projectKey);
        if (plates.length && window.openCustomLightbox) {
            window.openCustomLightbox(plates, currentPlateIndex);
        }
    };

    if (activeImg) {
        activeImg.addEventListener('click', triggerProjectLightbox);
    }
    if (plateZoomBtn) {
        plateZoomBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerProjectLightbox();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                setActivePlate(currentPlateIndex - 1);
            } else if (e.key === 'ArrowRight') {
                setActivePlate(currentPlateIndex + 1);
            }
        }
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            openProjectModal(currentProjectIndex - 1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            openProjectModal(currentProjectIndex + 1);
        });
    }
}

// ==========================================================================
// 07. 3D RENDERS SECTION (FILTERING, SEE MORE & MOBILE VISIBILITY)
// ==========================================================================
function init3DRendersSection() {
    const filterBtns = document.querySelectorAll('.viz-filter-btn');
    const vizItems = Array.from(document.querySelectorAll('.viz-item'));
    const seeMoreBtn = document.getElementById('viz-see-more-btn');
    const seeMoreText = document.getElementById('viz-see-more-text');
    const seeMoreIcon = document.getElementById('viz-see-more-icon');
    const emptyState = document.getElementById('viz-empty-state');

    if (!vizItems.length) return;

    let currentFilter = 'all';
    let isExpanded = false;
    const INITIAL_LIMIT = 12;

    const updateVisibility = () => {
        const filtered = vizItems.filter(item => {
            const cat = item.getAttribute('data-viz-cat') || '';
            return currentFilter === 'all' || cat === currentFilter;
        });

        vizItems.forEach(item => {
            item.classList.add('viz-item-hidden');
            item.style.display = 'none';
        });

        const limit = isExpanded ? filtered.length : INITIAL_LIMIT;
        filtered.forEach((item, idx) => {
            if (idx < limit) {
                item.classList.remove('viz-item-hidden');
                item.style.display = '';
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('hidden', filtered.length > 0);
        }

        if (seeMoreBtn) {
            if (filtered.length <= INITIAL_LIMIT) {
                seeMoreBtn.parentElement?.classList.add('hidden');
            } else {
                seeMoreBtn.parentElement?.classList.remove('hidden');
                if (seeMoreText) {
                    seeMoreText.textContent = isExpanded ? 'Show Less' : `Load More Renders (${filtered.length - INITIAL_LIMIT} Remaining)`;
                }
                if (seeMoreIcon) {
                    seeMoreIcon.className = isExpanded ? 'ph ph-caret-up' : 'ph ph-caret-down';
                }
            }
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-viz-filter') || 'all';
            isExpanded = false;
            updateVisibility();
        });
    });

    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            updateVisibility();
            if (!isExpanded) {
                const section = document.getElementById('visualization');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Initial render setup
    updateVisibility();
}

// ==========================================================================
// 08. INTERACTIVE 3D MODEL VIEWPORT (WEBGL / MODEL-VIEWER)
// ==========================================================================
function initModelViewer() {
    const modelViewer = document.getElementById('wellness-model-viewer');
    const viewportCard = document.getElementById('model-viewport-card');
    const hudTitle = document.getElementById('model-hud-title');
    const rotateToggle = document.getElementById('model-rotate-toggle');
    const rotateIcon = document.getElementById('model-rotate-icon');
    const rotateText = document.getElementById('model-rotate-text');
    const resetBtn = document.getElementById('model-reset-btn');
    const lightBtn = document.getElementById('model-light-btn');
    const lightIcon = document.getElementById('model-light-icon');
    const lightText = document.getElementById('model-light-text');
    const fullscreenBtn = document.getElementById('model-fullscreen-btn');
    const fullscreenIcon = document.getElementById('model-fullscreen-icon');
    const orientationHint = document.getElementById('model-orientation-hint');
    const modelSelectBtns = document.querySelectorAll('.model-select-btn');
    const cameraBtns = document.querySelectorAll('.model-camera-btn');

    if (!modelViewer) return;

    // 3D Model Catalog
    const models = {
        'wellness': {
            src: '3D Models/Wellness Center.glb',
            title: 'WELLNESS CENTER COMPLEX',
            typology: 'Healthcare / Wellness Complex',
            pipeline: 'Revit BIM + Lumion + Blender'
        },
        'airport': {
            src: '3D Models/Airport.glb',
            title: 'INTERNATIONAL AIRPORT TERMINAL',
            typology: 'Aviation Infrastructure',
            pipeline: 'BIM Massing + Rhino 3D + Lumion'
        },
        'domestic-airport': {
            src: '3D Models/Domestic Airport.glb',
            title: 'REGIONAL DOMESTIC AIRPORT',
            typology: 'Transport Infrastructure',
            pipeline: 'AutoCAD + SketchUp + Enscape'
        },
        'duplex': {
            src: '3D Models/Duplex.glb',
            title: 'CONTEMPORARY DUPLEX RESIDENCE',
            typology: 'Residential Architecture',
            pipeline: 'Revit Architecture + SketchUp'
        },
        'rowhouse': {
            src: '3D Models/Rowhouse.glb',
            title: 'ROWHOUSE RESIDENTIAL DEVELOPMENT',
            typology: 'Residential Architecture • Multi-Unit',
            pipeline: 'Revit BIM + Lumion Engine'
        },
        'event-place': {
            src: '3D Models/event place.glb',
            title: 'MODERN EVENT PAVILION',
            typology: 'Commercial Hospitality',
            pipeline: '3D Modeling + Lumion Engine'
        }
    };

    // Model Selector Tabs
    modelSelectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modelSelectBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const modelId = btn.getAttribute('data-model-id');
            const data = models[modelId];
            if (data) {
                modelViewer.src = data.src;
                if (hudTitle) hudTitle.textContent = data.title;
                const progressFilename = document.getElementById('model-progress-filename');
                if (progressFilename) {
                    const filename = data.src.split('/').pop().toUpperCase();
                    progressFilename.textContent = filename;
                }
            }
        });
    });

    // Camera Presets
    cameraBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cameraBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const orbit = btn.getAttribute('data-orbit');
            if (orbit) {
                modelViewer.cameraOrbit = orbit;
            }
        });
    });

    // Turntable Rotation
    let autoRotate = true;
    if (rotateToggle) {
        rotateToggle.addEventListener('click', () => {
            autoRotate = !autoRotate;
            modelViewer.autoRotate = autoRotate;
            if (rotateIcon) {
                rotateIcon.className = autoRotate ? 'ph ph-arrows-clockwise text-sm text-accent' : 'ph ph-pause text-sm text-studio-400';
            }
            if (rotateText) {
                rotateText.textContent = autoRotate ? 'Rotate' : 'Paused';
            }
        });
    }

    // Reset Camera
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            modelViewer.cameraOrbit = '45deg 65deg 105%';
            modelViewer.cameraTarget = 'auto auto auto';
            modelViewer.fieldOfView = 'auto';
        });
    }

    // Lighting Mode Toggle
    let isStudioLight = true;
    if (lightBtn) {
        lightBtn.addEventListener('click', () => {
            isStudioLight = !isStudioLight;
            modelViewer.exposure = isStudioLight ? 1.0 : 1.35;
            modelViewer.shadowIntensity = isStudioLight ? 1.4 : 0.8;
            if (lightIcon) {
                lightIcon.className = isStudioLight ? 'ph ph-sun text-sm text-accent' : 'ph ph-sun-dim text-sm text-studio-300';
            }
            if (lightText) {
                lightText.textContent = isStudioLight ? 'Studio' : 'Daylight';
            }
        });
    }

    // Fullscreen & Forced Mobile Landscape Orientation
    let isPseudoFullscreen = false;

    const lockLandscape = async () => {
        try {
            if (screen.orientation && typeof screen.orientation.lock === 'function') {
                await screen.orientation.lock('landscape');
                return true;
            } else if (screen.lockOrientation) {
                return screen.lockOrientation('landscape');
            }
        } catch (e) {}
        return false;
    };

    const unlockOrientation = () => {
        try {
            if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                screen.orientation.unlock();
            } else if (screen.unlockOrientation) {
                screen.unlockOrientation();
            }
        } catch (e) {}
    };

    const checkLandscapeOrientation = () => {
        const isFull = document.fullscreenElement === viewportCard ||
                       document.webkitFullscreenElement === viewportCard ||
                       isPseudoFullscreen;
        const isPortrait = window.innerWidth < window.innerHeight;
        const isMobile = window.innerWidth <= 1024;

        if (isFull && isPortrait && isMobile) {
            if (orientationHint) {
                orientationHint.classList.remove('hidden');
                orientationHint.classList.add('flex');
            }
        } else {
            if (orientationHint) {
                orientationHint.classList.add('hidden');
                orientationHint.classList.remove('flex');
            }
        }
    };

    const updateFullscreenUI = () => {
        const isFull = document.fullscreenElement === viewportCard ||
                       document.webkitFullscreenElement === viewportCard ||
                       isPseudoFullscreen;

        if (fullscreenIcon) {
            fullscreenIcon.className = isFull ? 'ph ph-corners-in text-accent' : 'ph ph-corners-out';
        }

        if (isFull) {
            lockLandscape().then(() => checkLandscapeOrientation());
            checkLandscapeOrientation();
        } else {
            isPseudoFullscreen = false;
            if (viewportCard) viewportCard.classList.remove('is-mobile-fullscreen');
            unlockOrientation();
            checkLandscapeOrientation();
        }

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    };

    if (fullscreenBtn && viewportCard) {
        fullscreenBtn.addEventListener('click', async () => {
            const isFull = document.fullscreenElement === viewportCard ||
                           document.webkitFullscreenElement === viewportCard ||
                           isPseudoFullscreen;

            if (!isFull) {
                let entered = false;
                if (viewportCard.requestFullscreen) {
                    try {
                        await viewportCard.requestFullscreen();
                        entered = true;
                    } catch (err) {}
                } else if (viewportCard.webkitRequestFullscreen) {
                    try {
                        viewportCard.webkitRequestFullscreen();
                        entered = true;
                    } catch (err) {}
                }

                if (!entered) {
                    isPseudoFullscreen = true;
                    viewportCard.classList.add('is-mobile-fullscreen');
                    updateFullscreenUI();
                } else {
                    await lockLandscape();
                    checkLandscapeOrientation();
                }
            } else {
                if (document.fullscreenElement || document.webkitFullscreenElement) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen().catch(() => {});
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                } else if (isPseudoFullscreen) {
                    isPseudoFullscreen = false;
                    viewportCard.classList.remove('is-mobile-fullscreen');
                    updateFullscreenUI();
                }
            }
        });

        document.addEventListener('fullscreenchange', updateFullscreenUI);
        document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
        window.addEventListener('resize', checkLandscapeOrientation, { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                checkLandscapeOrientation();
                window.dispatchEvent(new Event('resize'));
            }, 150);
        }, { passive: true });
    }
}

// ==========================================================================
// 09. DIGITAL ART & MANUAL DRAWINGS GALLERY
// ==========================================================================
function initArtGallerySection() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = Array.from(document.querySelectorAll('#gallery-grid .gallery-item, #gallery-grid > div'));
    const seeMoreBtn = document.getElementById('gallery-see-more-btn');
    const seeMoreText = document.getElementById('gallery-see-more-text');
    const seeMoreIcon = document.getElementById('gallery-see-more-icon');
    const emptyState = document.getElementById('gallery-empty-state');

    if (!galleryItems.length) return;

    let currentFilter = 'all';
    let isExpanded = false;
    const INITIAL_LIMIT = 9;

    const updateGallery = () => {
        const filter = (currentFilter || 'all').toLowerCase().trim();

        const filtered = galleryItems.filter(item => {
            if (filter === 'all') return true;

            const cat = (item.getAttribute('data-category') || item.getAttribute('data-cat') || '').toLowerCase().trim();
            const alt = (item.querySelector('img')?.getAttribute('alt') || '').toLowerCase();

            if (cat && (cat === filter || cat.includes(filter))) return true;
            if (filter === 'manual' && (cat.includes('manual') || alt.includes('manual') || alt.includes('drafting'))) return true;
            if (filter === 'watercolor' && (cat.includes('watercolor') || alt.includes('watercolor') || alt.includes('wash'))) return true;
            if (filter === 'digital' && (cat.includes('digital') || alt.includes('digital') || alt.includes('concept'))) return true;

            return false;
        });

        // Hide all items first
        galleryItems.forEach(item => {
            item.style.display = 'none';
        });

        // Show items up to limit
        const limit = isExpanded ? filtered.length : INITIAL_LIMIT;
        filtered.forEach((item, idx) => {
            if (idx < limit) {
                item.style.display = '';
                // Ensure scroll-reveal activates filtered items
                item.classList.add('is-active');
            }
        });

        // Toggle empty state
        if (emptyState) {
            if (filtered.length > 0) {
                emptyState.classList.add('hidden');
                emptyState.style.display = 'none';
            } else {
                emptyState.classList.remove('hidden');
                emptyState.style.display = 'block';
            }
        }

        // Toggle see more button
        if (seeMoreBtn) {
            const container = seeMoreBtn.closest('#gallery-see-more-container') || seeMoreBtn.parentElement;
            if (filtered.length <= INITIAL_LIMIT) {
                if (container) container.classList.add('hidden');
            } else {
                if (container) container.classList.remove('hidden');
                if (seeMoreText) {
                    seeMoreText.textContent = isExpanded ? 'Show Less' : `Load More Works (${filtered.length - INITIAL_LIMIT} Remaining)`;
                }
                if (seeMoreIcon) {
                    seeMoreIcon.className = isExpanded ? 'ph ph-caret-up' : 'ph ph-caret-down';
                }
            }
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = (btn.getAttribute('data-filter') || btn.getAttribute('data-category') || btn.getAttribute('data-cat') || 'all').toLowerCase().trim();
            isExpanded = false;
            updateGallery();
        });
    });

    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            updateGallery();
        });
    }

    updateGallery();
}

// ==========================================================================
// 10. ARCHITECTURAL SERVICES MODAL
// ==========================================================================
function initServiceModal() {
    const modal = document.getElementById('service-modal');
    const closeBtn = document.getElementById('close-service-modal');
    const serviceCards = document.querySelectorAll('.service-architectural-card');
    const directInquiryBtn = document.getElementById('open-inquiry-direct-btn');

    if (!modal) return;

    const titleEl = document.getElementById('modal-service-title');
    const catEl = document.getElementById('modal-service-category');
    const descEl = document.getElementById('modal-service-desc');
    const deliverablesEl = document.getElementById('modal-service-deliverables');
    const toolsEl = document.getElementById('modal-service-tools');
    const audienceEl = document.getElementById('modal-service-audience');
    const inquireBtn = document.getElementById('modal-inquire-btn');

    const serviceData = [
        {
            category: '01 // 3D DESIGN',
            title: '3D Architectural Modelling & BIM',
            desc: 'High-quality 3D models for architectural design, massing studies, and complex built forms—bringing conceptual spatial ideas to life with millimeter precision.',
            deliverables: ['Massing & Schematic Models', 'Detailed Building Information Models', 'Parametric Component Families', 'OBJ, FBX & IFC Exchange Files'],
            tools: 'SketchUp Pro / Autodesk Revit / AutoCAD 3D / Rhino',
            audience: 'Architects, Developers, Contractors, Interior Designers'
        },
        {
            category: '02 // VISUALIZATION',
            title: 'Photorealistic Architectural Rendering',
            desc: 'Photorealistic architectural, exterior, and interior visualizations configured with authentic natural lighting, realistic materiality, and atmospheric depth.',
            deliverables: ['4K Exterior Twilight & Daytime Renders', 'High-Res Interior Perspective Plates', 'Atmospheric Lighting & Material Studies', 'Interactive 360 Panorama Views'],
            tools: 'Lumion Pro / Photoshop Post-Prod / SketchUp / Blender',
            audience: 'Architects, Real Estate Developers, Design Studios'
        },
        {
            category: '03 // ILLUSTRATION',
            title: 'Manual Drawings & Watercolor Studies',
            desc: 'Hand-drawn architectural plates, fine technical pen illustrations, and expressive watercolor sketches celebrating the tactile heritage of architectural craft.',
            deliverables: ['Technical Pen & Stippling Plates', 'Watercolor Elevation Studies', 'Manual Perspective Drawings', 'Archival High-Resolution Digital Scans'],
            tools: 'Technical Drafting Pens / Watercolor Medium / Cold-Press Paper',
            audience: 'Design Jurors, Academic Reviewers, Collectors, Creative Teams'
        },
        {
            category: '04 // BOARD LAYOUT',
            title: 'Presentation Board Layout & Graphic Design',
            desc: 'Professional architectural presentation boards structured with clean visual hierarchy, diagrammatic narrative flow, and high-impact jury formatting.',
            deliverables: ['A1 / A0 Competition Sheet Layouts', 'Analytical Concept Diagrams & Axonometrics', 'Consistent Typographic & Grid Systems', 'High-Resolution Print-Ready Vectors & PDFs'],
            tools: 'Adobe Photoshop / Illustrator / InDesign',
            audience: 'Architecture Students, Competition Entrants, Studio Teams'
        },
        {
            category: '05 // ANIMATION',
            title: 'Cinematic 3D Architectural Walkthroughs',
            desc: 'Cinematic walkthrough animations that illustrate circulation paths, light penetration, acoustic feel, and real-time spatial experiences of proposed designs.',
            deliverables: ['4K 60FPS Camera Flythroughs', 'Interior Spatial Flow Sequences', 'Natural Daylight Transition Studies', 'Curated Audio-Visual Soundtrack & Editing'],
            tools: 'Lumion Cinematic / Adobe Premiere Pro / After Effects',
            audience: 'Commercial Clients, Real Estate Sales, Project Pitches'
        },
        {
            category: '06 // WEB ARCHITECTURE',
            title: 'Bespoke Portfolio & Technical Websites',
            desc: 'Bespoke, technical websites designed specifically for architects and designers—responsive, typography-driven, and built to present creative work flawlessly.',
            deliverables: ['Interactive 3D WebGL Model Viewers', 'High-Res Filterable Project Galleries', 'Responsive Dark / Light Blueprint Architecture', 'Production Cloud Run & Vercel Deployment'],
            tools: 'HTML5 / CSS3 / Tailwind CSS / Modern JavaScript / Three.js',
            audience: 'Architects, Designers, Creative Professionals, Studios'
        }
    ];

    serviceCards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            const s = serviceData[idx] || serviceData[0];
            if (titleEl) titleEl.textContent = s.title;
            if (catEl) catEl.textContent = s.category;
            if (descEl) descEl.textContent = s.desc;
            if (toolsEl) toolsEl.textContent = s.tools;
            if (audienceEl) audienceEl.textContent = s.audience;

            if (deliverablesEl) {
                deliverablesEl.innerHTML = s.deliverables.map(d => `
                    <li class="flex items-center gap-2">
                        <i class="ph ph-check-square text-accent shrink-0"></i>
                        <span>${d}</span>
                    </li>
                `).join('');
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    if (inquireBtn) {
        inquireBtn.addEventListener('click', () => {
            closeModal();
            const inqModal = document.getElementById('inquiry-modal');
            if (inqModal) {
                inqModal.classList.remove('hidden');
                inqModal.classList.add('flex');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (directInquiryBtn) {
        directInquiryBtn.addEventListener('click', () => {
            const inqModal = document.getElementById('inquiry-modal');
            if (inqModal) {
                inqModal.classList.remove('hidden');
                inqModal.classList.add('flex');
                document.body.style.overflow = 'hidden';
            }
        });
    }
}

// ==========================================================================
// 10B. ARCHITECTURAL MILESTONE COUNTERS
// ==========================================================================
function initMilestoneCounters() {
    const counters = document.querySelectorAll('.milestone-counter');
    if (!counters.length) return;

    let hasAnimated = false;

    const runCount = () => {
        if (hasAnimated) return;
        hasAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target') || '0', 10);
            const suffix = counter.getAttribute('data-suffix') || '';
            if (isNaN(target) || target <= 0) return;

            const duration = 1400;
            const startTime = performance.now();

            const update = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - (1 - progress) * (1 - progress);
                const current = Math.floor(ease * target);
                counter.textContent = `${current}${progress >= 1 ? suffix : ''}`;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = `${target}${suffix}`;
                }
            };

            requestAnimationFrame(update);
        });
    };

    const milestonesGrid = document.getElementById('milestones-grid') || document.getElementById('services');
    if (milestonesGrid && 'IntersectionObserver' in window && window.innerWidth > 768) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0] && entries[0].isIntersecting) {
                runCount();
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        observer.observe(milestonesGrid);
    } else {
        runCount();
    }
}

// ==========================================================================
// 11. PROJECT INQUIRY MODAL & EMAIL CLIENT DISPATCH
// ==========================================================================
function initInquiryModal() {
    const modal = document.getElementById('inquiry-modal');
    const closeBtn = document.getElementById('close-inquiry-modal');
    const form = document.getElementById('inquiry-form');
    const emailBtn = document.getElementById('inq-email-btn');
    const copyBtn = document.getElementById('inq-copy-btn');
    const toast = document.getElementById('inquiry-toast');
    const toastMsg = document.getElementById('inquiry-toast-msg');

    if (!modal) return;

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    const showToast = (msg) => {
        if (!toast) return;
        if (toastMsg) toastMsg.textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3500);
    };

    const getInquiryData = () => {
        const name = (document.getElementById('inq-client-name')?.value || '').trim();
        const contact = (document.getElementById('inq-client-contact')?.value || '').trim();
        const service = document.getElementById('inq-service-type')?.value || 'Architectural Design';
        const typology = document.getElementById('inq-typology')?.value || 'Residential';
        const timeline = document.getElementById('inq-timeline')?.value || 'Flexible';
        const notes = (document.getElementById('inq-notes')?.value || '').trim();

        const summary = `ARCHITECTURAL INQUIRY\n-------------------\nClient: ${name || 'Prospective Client'}\nContact: ${contact || 'N/A'}\nService Required: ${service}\nProject Typology: ${typology}\nTarget Timeline: ${timeline}\nProject Notes:\n${notes || 'None specified'}\n-------------------\nSent from Marjo Paguia Portfolio`;

        return { name, contact, service, typology, timeline, notes, summary };
    };

    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const data = getInquiryData();
            const subject = encodeURIComponent(`Project Inquiry: ${data.service} (${data.typology}) - ${data.name || 'Client'}`);
            const body = encodeURIComponent(data.summary);
            window.location.href = `mailto:noroniomarjo@gmail.com?subject=${subject}&body=${body}`;
            showToast('Opening your default email client...');
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const data = getInquiryData();
            navigator.clipboard.writeText(data.summary).then(() => {
                showToast('Inquiry details copied to clipboard!');
            }).catch(() => {
                showToast('Could not access clipboard.');
            });
        });
    }
}

// ==========================================================================
// 12. PROFESSIONAL CURRICULUM VITAE (CV) MODAL
// ==========================================================================
function initCVModal() {
    const modal = document.getElementById('cv-modal');
    const closeBtn = document.getElementById('close-cv-modal');
    const openBtns = [
        document.getElementById('open-cv-btn'),
        document.getElementById('sidebar-cv-btn'),
        document.getElementById('specs-cv-btn')
    ].filter(Boolean);

    const printBtn = document.getElementById('cv-print-btn');
    const sheetContainer = document.getElementById('cv-sheet-container');
    const orientSelector = document.getElementById('cv-orient-selector');
    const themeSelector = document.getElementById('cv-theme-selector');

    if (!modal) return;

    const openCV = () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    };

    const closeCV = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    };

    openBtns.forEach(b => b.addEventListener('click', openCV));
    if (closeBtn) closeBtn.addEventListener('click', closeCV);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCV();
    });

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    if (orientSelector && sheetContainer) {
        orientSelector.addEventListener('change', () => {
            if (orientSelector.value === 'landscape') {
                sheetContainer.classList.add('cv-landscape');
            } else {
                sheetContainer.classList.remove('cv-landscape');
            }
        });
    }

    if (themeSelector && sheetContainer) {
        themeSelector.addEventListener('change', () => {
            if (themeSelector.value === 'blueprint') {
                sheetContainer.classList.add('cv-blueprint');
            } else {
                sheetContainer.classList.remove('cv-blueprint');
            }
        });
    }
}

// ==========================================================================
// 13. GALLERY & 3D RENDERS LIGHTBOX
// ==========================================================================
function initLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const closeBtn = document.getElementById('close-lightbox-btn');
    const prevBtn = document.getElementById('prev-lightbox-btn');
    const nextBtn = document.getElementById('next-lightbox-btn');
    const zoomBtn = document.getElementById('lightbox-zoom-btn');

    if (!lightbox || !lightboxImg) return;

    let items = [];
    let currentIndex = 0;
    let isZoomed = false;

    // Collect all inspectable images
    const collectItems = () => {
        const renderCards = document.querySelectorAll('.viz-item:not(.viz-item-hidden) .viz-card, #gallery-grid > div');
        items = [];
        renderCards.forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                const title = card.querySelector('.text-accent.font-bold')?.textContent.trim() ||
                              img.getAttribute('alt') ||
                              'Architectural Plate';
                items.push({
                    src: img.getAttribute('src'),
                    title: title
                });
            }
        });
    };

    const showItem = (idx) => {
        if (!items.length) return;
        currentIndex = (idx + items.length) % items.length;
        const it = items[currentIndex];

        lightboxImg.src = it.src;
        if (lightboxCaption) lightboxCaption.textContent = it.title;
        if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${items.length}`;

        isZoomed = false;
        lightboxImg.style.transform = 'scale(1)';
        lightboxImg.style.cursor = 'zoom-in';
    };

    const openLightbox = (src) => {
        collectItems();
        const found = items.findIndex(it => it.src === src);
        showItem(found >= 0 ? found : 0);

        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
        document.body.style.overflow = 'hidden';
    };

    window.openCustomLightbox = (customItems, startIdx = 0) => {
        if (!customItems || !customItems.length) return;
        items = customItems.map(item => {
            if (typeof item === 'string') return { src: item, title: 'Architectural Plate' };
            return {
                src: item.src,
                title: item.title || item.spec || 'Architectural Plate'
            };
        });
        showItem(startIdx);
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex');
        document.body.style.overflow = '';
    };

    // Attach click listeners to cards
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.viz-card, #gallery-grid > div');
        if (trigger) {
            const img = trigger.querySelector('img');
            if (img && img.src) {
                openLightbox(img.getAttribute('src'));
            }
        }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.id === 'lightbox-viewport') {
            closeLightbox();
        }
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => showItem(currentIndex - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => showItem(currentIndex + 1));
    }

    if (zoomBtn || lightboxImg) {
        const toggleZoom = () => {
            isZoomed = !isZoomed;
            lightboxImg.style.transform = isZoomed ? 'scale(1.75)' : 'scale(1)';
            lightboxImg.style.cursor = isZoomed ? 'zoom-out' : 'zoom-in';
        };
        if (zoomBtn) zoomBtn.addEventListener('click', toggleZoom);
        lightboxImg.addEventListener('click', toggleZoom);
    }

    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('hidden')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showItem(currentIndex - 1);
        if (e.key === 'ArrowRight') showItem(currentIndex + 1);
    });
}

// ==========================================================================
// 14. DYNAMIC YEAR
// ==========================================================================
function initDynamicYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// ==========================================================================
// 15. CONTINUOUS TESTIMONIALS AUTO-SCROLL TRACK
// ==========================================================================
function initTestimonialsTrack() {
    const track = document.getElementById('testimonials-track');
    if (!track) return;

    const originalCards = Array.from(track.children);
    if (!originalCards.length) return;

    // Clone all cards once to create a seamless infinite loop
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });

    let singleCycleWidth = 0;
    const calculateCycleWidth = () => {
        if (track.children.length > originalCards.length) {
            const firstChild = track.children[0];
            const firstClone = track.children[originalCards.length];
            singleCycleWidth = firstClone.offsetLeft - firstChild.offsetLeft;
        }
        if (!singleCycleWidth || singleCycleWidth <= 0) {
            singleCycleWidth = track.scrollWidth / 2;
        }
    };

    // Calculate initial cycle width after DOM layout settling
    setTimeout(calculateCycleWidth, 100);
    window.addEventListener('resize', calculateCycleWidth);

    let isAutoScrolling = true;
    let isHovered = false;
    let isDragging = false;
    let isVisible = true;
    let resumeTimeout = null;
    let lastTime = performance.now();
    const scrollSpeedPixelsPerSecond = 36; // Buttery smooth reading speed (~0.6px per frame at 60fps)

    function animate(currentTime) {
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;

        if (isAutoScrolling && !isHovered && !isDragging && isVisible && singleCycleWidth > 0) {
            track.scrollLeft += scrollSpeedPixelsPerSecond * deltaTime;

            if (track.scrollLeft >= singleCycleWidth) {
                track.scrollLeft -= singleCycleWidth;
            } else if (track.scrollLeft < 0) {
                track.scrollLeft += singleCycleWidth;
            }
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Pause on mouse hover so user can read review without rushing
    track.addEventListener('mouseenter', () => {
        isHovered = true;
    });
    track.addEventListener('mouseleave', () => {
        isHovered = false;
        lastTime = performance.now();
    });

    // Mouse & Touch Drag interactions
    let startX = 0;
    let scrollStart = 0;

    const startDrag = (pageX) => {
        isDragging = true;
        startX = pageX;
        scrollStart = track.scrollLeft;
        track.classList.add('cursor-grabbing');
        track.classList.remove('cursor-grab');
        if (resumeTimeout) clearTimeout(resumeTimeout);
    };

    const moveDrag = (pageX) => {
        if (!isDragging) return;
        const delta = pageX - startX;
        track.scrollLeft = scrollStart - delta;

        if (singleCycleWidth > 0) {
            if (track.scrollLeft >= singleCycleWidth) {
                track.scrollLeft -= singleCycleWidth;
                scrollStart -= singleCycleWidth;
            } else if (track.scrollLeft < 0) {
                track.scrollLeft += singleCycleWidth;
                scrollStart += singleCycleWidth;
            }
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('cursor-grabbing');
        track.classList.add('cursor-grab');
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            lastTime = performance.now();
        }, 1500);
    };

    track.addEventListener('mousedown', (e) => {
        startDrag(e.pageX);
    });

    window.addEventListener('mousemove', (e) => {
        moveDrag(e.pageX);
    });

    window.addEventListener('mouseup', () => {
        endDrag();
    });

    track.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length) {
            startDrag(e.touches[0].pageX);
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length) {
            moveDrag(e.touches[0].pageX);
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        endDrag();
    });

    // Prev / Next button step navigation
    const prevBtn = document.getElementById('testimonials-prev-btn');
    const nextBtn = document.getElementById('testimonials-next-btn');
    const pauseBtn = document.getElementById('testimonials-pause-btn');
    const statusText = document.getElementById('testimonials-status-text');
    const pulseDot = document.getElementById('testimonials-pulse-dot');

    const getCardStepDistance = () => {
        if (track.children.length > 1) {
            return track.children[1].offsetLeft - track.children[0].offsetLeft;
        }
        return 340;
    };

    const pauseTemporarily = (duration = 3500) => {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        const wasAuto = isAutoScrolling;
        isAutoScrolling = false;
        resumeTimeout = setTimeout(() => {
            isAutoScrolling = wasAuto;
            lastTime = performance.now();
        }, duration);
    };

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const step = getCardStepDistance();
            track.scrollBy({ left: step, behavior: 'smooth' });
            pauseTemporarily();
            setTimeout(() => {
                if (singleCycleWidth > 0 && track.scrollLeft >= singleCycleWidth) {
                    track.scrollLeft -= singleCycleWidth;
                }
            }, 600);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const step = getCardStepDistance();
            if (track.scrollLeft <= 10 && singleCycleWidth > 0) {
                track.scrollLeft += singleCycleWidth;
            }
            track.scrollBy({ left: -step, behavior: 'smooth' });
            pauseTemporarily();
        });
    }

    // Toggle Auto-Scroll Button
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (resumeTimeout) clearTimeout(resumeTimeout);
            isAutoScrolling = !isAutoScrolling;
            if (statusText) {
                statusText.textContent = isAutoScrolling ? 'AUTO' : 'PAUSED';
            }
            if (pulseDot) {
                if (isAutoScrolling) {
                    pulseDot.className = 'w-2 h-2 rounded-full bg-accent animate-pulse';
                } else {
                    pulseDot.className = 'w-2 h-2 rounded-full bg-studio-600';
                }
            }
            lastTime = performance.now();
        });
    }

    // IntersectionObserver to pause loop when section is scrolled out of view
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible = entry.isIntersecting;
                if (isVisible) {
                    lastTime = performance.now();
                    calculateCycleWidth();
                }
            });
        }, { threshold: 0.05 });
        observer.observe(track);
    }
}
