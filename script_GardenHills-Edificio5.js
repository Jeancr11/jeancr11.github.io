// --- 1. Configuración de Supabase ---
// Define la URL y la Llave (Key) pública de tu proyecto en Supabase.
const SUPABASE_URL = 'https://orylzbnsgbvsssflvhse.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeWx6Ym5zZ2J2c3NzZmx2aHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTM5NzYsImV4cCI6MjA3NzQ2OTk3Nn0.2Hg9bulkmVcar1xC3kwxnvFYNzAh__w-jFDrQedFCXA';

// Inicializa el cliente de Supabase para poder hacer consultas.
const { createClient } = supabase;
const clienteSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// --- 2. Variables Globales ---
// Almacena el objeto del gráfico de Chart.js para poder destruirlo al cambiar de vista.
let miGraficoDeGastos = null; 
// Referencia al contenedor principal donde se "pintan" las vistas (Dashboard, Residentes, etc.).
const appContent = document.getElementById('app-content');
// Referencia al título <h1> en el header para actualizarlo dinámicamente.
const mainTitle = document.getElementById('main-title');


// --- 3. Inicialización (DOM ContentLoaded) ---
// Se ejecuta cuando el HTML ha terminado de cargarse.
document.addEventListener('DOMContentLoaded', () => {
    // Configura el toggle de tema claro/oscuro.
    setupThemeToggle();
    // Configura el menú de hamburguesa y el overlay para móviles.
    setupMobileMenu();
    // Configura los enlaces de navegación del sidebar.
    setupNavigation();
    // Configura los listeners para el modal (popup) de comprobantes.
    setupModalListeners();
    // Configura el efecto 'sticky' del header al hacer scroll.
    setupStickyHeaderScroll();
    // Carga la vista de 'dashboard' por defecto al iniciar.
    navigateTo('dashboard');
});


// --- 4. Lógica de Navegación ("Router") ---

/**
 * Configura los event listeners para los enlaces del sidebar (Dashboard, Residentes, Gastos).
 */
function setupNavigation() {
    const navLinks = {
        'nav-dashboard': 'dashboard',
        'nav-residentes': 'residentes',
        'nav-gastos': 'gastos'
    };

    // Itera sobre cada enlace y le asigna un evento de clic.
    Object.keys(navLinks).forEach(navId => {
        const linkElement = document.getElementById(navId);
        if (linkElement) {
            linkElement.addEventListener('click', (e) => {
                e.preventDefault(); // Evita que el navegador recargue la página.
                // Quita la clase 'active' de todos los enlaces.
                document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
                // Añade 'active' solo al enlace clickeado.
                linkElement.closest('li').classList.add('active');
                // Llama a la función que "pinta" la nueva vista.
                navigateTo(navLinks[navId]);
                // Si estamos en móvil, cierra el menú después de hacer clic.
                if (window.innerWidth <= 768) {
                    document.body.classList.remove('sidebar-open');
                }
            });
        }
    });
}

/**
 * Carga y "pinta" la vista seleccionada en el contenedor #app-content.
 * @param {string} page - El nombre de la vista a cargar ('dashboard', 'residentes', 'gastos').
 */
function navigateTo(page) {
    // Actualiza el título <h1> del header.
    mainTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);

    // Si existe un gráfico de Chart.js, lo destruye para evitar errores de renderizado.
    if (miGraficoDeGastos) {
        miGraficoDeGastos.destroy();
        miGraficoDeGastos = null;
    }

    // Selecciona qué función de renderizado llamar según la página.
    switch(page) {
        case 'dashboard':
            renderDashboardView();
            break;
        case 'residentes':
            renderResidentesView();
            break;
        case 'gastos':
            renderGastosView();
            break;
    }
}

// --- 5. Lógica de UI (Menú, Modal, Header) ---

/**
 * Configura los listeners para el botón de hamburguesa y el overlay en móviles.
 */
function setupMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    // Abre/cierra el sidebar al hacer clic en la hamburguesa.
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-open');
        });
    }

    // Cierra el sidebar al hacer clic en el overlay (fondo oscuro).
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            document.body.classList.remove('sidebar-open');
        });
    }
}

/**
 * Configura los listeners para el modal (popup) que muestra imágenes y PDFs.
 */
function setupModalListeners() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalLoader = document.getElementById('modal-loader'); 
    const appContentContainer = document.getElementById('app-content'); 

    // Verificación de seguridad
    if (!modalOverlay || !modalContent || !modalCloseBtn || !modalLoader || !appContentContainer) {
        console.warn('Elementos del modal no encontrados. El popup de comprobantes no funcionará.');
        return;
    }

    // Función interna para limpiar el <iframe> o <img> anterior.
    const clearModalContent = () => {
        const oldViewer = modalContent.querySelector('.modal-file-viewer');
        if (oldViewer) {
            oldViewer.remove();
        }
    };

    // Función interna para mostrar el modal. Detecta si la URL es PDF o imagen.
    const showModal = (imageUrl) => {
        clearModalContent(); 
        modalLoader.style.display = 'block'; // Muestra el spinner
        
        let fileViewer;

        if (imageUrl.toLowerCase().endsWith('.pdf')) {
            // Es PDF: crear un <iframe>
            fileViewer = document.createElement('iframe');
            fileViewer.className = 'modal-file-viewer';
            fileViewer.src = imageUrl;
            
            fileViewer.onload = () => {
                modalLoader.style.display = 'none'; // Oculta spinner
                fileViewer.style.display = 'block'; 
            };
            fileViewer.onerror = () => {
                console.error('Error al cargar el PDF.');
                hideModal();
            };

        } else {
            // Es Imagen: crear un <img>
            fileViewer = document.createElement('img');
            fileViewer.className = 'modal-file-viewer';
            fileViewer.src = imageUrl;
            fileViewer.alt = 'Comprobante';

            fileViewer.onload = () => {
                modalLoader.style.display = 'none'; // Oculta spinner
                fileViewer.style.display = 'block'; 
            };
            fileViewer.onerror = () => {
                console.error('Error al cargar la imagen del comprobante.');
                hideModal();
            };
        }
        
        modalContent.appendChild(fileViewer);
        modalOverlay.classList.add('visible');
    };

    // Función interna para ocultar el modal.
    const hideModal = () => {
        modalOverlay.classList.remove('visible');
        // Espera a que termine la animación de fade-out para limpiar el contenido.
        setTimeout(() => {
            clearModalContent(); 
            modalLoader.style.display = 'block'; // Resetea el spinner
        }, 300); 
    };

    // Asigna los eventos
    modalCloseBtn.addEventListener('click', hideModal); // Clic en la 'X'
    modalOverlay.addEventListener('click', (e) => { // Clic en el fondo (overlay)
        if (e.target.closest('.btn-comprobante')) return; // Ignora si se hizo clic en el botón (evita doble clic)
        if (modalContent.contains(e.target)) return; // Ignora si se hizo clic dentro del contenido
        hideModal();
    });

    // Delegación de eventos: Escucha clics en todo el #app-content.
    // Si el clic fue en un botón '.btn-comprobante', abre el modal.
    appContentContainer.addEventListener('click', (e) => {
        const comprobanteBtn = e.target.closest('.btn-comprobante');
        
        if (comprobanteBtn) {
            e.preventDefault(); 
            const imageUrl = comprobanteBtn.href;
            if (imageUrl) {
                showModal(imageUrl);
            }
        }
    });
}

/**
 * Configura el efecto 'sticky' del header, manejando el scroll
 * tanto en desktop (.main-content) como en móvil (window).
 */
function setupStickyHeaderScroll() {
    const mainContent = document.querySelector('.main-content'); // El scroller de desktop
    const mainHeader = document.querySelector('.main-header');

    if (!mainContent || !mainHeader) {
        console.warn('No se encontró .main-content o .main-header para el scroll.');
        return;
    }

    // Función genérica que aplica/quita la clase 'header-scrolled'.
    const handleScroll = (scrollTop) => {
        if (scrollTop > 10) { 
            mainHeader.classList.add('header-scrolled');
        } else {
            mainHeader.classList.remove('header-scrolled');
        }
    };

    // Listener para MÓVIL (scrollea 'window')
    window.addEventListener('scroll', () => { 
        if (window.innerWidth <= 768) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            handleScroll(scrollTop);
        }
    });

    // Listener para DESKTOP (scrollea '.main-content')
    mainContent.addEventListener('scroll', () => {
        if (window.innerWidth > 768) {
            const scrollTop = mainContent.scrollTop;
            handleScroll(scrollTop);
        }
    });

    // Limpia la clase al redimensionar para evitar estados extraños.
    window.addEventListener('resize', () => {
        mainHeader.classList.remove('header-scrolled');
    });
}

// --- 6. Renderizado de Vistas (HTML) ---

/**
 * "Pinta" el HTML de la vista Dashboard en #app-content.
 */
function renderDashboardView() {
    // Se usa un grid 50/50 para poner tabla y gráfico lado a lado en desktop.
    appContent.innerHTML = `
        <div class="card"> 
            
            <section class="dash-section kpi-section">
                <h2>Indicadores Clave</h2>
                <div class="kpi-container" id="kpi-container">
                    ${getLoadingHTML('kpis')}
                </div>
            </section>

            <div class="dash-grid-50-50">
                
                <!-- Columna 1: Tabla -->
                <section class="dash-section">
                    <div class="card-header">
                        <h2>Estado de Pagos (Residentes)</h2>
                        <button id="export-btn-dash" class="btn-export">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            Exportar
                        </button>
                    </div>
                    <div class="filters-container" id="dashboard-filters-container">
                        ${createFiltersHTML('dashboard')}
                    </div>
                    <div class="table-wrapper">
                        <div class="table-container">
                            <table id="tabla-residentes-dash">
                                <thead>
                                    <tr>
                                        <th>Residente</th>
                                        <th>Apt.</th>
                                        <th>Fecha de Pago</th>
                                        <th>Estado</th>
                                        <th>Comprobante</th>
                                    </tr>
                                </thead>
                                <tbody id="tabla-cuerpo-dash">
                                    ${getLoadingHTML('table', 5)} 
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <!-- Columna 2: Gráfico -->
                <section class="dash-section">
                    <h2>Resumen de Gastos del Mes</h2>
                    <div class="chart-container" id="chart-container-parent">
                        ${getLoadingHTML('chart')}
                    </div>
                </section>
            
            </div> <!-- Fin de .dash-grid-50-50 -->

        </div>
    `;

    // Por defecto, muestra el mes y año actual.
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); 

    // Configura los listeners para los filtros de esta vista.
    setupFilterListeners('dashboard', currentYear, currentMonth);
    
    // Lanza la primera carga de datos.
    fetchAndRenderDashboardData(
        currentYear, 
        currentMonth, 
        false, // showDebtors
        currentYear,    
        currentMonth    
    );
}

/**
 * "Pinta" el HTML de la vista Residentes en #app-content.
 */
function renderResidentesView() {
    appContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Historial de Pagos de Residentes</h2>
                <button id="export-btn-residentes" class="btn-export">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Exportar
                </button>
            </div>
            <div class="filters-container" id="residentes-filters-container">
                ${createFiltersHTML('residentes')}
            </div>
            <div class="totals-bar" id="residentes-totals-bar">
                ${getLoadingHTML('totals')}
            </div>
            <div class="table-wrapper">
                <div class="table-container">
                    <table id="tabla-residentes-full">
                        <thead>
                            <tr>
                                <th>Residente</th>
                                <th>Apt.</th>
                                <th>Fecha de Pago</th>
                                <th>Estado</th>
                                <th>Monto</th>
                                <th>Comprobante</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-cuerpo-residentes">
                            ${getLoadingHTML('table', 6)} 
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Configura listeners y carga datos (mostrando todo por defecto).
    setupFilterListeners('residentes', 'all', 'all');
    fetchAndRenderResidentesData('all', 'all', '', ''); 
}

/**
 * "Pinta" el HTML de la vista Gastos en #app-content.
 */
function renderGastosView() {
    appContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Historial de Gastos</h2>
                <button id="export-btn-gastos" class="btn-export">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Exportar
                </button>
            </div>
            <div class="filters-container" id="gastos-filters-container">
                ${createFiltersHTML('gastos')}
            </div>
            <div class="totals-bar" id="gastos-totals-bar">
                ${getLoadingHTML('totals')}
            </div>
            <div class="table-wrapper">
                <div class="table-container">
                    <table id="tabla-gastos-full">
                        <thead>
                            <tr>
                                <th>Tipo de Gasto</th>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Comprobante</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-cuerpo-gastos">
                            ${getLoadingHTML('table', 5)} 
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Configura listeners y carga datos (mostrando todo por defecto).
    setupFilterListeners('gastos', 'all', 'all');
    fetchAndRenderGastosData('all', 'all', 'all'); 
}


// --- 7. Lógica de Filtros ---

/**
 * Genera el HTML para los filtros de una vista específica.
 * @param {string} pagePrefix - 'dashboard', 'residentes' o 'gastos'.
 * @returns {string} - El HTML de los filtros.
 */
function createFiltersHTML(pagePrefix) {
    // Opciones de Año (se podrían generar dinámicamente)
    let yearOptions = `
        <option value="all">Todos los Años</option>
        <option value="2025">2025</option>
        <option value="2024">2024</option>
    `; 

    // Opciones de Mes
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    let monthOptions = '<option value="all">Todos los Meses</option>';
    months.forEach((month, index) => {
        monthOptions += `<option value="${index + 1}">${month}</option>`;
    });

    // Filtros base (Año y Mes)
    let filters = `
        <select id="${pagePrefix}-year-select" class="filter-select">${yearOptions}</select>
        <select id="${pagePrefix}-month-select" class="filter-select">${monthOptions}</select>
    `;

    // Añade filtros específicos por vista
    if (pagePrefix === 'dashboard') {
        filters = `
            <div class="filter-checkbox">
                <input type="checkbox" id="dashboard-debtors-check">
                <label for="dashboard-debtors-check">Mostrar solo deudores</label>
            </div>
        ` + filters;
    } else if (pagePrefix === 'residentes') {
        filters = `
            <input type="text" id="residentes-name-filter" class="filter-input" placeholder="Buscar por nombre...">
            <input type="text" id="residentes-apt-filter" class="filter-input" placeholder="Buscar por Apt...">
        ` + filters;
    } else if (pagePrefix === 'gastos') {
        const tiposGasto = ['all', 'Luz', 'Bienes Comunes', 'Mantenimiento', 'Otros'];
        let tipoOptions = '';
        tiposGasto.forEach(tipo => {
            tipoOptions += `<option value="${tipo}">${tipo === 'all' ? 'Todos los Tipos' : tipo}</option>`;
        });
        filters = `<select id="gastos-tipo-select" class="filter-select">${tipoOptions}</select>` + filters;
    }

    // Añade el botón de resetear filtros
    filters += `
        <button id="${pagePrefix}-reset-filter" class="filter-reset-btn" aria-label="Quitar filtros">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    return filters;
}

/**
 * Configura los event listeners para los filtros de una vista y el botón de exportar.
 * @param {string} pagePrefix - 'dashboard', 'residentes' o 'gastos'.
 * @param {string|number} defaultYear - El año seleccionado por defecto.
 * @param {string|number} defaultMonth - El mes seleccionado por defecto.
 */
function setupFilterListeners(pagePrefix, defaultYear, defaultMonth) {
    const yearSelect = document.getElementById(`${pagePrefix}-year-select`);
    const monthSelect = document.getElementById(`${pagePrefix}-month-select`);
    const resetBtn = document.getElementById(`${pagePrefix}-reset-filter`);

    if (!yearSelect || !monthSelect || !resetBtn) {
        console.warn(`Faltan elementos de filtro para: ${pagePrefix}`);
        return;
    }

    // Asigna los valores por defecto
    yearSelect.value = defaultYear;
    monthSelect.value = defaultMonth;

    // Función que se ejecuta cada vez que un filtro cambia
    const updateFunction = () => {
        const selectedYear = getFilterValue(yearSelect);
        const selectedMonth = getFilterValue(monthSelect);

        if (pagePrefix === 'dashboard') {
            const debtorsCheck = document.getElementById('dashboard-debtors-check');
            const showDebtors = debtorsCheck ? debtorsCheck.checked : false;
            
            const today = new Date();
            const kpiYear = today.getFullYear();
            const kpiMonth = today.getMonth();
            
            fetchAndRenderDashboardData(selectedYear, selectedMonth, showDebtors, kpiYear, kpiMonth);
            
        } else if (pagePrefix === 'residentes') {
            const nameFilter = document.getElementById('residentes-name-filter');
            const aptFilter = document.getElementById('residentes-apt-filter');
            fetchAndRenderResidentesData(selectedYear, selectedMonth, nameFilter.value, aptFilter.value);

        } else if (pagePrefix === 'gastos') {
            const tipoSelect = document.getElementById('gastos-tipo-select');
            fetchAndRenderGastosData(selectedYear, selectedMonth, tipoSelect.value);
        }
    };

    // Asigna la función a los listeners base
    yearSelect.addEventListener('change', updateFunction);
    monthSelect.addEventListener('change', updateFunction);

    // Asigna listeners específicos de cada vista
    const debtorsCheck = document.getElementById('dashboard-debtors-check');
    if (debtorsCheck) debtorsCheck.addEventListener('change', updateFunction);

    const nameFilter = document.getElementById('residentes-name-filter');
    if (nameFilter) nameFilter.addEventListener('input', updateFunction); // 'input' es mejor que 'change' para texto

    const aptFilter = document.getElementById('residentes-apt-filter');
    if (aptFilter) aptFilter.addEventListener('input', updateFunction);

    const tipoSelect = document.getElementById('gastos-tipo-select');
    if (tipoSelect) tipoSelect.addEventListener('change', updateFunction);

    // Configura el botón de reset
    resetBtn.addEventListener('click', () => {
        yearSelect.value = 'all';
        monthSelect.value = 'all';
        
        if (debtorsCheck) debtorsCheck.checked = false;
        if (nameFilter) nameFilter.value = '';
        if (aptFilter) aptFilter.value = '';
        if (tipoSelect) tipoSelect.value = 'all';
        
        updateFunction(); // Vuelve a cargar los datos con filtros reseteados
    });

    // --- Lógica de Botones de Exportación ---
    let exportBtnId = '';
    let tableId = '';
    let exportFilename = '';

    if (pagePrefix === 'dashboard') {
        exportBtnId = 'export-btn-dash';
        tableId = 'tabla-residentes-dash';
        exportFilename = 'Estado_Pagos_Dashboard';
    } else if (pagePrefix === 'residentes') {
        exportBtnId = 'export-btn-residentes';
        tableId = 'tabla-residentes-full';
        exportFilename = 'Reporte_Residentes';
    } else if (pagePrefix === 'gastos') {
        exportBtnId = 'export-btn-gastos';
        tableId = 'tabla-gastos-full';
        exportFilename = 'Reporte_Gastos';
    }

    // Asigna el evento de clic al botón de exportar correspondiente
    const exportBtn = document.getElementById(exportBtnId);
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportTableToExcel(tableId, exportFilename);
        });
    }
}

/**
 * Helper para obtener el valor de un <select>, convirtiéndolo a número si no es 'all'.
 */
function getFilterValue(selectElement) {
    if (selectElement.value === 'all') return 'all';
    return parseInt(selectElement.value, 10);
}


// --- 8. Carga de Datos (Fetch a Supabase) ---

/**
 * Helper para aplicar filtros de fecha (año y mes) a una consulta de Supabase.
 * @param {object} query - La consulta de Supabase (ej. clienteSupabase.from(...).select('*'))
 * @param {string|number} year - El año a filtrar ('all' o un número).
 * @param {string|number} month - El mes a filtrar ('all' o un número).
 * @returns {object} - La consulta de Supabase con los filtros de fecha aplicados.
 */
function applyDateFilters(query, year, month) {
    if (year !== 'all') {
        let startDate, endDate;
        if (month !== 'all') {
            // Filtro por mes específico
            startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const nextMonthDate = new Date(year, month, 1); // JS Date (month 0-11)
            endDate = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
        } else {
            // Filtro por año completo
            startDate = `${year}-01-01`;
            endDate = `${year + 1}-01-01`;
        }
        // Aplica filtro de rango de fechas (gte = >=, lt = <)
        query = query.gte('fecha', startDate).lt('fecha', endDate);
    }
    return query;
}

/**
 * Obtiene y renderiza todos los datos para la vista Dashboard (KPIs, Tabla, Gráfico).
 */
async function fetchAndRenderDashboardData(year, month, showDebtors, kpiYear, kpiMonth) {
    console.log('Iniciando carga de Dashboard:', year, month, showDebtors);
    
    // Muestra los estados de carga (shimmer)
    setLoading('tabla-cuerpo-dash', getLoadingHTML('table', 5)); 
    setLoading('kpi-container', getLoadingHTML('kpis'));
    setLoading('chart-container-parent', getLoadingHTML('chart'));
    
    try {
        // --- 1. Consulta de Pagos (para Tabla y KPIs) ---
        let pagosQuery = clienteSupabase.from('pagos_residentes').select('*');
        // Los KPIs y la tabla ahora respetan el filtro de fecha
        pagosQuery = applyDateFilters(pagosQuery, year, month);
        pagosQuery = pagosQuery.order('fecha', { ascending: false }); 
        
        const { data: pagosData, error: pagosError } = await pagosQuery;
        if (pagosError) throw new Error(`Error en Pagos: ${pagosError.message}`);

        // --- 2. Consulta de Gastos (para Gráfico y KPIs) ---
        let gastosQuery = clienteSupabase.from('gastos_condominio').select('*');
        gastosQuery = applyDateFilters(gastosQuery, year, month);
        gastosQuery = gastosQuery.order('fecha', { ascending: false }); 

        const { data: gastosData, error: gastosError } = await gastosQuery;
        if (gastosError) throw new Error(`Error en Gastos: ${gastosError.message}`);

        // --- 3. Aplicar filtros de JS (solo deudores) ---
        const pagosFiltrados = showDebtors
            ? (pagosData || []).filter(p => p.estado === 'Pendiente' || p.estado === 'Atrasado')
            : (pagosData || []);
        
        // Si se filtran deudores, se re-ordenan para mostrar 'Atrasado' primero.
        if (showDebtors) {
            pagosFiltrados.sort((a, b) => {
                const order = { 'Atrasado': 1, 'Pendiente': 2, 'Pagado': 3 };
                return (order[a.estado] || 4) - (order[b.estado] || 4);
            });
        }

        // --- 4. Renderizar todo ---
        // Se pasa 'pagosData' (filtrado por fecha) a los KPIs.
        renderizarKPIs(pagosData, gastosData, pagosData); 
        renderizarTablaDashboard(pagosFiltrados);
        renderizarGrafico(gastosData); 

    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
        const errorMessage = `Error al cargar: ${error.message}`;
        setError('tabla-cuerpo-dash', errorMessage);
        setError('kpi-container', errorMessage);
        setError('chart-container-parent', errorMessage);
    }
}

/**
 * Obtiene y renderiza los datos para la vista Residentes (Tabla y Totales).
 */
async function fetchAndRenderResidentesData(year, month, name, apt) {
    setLoading('tabla-cuerpo-residentes', getLoadingHTML('table', 6)); 
    setLoading('residentes-totals-bar', getLoadingHTML('totals'));

    try {
        let query = clienteSupabase.from('pagos_residentes').select('*');
        // Aplica filtros de fecha
        query = applyDateFilters(query, year, month);

        // Aplica filtros de texto (ilike es 'case-insensitive like')
        if (name) {
            query = query.ilike('nombre', `%${name}%`);
        }
        if (apt) {
            query = query.ilike('apt', `%${apt}%`);
        }
        
        query = query.order('fecha', { ascending: false }); 
        
        const { data: pagos, error } = await query;
        if (error) throw error;
        
        // Renderiza la tabla y la barra de totales
        renderizarTablaResidentesFull(pagos, 'tabla-cuerpo-residentes');
        renderizarTotalIngresos(pagos, 'residentes-totals-bar');

    } catch (error) {
        console.error('Error fetching residentes data:', error.message);
        setError('tabla-cuerpo-residentes', 'Error al cargar datos. Revisa la consola (F12).');
        setError('residentes-totals-bar', 'Error.');
    }
}

/**
 * Obtiene y renderiza los datos para la vista Gastos (Tabla y Totales).
 */
async function fetchAndRenderGastosData(year, month, tipo) {
    setLoading('tabla-cuerpo-gastos', getLoadingHTML('table', 5)); 
    setLoading('gastos-totals-bar', getLoadingHTML('totals'));

    try {
        let query = clienteSupabase.from('gastos_condominio').select('*');
        // Aplica filtros de fecha
        query = applyDateFilters(query, year, month);

        // Aplica filtro de tipo (eq es 'equals')
        if (tipo !== 'all') {
            query = query.eq('tipo', tipo);
        }
        
        query = query.order('fecha', { ascending: false });
        
        const { data: gastos, error } = await query;
        if (error) throw error;
        
        // Renderiza la tabla y la barra de totales
        renderizarTablaGastosFull(gastos, 'tabla-cuerpo-gastos');
        renderizarTotalGastos(gastos, 'gastos-totals-bar', false);

    } catch (error) {
        console.error('Error fetching gastos data:', error.message);
        setError('tabla-cuerpo-gastos', 'Error al cargar datos. Revisa la consola (F12).');
        setError('gastos-totals-bar', 'Error.');
    }
}


// --- 9. Renderizado de Componentes (Datos) ---

/**
 * Calcula y renderiza los 4 KPIs del Dashboard.
 * @param {Array} pagos - Datos de pagos (filtrados por fecha).
 * @param {Array} gastos - Datos de gastos (filtrados por fecha).
 * @param {Array} kpiPagos - Datos de pagos (usado para el conteo de residentes).
 */
function renderizarKPIs(pagos, gastos, kpiPagos) {
    const container = document.getElementById('kpi-container');
    if (!container) return;

    // Asegura que los datos sean arrays para evitar errores .filter/.reduce
    const pagosSeguro = Array.isArray(pagos) ? pagos : [];
    const gastosSeguro = Array.isArray(gastos) ? gastos : [];
    const kpiPagosSeguro = Array.isArray(kpiPagos) ? kpiPagos : [];

    // Calcula Total Ingresos (solo 'Pagado')
    const totalIngresos = pagosSeguro
        .filter(p => p.estado === 'Pagado')
        .reduce((sum, p) => sum + (p.monto || 0), 0);
    
    // Calcula Total Gastos
    const totalGastos = gastosSeguro.reduce((sum, g) => sum + (g.monto || 0), 0);
    
    // Calcula Saldo
    const saldoMes = totalIngresos - totalGastos;
    
    // Calcula Residentes al Día
    // Obtenemos una lista única de residentes (por 'apt')
    const residentesUnicos = [...new Map(kpiPagosSeguro.map(p => [p.apt, p])).values()];
    const totalResidentes = residentesUnicos.length;
    const residentesAlDia = residentesUnicos.filter(p => p.estado === 'Pagado').length;


    container.innerHTML = `
        <div class="kpi">
            <h3>Total Ingresos</h3>
            <p class="kpi-green">$${totalIngresos.toLocaleString('es-DO')}</p>
        </div>
        <div class="kpi">
            <h3>Total Gastos</h3>
            <p class="kpi-red">$${totalGastos.toLocaleString('es-DO')}</p>
        </div>
        <div class="kpi">
            <h3>Saldo</h3>
            <p class="kpi-yellow">$${saldoMes.toLocaleString('es-DO')}</p>
        </div>
        <div class="kpi" id="kpi-al-dia">
            <h3>Residentes al Día</h3>
            <p class="kpi-blue">${residentesAlDia} / ${totalResidentes}</p>
        </div>
    `;
}

/**
 * Renderiza la tabla de pagos en el Dashboard.
 * @param {Array} pagos - Datos de pagos (ya filtrados).
 */
function renderizarTablaDashboard(pagos) {
    const cuerpoTabla = document.getElementById('tabla-cuerpo-dash');
    if (!cuerpoTabla) return;
    
    const pagosSeguro = Array.isArray(pagos) ? pagos : [];

    if (pagosSeguro.length === 0) {
        setNoData('tabla-cuerpo-dash', 'No se encontraron pagos con esos filtros.', 5); 
        return;
    }

    cuerpoTabla.innerHTML = ''; // Limpia el estado de carga
    pagosSeguro.forEach(pago => {
        const fila = document.createElement('tr');
        const estadoClass = getEstadoClass(pago.estado);

        // Verifica si hay una URL de comprobante
        const hasUrl = pago.comprobante_url && pago.comprobante_url.trim() !== '';
        
        // Crea un botón <a> si hay URL, o un <button> deshabilitado si no hay.
        const btnComprobante = hasUrl
            ? `<a href="${pago.comprobante_url}" class="btn btn-secondary btn-sm btn-comprobante">Ver</a>`
            : `<button class="btn btn-secondary btn-sm" disabled>N/A</button>`;
        
        fila.innerHTML = `
            <td>${pago.nombre}</td>
            <td>${pago.apt}</td>
            <td>${pago.fecha}</td>
            <td><span class="status ${estadoClass}">${pago.estado}</span></td>
            <td>${btnComprobante}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

/**
 * Renderiza la tabla completa en la vista de Residentes.
 * @param {Array} pagos - Datos de pagos (ya filtrados).
 * @param {string} tableId - ID del <tbody>.
 */
function renderizarTablaResidentesFull(pagos, tableId) {
    const cuerpoTabla = document.getElementById(tableId);
    if (!cuerpoTabla) return;

    const pagosSeguro = Array.isArray(pagos) ? pagos : [];

    if (pagosSeguro.length === 0) {
        setNoData(tableId, 'No se encontraron pagos con esos filtros.', 6); 
        return;
    }
    
    cuerpoTabla.innerHTML = '';
    pagosSeguro.forEach(pago => {
        const fila = document.createElement('tr');
        const estadoClass = getEstadoClass(pago.estado);
        const hasUrl = pago.comprobante_url && pago.comprobante_url.trim() !== '';
        
        const btnComprobante = hasUrl
            ? `<a href="${pago.comprobante_url}" class="btn btn-secondary btn-sm btn-comprobante">Ver</a>`
            : `<button class="btn btn-secondary btn-sm" disabled>N/A</button>`;
        
        fila.innerHTML = `
            <td>${pago.nombre}</td>
            <td>${pago.apt}</td>
            <td>${pago.fecha}</td>
            <td><span class="status ${estadoClass}">${pago.estado}</span></td>
            <td>$${(pago.monto || 0).toLocaleString('es-DO')}</td>
            <td>${btnComprobante}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

/**
 * Renderiza la barra de total de ingresos (solo pagos 'Pagado').
 * @param {Array} pagos - Datos de pagos.
 * @param {string} totalsId - ID del contenedor de la barra de totales.
 */
function renderizarTotalIngresos(pagos, totalsId) {
    const totalsBar = document.getElementById(totalsId);
    if (!totalsBar) return;

    const pagosSeguro = Array.isArray(pagos) ? pagos : [];
    const totalIngresos = pagosSeguro
        .filter(p => p.estado === 'Pagado') // Solo suma los pagados
        .reduce((sum, p) => sum + (p.monto || 0), 0);
    
    totalsBar.innerHTML = `
        <div class="total-item total-ingresos">
            Total Pagado: <strong>$${totalIngresos.toLocaleString('es-DO')}</strong>
        </div>
    `;
}

/**
 * Renderiza la tabla completa en la vista de Gastos.
 * @param {Array} gastos - Datos de gastos (ya filtrados).
 * @param {string} tableId - ID del <tbody>.
 */
function renderizarTablaGastosFull(gastos, tableId) {
    const cuerpoTabla = document.getElementById(tableId);
    if (!cuerpoTabla) return;

    const gastosSeguro = Array.isArray(gastos) ? gastos : [];

    if (gastosSeguro.length === 0) {
        setNoData(tableId, 'No se encontraron gastos con esos filtros.', 5); 
        return;
    }

    cuerpoTabla.innerHTML = '';
    gastosSeguro.forEach(fact => {
        const fila = document.createElement('tr');
        const estadoClass = getEstadoClass(fact.estado);
        const hasUrl = fact.comprobante_url && fact.comprobante_url.trim() !== '';

        const btnComprobante = hasUrl
            ? `<a href="${fact.comprobante_url}" class="btn btn-secondary btn-sm btn-comprobante">Ver</a>`
            : `<button class="btn btn-secondary btn-sm" disabled>N/A</button>`;
        
        fila.innerHTML = `
            <td>${fact.tipo}</td>
            <td>${fact.fecha}</td>
            <td>$${(fact.monto || 0).toLocaleString('es-DO')}</td>
            <td><span class="status ${estadoClass}">${fact.estado}</span></td>
            <td>${btnComprobante}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

/**
 * Renderiza la barra de total de gastos.
 * @param {Array} gastos - Datos de gastos.
 * @param {string} totalsId - ID del contenedor de la barra de totales.
 */
function renderizarTotalGastos(gastos, totalsId) {
    const totalsBar = document.getElementById(totalsId);
    if (!totalsBar) return;

    const gastosSeguro = Array.isArray(gastos) ? gastos : [];
    // Suma todos los gastos, sin importar el estado
    const totalGastos = gastosSeguro.reduce((sum, g) => sum + (g.monto || 0), 0);
    
    const html = `
        <div class="total-item total-gastos">
            Total Gastos: <strong>$${totalGastos.toLocaleString('es-DO')}</strong>
        </div>
    `;
    totalsBar.innerHTML = html; 
}

/**
 * Renderiza el gráfico de dona (doughnut) de Chart.js para los gastos.
 * @param {Array} gastos - Datos de gastos (filtrados por fecha).
 */
function renderizarGrafico(gastos) {
    const container = document.getElementById('chart-container-parent');
    if (!container) return;
    
    const gastosSeguro = Array.isArray(gastos) ? gastos : [];

    // Agrupa los gastos por 'tipo'
    const gastosAgrupados = gastosSeguro.reduce((acc, gasto) => {
        const tipo = gasto.tipo || 'Otros';
        if (!acc[tipo]) {
            acc[tipo] = 0;
        }
        acc[tipo] += gasto.monto || 0;
        return acc;
    }, {});

    const labels = Object.keys(gastosAgrupados);
    const data = Object.values(gastosAgrupados);
    
    // Paleta de colores para el gráfico
    const colores = ['#FF6384', '#FF9F40', '#4BC0C0', '#9966FF', '#36A2EB', '#FFCD56'];

    if (labels.length === 0) {
        setError(container.id, 'No hay datos de gastos para mostrar en el gráfico.');
        return;
    }

    // Limpia el contenedor y crea un nuevo canvas (necesario para Chart.js)
    container.innerHTML = ''; 
    const canvas = document.createElement('canvas');
    canvas.id = 'grafico-gastos';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (miGraficoDeGastos) miGraficoDeGastos.destroy(); // Destruye el gráfico anterior
    
    // Adapta el color del texto de la leyenda al tema (claro/oscuro)
    const temaActual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const colorTexto = (temaActual === 'dark') ? '#a0a0b5' : '#667';
    
    miGraficoDeGastos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colores.slice(0, labels.length),
                hoverOffset: 4,
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colorTexto, // Color de texto dinámico
                        padding: 20,
                        font: {
                            family: 'system-ui',
                            size: 14
                        }
                    }
                },
                tooltip: {
                    // Formatea el tooltip para mostrar moneda (DOP)
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}


// --- 10. Lógica del Tema (Modo Oscuro) ---

/**
 * Configura el toggle de tema, guardando la preferencia en localStorage.
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Detecta la preferencia del sistema operativo
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Carga el tema desde localStorage o usa la preferencia del sistema
    const currentTheme = localStorage.getItem('theme');
    let theme;
    if (currentTheme) {
        theme = currentTheme;
    } else {
        theme = prefersDark.matches ? 'dark' : 'light';
    }

    // Aplica el tema al cargar la página
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.checked = false;
    }

    // Listener para cuando el usuario cambia el toggle
    themeToggle.addEventListener('change', () => {
        let newTheme;
        if (themeToggle.checked) {
            document.body.classList.add('dark-mode');
            newTheme = 'dark';
        } else {
            document.body.classList.remove('dark-mode');
            newTheme = 'light';
        }
        localStorage.setItem('theme', newTheme); // Guarda la preferencia
        
        // Actualiza el color del texto del gráfico si existe
        if (miGraficoDeGastos) {
             const temaActual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
             const colorTexto = (temaActual === 'dark') ? '#a0a0b5' : '#667';
             miGraficoDeGastos.options.plugins.legend.labels.color = colorTexto;
             miGraficoDeGastos.update();
        }
    });

    // Listener para si el usuario cambia el tema de su OS (y no tiene preferencia guardada)
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                themeToggle.checked = true;
            } else {
                document.body.classList.remove('dark-mode');
                themeToggle.checked = false;
            }
            // Actualiza el gráfico
            if (miGraficoDeGastos) {
                 const isDark = document.body.classList.contains('dark-mode');
                 const colorTexto = isDark ? '#a0a0b5' : '#667';
                 miGraficoDeGastos.options.plugins.legend.labels.color = colorTexto;
                 miGraficoDeGastos.update();
            }
        }
    });
}


// --- 11. Funciones de Ayuda (Helpers) ---

/**
 * Devuelve la clase CSS correspondiente a un estado de pago.
 * @param {string} estado - 'Pagado', 'Pendiente' o 'Atrasado'.
 * @returns {string} - La clase CSS.
 */
function getEstadoClass(estado) {
    if (!estado) return '';
    switch (estado.toLowerCase()) {
        case 'pagado':
            return 'status-pagado';
        case 'pendiente':
            return 'status-pendiente';
        case 'atrasado':
            return 'status-atrasado';
        default:
            return '';
    }
}

/**
 * Exporta una tabla HTML a un archivo Excel (XLSX).
 * Excluye inteligentemente la columna "Comprobante".
 * @param {string} tableId - El ID de la tabla a exportar.
 * @param {string} filename - El nombre del archivo (sin .xlsx).
 */
function exportTableToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error(`Tabla con id "${tableId}" no encontrada.`);
        return;
    }

    // 1. Clonar la tabla para no modificar la original del DOM.
    const tableClone = table.cloneNode(true);

    // 2. Encontrar el índice de la columna "Comprobante".
    let thComprobante = -1;
    tableClone.querySelectorAll('thead th').forEach((th, index) => {
        if (th.textContent.trim().toLowerCase() === 'comprobante') {
            thComprobante = index;
        }
    });

    // 3. Eliminar esa columna del header y de todas las filas del body.
    if (thComprobante !== -1) {
        tableClone.querySelector('thead tr').deleteCell(thComprobante);
        tableClone.querySelectorAll('tbody tr').forEach(row => {
            // Verifica si la fila es de datos (no de "cargando" o "sin datos")
            if(row.cells.length > 1) {
                row.deleteCell(thComprobante);
            }
        });
    }

    // 4. Generar el libro (Workbook) y la hoja (Worksheet) usando SheetJS.
    const wb = XLSX.utils.table_to_book(tableClone, { sheet: "Reporte" });

    // 5. Descargar el archivo.
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}


/**
 * Genera HTML para los esqueletos de carga (shimmer).
 * @param {string} type - 'table', 'kpis', 'chart', 'totals'.
 * @param {number} [colspan=5] - Número de columnas para el esqueleto de tabla.
 * @returns {string} - El HTML del esqueleto.
 */
function getLoadingHTML(type, colspan = 5) { 
    if (type === 'table') {
        return `
            <tr><td colspan="${colspan}"><div class="loading-shimmer" style="height: 20px; width: 90%;"></div></td></tr>
            <tr><td colspan="${colspan}"><div class="loading-shimmer" style="height: 20px; width: 70%;"></div></td></tr>
            <tr><td colspan="${colspan}"><div class="loading-shimmer" style="height: 20px; width: 80%;"></div></td></tr>
        `;
    }
    if (type === 'kpis') {
        return `
            <div class="kpi"><div class="loading-shimmer" style="height: 30px; width: 60%; margin: 10px auto;"></div></div>
            <div class="kpi"><div class="loading-shimmer" style="height: 30px; width: 60%; margin: 10px auto;"></div></div>
            <div class="kpi"><div class="loading-shimmer" style="height: 30px; width: 60%; margin: 10px auto;"></div></div>
            <div class="kpi"><div class="loading-shimmer" style="height: 30px; width: 60%; margin: 10px auto;"></div></div>
        `;
    }
    if (type === 'chart' || type === 'totals') {
         return `<div class="loading-shimmer" style="height: 40px; width: 80%; margin: 0 auto;"></div>`;
    }
    return `<div class="loading-shimmer" style="height: 50px; width: 100%;"></div>`;
}

/**
 * Inserta un estado de carga (shimmer) en un elemento.
 * @param {string} elementId - ID del elemento.
 * @param {string} html - El HTML de carga.
 */
function setLoading(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) element.innerHTML = html;
}

/**
 * Muestra un mensaje de error dentro de un elemento.
 * @param {string} elementId - ID del elemento.
 * @param {string} message - Mensaje de error.
 */
function setError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        let colspan = 1;
        // Si es un <tbody>, crea una fila de error.
        if (element.tagName === 'TBODY') {
            const table = element.closest('table');
            if (table) {
                colspan = table.querySelector('thead th')?.length || 1;
            }
            element.innerHTML = `<tr><td colspan="${colspan}"><div class="error-text">${message}</div></td></tr>`;
        } else {
            element.innerHTML = `<div class="error-text">${message}</div>`;
        }
    }
}

/**
 * Muestra un mensaje de "Sin Datos" dentro de un elemento.
 * @param {string} elementId - ID del elemento.
 * @param {string} message - Mensaje de "sin datos".
 * @param {number} [colspan=1] - Colspan para filas de tabla.
 */
function setNoData(elementId, message, colspan = 1) {
    const element = document.getElementById(elementId);
    if (element) {
         if (element.tagName === 'TBODY') {
            element.innerHTML = `<tr><td colspan="${colspan}"><div class="loading-text">${message}</div></td></tr>`;
        } else {
            element.innerHTML = `<div class="loading-text">${message}</div>`;
        }
    }
}


