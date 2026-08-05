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

    // Expand cursor on interactive elements using event delegation
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .hover-trigger')) {
            cursorOutline?.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .hover-trigger')) {
            cursorOutline?.classList.remove('cursor-hover');
        }
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

// --- Services Modal Logic ---
const serviceData = {
    "3D Modelling": {
        category: "3D DESIGN",
        title: "3D Modelling",
        desc: "High-quality 3D models for architectural design, product visualization, and creative projects—bringing concepts to life with precision and flair.",
        deliverables: "3D CAD Files, OBJ/FBX, SketchUp / Revit Files",
        tools: "SketchUp Pro, Autodesk Revit, AutoCAD",
        audience: "Architecture Students, Design Studios, Commissions"
    },
    "Rendering": {
        category: "VISUALIZATION",
        title: "Rendering",
        desc: "Photorealistic architectural and interior renderings that present your designs with depth, realism, and visual impact.",
        deliverables: "High-Res Renderings (4K), Post-processed Images, Lighting Variations",
        tools: "Lumion, Adobe Photoshop, SketchUp",
        audience: "Property Developers, Designers, Presentation Boards"
    },
    "Manual Drawings": {
        category: "ILLUSTRATION",
        title: "Manual Drawings",
        desc: "Hand-crafted architectural and artistic drawings that convey concepts with authenticity, detail, and a personal touch.",
        deliverables: "Ink/Graphite Sketches, Scanned High-Res Digital Art, Physical Originals",
        tools: "Technical Pens, Markers, Watercolors, Sketching Paper",
        audience: "Conceptual Design, Competitions, Framed Artwork"
    },
    "Presentation Board Layout": {
        category: "LAYOUT",
        title: "Presentation Board Layout",
        desc: "Clean and professional layouts that clearly present design ideas, concepts, and technical details for impactful reviews.",
        deliverables: "Print-ready PDF Boards, Modular Grids, High-Res Graphics",
        tools: "Adobe Photoshop, Illustrator, InDesign",
        audience: "Architecture Jury Reviews, Client Proposals, Competitions"
    },
    "Architectural Walkthrough": {
        category: "WALKTHROUGH",
        title: "Architectural Walkthrough",
        desc: "Immersive visual experiences that highlight spatial relationships, materials, and the overall design atmosphere.",
        deliverables: "1080p/4K Video Walkthrough, Cinematic Lighting, BG Music Track",
        tools: "Lumion, Premiere Pro, After Effects",
        audience: "Virtual Tours, Client Presentations, Video Portfolios"
    },
    "Personal Portfolio Website": {
        category: "WEB DESIGN & DEVELOPMENT",
        title: "Personal Portfolio Website",
        desc: "Custom-coded portfolio sites for architecture students and pros—clean, mobile-friendly, and built from scratch.",
        deliverables: "Responsive Portfolio Website, Clean Source Code, Deployment Setup",
        tools: "HTML5, Tailwind CSS, JavaScript, Node.js",
        audience: "Architecture Students, Freelancers, Creative Professionals"
    }
};

const serviceModal = document.getElementById('service-modal');
const closeServiceModal = document.getElementById('close-service-modal');
const modalCategory = document.getElementById('modal-service-category');
const modalTitle = document.getElementById('modal-service-title');
const modalDesc = document.getElementById('modal-service-desc');
const modalDeliverables = document.getElementById('modal-service-deliverables');
const modalTools = document.getElementById('modal-service-tools');
const modalAudience = document.getElementById('modal-service-audience');
const modalInquireBtn = document.getElementById('modal-inquire-btn');

document.querySelectorAll('.see-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-service');
        const data = serviceData[key];
        if (data && serviceModal) {
            if (modalCategory) modalCategory.textContent = data.category;
            if (modalTitle) modalTitle.textContent = data.title;
            if (modalDesc) modalDesc.textContent = data.desc;
            if (modalDeliverables) modalDeliverables.textContent = data.deliverables;
            if (modalTools) modalTools.textContent = data.tools;
            if (modalAudience) modalAudience.textContent = data.audience;
            if (modalInquireBtn) modalInquireBtn.setAttribute('href', '#contact');

            serviceModal.classList.remove('hidden');
            serviceModal.classList.add('flex');
        }
    });
});

if (closeServiceModal && serviceModal) {
    const hideModal = () => {
        serviceModal.classList.add('hidden');
        serviceModal.classList.remove('flex');
    };

    closeServiceModal.addEventListener('click', hideModal);

    serviceModal.addEventListener('click', (e) => {
        if (e.target === serviceModal) {
            hideModal();
        }
    });

    if (modalInquireBtn) {
        modalInquireBtn.addEventListener('click', hideModal);
    }
}

// --- Project Popup Modal Window Logic ---
const projectModal = document.getElementById('project-modal');
const closeProjectModalBtn = document.getElementById('close-project-modal');
const projModalTitle = document.getElementById('proj-modal-title');
const projModalCategory = document.getElementById('proj-modal-category');
const projModalYear = document.getElementById('proj-modal-year');
const projModalDesc = document.getElementById('proj-modal-desc');
const projModalEmptyState = document.getElementById('proj-modal-empty-state');
const projCollage = document.getElementById('proj-collage');
const projPhotoSection = document.getElementById('proj-photo-section');
const projPhotoCount = document.getElementById('proj-photo-count');
const projModalFullLink = document.getElementById('proj-modal-full-link');

let currentProjImages = [];
let openLightboxWithItems;

// Project image datasets mapping project keys to all associated images in portfolio
const projectData = {
    "airport": {
        title: "Layag Airport",
        year: "2024",
        category: "ARCHITECTURE • TERMINAL DESIGN",
        desc: "A conceptual airport proposal that balances movement, structure, and visual clarity with terminal concourses, roof elevation studies, and interior lounge spaces.",
        pageUrl: "portfolio/airport/full_project.html",
        images: [
            { src: "portfolio/airport/1.webp", alt: "Layag Airport - Design Concept Board" },
            { src: "portfolio/airport/2.webp", alt: "Layag Airport - Terminal Form Development" },
            { src: "portfolio/airport/3.webp", alt: "Layag Airport - Interior and Terminal Perspectives" },
            { src: "portfolio/airport/4.webp", alt: "Layag Airport - Site and Exterior Studies" }
        ]
    },
    "amping": {
        title: "Amparo Hospital",
        year: "2023",
        category: "HEALTHCARE • SPATIAL PLANNING",
        desc: "A hospital concept centered on calm circulation, clarity, and efficient spatial organization, including site plans, flow diagrams, and emergency ward layouts.",
        pageUrl: "portfolio/amping/full_project.html",
        images: [
            { src: "portfolio/amping/1.webp", alt: "Amparo Hospital - Main Facade Render" },
            { src: "portfolio/amping/2.webp", alt: "Amparo Hospital - Aerial Site View" },
            { src: "portfolio/amping/3.webp", alt: "Amparo Hospital - Floor Plan & Circulation Layout" },
            { src: "portfolio/amping/4.webp", alt: "Amparo Hospital - Interior Emergency Ward" },
            { src: "portfolio/amping/5.webp", alt: "Amparo Hospital - Spatial Flow Diagram" },
            { src: "portfolio/amping/7.webp", alt: "Amparo Hospital - Elevation Study" },
            { src: "portfolio/amping/8.webp", alt: "Amparo Hospital - Master Site Plan" }
        ]
    },
    "marahuyo": {
        title: "Marahuyo Park",
        year: "2024",
        category: "PLANNING • PUBLIC REALM",
        desc: "A landscape and circulation study shaped for open gathering, pause, and movement along waterfront promenades and community gathering pavilions.",
        pageUrl: "portfolio/marahuyo/full_project.html",
        images: [
            { src: "portfolio/marahuyo/1.webp", alt: "Marahuyo Park - Waterfront Master Plan" },
            { src: "portfolio/marahuyo/2.webp", alt: "Marahuyo Park - Park Plan and Elevations" },
            { src: "portfolio/marahuyo/3.webp", alt: "Marahuyo Park - Perspective Studies" }
        ]
    },
    "marikina": {
        title: "Marikina Riverside",
        year: "2024",
        category: "PLANNING • URBAN RENEWAL",
        desc: "A riverside proposal highlighting pedestrian flow, edge conditions, and site character with riverfront boardwalks and urban edge drawings.",
        pageUrl: "portfolio/marikina/full_project.html",
        images: [
            { src: "portfolio/marikina/1.webp", alt: "Marikina Riverside - Riverfront Master Plan" },
            { src: "portfolio/marikina/2.webp", alt: "Marikina Riverside - Site Development Plan" },
            { src: "portfolio/marikina/3.webp", alt: "Marikina Riverside - Design Strategy Board" },
            { src: "portfolio/marikina/4.webp", alt: "Marikina Riverside - Landscape Perspective Studies" }
        ]
    },
    "subdivision": {
        title: "Hinabi Heights Subdivision",
        year: "2024",
        category: "RESIDENTIAL • SITE PLANNING",
        desc: "A subdivision concept organized around livability, hierarchy, and practical circulation with master subdivision lotting and streetscape renders.",
        pageUrl: "portfolio/subdivision/full_project.html",
        images: [
            { src: "portfolio/subdivision/PAGE 1.webp", alt: "Hinabi Heights Subdivision - Master Planning Board" },
            { src: "portfolio/subdivision/PAGE 2.webp", alt: "Hinabi Heights Subdivision - Residential Plans and Perspectives" },
            { src: "portfolio/subdivision/PAGE 3.webp", alt: "Hinabi Heights Subdivision - Housing Design Studies" },
            { src: "portfolio/subdivision/PAGE 4.webp", alt: "Hinabi Heights Subdivision - Site and Unit Development" }
        ]
    },
    "plaza": {
        title: "Civic Plaza",
        year: "2024",
        category: "PLANNING • CIVIC SPACE",
        desc: "A civic plaza study focused on public gathering, proportion, and open-air experience featuring site plans and conceptual hand sketches.",
        pageUrl: "portfolio/plaza/full_project.html",
        images: [
            { src: "portfolio/plaza/plaza.webp", alt: "Civic Plaza - Architectural Site Plan & Flow" }
        ]
    }
};

function openProjectModal(projKey) {
    const data = projectData[projKey];
    if (!data || !projectModal) return;

    if (projModalTitle) projModalTitle.textContent = data.title;
    if (projModalCategory) projModalCategory.textContent = data.category;
    if (projModalYear) projModalYear.textContent = data.year;
    if (projModalDesc) projModalDesc.textContent = data.desc;
    if (projModalFullLink) projModalFullLink.setAttribute('href', data.pageUrl);

    currentProjImages = data.images || [];

    if (projPhotoCount) projPhotoCount.textContent = currentProjImages.length;
    if (projPhotoSection) projPhotoSection.classList.toggle('hidden', currentProjImages.length === 0);
    if (projModalEmptyState) projModalEmptyState.classList.toggle('hidden', currentProjImages.length > 0);

    if (projCollage) {
        projCollage.innerHTML = '';
        const collageTileWidth = currentProjImages.length === 1
            ? 'w-full'
            : currentProjImages.length === 2 || currentProjImages.length === 4
                ? 'w-full sm:w-[calc(50%-0.375rem)]'
                : 'w-full sm:w-[calc(33.333%-0.5rem)]';

        currentProjImages.forEach((img, idx) => {
            const btn = document.createElement('button');
            btn.className = `group relative ${collageTileWidth} flex-grow aspect-[4/3] overflow-hidden rounded-lg border border-studio-700 hover:border-accent transition-all hover-trigger`;
            btn.setAttribute('aria-label', `Open ${img.alt}`);
            btn.innerHTML = `<img src="${img.src}" alt="${img.alt}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"><span class="absolute inset-0 flex items-center justify-center bg-studio-900/0 group-hover:bg-studio-900/35 transition-colors"><i class="ph ph-magnifying-glass-plus text-2xl text-studio-100 opacity-0 group-hover:opacity-100 transition-opacity"></i></span>`;
            btn.addEventListener('click', () => {
                if (openLightboxWithItems) openLightboxWithItems(currentProjImages, idx);
            });
            projCollage.appendChild(btn);
        });
    }

    projectModal.classList.remove('hidden');
    projectModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.add('hidden');
    projectModal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

if (projectModal) {
    if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModal);

    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        const lightboxIsOpen = galleryLightbox && !galleryLightbox.classList.contains('hidden');
        if (!projectModal.classList.contains('hidden') && !lightboxIsOpen && e.key === 'Escape') closeProjectModal();
    });
}

// --- Gallery Lightbox Logic ---
const galleryCards = document.querySelectorAll('.gallery-card');
const projectCards = document.querySelectorAll('.project-card');
const galleryLightbox = document.getElementById('gallery-lightbox');
const closeLightboxBtn = document.getElementById('close-lightbox-btn');
const prevLightboxBtn = document.getElementById('prev-lightbox-btn');
const nextLightboxBtn = document.getElementById('next-lightbox-btn');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxCounter = document.getElementById('lightbox-counter');

let galleryItems = [];
let currentGalleryIndex = 0;

if (galleryLightbox) {
    openLightboxWithItems = (items, startIndex = 0) => {
        galleryItems = items;
        currentGalleryIndex = startIndex;
        updateLightboxContent();
        galleryLightbox.classList.remove('hidden');
        galleryLightbox.classList.add('flex');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        galleryLightbox.classList.add('hidden');
        galleryLightbox.classList.remove('flex');
        document.body.style.overflow = projectModal && !projectModal.classList.contains('hidden') ? 'hidden' : 'auto';
    };

    const updateLightboxContent = () => {
        if (!galleryItems[currentGalleryIndex]) return;
        const item = galleryItems[currentGalleryIndex];
        
        if (lightboxImg) {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = item.src;
                lightboxImg.alt = item.alt;
                lightboxImg.style.opacity = '1';
            }, 100);
        }
        if (lightboxCaption) {
            lightboxCaption.textContent = item.alt;
        }
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${galleryItems.length}`;
        }
    };

    // Attach click listeners to gallery cards
    if (galleryCards.length > 0) {
        const defaultGalleryItems = [];
        galleryCards.forEach((card, index) => {
            const img = card.querySelector('img');
            if (img) {
                defaultGalleryItems.push({
                    src: img.getAttribute('src'),
                    alt: img.getAttribute('alt') || `Gallery Image ${index + 1}`
                });

                card.addEventListener('click', () => {
                    openLightboxWithItems(defaultGalleryItems, index);
                });
            }
        });
    }

    const showNext = () => {
        if (galleryItems.length <= 1) return;
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
        updateLightboxContent();
    };

    const showPrev = () => {
        if (galleryItems.length <= 1) return;
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxContent();
    };

    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (nextLightboxBtn) nextLightboxBtn.addEventListener('click', showNext);
    if (prevLightboxBtn) prevLightboxBtn.addEventListener('click', showPrev);

    galleryLightbox.addEventListener('click', (e) => {
        if (e.target === galleryLightbox) {
            closeLightbox();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (!galleryLightbox.classList.contains('hidden')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        }
    });
}

// Attach click listeners to project cards to open project popup modal
if (projectCards.length > 0) {
    projectCards.forEach((card) => {
        const projKey = card.getAttribute('data-project');
        if (projKey) {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                openProjectModal(projKey);
            });
        }
    });
}

