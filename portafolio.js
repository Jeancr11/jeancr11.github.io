document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const toggleMenu = () => {
        mobileMenu.classList.toggle('hidden');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
        document.body.classList.toggle('menu-open');
    };
    menuButton.addEventListener('click', toggleMenu);
    mobileNavLinks.forEach(link => link.addEventListener('click', toggleMenu));

    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const themeToggleBtn = document.getElementById('theme-toggle');

    if (localStorage.getItem('color-theme') === 'light') {
        document.documentElement.classList.remove('dark');
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.add('dark');
        themeToggleDarkIcon.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', function() {
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    });

    document.getElementById('hero-projects-button').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });

    const navLinks = document.querySelectorAll('header nav .nav-link');
    const sections = document.querySelectorAll('main section[id]');
    const scrollObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`header nav a[href="#${id}"]`);
                navLinks.forEach(link => link.classList.remove('text-blue-600', 'dark:text-blue-400'));
                if (activeLink) activeLink.classList.add('text-blue-600', 'dark:text-blue-400');
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' });
    sections.forEach(section => scrollObserver.observe(section));
    
    // --- DATA Y LÓGICA DE PROYECTOS ---
    const projectData = [
        { title: 'Dashboard Financiero', desc: 'Análisis visual de KPIs para monitoreo de objetivos estratégicos.', category: 'powerbi', tags: ['Power BI', 'DAX'], images: ['https://placehold.co/800x450/1e40af/ffffff?text=Dashboard+1', 'https://placehold.co/800x450/1d4ed8/ffffff?text=Dashboard+2'], githubUrl: null },
        { title: 'Automatización de ETL', desc: 'Script para automatizar la extracción, transformación y carga de datos.', category: 'python', tags: ['Python', 'Pandas'], images: ['https://placehold.co/800x450/166534/ffffff?text=ETL+Script'], githubUrl: '#' },
        { title: 'Optimización de Consultas', desc: 'Reescritura de consultas complejas para mejorar el rendimiento.', category: 'sql', tags: ['SQL Server', 'Tuning'], images: ['https://placehold.co/800x450/c2410c/ffffff?text=SQL+Query'], githubUrl: '#' },
        { title: 'Portafolio Personal', desc: 'Diseño y desarrollo de este sitio web con Tailwind CSS.', category: 'web', tags: ['HTML', 'Tailwind CSS', 'JavaScript'], images: ['https://placehold.co/800x450/7c3aed/ffffff?text=Web+1', 'https://placehold.co/800x450/9333ea/ffffff?text=Web+2'], githubUrl: '#' },
        { title: 'Análisis Estadístico', desc: 'Análisis exploratorio de un dataset de salud pública con R.', category: 'r', tags: ['R', 'ggplot2'], images: ['https://placehold.co/800x450/64748b/ffffff?text=An%C3%A1lisis+R'], githubUrl: null },
        { title: 'Dashboard de Operaciones', desc: 'Informe en Excel para el seguimiento de operaciones diarias.', category: 'excel', tags: ['Excel', 'Power Query'], images: ['https://placehold.co/800x450/15803d/ffffff?text=Excel'], githubUrl: null },
        { title: 'Modelo de Segmentación', desc: 'Uso de Machine Learning para segmentar clientes según su comportamiento.', category: 'python', tags: ['Python', 'Scikit-learn'], images: ['https://placehold.co/800x450/166534/ffffff?text=ML+Model'], githubUrl: '#' },
        { title: 'Reporte de Ventas Interactivo', desc: 'Informe dinámico y personalizable para el equipo de ventas.', category: 'powerbi', tags: ['Power BI', 'Ventas'], images: ['https://placehold.co/800x450/1e40af/ffffff?text=Ventas'], githubUrl: null },
    ];

    const filterButtons = document.querySelectorAll('#project-filters .filter-btn');
    
    const projectModal = document.getElementById('project-modal');
    const modalContentBox = document.getElementById('modal-content-box');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalDesc = document.getElementById('modal-desc');
    const modalTags = document.getElementById('modal-tags');
    const modalGithubLink = document.getElementById('modal-github-link');
    const modalPrevBtn = document.getElementById('modal-prev-btn');
    const modalNextBtn = document.getElementById('modal-next-btn');
    const modalExpandBtn = document.getElementById('modal-expand-btn');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const fullscreenCloseBtn = document.getElementById('fullscreen-close-btn');
    const fullscreenPrevBtn = document.getElementById('fullscreen-prev-btn');
    const fullscreenNextBtn = document.getElementById('fullscreen-next-btn');
    
    let currentProjectImages = [];
    let currentImageIndex = 0;

    const carouselContainer = document.getElementById('carousel-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    function renderProjects(filter = 'all') {
        carouselContainer.innerHTML = '';
        
        let projectsToShow = projectData;
        if (filter !== 'all') {
            projectsToShow = projectData.filter(p => p.category === filter);
        }

        projectsToShow.forEach(project => {
            const tagColors = {
                powerbi: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
                python: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
                sql: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
                web: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
                excel: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300',
                r: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            };
            
            const card = document.createElement('div');
            const tagsHTML = project.tags.map(tag => `<span class="inline-block ${tagColors[project.category] || tagColors.r} px-2 py-1 rounded-full">${tag}</span>`).join('');
            card.className = `w-[90%] sm:w-1/2 lg:w-[31%] flex-shrink-0 snap-center`;
            card.innerHTML = `
                <div class="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full min-h-[320px] cursor-pointer">
                    <div class="aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                        <img src="${project.images[0]}" alt="Vista previa de ${project.title}" class="w-full h-full object-cover">
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="text-base font-bold mb-2 text-slate-800 dark:text-white">${project.title}</h3>
                        <p class="text-slate-600 dark:text-slate-400 text-sm flex-grow mb-4">${project.desc}</p>
                        <div class="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 font-mono text-xs">
                            ${tagsHTML}
                        </div>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openModal(project));
            carouselContainer.appendChild(card);
        });
        lucide.createIcons();
    }

    function showImage(index) {
        modalImage.src = currentProjectImages[index];
        fullscreenImage.src = currentProjectImages[index];
    }

    function navigateImages(direction) {
        currentImageIndex = (currentImageIndex + direction + currentProjectImages.length) % currentProjectImages.length;
        showImage(currentImageIndex);
    }

    modalPrevBtn.addEventListener('click', () => navigateImages(-1));
    modalNextBtn.addEventListener('click', () => navigateImages(1));
    fullscreenPrevBtn.addEventListener('click', () => navigateImages(-1));
    fullscreenNextBtn.addEventListener('click', () => navigateImages(1));
    
    function openModal(project) {
        modalTitle.textContent = project.title;
        modalDesc.textContent = project.desc;
        
        currentProjectImages = project.images;
        currentImageIndex = 0;
        showImage(currentImageIndex);

        if (currentProjectImages.length > 1) {
            modalPrevBtn.classList.remove('hidden');
            modalNextBtn.classList.remove('hidden');
        } else {
            modalPrevBtn.classList.add('hidden');
            modalNextBtn.classList.add('hidden');
        }
        
        const tagColors = {
            powerbi: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
            python: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
            sql: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
            web: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
            excel: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300',
            r: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        };
        modalTags.innerHTML = project.tags.map(tag => `<span class="inline-block ${tagColors[project.category] || tagColors.r} px-2 py-1 rounded-full">${tag}</span>`).join('');

        if (project.githubUrl) {
            modalGithubLink.href = project.githubUrl;
            modalGithubLink.classList.remove('hidden');
        } else {
            modalGithubLink.classList.add('hidden');
        }

        projectModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        setTimeout(() => modalContentBox.classList.remove('scale-95', 'opacity-0'), 10);
    }

    function closeModal() {
        modalContentBox.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            projectModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }, 300);
    }
    
    modalExpandBtn.addEventListener('click', () => {
        fullscreenImage.src = modalImage.src;
        fullscreenModal.classList.remove('hidden');
         if (currentProjectImages.length > 1) {
            fullscreenPrevBtn.classList.remove('hidden');
            fullscreenNextBtn.classList.remove('hidden');
        } else {
            fullscreenPrevBtn.classList.add('hidden');
            fullscreenNextBtn.classList.add('hidden');
        }
    });
    fullscreenCloseBtn.addEventListener('click', () => {
        fullscreenModal.classList.add('hidden');
    });


    modalCloseBtn.addEventListener('click', closeModal);
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeModal();
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            renderProjects(filter);
        });
    });

    // --- Lógica para tamaño aleatorio de logos ---
    document.querySelectorAll('#hero-logos .logo-bg').forEach(logo => {
        logo.addEventListener('animationiteration', () => {
            const newSize = Math.random() * 80 + 40; // Tamaño entre 40px y 120px
            logo.style.width = `${newSize}px`;
            logo.style.height = `${newSize}px`;
        });
    });
    
    // --- Lógica del Carrusel ---
    let isDown = false;
    let startX;
    let scrollLeft;

    carouselContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        carouselContainer.classList.add('cursor-grabbing');
        startX = e.pageX - carouselContainer.offsetLeft;
        scrollLeft = carouselContainer.scrollLeft;
    });
    carouselContainer.addEventListener('mouseleave', () => {
        isDown = false;
        carouselContainer.classList.remove('cursor-grabbing');
    });
    carouselContainer.addEventListener('mouseup', () => {
        isDown = false;
        carouselContainer.classList.remove('cursor-grabbing');
    });
    carouselContainer.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - carouselContainer.offsetLeft;
        const walk = (x - startX) * 2; // Multiplicador para mayor velocidad de scroll
        carouselContainer.scrollLeft = scrollLeft - walk;
    });

    nextBtn.addEventListener('click', () => {
        carouselContainer.scrollBy({ left: carouselContainer.clientWidth / 2, behavior: 'smooth' });
    });
    prevBtn.addEventListener('click', () => {
        carouselContainer.scrollBy({ left: -carouselContainer.clientWidth / 2, behavior: 'smooth' });
    });


    renderProjects('all');
});
