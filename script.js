/**
 * Marjo Paguia Portfolio - Master Application Script
 * Full-stack architectural portfolio engine including 3D WebGL viewport,
 * responsive gallery filtering, interactive modal HUDs, theme toggles,
 * and mobile-optimized render presentation.
 */

document.addEventListener('DOMContentLoaded', () => {
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
    initDynamicYear();
});

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

    if (!distanceFill || !distanceValue) return;

    const updateRuler = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;

        const scrollPos = window.scrollY || window.pageYOffset;
        const scrollPct = Math.min(100, Math.max(0, (scrollPos / docHeight) * 100));

        distanceFill.style.width = `${scrollPct}%`;
        if (distanceMarker) distanceMarker.style.left = `${scrollPct}%`;

        // Scale distance value to a realistic architectural building axis length (e.g. 0m to 120m)
        const meters = ((scrollPct / 100) * 128.5).toFixed(1);
        distanceValue.textContent = `${meters} m`;
    };

    window.addEventListener('scroll', updateRuler, { passive: true });
    updateRuler();
}

// ==========================================================================
// 05. SCROLL REVEAL (MOBILE-SAFE OBSERVER)
// ==========================================================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.gs-reveal');
    if (!revealElements.length) return;

    // Mobile fallback: On screens <= 768px or if IntersectionObserver is unavailable, activate all immediately
    if (window.innerWidth <= 768 || !('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('is-active'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.01,
        rootMargin: '100px 0px 50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // Fallback safety timeout: ensure no content remains hidden if user doesn't trigger scroll
    setTimeout(() => {
        revealElements.forEach(el => el.classList.add('is-active'));
    }, 2000);
}

// ==========================================================================
// 06. ARCHITECTURAL PROJECTS SECTION & MODAL
// ==========================================================================
function initProjectSection() {
    const filterBtns = document.querySelectorAll('.project-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const emptyState = document.getElementById('project-empty-state');

    // Filter Logic
    if (filterBtns.length && projectCards.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-typology') || btn.getAttribute('data-filter') || 'all';
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

                if (emptyState) {
                    emptyState.classList.toggle('hidden', visibleCount > 0);
                }
            });
        });
    }

    // Project Detail Modal
    initProjectModal();
}

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
    const collageEl = document.getElementById('proj-collage');
    const photoCountEl = document.getElementById('proj-photo-count');
    const prevBtn = document.getElementById('proj-modal-prev-btn');
    const nextBtn = document.getElementById('proj-modal-next-btn');
    const indexBadge = document.getElementById('proj-modal-index-badge');

    let currentProjectIndex = 0;
    const projectsData = [];

    projectCards.forEach((card, idx) => {
        const title = card.querySelector('h3')?.textContent.trim() || `Project ${idx + 1}`;
        const cat = card.getAttribute('data-category') || 'Architecture';
        const img = card.querySelector('img')?.getAttribute('src') || '';
        const year = card.querySelector('.font-mono.text-accent')?.textContent.trim() || '2024';
        const desc = card.querySelector('p')?.textContent.trim() || 'Comprehensive architectural design documentation and 3D computational model.';

        projectsData.push({
            title,
            category: cat.toUpperCase(),
            image: img,
            year,
            desc,
            location: 'Philippines',
            area: '3,500 sqm',
            tools: 'Revit / SketchUp / Lumion / AutoCAD',
            typology: cat.toUpperCase()
        });

        card.addEventListener('click', () => {
            openProjectModal(idx);
        });
    });

    const openProjectModal = (index) => {
        currentProjectIndex = index;
        const p = projectsData[index];
        if (!p) return;

        if (titleEl) titleEl.textContent = p.title;
        if (subtitleEl) subtitleEl.textContent = `${p.category} Architectural Documentation`;
        if (catEl) catEl.textContent = p.category;
        if (yearEl) yearEl.textContent = p.year;
        if (descEl) descEl.textContent = p.desc;
        if (locationEl) locationEl.textContent = p.location;
        if (areaEl) areaEl.textContent = p.area;
        if (typologyEl) typologyEl.textContent = p.typology;
        if (toolsEl) toolsEl.textContent = p.tools;
        if (indexBadge) indexBadge.textContent = `${index + 1} / ${projectsData.length}`;

        if (collageEl) {
            collageEl.innerHTML = `
                <div class="relative w-full aspect-video border border-studio-700 bg-studio-900 overflow-hidden shadow-xl">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
                </div>
            `;
        }
        if (photoCountEl) photoCountEl.textContent = '1 PLATE';

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentProjectIndex = (currentProjectIndex - 1 + projectsData.length) % projectsData.length;
            openProjectModal(currentProjectIndex);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentProjectIndex = (currentProjectIndex + 1) % projectsData.length;
            openProjectModal(currentProjectIndex);
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
            src: '3D Models/event place.glb',
            title: 'COMMUNITY EVENT PAVILION',
            typology: 'Commercial / Civic Center',
            pipeline: 'SketchUp 3D + Lumion Engine'
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
                // Ensure scroll-reveal does not keep filtered items invisible
                item.classList.add('is-active');
                item.style.visibility = 'visible';
                item.style.opacity = '1';
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
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    if (inquireBtn) {
        inquireBtn.addEventListener('click', () => {
            closeModal();
            const inqModal = document.getElementById('inquiry-modal');
            if (inqModal) {
                inqModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (directInquiryBtn) {
        directInquiryBtn.addEventListener('click', () => {
            const inqModal = document.getElementById('inquiry-modal');
            if (inqModal) {
                inqModal.classList.remove('hidden');
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
        document.body.style.overflow = 'hidden';
    };

    const closeCV = () => {
        modal.classList.add('hidden');
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
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.add('hidden');
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
