// --- NEW: Architectural Blueprint Loader Logic ---
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');

if (loader && loaderBar && loaderPercent) {
    let progress = 0;
    const interval = setInterval(() => {
        // Increment progress with slight randomness for a natural technical feel
        progress += Math.floor(Math.random() * 14) + 6;
        if (progress > 100) progress = 100;

        loaderBar.style.width = `${progress}%`;
        loaderPercent.textContent = `${progress}%`;

        if (progress === 100) {
            clearInterval(interval);
            // Brief pause at 100% before triggering smooth fade-out
            setTimeout(() => {
                loader.classList.add('loader-hidden');
            }, 450);
        }
    }, 60);
}


// --- Background Image Cache & Fast Preloader ---
// Preloads modal & lightbox high-res images in idle time so they appear instantly on click
const preloadedImageCache = new Set();

function preloadImages(imageUrls) {
    if (!Array.isArray(imageUrls)) return;
    imageUrls.forEach(url => {
        if (!url || preloadedImageCache.has(url)) return;
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
        img.onload = () => preloadedImageCache.add(url);
    });
}

// Automatically start warm-up preloading after initial page load (idle time)
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        const schedulePreload = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
        schedulePreload(() => {
            // Collect all project modal images
            const allProjImages = [];
            if (typeof projectData !== 'undefined') {
                Object.values(projectData).forEach(proj => {
                    if (proj.images) {
                        proj.images.forEach(img => allProjImages.push(img.src));
                    }
                });
            }
            preloadImages(allProjImages);
        });
    });
}


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

let currentSelectedService = "3D Modelling";

document.querySelectorAll('.see-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-service');
        const data = serviceData[key];
        if (data && serviceModal) {
            currentSelectedService = key;
            if (modalCategory) modalCategory.textContent = data.category;
            if (modalTitle) modalTitle.textContent = data.title;
            if (modalDesc) modalDesc.textContent = data.desc;
            if (modalDeliverables) modalDeliverables.textContent = data.deliverables;
            if (modalTools) modalTools.textContent = data.tools;
            if (modalAudience) modalAudience.textContent = data.audience;

            serviceModal.classList.remove('hidden');
            serviceModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    });
});

if (closeServiceModal && serviceModal) {
    const hideServiceModal = () => {
        serviceModal.classList.add('hidden');
        serviceModal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    };

    closeServiceModal.addEventListener('click', hideServiceModal);

    serviceModal.addEventListener('click', (e) => {
        if (e.target === serviceModal) {
            hideServiceModal();
        }
    });

    if (modalInquireBtn) {
        modalInquireBtn.addEventListener('click', () => {
            hideServiceModal();
            if (typeof openInquiryModal === 'function') {
                openInquiryModal(currentSelectedService);
            }
        });
    }
}

// --- Project Popup Modal Window Logic & Typology Filtering ---
const projectModal = document.getElementById('project-modal');
const closeProjectModalBtn = document.getElementById('close-project-modal');
const projModalTitle = document.getElementById('proj-modal-title');
const projModalSubtitle = document.getElementById('proj-modal-subtitle');
const projModalLocation = document.getElementById('proj-modal-location');
const projModalArea = document.getElementById('proj-modal-area');
const projModalCategory = document.getElementById('proj-modal-category');
const projModalYear = document.getElementById('proj-modal-year');
const projModalDesc = document.getElementById('proj-modal-desc');
const projModalTypologySpec = document.getElementById('proj-modal-typology-spec');
const projModalToolsSpec = document.getElementById('proj-modal-tools-spec');
const projModalFeatures = document.getElementById('proj-modal-features');
const projModalInquireBtn = document.getElementById('proj-modal-inquire-btn');
const projModalEmptyState = document.getElementById('proj-modal-empty-state');
const projCollage = document.getElementById('proj-collage');
const projPhotoSection = document.getElementById('proj-photo-section');
const projPhotoCount = document.getElementById('proj-photo-count');
const projModalFullLink = document.getElementById('proj-modal-full-link');
const projModalPrevBtn = document.getElementById('proj-modal-prev-btn');
const projModalNextBtn = document.getElementById('proj-modal-next-btn');
const projModalIndexBadge = document.getElementById('proj-modal-index-badge');

let currentProjImages = [];
let openLightboxWithItems;
let currentSelectedProjectKey = 'airport';

// Project datasets mapping project keys to comprehensive architectural specifications and plates
const projectData = {
    "airport": {
        title: "Layag Airport",
        subtitle: "Sangley Point Domestic Airport",
        location: "Sangley Point, Cavite City",
        siteArea: "147 Hectares",
        year: "2024",
        category: "ARCHITECTURE • TERMINAL DESIGN",
        typologySpec: "Civic Aviation & Terminal Infrastructure",
        toolsSpec: "AutoCAD • SketchUp Pro • Enscape • Photoshop",
        features: ["Aerodynamic Sail Canopies", "Departures / Arrivals Separation", "Passive Daylight Optimization", "High-Volume Concourse Flow"],
        desc: "A 147-hectare domestic airport proposal for Sangley Point, Cavite City that harmonizes passenger movement, structural sail canopies, and visual clarity. Inspired by traditional Filipino seafaring vessels ('Layag'), the aerodynamic roof profiles scoop indirect natural illumination into terminal departure halls while shading drop-off lanes. The interior layout enforces clear multi-level vertical circulation separating arrival passenger streams from departures check-in and gate boarding piers.",
        pageUrl: "portfolio/airport/full_project.html",
        images: [
            { src: "portfolio/airport/1.webp", alt: "Layag Airport - Main Terminal Exterior & Runway Perspective", plateTitle: "PLATE 01: Main Terminal Exterior & Runway Perspective" },
            { src: "portfolio/airport/2.webp", alt: "Layag Airport - Roof Structural & Elevation Study", plateTitle: "PLATE 02: Roof Structural Geometry & Elevation Analysis" },
            { src: "portfolio/airport/3.webp", alt: "Layag Airport - Terminal Approach & Circulation Concourse", plateTitle: "PLATE 03: Terminal Approach & Passenger Concourse" },
            { src: "portfolio/airport/4.webp", alt: "Layag Airport - Passenger Departure Lounge Interior", plateTitle: "PLATE 04: Departure Lounge Interior & Gate Access" }
        ]
    },
    "amping": {
        title: "Amping Children's Hospital",
        subtitle: "Specialized Pediatric Healthcare Facility",
        location: "Panglao Island, Bohol",
        siteArea: "5 Hectares",
        year: "2023",
        category: "HEALTHCARE • SPATIAL PLANNING",
        typologySpec: "Specialized Pediatric Healthcare Facility",
        toolsSpec: "AutoCAD • Revit BIM • SketchUp Pro • Lumion 3D",
        features: ["Biophilic Healing Courtyards", "Child-Friendly Intuitive Wayfinding", "Strict Sterile vs Outpatient Zoning", "Direct Emergency Ambulance Triage"],
        desc: "A 5-hectare dedicated pediatric healthcare facility located on Panglao Island, Bohol, centered on gentle circulation, healing garden courtyards, and clinical efficiency. The spatial layout organizes outpatient clinics, sterile operating surgical suites, and emergency response zones with clear, intuitive color-coded wayfinding designed to reduce anxiety for young patients and their families.",
        pageUrl: "portfolio/amping/full_project.html",
        images: [
            { src: "portfolio/amping/1.webp", alt: "Amping Children's Hospital - Main Facade Render", plateTitle: "PLATE 01: Main Facade & Shading Entrance Canopy" },
            { src: "portfolio/amping/2.webp", alt: "Amping Children's Hospital - Aerial Site Development Plan", plateTitle: "PLATE 02: Master Site Development & Healing Courtyard" },
            { src: "portfolio/amping/3.webp", alt: "Amping Children's Hospital - Floor Plan & Circulation Layout", plateTitle: "PLATE 03: Clinical Flow & Outpatient Ward Layout" },
            { src: "portfolio/amping/4.webp", alt: "Amping Children's Hospital - Interior Emergency Ward", plateTitle: "PLATE 04: Pediatric Emergency Ward & Triage Interior" },
            { src: "portfolio/amping/5.webp", alt: "Amping Children's Hospital - Spatial Flow Diagram", plateTitle: "PLATE 05: Infection Control & Functional Adjacency" },
            { src: "portfolio/amping/7.webp", alt: "Amping Children's Hospital - Elevation Study", plateTitle: "PLATE 06: Exterior Solar Louver Elevation & Thermal Buffer" },
            { src: "portfolio/amping/8.webp", alt: "Amping Children's Hospital - Master Site Plan", plateTitle: "PLATE 07: Comprehensive Master Site Plan & Logistics" }
        ]
    },
    "marahuyo": {
        title: "Marahuyo Park",
        subtitle: "Calamba Baywalk Waterfront Promenade",
        location: "Calamba Baywalk, Calamba City",
        siteArea: "1.5 Hectares",
        year: "2024",
        category: "PLANNING • PUBLIC REALM",
        typologySpec: "Coastal Landscape & Community Waterfront Promenade",
        toolsSpec: "AutoCAD • SketchUp Pro • Enscape • Photoshop",
        features: ["Elevated Boardwalk Network", "Native Riparian Bio-Buffers", "Modular Gathering Pavilions", "Coastal Flood-Adaptive Design"],
        desc: "A 1.5-hectare waterfront landscape architecture and master circulation study situated at the Calamba Baywalk in Calamba City, shaped for open community gathering, contemplation, and natural ecology. Features integrated elevated timber boardwalks, flood-resilient coastal edge buffers, native wetland riparian zones, and shaded community gathering pavilions providing panoramic water views.",
        pageUrl: "portfolio/marahuyo/full_project.html",
        images: [
            { src: "portfolio/marahuyo/1.webp", alt: "Marahuyo Park - Waterfront Master Plan", plateTitle: "PLATE 01: Waterfront Master Plan & Ecological Zoning" },
            { src: "portfolio/marahuyo/2.webp", alt: "Marahuyo Park - Park Plan and Elevations", plateTitle: "PLATE 02: Park Master Plan, Elevations & Sectional Relief" },
            { src: "portfolio/marahuyo/3.webp", alt: "Marahuyo Park - Perspective Studies", plateTitle: "PLATE 03: Community Pavilion, Amphitheater & Perspectives" }
        ]
    },
    "marikina": {
        title: "Marikina Riverside Park",
        subtitle: "Urban Riverfront Revitalization & Flood-Resilient Promenade",
        location: "Marikina Riverside",
        siteArea: "1 Hectare",
        year: "2024",
        category: "PLANNING • URBAN RENEWAL",
        typologySpec: "Urban Waterfront Revitalization & Flood-Adaptive Corridor",
        toolsSpec: "AutoCAD • SketchUp Pro • Enscape • Illustrator",
        features: ["Multi-Tiered Flood Terraces", "Continuous Active Mobility Spine", "Amphitheater Water Steps", "Urban Micro-Park Nodes"],
        desc: "A 1-hectare riverfront master plan along the Marikina Riverside highlighting pedestrian mobility, flood-adaptive riverbank conditions, and civic identity. The master plan introduces multi-tiered promenade terraces that absorb seasonal river fluctuations while serving as vibrant civic promenades with active bike lanes, commercial food pods, and scenic overlook plazas during dry months.",
        pageUrl: "portfolio/marikina/full_project.html",
        images: [
            { src: "portfolio/marikina/1.webp", alt: "Marikina Riverside - Riverfront Master Plan", plateTitle: "PLATE 01: Urban Riverfront Master Plan & Mobility Spine" },
            { src: "portfolio/marikina/2.webp", alt: "Marikina Riverside - Site Development Plan", plateTitle: "PLATE 02: Stepped Promenade Site Plan & Sections" },
            { src: "portfolio/marikina/3.webp", alt: "Marikina Riverside - Design Strategy Board", plateTitle: "PLATE 03: Design Strategy, Flood Zones & Active Plazas" },
            { src: "portfolio/marikina/4.webp", alt: "Marikina Riverside - Landscape Perspective Studies", plateTitle: "PLATE 04: Riverbank Amphitheater & Walkway Perspectives" }
        ]
    },
    "subdivision": {
        title: "Hinabi Heights Subdivision",
        subtitle: "Master-Planned Mountain Residential Community",
        location: "Manggahan, General Trias, Cavite",
        siteArea: "3.5 Hectares",
        year: "2024",
        category: "RESIDENTIAL • SITE PLANNING",
        typologySpec: "Master-Planned Mountain Residential Community",
        toolsSpec: "AutoCAD Civil • SketchUp Pro • Enscape • Photoshop",
        features: ["Hierarchical Collector Road Grid", "Central Community Clubhouse & Parks", "Topographic Cut & Fill Adaptation", "Integrated Storm Runoff Retention"],
        desc: "A 3.5-hectare master-planned residential community in Manggahan, General Trias, Cavite, organized around neighborhood livability, road hierarchy, and environmental sustainability. Includes standardized residential lotting layouts, interconnected greenway corridors, community recreation hubs, swimming nodes, and engineered topographic cut-and-fill slope grading with sustainable storm retention routing.",
        pageUrl: "portfolio/subdivision/full_project.html",
        images: [
            { src: "portfolio/subdivision/PAGE 1.webp", alt: "Hinabi Heights Subdivision - Master Planning Board", plateTitle: "PLATE 01: Master Subdivision Lotting & Road Infrastructure" },
            { src: "portfolio/subdivision/PAGE 2.webp", alt: "Hinabi Heights Subdivision - Residential Plans and Perspectives", plateTitle: "PLATE 02: Residential Streetscape & Housing Typology Models" },
            { src: "portfolio/subdivision/PAGE 3.webp", alt: "Hinabi Heights Subdivision - Housing Design Studies", plateTitle: "PLATE 03: Community Amenity Node & Clubhouse Design" },
            { src: "portfolio/subdivision/PAGE 4.webp", alt: "Hinabi Heights Subdivision - Site and Unit Development", plateTitle: "PLATE 04: Topographic Slope Analysis & Drainage Flow" }
        ]
    },
    "plaza": {
        title: "Jagna De Plaza",
        subtitle: "Historic Town Center Civic Plaza Revitalization",
        location: "Población, Jagna, Bohol",
        siteArea: "5,200 sqm",
        year: "2024",
        category: "PLANNING • CIVIC SPACE",
        typologySpec: "Historic Town Center Civic Plaza Revitalization",
        toolsSpec: "AutoCAD • Hand Conceptual Sketches • Adobe Photoshop",
        features: ["Modular Tensile Canopy Architecture", "Civic Assembly & Event Concourse", "Pedestrian-First Urban Spine", "Heritage Market & Activity Zones"],
        desc: "A 5,200 sqm comprehensive civic plaza revitalization study in Población, Jagna, Bohol, focused on public gathering, civic pride, and shaded outdoor comfort. The proposal incorporates modular seating, architectural canopy structures, pedestrianized promenades, water monument anchor nodes, and dedicated zones for local heritage events and weekend markets.",
        pageUrl: "portfolio/plaza/full_project.html",
        images: [
            { src: "portfolio/plaza/plaza.webp", alt: "Jagna De Plaza - Architectural Site Plan & Flow", plateTitle: "PLATE 01: Comprehensive Master Site Plan & Civic Concourse Study" }
        ]
    }
};

const projectKeyList = ["airport", "amping", "marahuyo", "marikina", "subdivision", "plaza"];
let currentProjectIndex = 0;

function updateProjectModalByIndex(index) {
    if (index < 0) index = projectKeyList.length - 1;
    if (index >= projectKeyList.length) index = 0;
    currentProjectIndex = index;
    const projKey = projectKeyList[currentProjectIndex];
    openProjectModal(projKey);
}

function openProjectModal(projKey) {
    const data = projectData[projKey];
    if (!data || !projectModal) return;

    currentSelectedProjectKey = projKey;
    currentProjectIndex = projectKeyList.indexOf(projKey);
    if (currentProjectIndex === -1) currentProjectIndex = 0;

    // Preload next and previous project images immediately in the background
    const prevKey = projectKeyList[(currentProjectIndex - 1 + projectKeyList.length) % projectKeyList.length];
    const nextKey = projectKeyList[(currentProjectIndex + 1) % projectKeyList.length];
    if (projectData[prevKey]?.images) preloadImages(projectData[prevKey].images.map(i => i.src));
    if (projectData[nextKey]?.images) preloadImages(projectData[nextKey].images.map(i => i.src));

    if (projModalIndexBadge) {
        projModalIndexBadge.textContent = `${String(currentProjectIndex + 1).padStart(2, '0')} / ${String(projectKeyList.length).padStart(2, '0')}`;
    }

    if (projModalTitle) projModalTitle.textContent = data.title;
    if (projModalSubtitle) {
        projModalSubtitle.textContent = data.subtitle || '';
        projModalSubtitle.classList.toggle('hidden', !data.subtitle);
    }
    if (projModalLocation) {
        projModalLocation.innerHTML = `<i class="ph ph-map-pin text-accent"></i> <span>${data.location || 'Cavite, Philippines'}</span>`;
    }
    if (projModalArea) {
        projModalArea.textContent = data.siteArea || 'N/A';
    }
    if (projModalCategory) projModalCategory.textContent = data.category;
    if (projModalYear) projModalYear.textContent = data.year;
    if (projModalDesc) projModalDesc.textContent = data.desc;
    if (projModalTypologySpec) projModalTypologySpec.textContent = data.typologySpec || data.category;
    if (projModalToolsSpec) projModalToolsSpec.textContent = data.toolsSpec || 'AutoCAD • SketchUp • Photoshop';
    
    // Render key architectural feature pills
    if (projModalFeatures) {
        projModalFeatures.innerHTML = '';
        const features = data.features || [];
        features.forEach(feat => {
            const pill = document.createElement('span');
            pill.className = 'inline-block bg-studio-800 border border-studio-700 text-studio-200 px-2 py-0.5 text-[10px] whitespace-nowrap hover:border-accent transition-colors';
            pill.textContent = feat;
            projModalFeatures.appendChild(pill);
        });
    }

    if (projModalFullLink) projModalFullLink.setAttribute('href', data.pageUrl);

    currentProjImages = data.images || [];

    // Preload current project's full images
    preloadImages(currentProjImages.map(i => i.src));

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
            btn.className = `group relative ${collageTileWidth} flex-grow aspect-[16/10] overflow-hidden border border-studio-700 hover:border-accent transition-all hover-trigger cursor-pointer bg-studio-900`;
            btn.setAttribute('aria-label', `Open ${img.plateTitle || img.alt}`);
            
            const plateLabel = `PLATE ${String(idx + 1).padStart(2, '0')}`;
            const shortCaption = img.plateTitle ? img.plateTitle.replace(/^PLATE \d+:\s*/i, '') : img.alt;

            // Build responsive image tile with plate badge and hover caption
            btn.innerHTML = `
                <div class="absolute inset-0 bg-studio-800/80 animate-pulse modal-img-skeleton pointer-events-none"></div>
                <img src="${img.src}" alt="${img.alt}" loading="eager" decoding="async" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-0 modal-thumb-img">
                
                <!-- Plate index tag badge -->
                <div class="absolute top-2 left-2 z-10 bg-studio-900/90 border border-studio-700 text-accent font-mono text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold shadow-md">
                    ${plateLabel}
                </div>

                <!-- Hover overlay with expansion icon and caption -->
                <div class="absolute inset-0 flex flex-col justify-between p-3 bg-studio-900/0 group-hover:bg-studio-900/60 transition-all duration-200">
                    <div class="flex justify-end">
                        <span class="w-7 h-7 rounded-none bg-accent/90 text-studio-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <i class="ph ph-magnifying-glass-plus text-sm"></i>
                        </span>
                    </div>
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                        <p class="font-mono text-[10px] text-studio-100 font-bold truncate bg-studio-900/95 border border-studio-700 px-2 py-1">${shortCaption}</p>
                    </div>
                </div>`;
            
            const thumbImg = btn.querySelector('.modal-thumb-img');
            const skeleton = btn.querySelector('.modal-img-skeleton');
            
            if (thumbImg) {
                if (thumbImg.complete) {
                    thumbImg.classList.remove('opacity-0');
                    if (skeleton) skeleton.remove();
                } else {
                    thumbImg.onload = () => {
                        thumbImg.classList.remove('opacity-0');
                        if (skeleton) skeleton.remove();
                    };
                }
            }

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
    if (projModalPrevBtn) {
        projModalPrevBtn.addEventListener('click', () => {
            updateProjectModalByIndex(currentProjectIndex - 1);
        });
    }
    if (projModalNextBtn) {
        projModalNextBtn.addEventListener('click', () => {
            updateProjectModalByIndex(currentProjectIndex + 1);
        });
    }
    if (projModalInquireBtn) {
        projModalInquireBtn.addEventListener('click', () => {
            const currentProj = projectData[currentSelectedProjectKey];
            closeProjectModal();
            if (typeof openInquiryModal === 'function') {
                openInquiryModal(currentProj ? currentProj.title : 'Architectural Design');
            }
        });
    }

    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        const lightboxIsOpen = galleryLightbox && !galleryLightbox.classList.contains('hidden');
        if (!projectModal.classList.contains('hidden') && !lightboxIsOpen) {
            if (e.key === 'Escape') closeProjectModal();
            if (e.key === 'ArrowLeft') updateProjectModalByIndex(currentProjectIndex - 1);
            if (e.key === 'ArrowRight') updateProjectModalByIndex(currentProjectIndex + 1);
        }
    });
}

// --- Gallery Filtering, Pagination (See More) & Lightbox Logic ---
const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
const galleryItemsList = document.querySelectorAll('.gallery-item');
const galleryEmptyState = document.getElementById('gallery-empty-state');
const gallerySeeMoreContainer = document.getElementById('gallery-see-more-container');
const gallerySeeMoreBtn = document.getElementById('gallery-see-more-btn');
const gallerySeeMoreText = document.getElementById('gallery-see-more-text');
const gallerySeeMoreIcon = document.getElementById('gallery-see-more-icon');
const projectCards = document.querySelectorAll('.project-card');
const galleryLightbox = document.getElementById('gallery-lightbox');
const closeLightboxBtn = document.getElementById('close-lightbox-btn');
const prevLightboxBtn = document.getElementById('prev-lightbox-btn');
const nextLightboxBtn = document.getElementById('next-lightbox-btn');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxZoomBtn = document.getElementById('lightbox-zoom-btn');
const lightboxViewport = document.getElementById('lightbox-viewport');

let isLightboxZoomed = false;

const toggleLightboxZoom = () => {
    if (!lightboxImg) return;
    isLightboxZoomed = !isLightboxZoomed;
    lightboxImg.classList.toggle('is-zoomed', isLightboxZoomed);
    if (lightboxZoomBtn) {
        lightboxZoomBtn.innerHTML = isLightboxZoomed
            ? '<i class="ph ph-magnifying-glass-minus text-base"></i> <span class="hidden md:inline">FIT</span>'
            : '<i class="ph ph-magnifying-glass-plus text-base"></i> <span class="hidden md:inline">ZOOM</span>';
    }
};

const resetLightboxZoom = () => {
    isLightboxZoomed = false;
    if (lightboxImg) {
        lightboxImg.classList.remove('is-zoomed');
    }
    if (lightboxZoomBtn) {
        lightboxZoomBtn.innerHTML = '<i class="ph ph-magnifying-glass-plus text-base"></i> <span class="hidden md:inline">ZOOM</span>';
    }
};

const INITIAL_ALL_LIMIT = 10;
let isGalleryExpanded = false;
let galleryItems = [];
let currentGalleryIndex = 0;
let currentFilter = 'all';

// Function to get all currently visible gallery items
function getVisibleGalleryItems() {
    const visibleCards = [];
    galleryItemsList.forEach((item) => {
        if (!item.classList.contains('gallery-item-hidden')) {
            const img = item.querySelector('img');
            const captionElem = item.querySelector('p');
            if (img) {
                visibleCards.push({
                    element: item,
                    src: img.getAttribute('src'),
                    alt: img.getAttribute('alt') || captionElem?.textContent || 'Gallery Artwork'
                });
            }
        }
    });
    return visibleCards;
}

// Function to filter gallery items and manage see more visibility
function filterGallery(filterCategory, preserveExpandState = false) {
    currentFilter = filterCategory;
    if (!preserveExpandState && filterCategory !== 'all') {
        isGalleryExpanded = false;
    }

    let matchingCount = 0;
    let visibleCount = 0;

    // Update filter buttons appearance
    galleryFilterBtns.forEach((btn) => {
        const btnFilter = btn.getAttribute('data-filter');
        if (btnFilter === filterCategory) {
            btn.classList.add('active');
            btn.classList.remove('text-studio-400');
            btn.classList.add('text-studio-100');
        } else {
            btn.classList.remove('active');
            btn.classList.remove('text-studio-100');
            btn.classList.add('text-studio-400');
        }
    });

    // Show/hide gallery items
    galleryItemsList.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');
        const matchesCategory = (filterCategory === 'all' || itemCategory === filterCategory);

        if (matchesCategory) {
            matchingCount++;
            const shouldShow = (filterCategory !== 'all') || isGalleryExpanded || (matchingCount <= INITIAL_ALL_LIMIT);

            if (shouldShow) {
                item.classList.remove('gallery-item-hidden');
                item.classList.add('is-active');
                item.classList.remove('gallery-item-fadeout');
                item.classList.add('gallery-item-fadein');
                visibleCount++;
            } else {
                item.classList.add('gallery-item-fadeout');
                item.classList.remove('gallery-item-fadein');
                item.classList.add('gallery-item-hidden');
            }
        } else {
            item.classList.add('gallery-item-fadeout');
            item.classList.remove('gallery-item-fadein');
            item.classList.add('gallery-item-hidden');
        }
    });

    // Handle See More button state
    if (gallerySeeMoreContainer && gallerySeeMoreBtn && gallerySeeMoreText && gallerySeeMoreIcon) {
        if (filterCategory === 'all' && matchingCount > INITIAL_ALL_LIMIT) {
            gallerySeeMoreContainer.classList.remove('hidden');
            if (isGalleryExpanded) {
                gallerySeeMoreText.textContent = 'Show Less Works';
                gallerySeeMoreIcon.className = 'ph ph-arrow-up text-base text-accent group-hover:-translate-y-1 transition-transform';
            } else {
                const remaining = matchingCount - INITIAL_ALL_LIMIT;
                gallerySeeMoreText.textContent = `Load More Works (${remaining} Remaining)`;
                gallerySeeMoreIcon.className = 'ph ph-arrow-down text-base text-accent group-hover:translate-y-1 transition-transform';
            }
        } else {
            gallerySeeMoreContainer.classList.add('hidden');
        }
    }

    if (galleryEmptyState) {
        if (visibleCount === 0) {
            galleryEmptyState.classList.remove('hidden');
        } else {
            galleryEmptyState.classList.add('hidden');
        }
    }
}

// Attach click listeners to filter buttons
if (galleryFilterBtns.length > 0) {
    galleryFilterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter') || 'all';
            filterGallery(filter, false);
        });
    });
}

// Attach click listener to See More button
if (gallerySeeMoreBtn) {
    gallerySeeMoreBtn.addEventListener('click', () => {
        if (isGalleryExpanded) {
            isGalleryExpanded = false;
            filterGallery('all', true);
            const allWorksSection = document.getElementById('all-works');
            if (allWorksSection) {
                allWorksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            isGalleryExpanded = true;
            filterGallery('all', true);
        }
    });
}

// Initial gallery filtering setup
filterGallery('all', false);

if (galleryLightbox) {
    openLightboxWithItems = (items, startIndex = 0) => {
        galleryItems = items;
        currentGalleryIndex = startIndex;
        resetLightboxZoom();
        updateLightboxContent();
        galleryLightbox.classList.remove('hidden');
        galleryLightbox.classList.add('flex');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        resetLightboxZoom();
        galleryLightbox.classList.add('hidden');
        galleryLightbox.classList.remove('flex');
        document.body.style.overflow = projectModal && !projectModal.classList.contains('hidden') ? 'hidden' : 'auto';
    };

    const updateLightboxContent = () => {
        if (!galleryItems[currentGalleryIndex]) return;
        const item = galleryItems[currentGalleryIndex];
        resetLightboxZoom();
        
        // Immediately preload adjacent images (prev & next) in the background
        if (galleryItems.length > 1) {
            const nextIdx = (currentGalleryIndex + 1) % galleryItems.length;
            const prevIdx = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
            if (galleryItems[nextIdx]) preloadImages([galleryItems[nextIdx].src]);
            if (galleryItems[prevIdx]) preloadImages([galleryItems[prevIdx].src]);
        }

        if (lightboxImg) {
            lightboxImg.decoding = 'async';
            lightboxImg.loading = 'eager';
            lightboxImg.src = item.src;
            lightboxImg.alt = item.plateTitle || item.alt || 'Architectural Plate';
            lightboxImg.style.opacity = '1';
        }
        if (lightboxCaption) {
            lightboxCaption.innerHTML = item.plateTitle 
                ? `<span class="text-accent font-bold">${item.plateTitle.split(':')[0]}:</span> <span class="text-studio-100">${item.plateTitle.split(':').slice(1).join(':') || item.alt}</span>`
                : `<span class="text-studio-100 font-bold">${item.alt}</span>`;
        }
        if (lightboxCounter) {
            lightboxCounter.textContent = `${String(currentGalleryIndex + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
        }
    };

    // Attach click & hover preloader listeners to gallery cards with filtered context
    galleryItemsList.forEach((item) => {
        const card = item.querySelector('.gallery-card');
        if (card) {
            card.addEventListener('pointerenter', () => {
                const img = item.querySelector('img');
                if (img) {
                    const src = img.getAttribute('src');
                    if (src) preloadImages([src]);
                }
            }, { passive: true });

            card.addEventListener('click', () => {
                const currentVisible = getVisibleGalleryItems();
                const clickedIndex = currentVisible.findIndex(v => v.element === item);
                if (clickedIndex !== -1) {
                    openLightboxWithItems(currentVisible, clickedIndex);
                }
            });
        }
    });

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
    if (lightboxZoomBtn) lightboxZoomBtn.addEventListener('click', toggleLightboxZoom);
    if (lightboxImg) lightboxImg.addEventListener('click', toggleLightboxZoom);

    galleryLightbox.addEventListener('click', (e) => {
        if (e.target === galleryLightbox || e.target === lightboxViewport) {
            closeLightbox();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (!galleryLightbox.classList.contains('hidden')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key.toLowerCase() === 'z') toggleLightboxZoom();
        }
    });
}

// Attach click and hover-preloader listeners to project cards to open project popup modal instantly
if (projectCards.length > 0) {
    projectCards.forEach((card) => {
        const projKey = card.getAttribute('data-project');
        if (projKey) {
            // Preload images on mouse hover / touch start so opening is instant
            card.addEventListener('pointerenter', () => {
                if (projectData[projKey]?.images) {
                    preloadImages(projectData[projKey].images.map(i => i.src));
                }
            }, { passive: true });

            card.addEventListener('click', (e) => {
                e.preventDefault();
                openProjectModal(projKey);
            });
        }
    });
}

// --- Typology Filtering for Projects Section ---
const projectFilterBtns = document.querySelectorAll('.project-filter-btn');
const projectEmptyState = document.getElementById('project-empty-state');

function filterProjects(typology) {
    let visibleCount = 0;

    projectFilterBtns.forEach(btn => {
        const btnTypology = btn.getAttribute('data-typology');
        if (btnTypology === typology) {
            btn.classList.add('active', 'text-studio-100');
            btn.classList.remove('text-studio-400');
            const countBadge = btn.querySelector('.proj-filter-count');
            if (countBadge) {
                countBadge.classList.add('text-studio-200');
                countBadge.classList.remove('text-studio-400');
            }
        } else {
            btn.classList.remove('active', 'text-studio-100');
            btn.classList.add('text-studio-400');
            const countBadge = btn.querySelector('.proj-filter-count');
            if (countBadge) {
                countBadge.classList.remove('text-studio-200');
                countBadge.classList.add('text-studio-400');
            }
        }
    });

    projectCards.forEach(card => {
        const cardTypology = card.getAttribute('data-typology');
        const matches = (typology === 'all' || cardTypology === typology);

        if (matches) {
            card.classList.remove('hidden');
            card.classList.add('flex');
            visibleCount++;
        } else {
            card.classList.add('hidden');
            card.classList.remove('flex');
        }
    });

    if (projectEmptyState) {
        if (visibleCount === 0) {
            projectEmptyState.classList.remove('hidden');
        } else {
            projectEmptyState.classList.add('hidden');
        }
    }
}

if (projectFilterBtns.length > 0) {
    projectFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const typ = btn.getAttribute('data-typology') || 'all';
            filterProjects(typ);
        });
    });
}

// --- Interactive Commission Inquiry Modal Logic ---
const inquiryModal = document.getElementById('inquiry-modal');
const closeInquiryModalBtn = document.getElementById('close-inquiry-modal');
const openInquiryDirectBtn = document.getElementById('open-inquiry-direct-btn');
const inquiryForm = document.getElementById('inquiry-form');
const inqClientName = document.getElementById('inq-client-name');
const inqClientContact = document.getElementById('inq-client-contact');
const inqServiceType = document.getElementById('inq-service-type');
const inqTypology = document.getElementById('inq-typology');
const inqTimeline = document.getElementById('inq-timeline');
const inqNotes = document.getElementById('inq-notes');
const inqCopyBtn = document.getElementById('inq-copy-btn');
const inquiryToast = document.getElementById('inquiry-toast');
const inquiryToastMsg = document.getElementById('inquiry-toast-msg');

let toastTimer = null;

function showInquiryToast(msg) {
    if (!inquiryToast || !inquiryToastMsg) return;
    inquiryToastMsg.textContent = msg;
    inquiryToast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        inquiryToast.classList.add('hidden');
    }, 4000);
}

function getFormattedInquiryBrief() {
    const name = inqClientName ? inqClientName.value.trim() || 'Client' : 'Client';
    const contact = inqClientContact ? inqClientContact.value.trim() || 'Not specified' : 'Not specified';
    const service = inqServiceType ? inqServiceType.value : 'Architectural Commission';
    const typology = inqTypology ? inqTypology.value : 'General';
    const timeline = inqTimeline ? inqTimeline.value : 'Standard';
    const notes = inqNotes ? inqNotes.value.trim() : '';

    return `[COMMISSION INQUIRY BRIEF]
------------------------------------
• Client/Studio: ${name}
• Contact/Handle: ${contact}
• Requested Scope: ${service}
• Project Typology: ${typology}
• Target Timeline: ${timeline}
• Scope Notes & Links:
${notes ? notes : '(No additional notes provided)'}
------------------------------------
Recipient: Marjo Paguia <norioniomarjo@gmail.com>`;
}

function openInquiryModal(preselectedService) {
    if (!inquiryModal) return;
    if (preselectedService && inqServiceType) {
        // Try to match option
        const options = Array.from(inqServiceType.options);
        const match = options.find(opt => opt.value.toLowerCase().includes(preselectedService.toLowerCase()) || preselectedService.toLowerCase().includes(opt.value.toLowerCase()));
        if (match) {
            inqServiceType.value = match.value;
        }
    }
    inquiryModal.classList.remove('hidden');
    inquiryModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeInquiryModal() {
    if (!inquiryModal) return;
    inquiryModal.classList.add('hidden');
    inquiryModal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

if (inquiryModal) {
    if (closeInquiryModalBtn) closeInquiryModalBtn.addEventListener('click', closeInquiryModal);
    if (openInquiryDirectBtn) {
        openInquiryDirectBtn.addEventListener('click', () => openInquiryModal('Full Comprehensive Package'));
    }

    inquiryModal.addEventListener('click', (e) => {
        if (e.target === inquiryModal) closeInquiryModal();
    });

    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const service = inqServiceType ? inqServiceType.value : 'Commission';
            const name = inqClientName ? inqClientName.value.trim() : 'Client';
            const subject = encodeURIComponent(`[Commission Brief] ${service} - ${name}`);
            const body = encodeURIComponent(getFormattedInquiryBrief());
            
            showInquiryToast('[BRIEF PREPARED — LAUNCHING EMAIL CLIENT]');
            
            setTimeout(() => {
                window.location.href = `mailto:norioniomarjo@gmail.com?subject=${subject}&body=${body}`;
            }, 600);
        });
    }

    if (inqCopyBtn) {
        inqCopyBtn.addEventListener('click', () => {
            const brief = getFormattedInquiryBrief();
            navigator.clipboard.writeText(brief).then(() => {
                showInquiryToast('[BRIEF COPIED TO CLIPBOARD — PASTE DIRECTLY IN DMs / EMAIL]');
            }).catch(() => {
                showInquiryToast('[COPY FAILED — PLEASE MANUALLY SELECT TEXT]');
            });
        });
    }

    window.addEventListener('keydown', (e) => {
        if (!inquiryModal.classList.contains('hidden') && e.key === 'Escape') {
            closeInquiryModal();
        }
    });
}

// --- Architectural CV & Resume Sheet Modal Logic ---
const cvModal = document.getElementById('cv-modal');
const cvSheetContainer = document.getElementById('cv-sheet-container');
const closeCvModalBtn = document.getElementById('close-cv-modal');
const openCvBtn = document.getElementById('open-cv-btn');
const specsCvBtn = document.getElementById('specs-cv-btn');
const cvPrintBtn = document.getElementById('cv-print-btn');
const cvDownloadPngBtn = document.getElementById('cv-download-png-btn');
const cvDownloadBtnText = document.getElementById('cv-download-btn-text');
const cvThemeModeBtns = document.querySelectorAll('.cv-theme-mode-btn');
const cvOrientBtns = document.querySelectorAll('.cv-orient-btn');
const cvSheetIdLabel = document.getElementById('cv-sheet-id-label');

let currentCvThemeMode = 'auto'; // 'auto', 'light', 'dark'
let currentCvOrientation = 'portrait'; // 'portrait', 'landscape'

function setCvOrientation(orientation) {
    currentCvOrientation = orientation;

    // Update active button state
    cvOrientBtns.forEach(btn => {
        const btnOrient = btn.getAttribute('data-cv-orient');
        if (btnOrient === orientation) {
            btn.classList.add('active', 'text-studio-100', 'bg-studio-700');
            btn.classList.remove('text-studio-400');
        } else {
            btn.classList.remove('active', 'text-studio-100', 'bg-studio-700');
            btn.classList.add('text-studio-400');
        }
    });

    // Update container classes
    if (cvSheetContainer) {
        cvSheetContainer.classList.remove('cv-orient-portrait', 'cv-orient-landscape');
        cvSheetContainer.classList.add(`cv-orient-${orientation}`);
    }

    // Update sheet ID stamp
    if (cvSheetIdLabel) {
        if (orientation === 'landscape') {
            cvSheetIdLabel.textContent = 'ARCH-CV-01-L (A4 LANDSCAPE)';
        } else {
            cvSheetIdLabel.textContent = 'ARCH-CV-01-P (A4 PORTRAIT)';
        }
    }

    // Update button text hint
    if (cvDownloadBtnText) {
        cvDownloadBtnText.textContent = orientation === 'landscape' ? 'Download A4 PNG (Landscape)' : 'Download A4 PNG';
    }

    // Update body print orientation class
    if (orientation === 'landscape') {
        document.body.classList.add('cv-print-landscape');
    } else {
        document.body.classList.remove('cv-print-landscape');
    }
}

function setCvThemeMode(mode) {
    currentCvThemeMode = mode;

    // Update active button state
    cvThemeModeBtns.forEach(btn => {
        const btnMode = btn.getAttribute('data-cv-mode');
        if (btnMode === mode) {
            btn.classList.add('active', 'text-studio-100', 'bg-studio-700');
            btn.classList.remove('text-studio-400');
            const icon = btn.querySelector('i');
            if (icon && !icon.classList.contains('text-accent')) {
                icon.classList.add('text-accent');
            }
        } else {
            btn.classList.remove('active', 'text-studio-100', 'bg-studio-700');
            btn.classList.add('text-studio-400');
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('text-accent');
            }
        }
    });

    // Apply class to CV sheet container
    if (cvSheetContainer) {
        cvSheetContainer.classList.remove('cv-theme-auto', 'cv-theme-light', 'cv-theme-dark');
        if (mode === 'light') {
            cvSheetContainer.classList.add('cv-theme-light');
        } else if (mode === 'dark') {
            cvSheetContainer.classList.add('cv-theme-dark');
        } else {
            cvSheetContainer.classList.add('cv-theme-auto');
        }
    }
}

function exportCvAsA4Png() {
    if (!cvSheetContainer) return;

    if (typeof html2canvas === 'undefined') {
        alert("Preparing rendering engine... Please try again in a second.");
        return;
    }

    const downloadBtn = document.getElementById('cv-download-png-btn');
    const originalBtnHTML = downloadBtn ? downloadBtn.innerHTML : '';
    const isLandscape = currentCvOrientation === 'landscape';

    if (downloadBtn) {
        downloadBtn.innerHTML = `<i class="ph ph-spinner animate-spin text-base"></i><span>RENDERING ${isLandscape ? 'LANDSCAPE' : 'PORTRAIT'} PNG...</span>`;
        downloadBtn.disabled = true;
    }

    // Determine current active mode (if auto, check document class)
    const isDocDark = document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light');
    let effectiveTheme = currentCvThemeMode;
    if (effectiveTheme === 'auto') {
        effectiveTheme = isDocDark ? 'dark' : 'light';
    }

    // Clone the container for clean off-screen A4 canvas rendering
    const clone = cvSheetContainer.cloneNode(true);
    
    // A4 Standard Dimensions at 96 DPI: 
    // Portrait: 820px x 1160px | Landscape: 1160px x 820px
    const targetA4Width = isLandscape ? 1160 : 820; 
    const targetA4Height = isLandscape ? 820 : 1160;

    clone.id = 'cv-export-clone';
    clone.style.width = `${targetA4Width}px`;
    clone.style.height = `${targetA4Height}px`;
    clone.style.minHeight = `${targetA4Height}px`;
    clone.style.maxHeight = `${targetA4Height}px`;
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.zIndex = '-1000';
    clone.style.margin = '0';
    clone.style.padding = isLandscape ? '24px 28px' : '26px 30px';
    clone.style.boxSizing = 'border-box';
    clone.style.borderRadius = '0';
    clone.style.overflow = 'hidden';
    clone.style.display = 'flex';
    clone.style.flexDirection = 'column';
    clone.style.justifyContent = 'space-between';

    // Remove buttons & interactive controls from the export clone
    const cloneOrientSel = clone.querySelector('#cv-orient-selector');
    if (cloneOrientSel) cloneOrientSel.remove();
    const cloneThemeSel = clone.querySelector('#cv-theme-selector');
    if (cloneThemeSel) cloneThemeSel.remove();
    const clonePrintBtn = clone.querySelector('#cv-print-btn');
    if (clonePrintBtn) clonePrintBtn.remove();
    const cloneDlBtn = clone.querySelector('#cv-download-png-btn');
    if (cloneDlBtn) cloneDlBtn.remove();
    const cloneCloseBtn = clone.querySelector('#close-cv-modal');
    if (cloneCloseBtn) cloneCloseBtn.remove();

    // Apply color theme explicitly to the export clone
    if (effectiveTheme === 'light') {
        clone.classList.remove('cv-theme-auto', 'cv-theme-dark');
        clone.classList.add('cv-theme-light');
        clone.style.backgroundColor = '#ffffff';
        clone.style.color = '#0f172a';
        clone.style.borderColor = '#cbd5e1';
    } else {
        clone.classList.remove('cv-theme-auto', 'cv-theme-light');
        clone.classList.add('cv-theme-dark');
        clone.style.backgroundColor = '#121212';
        clone.style.color = '#f1f5f9';
        clone.style.borderColor = '#27272a';
    }

    document.body.appendChild(clone);

    // Render using html2canvas at scale 2 for ultra crisp text and photo
    html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: effectiveTheme === 'light' ? '#ffffff' : '#121212',
        logging: false,
        windowWidth: targetA4Width,
        width: targetA4Width
    }).then(canvas => {
        // Remove temporary clone from DOM
        document.body.removeChild(clone);

        // Convert canvas to downloadable PNG
        const imageURI = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        const orientTag = isLandscape ? 'LANDSCAPE' : 'PORTRAIT';
        link.download = `Marjo_Paguia_Architectural_CV_${effectiveTheme.toUpperCase()}_A4_${orientTag}_${timestamp}.png`;
        link.href = imageURI;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (downloadBtn) {
            downloadBtn.innerHTML = `<i class="ph ph-check-circle text-base"></i><span>SAVED PNG!</span>`;
            setTimeout(() => {
                downloadBtn.innerHTML = originalBtnHTML;
                downloadBtn.disabled = false;
            }, 2500);
        }

        if (typeof showInquiryToast === 'function') {
            showInquiryToast(`ARCHITECTURAL CV EXPORTED AS A4 ${orientTag} PNG (${effectiveTheme.toUpperCase()} MODE)`);
        }
    }).catch(err => {
        console.error('CV PNG Generation Error:', err);
        if (clone.parentNode) {
            document.body.removeChild(clone);
        }
        if (downloadBtn) {
            downloadBtn.innerHTML = originalBtnHTML;
            downloadBtn.disabled = false;
        }
        alert("Failed to export image. You can also use the Print button to save as PDF or image.");
    });
}

function openCvModal() {
    if (!cvModal) return;
    cvModal.classList.remove('hidden');
    cvModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeCvModal() {
    if (!cvModal) return;
    cvModal.classList.add('hidden');
    cvModal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

if (cvModal) {
    if (openCvBtn) openCvBtn.addEventListener('click', openCvModal);
    if (specsCvBtn) specsCvBtn.addEventListener('click', openCvModal);
    if (closeCvModalBtn) closeCvModalBtn.addEventListener('click', closeCvModal);
    
    cvOrientBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const orient = btn.getAttribute('data-cv-orient') || 'portrait';
            setCvOrientation(orient);
        });
    });

    cvThemeModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-cv-mode') || 'auto';
            setCvThemeMode(mode);
        });
    });

    if (cvDownloadPngBtn) {
        cvDownloadPngBtn.addEventListener('click', exportCvAsA4Png);
    }

    if (cvPrintBtn) {
        cvPrintBtn.addEventListener('click', () => {
            window.print();
        });
    }

    cvModal.addEventListener('click', (e) => {
        if (e.target === cvModal) closeCvModal();
    });

    window.addEventListener('keydown', (e) => {
        if (!cvModal.classList.contains('hidden') && e.key === 'Escape') {
            closeCvModal();
        }
    });
}

// --- NEW: Services Milestones Counter Animation ---
const milestonesGrid = document.getElementById('milestones-grid');
const milestoneCounters = document.querySelectorAll('.milestone-counter');

if (milestonesGrid && milestoneCounters.length > 0) {
    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800; // Animation duration in milliseconds
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for natural deceleration as it nears the target number
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOut * target);

            el.textContent = `${currentVal}${progress === 1 ? suffix : ''}`;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                el.textContent = `${target}${suffix}`;
            }
        };

        requestAnimationFrame(updateNumber);
    };

    const milestoneObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                milestoneCounters.forEach(counter => animateCounter(counter));
                observer.unobserve(entry.target); // Runs only once per page load
            }
        });
    }, {
        threshold: 0.35 // Triggers when 35% of the milestones bar is visible
    });

    milestoneObserver.observe(milestonesGrid);
}






// --- NEW: Testimonials Auto-Scroll, Drag-to-Scroll & Mouse Wheel ---
const testimonialsTrack = document.getElementById('testimonials-track');

if (testimonialsTrack) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let isHovered = false;
    let autoScrollSpeed = 0.6; // Adjust lower for slower, higher for faster
    let animationFrameId;

    // 1. Automatic Slow Scrolling
    const startAutoScroll = () => {
        const scroll = () => {
            if (!isHovered && !isDown) {
                testimonialsTrack.scrollLeft += autoScrollSpeed;
                
                // Optional: Loop back to start when reaching the end
                if (testimonialsTrack.scrollLeft >= (testimonialsTrack.scrollWidth - testimonialsTrack.clientWidth - 1)) {
                    testimonialsTrack.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };
        animationFrameId = requestAnimationFrame(scroll);
    };

    // Pause auto-scroll when hovering over the testimonials section
    testimonialsTrack.addEventListener('mouseenter', () => { isHovered = true; });
    testimonialsTrack.addEventListener('mouseleave', () => { 
        isHovered = false; 
        isDown = false;
    });

    // 2. Click-and-Drag (Grab to Scroll)
    testimonialsTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        testimonialsTrack.classList.add('cursor-grabbing');
        testimonialsTrack.classList.remove('cursor-grab');
        startX = e.pageX - testimonialsTrack.offsetLeft;
        scrollLeft = testimonialsTrack.scrollLeft;
    });

    testimonialsTrack.addEventListener('mouseup', () => {
        isDown = false;
        testimonialsTrack.classList.remove('cursor-grabbing');
        testimonialsTrack.classList.add('cursor-grab');
    });

    testimonialsTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - testimonialsTrack.offsetLeft;
        const walk = (x - startX) * 1.5; // Drag sensitivity multiplier
        testimonialsTrack.scrollLeft = scrollLeft - walk;
    });

    // 3. Mouse Wheel Support (Converts vertical scroll to horizontal)
    testimonialsTrack.addEventListener('wheel', (e) => {
        // Prevent default page scroll if scrolling over the cards
        if (Math.abs(e.deltaY) > 0) {
            e.preventDefault();
            testimonialsTrack.scrollLeft += e.deltaY;
        }
    }, { passive: false });

    // Initialize auto-scroll
    startAutoScroll();
}

// ==========================================================================
// ARCHITECTURAL THEME MANAGER (DARK BLUEPRINT DEFAULT / DRAFTING LIGHT MODE)
// ==========================================================================
const THEME_STORAGE_KEY = 'mp_portfolio_theme';

function initThemeManager() {
    const desktopThemeBtn = document.getElementById('desktop-theme-btn');
    const mobileThemeBtn = document.getElementById('mobile-theme-btn');
    const menuThemeBtn = document.getElementById('menu-theme-btn');
    const themeSidebarText = document.querySelector('.theme-sidebar-text');
    const themeSidebarBadge = document.querySelector('.theme-sidebar-badge');
    const themeMenuText = document.querySelector('.theme-menu-text');
    const themeMenuBadge = document.querySelector('.theme-menu-badge');

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

        if (persist) {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
            } catch (e) {}
        }

        // Update Desktop Sidebar button text & badge (fixed width labels)
        if (themeSidebarText) {
            themeSidebarText.textContent = isLight ? 'Light Mode' : 'Dark Mode';
        }
        if (themeSidebarBadge) {
            themeSidebarBadge.textContent = isLight ? 'DRAFT' : 'CAD';
        }

        // Update Mobile Menu button text & badge
        if (themeMenuText) {
            themeMenuText.textContent = isLight ? 'Light Drafting' : 'Dark Blueprint';
        }
        if (themeMenuBadge) {
            themeMenuBadge.textContent = isLight ? 'DRAFT' : 'CAD';
        }

        // Update icons inside all toggle buttons smoothly without layout shifts
        document.querySelectorAll('.theme-toggle-btn .theme-icon').forEach(icon => {
            if (isLight) {
                icon.classList.remove('ph-moon');
                icon.classList.add('ph-sun');
            } else {
                icon.classList.remove('ph-sun');
                icon.classList.add('ph-moon');
            }
        });
    };

    // Determine initial theme: Strictly dark mode by default unless user saved 'light'
    const saved = getStoredTheme();
    const initialTheme = saved === 'light' ? 'light' : 'dark';
    applyTheme(initialTheme, false);

    // Toggle handler
    const toggleTheme = () => {
        const currentIsLight = document.documentElement.classList.contains('light');
        const newTheme = currentIsLight ? 'dark' : 'light';
        applyTheme(newTheme, true);
    };

    // Attach listeners
    if (desktopThemeBtn) desktopThemeBtn.addEventListener('click', toggleTheme);
    if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);
    if (menuThemeBtn) menuThemeBtn.addEventListener('click', toggleTheme);

    // Keyboard shortcut (Alt + T or Ctrl + Shift + L)
    window.addEventListener('keydown', (e) => {
        if ((e.altKey && e.key.toLowerCase() === 't') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l')) {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeManager);
} else {
    initThemeManager();
}
