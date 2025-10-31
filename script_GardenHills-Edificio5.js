// --- 1. Configuración de Supabase ---
const SUPABASE_URL = 'https://orylzbnsgbvsssflvhse.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeWx6Ym5zZ2J2c3NzZmx2aHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTM5NzYsImV4cCI6MjA3NzQ2OTk3Nn0.2Hg9bulkmVcar1xC3kwxnvFYNzAh__w-jFDrQedFCXA';

// Inicializa el cliente de Supabase
const { createClient } = supabase;
const clienteSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// --- 2. Variables Globales ---
let miGraficoDeGastos = null; 
const appContent = document.getElementById('app-content');
const mainTitle = document.getElementById('main-title');


// --- 3. Lógica Principal al Cargar la Página ---
document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    setupMobileMenu();
    setupNavigation();
    setupModalListeners(); // Carga la lógica del modal
    navigateTo('dashboard');
});


// --- 4. Lógica de Navegación ("Router") ---
function setupNavigation() {
    const navLinks = {
        'nav-dashboard': 'dashboard',
        'nav-residentes': 'residentes',
        'nav-gastos': 'gastos'
    };

    Object.keys(navLinks).forEach(navId => {
        const linkElement = document.getElementById(navId);
        if (linkElement) {
            linkElement.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
                linkElement.closest('li').classList.add('active');
                navigateTo(navLinks[navId]);
                if (window.innerWidth <= 768) {
                    document.body.classList.remove('sidebar-open');
                }
            });
        }
    });
}

function navigateTo(page) {
    mainTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);

    if (miGraficoDeGastos) {
        miGraficoDeGastos.destroy();
        miGraficoDeGastos = null;
    }

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

// --- 5. Lógica del Menú Móvil ---
function setupMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-open');
        });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            document.body.classList.remove('sidebar-open');
        });
    }
}

// --- 5.5. Lógica del Modal (Popup) ---
function setupModalListeners() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalLoader = document.getElementById('modal-loader'); // ¡CAMBIO!
    const appContentContainer = document.getElementById('app-content'); 

    if (!modalOverlay || !modalContent || !modalCloseBtn || !modalLoader || !appContentContainer) {
        console.warn('Elementos del modal no encontrados. El popup de comprobantes no funcionará.');
        return;
    }

    // Función para limpiar el contenido viejo (img o iframe)
    const clearModalContent = () => {
        const oldViewer = modalContent.querySelector('.modal-file-viewer');
        if (oldViewer) {
            oldViewer.remove();
        }
    };

    // ¡¡FUNCIÓN ACTUALIZADA!!
    const showModal = (imageUrl) => {
        clearModalContent(); // Limpiar contenido anterior
        modalLoader.style.display = 'block'; // Mostrar spinner
        
        let fileViewer;

        // Decidir si es PDF o imagen
        if (imageUrl.toLowerCase().endsWith('.pdf')) {
            // Es PDF: crear un <iframe>
            fileViewer = document.createElement('iframe');
            fileViewer.className = 'modal-file-viewer';
            fileViewer.src = imageUrl;
            
            fileViewer.onload = () => {
                modalLoader.style.display = 'none'; // Ocultar spinner
                fileViewer.style.display = 'block'; // Mostrar iframe
            };
            fileViewer.onerror = () => {
                console.error('Error al cargar el PDF.');
                hideModal();
            };

        } else {
            // Asumir que es Imagen: crear un <img>
            fileViewer = document.createElement('img');
            fileViewer.className = 'modal-file-viewer';
            fileViewer.src = imageUrl;
            fileViewer.alt = 'Comprobante';

            fileViewer.onload = () => {
                modalLoader.style.display = 'none'; // Ocultar spinner
                fileViewer.style.display = 'block'; // Mostrar imagen
            };
            fileViewer.onerror = () => {
                console.error('Error al cargar la imagen del comprobante.');
                hideModal();
            };
        }
        
        // Añadir el elemento (oculto por defecto) al modal
        modalContent.appendChild(fileViewer);
        // Mostrar todo el modal
        modalOverlay.classList.add('visible');
    };

    // ¡¡FUNCIÓN ACTUALIZADA!!
    const hideModal = () => {
        modalOverlay.classList.remove('visible');
        
        // Esperar a la animación antes de limpiar
        setTimeout(() => {
            clearModalContent(); // Limpiar el <img> o <iframe>
            modalLoader.style.display = 'block'; // Resetear el spinner para la próxima vez
        }, 300); 
    };

    // 1. Clic en el botón de cerrar
    modalCloseBtn.addEventListener('click', hideModal);

    // 2. Clic en el overlay (afuera del contenido)
    modalOverlay.addEventListener('click', (e) => {
        
        // Lógica de v27.2 (robusta)
        
        // `e.target` es el elemento exacto donde se hizo clic.
        
        // Primero, verificamos si el clic fue en un botón de "Ver".
        // Si es así, no hacemos NADA. El otro listener se encargará.
        if (e.target.closest('.btn-comprobante')) {
            return;
        }

        // Segundo, verificamos si el clic fue DENTRO del contenido del modal
        // (p.ej., en la imagen o en el padding).
        // Si es así, no hacemos NADA.
        if (modalContent.contains(e.target)) {
            return;
        }

        // Si el clic no fue en un botón "Ver" Y no fue dentro del contenido,
        // significa que fue en el fondo (overlay). Cerramos el modal.
        hideModal();
    });

    // 3. (CLAVE) Event Delegation en el contenedor principal
    appContentContainer.addEventListener('click', (e) => {
        // .closest() busca el botón, incluso si se hizo clic en el texto "Ver"
        const comprobanteBtn = e.target.closest('.btn-comprobante');
        
        if (comprobanteBtn) {
            e.preventDefault(); // Prevenir que el <a> abra una nueva pestaña
            
            const imageUrl = comprobanteBtn.href;
            if (imageUrl) {
                showModal(imageUrl);
            }
        }
    });
}


// --- 6. Funciones para "Pintar" Vistas (Los "esqueletos" HTML) ---

/** VISTA 1: DASHBOARD **/
function renderDashboardView() {
    appContent.innerHTML = `
        <div class="dashboard-grid">
            <section class="card kpi-card grid-span-2">
                <h2>Indicadores Clave</h2>
                <div class="kpi-container" id="kpi-container">
                    ${getLoadingHTML('kpis')}
                </div>
            </section>

            <section class="card grid-span-1">
                <h2>Estado de Pagos (Residentes)</h2>
                <div class="filters-container" id="dashboard-filters-container">
                    ${createFiltersHTML('dashboard')}
                </div>
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
                            ${getLoadingHTML('table', 5)} <!-- BUGFIX: Colspan 5 -->
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="card grid-span-1">
                <h2>Resumen de Gastos del Mes</h2>
                <div class="chart-container" id="chart-container-parent">
                    ${getLoadingHTML('chart')}
                </div>
            </section>
        </div>
    `;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; 

    setupFilterListeners('dashboard', currentYear, currentMonth);
    
    // Llamamos a la función de carga única del dashboard
    fetchAndRenderDashboardData(
        currentYear, 
        currentMonth, 
        false,          // showDebtors
        currentYear,    // kpiYear (este se mantiene)
        currentMonth    // kpiMonth (este se mantiene)
    );
}

/** VISTA 2: RESIDENTES **/
function renderResidentesView() {
    appContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Historial de Pagos de Residentes</h2>
                <div class="filters-container" id="residentes-filters-container">
                    ${createFiltersHTML('residentes')}
                </div>
            </div>
            <div class="totals-bar" id="residentes-totals-bar">
                ${getLoadingHTML('totals')}
            </div>
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
                        ${getLoadingHTML('table', 6)} <!-- BUGFIX: Colspan 6 -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    setupFilterListeners('residentes', 'all', 'all');
    fetchAndRenderResidentesData('all', 'all', '', ''); 
}

/** VISTA 3: GASTOS **/
function renderGastosView() {
    appContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Historial de Gastos</h2>
                <div class="filters-container" id="gastos-filters-container">
                    ${createFiltersHTML('gastos')}
                </div>
            </div>
            <div class="totals-bar" id="gastos-totals-bar">
                ${getLoadingHTML('totals')}
            </div>
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
                        ${getLoadingHTML('table', 5)} <!-- BUGFIX: Colspan 5 -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    setupFilterListeners('gastos', 'all', 'all');
    fetchAndRenderGastosData('all', 'all', 'all'); 
}


// --- 7. Lógica de Filtros (Mejorada) ---
function createFiltersHTML(pagePrefix) {
    let yearOptions = `
        <option value="all">Todos los Años</option>
        <option value="2025">2025</option>
        <option value="2024">2024</option>
    `; // Placeholder

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    let monthOptions = '<option value="all">Todos los Meses</option>';
    months.forEach((month, index) => {
        monthOptions += `<option value="${index + 1}">${month}</option>`;
    });

    let filters = `
        <select id="${pagePrefix}-year-select" class="filter-select">${yearOptions}</select>
        <select id="${pagePrefix}-month-select" class="filter-select">${monthOptions}</select>
    `;

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

function setupFilterListeners(pagePrefix, defaultYear, defaultMonth) {
    const yearSelect = document.getElementById(`${pagePrefix}-year-select`);
    const monthSelect = document.getElementById(`${pagePrefix}-month-select`);
    const resetBtn = document.getElementById(`${pagePrefix}-reset-filter`);

    yearSelect.value = defaultYear;
    monthSelect.value = defaultMonth;

    const updateFunction = () => {
        const selectedYear = getFilterValue(yearSelect);
        const selectedMonth = getFilterValue(monthSelect);

        if (pagePrefix === 'dashboard') {
            const debtorsCheck = document.getElementById('dashboard-debtors-check');
            const showDebtors = debtorsCheck.checked;
            
            // Los KPIs fijos (Residentes al Día) siempre usan el mes actual
            const today = new Date();
            const kpiYear = today.getFullYear();
            const kpiMonth = today.getMonth() + 1;
            
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

    yearSelect.addEventListener('change', updateFunction);
    monthSelect.addEventListener('change', updateFunction);

    if (pagePrefix === 'dashboard') {
        document.getElementById('dashboard-debtors-check').addEventListener('change', updateFunction);
    } else if (pagePrefix === 'residentes') {
        document.getElementById('residentes-name-filter').addEventListener('input', updateFunction);
        document.getElementById('residentes-apt-filter').addEventListener('input', updateFunction);
    } else if (pagePrefix === 'gastos') {
        document.getElementById('gastos-tipo-select').addEventListener('change', updateFunction);
    }

    resetBtn.addEventListener('click', () => {
        yearSelect.value = 'all';
        monthSelect.value = 'all';
        if (pagePrefix === 'dashboard') {
            document.getElementById('dashboard-debtors-check').checked = false;
        } else if (pagePrefix === 'residentes') {
            document.getElementById('residentes-name-filter').value = '';
            document.getElementById('residentes-apt-filter').value = '';
        } else if (pagePrefix === 'gastos') {
            document.getElementById('gastos-tipo-select').value = 'all';
        }
        updateFunction();
    });
}

function getFilterValue(selectElement) {
    if (selectElement.value === 'all') return 'all';
    return parseInt(selectElement.value, 10);
}


// --- 8. Funciones de Carga de Datos (FETCH) ---

function applyDateFilters(query, year, month) {
    if (year !== 'all') {
        let startDate, endDate;
        if (month !== 'all') {
            startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const nextMonthDate = new Date(year, month, 1); 
            endDate = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
        } else {
            startDate = `${year}-01-01`;
            endDate = `${year + 1}-01-01`;
        }
        query = query.gte('fecha', startDate).lt('fecha', endDate);
    }
    return query;
}

/** ¡¡VERSIÓN 26.1!! FETCH: DASHBOARD (Corrección de Gráfico) */
async function fetchAndRenderDashboardData(year, month, showDebtors, kpiYear, kpiMonth) {
    console.log('Iniciando fetchAndRenderDashboardData (v26.1) con:', year, month, showDebtors);
    
    // 1. Mostrar indicadores de carga
    setLoading('tabla-cuerpo-dash', getLoadingHTML('table', 5)); // BUGFIX: Colspan 5
    setLoading('kpi-container', getLoadingHTML('kpis'));
    setLoading('chart-container-parent', getLoadingHTML('chart'));
    
    try {
        // --- 2. Consulta de Pagos (para Tabla y KPIs dinámicos) ---
        let pagosQuery = clienteSupabase.from('pagos_residentes').select('*');
        pagosQuery = applyDateFilters(pagosQuery, year, month);
        pagosQuery = pagosQuery.order('fecha', { ascending: false }); 
        
        const { data: pagosData, error: pagosError } = await pagosQuery;
        if (pagosError) throw new Error(`Error en Pagos: ${pagosError.message}`);
        console.log('Fetch de Pagos (Dashboard) exitoso:', pagosData);


        // --- 3. Consulta de Gastos (para Gráfico y KPIs dinámicos) ---
        let gastosQuery = clienteSupabase.from('gastos_condominio').select('*');
        gastosQuery = applyDateFilters(gastosQuery, year, month);
        gastosQuery = gastosQuery.order('fecha', { ascending: false }); 

        const { data: gastosData, error: gastosError } = await gastosQuery;
        if (gastosError) throw new Error(`Error en Gastos: ${gastosError.message}`);
        console.log('Fetch de Gastos (Dashboard) exitoso:', gastosData);


        // --- 4. Consulta de Pagos (para KPI Fijo "Residentes al Día") ---
        let kpiQuery = clienteSupabase.from('pagos_residentes').select('*');
        kpiQuery = applyDateFilters(kpiQuery, kpiYear, kpiMonth);
        kpiQuery = kpiQuery.order('fecha', { ascending: false }); 

        const { data: kpiPagosData, error: kpiError } = await kpiQuery;
        if (kpiError) throw new Error(`Error en KPI Pagos: ${kpiError.message}`);
        console.log('Fetch de kpiPagos (Dashboard) exitoso:', kpiPagosData);


        // --- 5. Aplicar filtros de JS ---
        const pagosFiltrados = showDebtors
            ? (pagosData || []).filter(p => p.estado === 'Pendiente' || p.estado === 'Atrasado')
            : (pagosData || []);
        
        if (showDebtors) {
            pagosFiltrados.sort((a, b) => {
                const order = { 'Atrasado': 1, 'Pendiente': 2, 'Pagado': 3 };
                return (order[a.estado] || 4) - (order[b.estado] || 4);
            });
        }


        // --- 6. Renderizar todo ---
        renderizarKPIs(pagosData, gastosData, kpiPagosData);
        renderizarTablaDashboard(pagosFiltrados);
        renderizarGrafico(gastosData); // Esta función ahora crea el canvas

    } catch (error) {
        console.error('Error fetching dashboard data (v26.1):', error.message);
        
        // Escribe el error en todas las secciones
        const errorMessage = `Error al cargar: ${error.message}`;
        setError('tabla-cuerpo-dash', errorMessage);
        setError('kpi-container', errorMessage);
        setError('chart-container-parent', errorMessage);
    }
}


/** FETCH: RESIDENTES (Página completa - Lógica separada) */
async function fetchAndRenderResidentesData(year, month, name, apt) {
    setLoading('tabla-cuerpo-residentes', getLoadingHTML('table', 6)); // BUGFIX: Colspan 6
    setLoading('residentes-totals-bar', getLoadingHTML('totals'));

    try {
        let query = clienteSupabase.from('pagos_residentes').select('*');
        query = applyDateFilters(query, year, month);

        if (name) {
            query = query.ilike('nombre', `%${name}%`);
        }
        if (apt) {
            query = query.ilike('apt', `%${apt}%`);
        }
        
        query = query.order('fecha', { ascending: false }); 
        
        const { data: pagos, error } = await query;
        if (error) throw error;
        
        // Renderiza en los IDs correctos
        renderizarTablaResidentesFull(pagos, 'tabla-cuerpo-residentes');
        renderizarTotalIngresos(pagos, 'residentes-totals-bar');

    } catch (error) {
        console.error('Error fetching residentes data:', error.message);
        setError('tabla-cuerpo-residentes', 'Error al cargar datos. Revisa la consola (F12).');
        setError('residentes-totals-bar', 'Error.');
    }
}

/** FETCH: GASTOS (Página completa - Lógica separada) */
async function fetchAndRenderGastosData(year, month, tipo) {
    setLoading('tabla-cuerpo-gastos', getLoadingHTML('table', 5)); // BUGFIX: Colspan 5
    setLoading('gastos-totals-bar', getLoadingHTML('totals'));

    try {
        let query = clienteSupabase.from('gastos_condominio').select('*');
        query = applyDateFilters(query, year, month);

        if (tipo !== 'all') {
            query = query.eq('tipo', tipo);
        }
        
        query = query.order('fecha', { ascending: false });
        
        const { data: gastos, error } = await query;
        if (error) throw error;
        
        // Renderiza en los IDs correctos
        renderizarTablaGastosFull(gastos, 'tabla-cuerpo-gastos');
        renderizarTotalGastos(gastos, 'gastos-totals-bar', false);

    } catch (error) {
        console.error('Error fetching gastos data:', error.message);
        setError('tabla-cuerpo-gastos', 'Error al cargar datos. Revisa la consola (F12).');
        setError('gastos-totals-bar', 'Error.');
    }
}


// --- 9. Funciones de Renderizado de Datos (Componentes) ---

/** Renderiza los 4 KPIs del Dashboard */
function renderizarKPIs(pagos, gastos, kpiPagos) {
    const container = document.getElementById('kpi-container');
    if (!container) return;

    // --- ¡¡BLINDAJE!! ---
    const pagosSeguro = Array.isArray(pagos) ? pagos : [];
    const gastosSeguro = Array.isArray(gastos) ? gastos : [];
    const kpiPagosSeguro = Array.isArray(kpiPagos) ? kpiPagos : [];
    // --- FIN BLINDAJE ---

    // Calcular KPIs dinámicos (basados en filtros)
    const totalIngresos = pagosSeguro
        .filter(p => p.estado === 'Pagado')
        .reduce((sum, p) => sum + (p.monto || 0), 0);
    
    const totalGastos = gastosSeguro.reduce((sum, g) => sum + (g.monto || 0), 0);
    
    const saldoMes = totalIngresos - totalGastos;
    
    // Calcular KPI Fijo (basado en kpiPagos)
    const totalResidentes = kpiPagosSeguro.length;
    const residentesAlDia = kpiPagosSeguro.filter(p => p.estado === 'Pagado').length;


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

/** Renderiza la tabla del Dashboard (v27.3) */
function renderizarTablaDashboard(pagos) {
    const cuerpoTabla = document.getElementById('tabla-cuerpo-dash');
    if (!cuerpoTabla) return;
    
    const pagosSeguro = Array.isArray(pagos) ? pagos : [];

    if (pagosSeguro.length === 0) {
        setNoData('tabla-cuerpo-dash', 'No se encontraron pagos con esos filtros.', 5); // Colspan 5
        return;
    }

    cuerpoTabla.innerHTML = ''; 
    pagosSeguro.forEach(pago => {
        const fila = document.createElement('tr');
        const estadoClass = getEstadoClass(pago.estado);

        // --- ¡¡INICIO CORRECCIÓN v27.3!! ---
        // Verificamos que la URL exista Y no sea una cadena vacía
        const hasUrl = pago.comprobante_url && pago.comprobante_url.trim() !== '';
        
        const btnComprobante = hasUrl
            ? `<a href="${pago.comprobante_url}" class="btn btn-secondary btn-sm btn-comprobante">Ver</a>`
            : `<button class="btn btn-secondary btn-sm" disabled>N/A</button>`;
        // --- ¡¡FIN CORRECCIÓN v27.3!! ---
        
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

/** Renderiza la tabla de Residentes (Página) (v27.3) */
function renderizarTablaResidentesFull(pagos, tableId) {
    const cuerpoTabla = document.getElementById(tableId);
    if (!cuerpoTabla) return;

    const pagosSeguro = Array.isArray(pagos) ? pagos : [];

    if (pagosSeguro.length === 0) {
        setNoData(tableId, 'No se encontraron pagos con esos filtros.', 6); // Colspan 6
        return;
    }
    
    cuerpoTabla.innerHTML = '';
    pagosSeguro.forEach(pago => {
        const fila = document.createElement('tr');
        const estadoClass = getEstadoClass(pago.estado);
        
        // --- ¡¡INICIO CORRECCIÓN v27.3!! ---
        const hasUrl = pago.comprobante_url && pago.comprobante_url.trim() !== '';
        
        const btnComprobante = hasUrl
            ? `<a href="${pago.comprobante_url}" class="btn btn-secondary btn-sm btn-comprobante">Ver</a>`
            : `<button class="btn btn-secondary btn-sm" disabled>N/A</button>`;
        // --- ¡¡FIN CORRECCIÓN v27.3!! ---
        
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

/** Renderiza el total de Ingresos (Página) */
function renderizarTotalIngresos(pagos, totalsId) {
    const totalsBar = document.getElementById(totalsId);
    if (!totalsBar) return;

    const pagosSeguro = Array.isArray(pagos) ? pagos : [];
    const totalIngresos = pagosSeguro
        .filter(p => p.estado === 'Pagado')
        .reduce((sum, p) => sum + (p.monto || 0), 0);
    
    totalsBar.innerHTML = `
        <div class="total-item total-ingresos">
            Total Pagado: <strong>$${totalIngresos.toLocaleString('es-DO')}</strong>
        </div>
    `;
}

/** Renderiza la tabla de Gastos (Página) (v27.3) */
function renderizarTablaGastosFull(gastos, tableId) {
    const cuerpoTabla = document.getElementById(tableId);
    if (!cuerpoTabla) return;

    const gastosSeguro = Array.isArray(gastos) ? gastos : [];

    if (gastosSeguro.length === 0) {
        setNoData(tableId, 'No se encontraron gastos con esos filtros.', 5); // Colspan 5
        return;
    }

    cuerpoTabla.innerHTML = '';
    gastosSeguro.forEach(fact => {
        const fila = document.createElement('tr');
        const estadoClass = getEstadoClass(fact.estado);
        
        // --- ¡¡INICIO CORRECCIÓN v27.3!! ---
        const hasUrl = fact.comprobante_url && fact.comprobante_url.trim() !== '';

        const btnComprobante = hasUrl
            ? `<a href="${fact.comprobante_url}" class="btn btn-secondary btn-sm btn-comprobante">Ver</a>`
            : `<button class="btn btn-secondary btn-sm" disabled>N/A</button>`;
        // --- ¡¡FIN CORRECCIÓN v27.3!! ---
        
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

/** Renderiza el total de Gastos (Página) */
function renderizarTotalGastos(gastos, totalsId, append = false) {
    const totalsBar = document.getElementById(totalsId);
    if (!totalsBar) return;

    const gastosSeguro = Array.isArray(gastos) ? gastos : [];
    const totalGastos = gastosSeguro.reduce((sum, g) => sum + (g.monto || 0), 0);
    
    const html = `
        <div class="total-item total-gastos">
            Total Gastos: <strong>$${totalGastos.toLocaleString('es-DO')}</strong>
        </div>
    `;

    if (append) {
        // No se usa en v26.0
    } else {
        totalsBar.innerHTML = html; // Reemplaza
    }
}


/** ¡CAMBIO 3! Esta función ahora crea el canvas */
function renderizarGrafico(gastos) {
    // const canvas = document.getElementById('grafico-gastos'); // <-- Ya no se busca
    const container = document.getElementById('chart-container-parent');
    // if (!canvas || !container) return; // <-- Se cambia por:
    if (!container) return;
    
    const gastosSeguro = Array.isArray(gastos) ? gastos : [];

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
    
    const colores = ['#FF6384', '#FF9F40', '#4BC0C0', '#9966FF', '#36A2EB', '#FFCD56'];

    if (labels.length === 0) {
        // Si no hay datos, muestra error (esto ya limpiará el shimmer)
        setError(container.id, 'No hay datos de gastos para mostrar en el gráfico.');
        return;
    }

    // --- INICIO DE CORRECCIÓN (v26.1) ---
    // 1. Limpiamos el 'loading shimmer' que puso fetchAndRenderDashboardData
    container.innerHTML = ''; 

    // 2. Creamos el canvas dinámicamente AHORA
    const canvas = document.createElement('canvas');
    canvas.id = 'grafico-gastos';
    
    // 3. Lo añadimos al contenedor ANTES de usarlo
    container.appendChild(canvas);
    // --- FIN DE CORRECCIÓN ---

    const ctx = canvas.getContext('2d');
    if (miGraficoDeGastos) miGraficoDeGastos.destroy();
    
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
                        color: colorTexto,
                        padding: 20,
                        font: {
                            family: 'system-ui',
                            size: 14
                        }
                    }
                },
                tooltip: {
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
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const currentTheme = localStorage.getItem('theme');
    let theme;
    if (currentTheme) {
        theme = currentTheme;
    } else {
        theme = prefersDark.matches ? 'dark' : 'light';
    }

    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.checked = false;
    }

    themeToggle.addEventListener('change', () => {
        let newTheme;
        if (themeToggle.checked) {
            document.body.classList.add('dark-mode');
            newTheme = 'dark';
        } else {
            document.body.classList.remove('dark-mode');
            newTheme = 'light';
        }
        localStorage.setItem('theme', newTheme);
        
        if (miGraficoDeGastos) {
             const temaActual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
             const colorTexto = (temaActual === 'dark') ? '#a0a0b5' : '#667';
             miGraficoDeGastos.options.plugins.legend.labels.color = colorTexto;
             miGraficoDeGastos.update();
        }
    });

    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                themeToggle.checked = true;
            } else {
                document.body.classList.remove('dark-mode');
                themeToggle.checked = false;
            }
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

// --- 12. Helpers de Carga y Error (NUEVOS) ---

// ¡BUGFIX! Se añade parámetro colspan
function getLoadingHTML(type, colspan = 5) { // default 5
    if (type === 'table') {
        // Se elimina la lógica anterior, ahora usamos el parámetro
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

if (!document.getElementById('loading-styles')) {
    const style = document.createElement('style');
    style.id = 'loading-styles';
    style.innerHTML = `
        .loading-shimmer {
            background: #f6f7f8;
            background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
            background-repeat: no-repeat;
            background-size: 800px 104px; 
            display: inline-block;
            position: relative; 
            animation-duration: 1s;
            animation-fill-mode: forwards; 
            animation-iteration-count: infinite;
            animation-name: shimmer;
            animation-timing-function: linear;
            border-radius: 4px;
        }
        body.dark-mode .loading-shimmer {
            background: #2a2a45;
            background-image: linear-gradient(to right, #2a2a45 0%, #3a3a5a 20%, #2a2a45 40%, #2a2a45 100%);
        }
        @keyframes shimmer {
            0% { background-position: -468px 0; }
            100% { background-position: 468px 0; } 
        }
        .loading-text { color: var(--subtle-text-color); text-align: center; padding: 20px; }
        .error-text { color: var(--accent-red); text-align: center; padding: 20px; font-weight: 600; }
    `;
    document.head.appendChild(style);
}

function setLoading(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) element.innerHTML = html;
}

function setError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        // Colspan dinámico
        const table = element.closest('table');
        let colspan = 1;
        if (table) {
            colspan = table.querySelector('thead th')?.length || 1;
        }
        
        if (element.tagName === 'TBODY') {
            element.innerHTML = `<tr><td colspan="${colspan}"><div class="error-text">${message}</div></td></tr>`;
        } else {
            element.innerHTML = `<div class="error-text">${message}</div>`;
        }
    }
}

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


