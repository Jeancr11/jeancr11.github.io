document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // --- Lógica del menú y tema (sin cambios) ---
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
    if (localStorage.getItem('color-theme') === 'dark') {
        document.documentElement.classList.add('dark');
        themeToggleDarkIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('light');
        themeToggleLightIcon.classList.remove('hidden');
    }
    themeToggleBtn.addEventListener('click', function() {
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    });
    const navLinks = document.querySelectorAll('header nav .nav-link');
    const sections = document.querySelectorAll('main section[id]');
    const scrollObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`nav a[onclick*="${id}"]`);
                navLinks.forEach(link => link.classList.remove('text-blue-600', 'dark:text-blue-400'));
                if (activeLink) activeLink.classList.add('text-blue-600', 'dark:text-blue-400');
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' });
    sections.forEach(section => scrollObserver.observe(section));
    
    // --- DATA DE PROYECTOS ---
    const projectData = [
        {
            title: 'Dashboard de Análisis de Ventas',
            desc: 'Análisis de datos de un restaurante para optimizar operaciones, con limpieza de datos en Power Query y KPIs de ventas en Power BI. El diseño es de mi autoría.',
            longDesc: `
                <p>Este proyecto consiste en la construcción de un dashboard completo en <strong>Power BI</strong> para analizar los datos de ventas de un restaurante. El proceso abarcó desde la limpieza y transformación de los datos en <strong>Power Query</strong>, donde se consolidaron encabezados y se calcularon nuevas columnas como la propina por orden.</p>
                <p>En el área de visualización, se crearon gráficos interactivos, un <strong>Bubble Chart</strong> para análisis multivariable y <strong>KPIs</strong> con metas de ventas para monitorear el rendimiento. Se implementaron medidas <strong>DAX</strong> avanzadas, utilizando funciones como <strong>SUMMARIZE</strong> y <strong>SUMX</strong> para obtener métricas complejas como el promedio de ítems por orden y comparativas temporales (mes vs. mes, acumulados anuales).</p>
                
                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>¿Para Qué Podemos Usar Esto en la Vida Real?</h4>
                <p>Un dashboard de análisis para un restaurante es una herramienta poderosa para la gestión diaria y estratégica. Permite a los dueños y gerentes:</p>
                <ul class='list-disc list-inside mt-2 space-y-2'>
                    <li><strong>Optimizar el menú:</strong> Identificar qué platos son los más vendidos (y los más rentables) para destacarlos en el menú o eliminar los que no tienen buen rendimiento.</li>
                    <li><strong>Mejorar la gestión de personal:</strong> Analizar las horas pico de ventas para programar al personal de manera más eficiente, asegurando un buen servicio sin incurrir en costos laborales innecesarios.</li>
                    <li><strong>Incrementar el ticket promedio:</strong> Entender el promedio de ítems y el gasto por orden para capacitar al personal en técnicas de venta sugestiva (upselling), como ofrecer postres o aperitivos.</li>
                    <li><strong>Evaluar el rendimiento de las propinas:</strong> Analizar qué turnos o meseros generan más propinas, lo que puede ser un indicador de la calidad del servicio al cliente.</li>
                </ul>
                <p class='mt-2'>Con esta información, un restaurante puede tomar decisiones rápidas y basadas en datos para mejorar la experiencia del cliente, aumentar la eficiencia operativa y, en última instancia, maximizar sus ganancias.</p>

                <h4 class="text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white">Tabla y Medidas DAX Implementadas</h4>
                <div class="dax-accordion">
                    <!-- Tabla: Analisis de Ordenes -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Tabla: Análisis de Órdenes</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Crea una tabla virtual que resume cada orden, contando los productos y sumando el precio total.</p>
                            <pre><code>Analisis de Ordenes = \nSUMMARIZE(Detalles1,\n    Detalles1[Orden],\n    "Cuenta de Producto", COUNT(Detalles1[Producto]),\n    "Ventas Totales", SUM(Detalles1[Precio])\n)</code></pre>
                        </div>
                    </div>
                    <!-- Columna: Propina en Pesos -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Columna: Propina en Pesos</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Calcula el valor monetario de la propina para cada ítem de la orden.</p>
                            <pre><code>Propina en Pesos = Detalles1[Precio] * Detalles1[Propina]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas Totales -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Ventas Totales</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Suma el precio de todos los productos vendidos.</p>
                            <pre><code>Ventas Totales = SUM(Detalles1[Precio])</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Cantidad de ordenes Diferentes -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Cantidad de Órdenes Diferentes</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Cuenta el número único de órdenes procesadas.</p>
                            <pre><code>Cantidad de ordenes Diferentes = DISTINCTCOUNT(Detalles1[Orden])</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas Promedio por Orden -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Ventas Promedio por Orden</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Calcula el ingreso promedio generado por cada orden única.</p>
                            <pre><code>Ventas Promedio por Orden = \nAVERAGEX(\n    'Analisis de Ordenes',\n    'Analisis de Ordenes'[Ventas Totales]\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Productos Promedios Vendidos -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Productos Promedio por Orden</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Calcula la cantidad promedio de productos incluidos en cada orden.</p>
                            <pre><code>Productos Promedios Vendidos = \nAVERAGEX(\n    'Analisis de Ordenes',\n    'Analisis de Ordenes'[Cuenta de Producto]\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas del mes Pasado -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Ventas del Mes Pasado</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Obtiene las ventas totales del mes anterior para comparativas.</p>
                            <pre><code>Ventas del mes Pasado = \nCALCULATE(\n    [Ventas Totales],\n    DATEADD(Detalles1[Fecha].[Date], -1, MONTH)\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Diferencia mes -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Diferencia vs Mes Anterior</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Calcula la diferencia monetaria en ventas entre el mes actual y el anterior.</p>
                            <pre><code>Diferencia mes = [Ventas Totales] - [Ventas del mes Pasado]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Diferencia % mes -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Diferencia % vs Mes Anterior</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Muestra la variación porcentual de las ventas en comparación con el mes anterior.</p>
                            <pre><code>Diferencia % mes = DIVIDE([Diferencia mes], [Ventas Totales], 0)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas YTD -->
                    <div class="dax-accordion-item">
                        <div class="dax-accordion-header" onclick="this.nextElementSibling.classList.toggle('open')">
                            <h4>Ventas Acumuladas (YTD)</h4>
                            <i data-lucide="chevron-down"></i>
                        </div>
                        <div class="dax-accordion-content">
                            <p>Calcula las ventas acumuladas desde el inicio del año hasta la fecha actual.</p>
                            <pre><code>Ventas YTD = TOTALYTD([Ventas Totales], Detalles1[Fecha].[Date])</code></pre>
                        </div>
                    </div>
                </div>
            `,
            categories: ['power bi', 'dax'],
            tags: ['Power BI', 'DAX', 'Power Query', 'Análisis de Ventas', 'KPIs','UI/UX'],
            media: [
                { type: 'video', src: 'https://res.cloudinary.com/dlo3r0you/video/upload/v1754666297/Grabaci%C3%B3n_2025-08-08_111934_vn5dvn.mp4' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754666309/ralcion_redux_restaurant_arqk4k.png' }
            ],
            githubUrl: null,
            liveUrl: null
        },
        {
            title: 'VisorData RD - Observatorio de Datos Públicos (En Desarrollo)',
            // ***** INICIO DEL CAMBIO *****
            status: 'development', // Se añade el estado del proyecto
            // ***** FIN DEL CAMBIO *****
            desc: 'Plataforma de datos que centraliza, analiza y visualiza indicadores públicos y sociales de la República Dominicana.',
            longDesc: '<p>Este proyecto representa una oportunidad para unificar y aplicar mis conocimientos en <strong>ciencia de datos</strong>, <strong>machine learning con Python</strong>, gestión de bases de datos con <strong>SQL</strong> y desarrollo web front-end con <strong>HTML, CSS y JavaScript</strong>.</p><p>VisorData RD es un proyecto de ciencia e ingeniería de datos concebido para democratizar el acceso a la información pública en la República Dominicana. El objetivo es transformar datos crudos de fuentes oficiales en un recurso interactivo, comprensible y valioso para ciudadanos, periodistas, estudiantes e investigadores.</p>',
            categories: ['python', 'sql', 'web', 'data science'],
            tags: ['Python', 'SQL', 'Web', 'JavaScript', 'ETL', 'Machine Learning'],
            media: [
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754336596/virsorrs-inciio_iemnk3.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754336597/virsorrs-inciio-1_ncqr2g.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754336596/virsorrs-dashboards_zbfndz.png' }
            ],
            githubUrl: null,
            liveUrl: 'https://www.jeancarlosrosario.org/visordata-rd'
        }, 
        {
            title: 'Dashboard de Análisis de Ventas',
            desc: 'Dashboard en Power BI que analiza la estacionalidad y el detalle de órdenes para la empresa de libros PANDIL, utilizando medidas avanzadas en DAX.',
            longDesc: `
                <p>Este proyecto es un dashboard de análisis de ventas desarrollado en <strong>Power BI</strong> como respuesta a un examen de nivel Black Belt. El objetivo fue analizar la data de la empresa de libros "PANDIL" para descubrir insights sobre la <strong>estacionalidad</strong> y el comportamiento de las órdenes.</p>
                <p>Puse especial atención en el <strong>diseño y la experiencia de usuario (UI/UX)</strong>, creándolo desde cero para asegurar que la visualización fuera intuitiva. Utilizando <strong>Medidas DAX</strong> avanzadas, el dashboard ofrece una visión interactiva que permite a la gerencia entender el impacto de las temporadas clave y la efectividad de las estrategias de descuento.</p>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>¿Para Qué Podemos Usar Esto en la Vida Real?</h4>
                <p>Un dashboard de ventas es una herramienta esencial para cualquier negocio, ya que permite a los líderes y equipos comerciales:</p>
                <ul class='list-disc list-inside mt-2 space-y-2'>
                    <li><strong>Entender la estacionalidad:</strong> Identificar patrones de compra durante el año (como Navidad o Regreso a Clases) para planificar campañas de marketing y gestionar el inventario de forma proactiva.</li>
                    <li><strong>Evaluar el impacto de promociones:</strong> Medir la efectividad de los cupones de descuento y las ofertas de envío gratis para saber si realmente impulsan la ganancia o solo reducen el margen.</li>
                    <li><strong>Optimizar el ticket promedio:</strong> Analizar el valor y la cantidad de libros por orden para crear estrategias que incentiven a los clientes a comprar más en cada transacción.</li>
                    <li><strong>Comparar el rendimiento a lo largo del tiempo:</strong> Medir el crecimiento de las ventas año contra año para evaluar la salud del negocio y la efectividad de las estrategias a largo plazo.</li>
                </ul>
                <p class='mt-2'>Con estos insights, una empresa puede tomar decisiones basadas en datos para aumentar sus ingresos, mejorar su rentabilidad y fortalecer su posición en el mercado.</p>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>Medidas y Columnas DAX Implementadas</h4>
                <div class='dax-accordion'>
                    <!-- Columna Calculada: Temporada -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Columna: Temporada</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Clasifica cada fecha en una temporada de ventas: "Navidad", "Regreso a Clases" o "Regular".</p>
                            <pre><code>Temporada = \nSWITCH(TRUE(),\n    Fecha[Date] >= DATE(YEAR(Fecha[Date]),11,15) && Fecha[Date] <= DATE(YEAR(Fecha[Date]),12,31), "Navidad",\n    Fecha[Date] >= DATE(YEAR(Fecha[Date]),7,15) && Fecha[Date] <= DATE(YEAR(Fecha[Date]),8,15), "Regreso a Clases",\n    "Regular"\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas Brutas -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Brutas</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Suma total de los precios de todos los productos vendidos antes de descuentos.</p>
                            <pre><code>Ventas Brutas = SUM(DetalledeOrdenes[Precio])</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Descuentos -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Descuentos</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el valor total de los descuentos aplicados (10% en órdenes con cupón).</p>
                            <pre><code>Descuentos = \nCALCULATE(\n    [Ventas Brutas] * 0.10,\n    OrdenesTotales[Cupón Descuento] = TRUE()\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas Netas -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Netas</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula los ingresos totales después de aplicar los descuentos.</p>
                            <pre><code>Ventas Netas = [Ventas Brutas] - [Descuentos]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Costo Total -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Costo Total</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Suma de todos los costos de los productos vendidos.</p>
                            <pre><code>Costo Total = SUM(DetalledeOrdenes[Costo])</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Costo Envio gratis -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Costo Envío Gratis</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el costo total de los envíos que fueron marcados como gratuitos.</p>
                            <pre><code>Costo Envio gratis = \nSUMX(\n    FILTER(OrdenesTotales, OrdenesTotales[Envío Gratis] = TRUE()),\n    RELATED(CostoEnvios[Costo])\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Costo Total con Envio -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Costo Total con Envío</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Suma el costo de los productos y el costo de los envíos gratuitos.</p>
                            <pre><code>Costo Total con Envio = [Costo Total] + [Costo Envio gratis]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ganancia -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ganancia</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula la ganancia total restando los costos de las ventas brutas.</p>
                            <pre><code>Ganancia = [Ventas Brutas] - [Costo Total]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ganancia por Libro -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ganancia por Libro</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Itera sobre cada producto para calcular la ganancia total, útil para visualizaciones a nivel de libro.</p>
                            <pre><code>Ganancia por Libro = \nSUMX(\n    VALUES(DetalledeLibros[Código de Producto]),\n    CALCULATE([Ganancia])\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ordenes Totales -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Órdenes Totales</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Cuenta el número único de órdenes realizadas.</p>
                            <pre><code>Ordenes Totales = DISTINCTCOUNT(OrdenesTotales[# De Orden])</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Libros Totales -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Libros Totales</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Cuenta el número total de filas (libros) en los detalles de las órdenes.</p>
                            <pre><code>Libros Totales = COUNTROWS(DetalledeOrdenes)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Promedio Libros por Orden -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Promedio Libros por Orden</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula la cantidad promedio de libros vendidos en cada orden.</p>
                            <pre><code>Promedio Libros por Orden = \nDIVIDE([Libros Totales], [Ordenes Totales], 0)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Promedio ventas netas por orden -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Promedio Ventas Netas por Orden</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el valor promedio de venta neta para cada orden.</p>
                            <pre><code>Promedio ventas netas por orden = \nDIVIDE([Ventas Netas], [Ordenes Totales], 0)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas Navidad 2017 -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Navidad 2017</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Filtra las ventas netas para la temporada de Navidad del año 2017.</p>
                            <pre><code>Ventas Navidad 2017 = \nCALCULATE(\n    [Ventas Netas],\n    Fecha[Year] = 2017,\n    Fecha[Temporada] = "Navidad"\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas Navidad 2018 -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Navidad 2018</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Filtra las ventas netas para la temporada de Navidad del año 2018.</p>
                            <pre><code>Ventas NAvidad 2018 = \nCALCULATE(\n    [Ventas Netas],\n    Fecha[Year] = 2018,\n    Fecha[Temporada] = "Navidad"\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Crecimiento Navidad en pesos -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Crecimiento Navidad en Pesos</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula la diferencia absoluta en ventas de Navidad entre 2018 y 2017.</p>
                            <pre><code>Crecimiento Navidad en pesos = [Ventas NAvidad 2018] - [Ventas Navidad 2017]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Crecimiento Navidad en Porcentaje -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Crecimiento Navidad %</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Mide el crecimiento porcentual de las ventas durante la temporada de Navidad entre 2017 y 2018.</p>
                            <pre><code>Crecimiento Navidad en Porcentaje = \nDIVIDE([Crecimiento Navidad en pesos], [Ventas Navidad 2017], 0)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas regreso 2017 -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Regreso a Clases 2017</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Filtra las ventas netas para la temporada de Regreso a Clases del año 2017.</p>
                            <pre><code>Ventas regreso 2017 = \nCALCULATE(\n    [Ventas Netas],\n    Fecha[Year] = 2017,\n    Fecha[Temporada] = "Regreso a Clases"\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas regreso 2018 -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Regreso a Clases 2018</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Filtra las ventas netas para la temporada de Regreso a Clases del año 2018.</p>
                            <pre><code>Ventas regreso 2018 = \nCALCULATE(\n    [Ventas Netas],\n    Fecha[Year] = 2018,\n    Fecha[Temporada] = "Regreso a Clases"\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Crecimiento Regreso en pesos -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Crecimiento Regreso a Clases en Pesos</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula la diferencia absoluta en ventas de Regreso a Clases entre 2018 y 2017.</p>
                            <pre><code>Crecimiento Regreso en pesos = [Ventas regreso 2018] - [Ventas regreso 2017]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Crecimiento regreso en procentaje -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Crecimiento Regreso a Clases %</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Mide el crecimiento porcentual de las ventas durante la temporada de Regreso a Clases.</p>
                            <pre><code>Crecimiento regreso en procentaje = \nDIVIDE([Crecimiento Regreso en pesos], [Ventas regreso 2017], 0)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas Netas año pasado -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Netas Año Pasado</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula las ventas netas para el mismo período del año anterior.</p>
                            <pre><code>Ventas Netas año pasado = \nCALCULATE(\n    [Ventas Netas],\n    DATEADD(Fecha[Date], -1, YEAR)\n)</code></pre>
                        </div>
                    </div>
                </div>
            `,
            categories: ['power bi', 'dax', 'business intelligence', 'UI/UX'],
            tags: ['Power BI', 'DAX', 'UI/UX', 'Business Intelligence', 'Análisis de Ventas'],
            media: [
                { type: 'video', src: 'https://res.cloudinary.com/dlo3r0you/video/upload/v1754340404/Dashboard_pandil_nc6w8g.mp4' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754578970/Relacion_-_pandil_xb5lxc.png' }
            ],
            githubUrl: null,
            liveUrl: null
        },
        {
            title: 'J&O Punta Cana Transfer - Sitio Web de Reservas',
            desc: 'Sitio web completo para una empresa de transporte turístico, enfocado en la experiencia de usuario y la captación de reservas.',
            longDesc: '<p>Desarrollo integral del sitio web para <strong>J&O Punta Cana Transfer</strong>, una empresa de transporte privado en República Dominicana. El proyecto fue construido desde cero, abarcando desde el diseño del logo y la identidad visual hasta la implementación completa de la plataforma.</p><p>La web cuenta con un sistema de reservas dinámico que permite a los usuarios cotizar y solicitar traslados fácilmente. Se utilizó <strong>HTML</strong> semántico, <strong>CSS</strong> para un diseño moderno y totalmente responsivo, y <strong>JavaScript</strong> para gestionar la interactividad, incluyendo el menú de navegación, el slider de destinos, y los formularios de contacto y reserva que se conectan directamente con WhatsApp.</p>',
            categories: ['web'],
            tags: ['Web', 'HTML', 'CSS', 'JavaScript', 'Diseño Web', 'Reservas', 'UI/UX'],
            media: [
                { type: 'video', src: 'https://res.cloudinary.com/dlo3r0you/video/upload/v1754577756/pagina_web_jyopuntacanatrasfer_nvivzy.mp4' }
            ],
            githubUrl: null,
            liveUrl: 'https://www.jyopuntacanatransfer.com/'
        },
        {
            title: 'Estructurando Datos desde una columna de Texto con SQL',
            desc: 'Este proyecto responde a un reto común: ¿cómo extraer y estructurar información valiosa cuando está atrapada en una sola columna de texto? Se demuestra el proceso completo usando solo SQL.',
            longDesc: `
                <p>¿Qué haces cuando toda la información que necesitas está atrapada en una única columna de texto, sin estructura alguna? Este proyecto responde a esa pregunta, demostrando cómo se puede usar exclusivamente <strong>SQL</strong> para llevar a cabo un proceso completo de <strong>ingeniería de datos</strong>.</p>
                <p>El punto de partida fue una tabla con datos de reseñas de Disney en un formato desestructurado. El reto consistió en <strong>extraer, limpiar, estandarizar y estructurar</strong> cada pieza de información en una tabla relacional limpia, lista para el análisis.</p>
                
                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>¿Para Qué Podemos Usar Esto en la Vida Real?</h4>
                <p>Esta habilidad es crucial en muchos escenarios del mundo real donde los datos no siempre vienen en un formato ordenado. Por ejemplo:</p>
                <ul class='list-disc list-inside mt-2 space-y-2'>
                    <li><strong>Análisis de feedback de clientes:</strong> Extraer temas, productos mencionados y sentimiento de miles de comentarios de un formulario de "caja de texto libre".</li>
                    <li><strong>Procesamiento de logs de sistemas:</strong> Separar la información de logs de servidores (como fecha, tipo de error, IP de usuario) que a menudo se registran como una sola línea de texto.</li>
                    <li><strong>Estandarización de direcciones:</strong> Tomar direcciones escritas en un solo campo y dividirlas en calle, ciudad, estado y código postal para análisis geográfico o envíos.</li>
                    <li><strong>Migración de datos antiguos:</strong> Convertir datos de sistemas heredados, donde la información a menudo se almacenaba de forma concatenada, a bases de datos modernas y estructuradas.</li>
                </ul>
                <p class='mt-2'>Saber manipular texto con SQL te permite transformar datos "sucios" en un activo valioso y analizable para cualquier organización.</p>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>Ejemplo de los Datos Utilizados</h4>
                <div class='dax-accordion'>
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Tabla: DISNEYREW (Datos Crudos)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <pre><code>
        disneyrew_id | Information
        -------------|------------------------------------------------------------------------------------
        1            | Rating: 4, Year_Month: 2019-4, Reviewer_Location: Australia, Review_Text: If you...
        2            | Rating: 4, Year_Month: 2019-5, Reviewer_Location: Philippines, Review_Text: Its...
        3            | Rating: 4, Year_Month: 2019-4, Reviewer_Location: United Arab Emirates, Review_T...
        ...          | ...</code></pre>
                        </div>
                    </div>
                </div>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>Técnicas y Consultas Clave</h4>
                <div class='dax-accordion'>
                    <!-- 1. Extracción de Datos -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>1. Extracción de Datos (Text Parsing)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Utiliza funciones de texto para separar la columna 'Information' en campos individuales. Arroja una tabla con columnas separadas para año, mes, parque, país, rating y comentario.</p>
                            <pre><code>SELECT
            SUBSTRING_INDEX(a.Fecha,"-",1) AS año,
            SUBSTRING_INDEX(a.Fecha,"-",-1) AS mes,
            parque, pais_origen, rating, comentario
        FROM(
            SELECT
                SUBSTRING_INDEX(SUBSTRING_INDEX(information, ', Reviewer_Location', 1), 'Year_Month: ', -1) AS fecha,
                SUBSTRING_INDEX(SUBSTRING_INDEX(information, ', Year_Month', 1), 'Rating: ', -1) AS rating,
                SUBSTRING_INDEX(SUBSTRING_INDEX(information, ', Review_Text', 1), 'Reviewer_Location: ', -1) AS pais_origen,
                SUBSTRING_INDEX(SUBSTRING_INDEX(information, 'Branch:', 1), 'Review_Text: ', -1) AS comentario,
                SUBSTRING_INDEX(information, 'Branch:', -1) AS parque
            FROM disneyrew
        ) AS a;</code></pre>
                        </div>
                    </div>
                    <!-- 2. Limpieza y Estandarización -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>2. Limpieza y Estandarización</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Toma los datos extraídos para convertir tipos de datos, manejar nulos y estandarizar valores de texto. Arroja una tabla nueva y limpia ('disneycleann') lista para el análisis.</p>
                            <pre><code>CREATE TABLE disneycleann AS
        SELECT
            CASE WHEN mes = 'missing' THEN NULL ELSE CONVERT(mes, UNSIGNED INT) END AS mes,
            CASE WHEN año = 'missing' THEN NULL ELSE CONVERT(año, UNSIGNED INT) END AS año,
            REPLACE(REPLACE(pais_origen, 'United States', 'US'), 'United Kingdom', 'UK') AS pais_origen,
            TRIM(comentario) AS comentario,
            parque,
            rating
        FROM (
            SELECT
                CONVERT(rating, UNSIGNED INT) AS rating,
                SUBSTRING_INDEX(a.Fecha,'-',1) AS año,
                SUBSTRING_INDEX(a.Fecha,'-',-1) AS mes,
                pais_origen,
                parque,
                TRIM(comentario) AS comentario
            FROM(
                SELECT
                    SUBSTRING_INDEX(SUBSTRING_INDEX(information, ', Reviewer_Location', 1), 'Year_Month: ', -1) AS fecha,
                    SUBSTRING_INDEX(SUBSTRING_INDEX(information, ', Year_Month', 1), 'Rating: ', -1) AS rating,
                    SUBSTRING_INDEX(SUBSTRING_INDEX(information, ', Review_Text', 1), 'Reviewer_Location: ', -1) AS pais_origen,
                    SUBSTRING_INDEX(SUBSTRING_INDEX(information, 'Branch:', 1), 'Review_Text: ', -1) AS comentario,
                    SUBSTRING_INDEX(information, 'Branch:', -1) AS parque
                FROM disneyrew
            ) AS a
        ) AS aa;</code></pre>
                        </div>
                    </div>
                    <!-- 3. Búsqueda por Patrones -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>3. Búsqueda por Patrones (LIKE & REGEXP)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Busca palabras clave dentro de los comentarios para un análisis de sentimiento simple. Arroja el conteo de reseñas para cada categoría de sentimiento (Aman, Bien, Mal).</p>
                            <pre><code>SELECT
            CASE 
                WHEN comentario LIKE '%love%' THEN 'Aman'
                WHEN comentario LIKE '%good%' THEN 'Bien'
                WHEN comentario LIKE '%bad%' THEN 'Mal'
                ELSE 'Ninguno' 
            END AS sentimiento,
            COUNT(*)
        FROM disneycleann
        GROUP BY 1
        ORDER BY 2 DESC;</code></pre>
                        </div>
                    </div>
                    <!-- 4. Construcción y Agrupación de Texto -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>4. Construcción y Agrupación de Texto</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Agrupa los datos por parque y concatena los países de origen de los visitantes en una sola lista. Arroja una tabla que muestra qué países han visitado cada parque.</p>
                            <pre><code>SELECT
            parque,
            GROUP_CONCAT(DISTINCT pais_origen ORDER BY pais_origen SEPARATOR ', ') AS paises_visitantes
        FROM disneycleann
        GROUP BY 1;</code></pre>
                        </div>
                    </div>
                </div>
            `,
            categories: ['sql', 'data cleaning', 'data analysis'],
            tags: ['SQL', 'Data Cleaning', 'Text Manipulation', 'RegEx', 'ETL', 'Data Parsing', 'Data Engineering'],
            media: [
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754592863/0._Datos_crudos_gwlfpp.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754592863/1._Extracci%C3%B3n_de_Datos_Text_Parsing_yspegv.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754592878/2._Limpieza_y_Estandarizaci%C3%B3n_de_Datos_hua5is.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754592908/3._B%C3%BAsqueda_por_Patrones_LIKE_y_REGEXP_tkzies.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754592943/4._Construcci%C3%B3n_y_Agrupaci%C3%B3n_de_Texto_vxnndp.png' }
            ],
            githubUrl: null,
            liveUrl: null
        },
        {
            title: 'Dashboard de Inventario para Almacén',
            desc: 'Dashboard en Power BI para la gestión de inventario, análisis de compras y métricas de calidad.',
            longDesc: `
                <p>Este proyecto es un dashboard comprensivo para la gestión de inventarios en un almacén de madera, creado como parte de una competencia de análisis de datos. El objetivo fue desarrollar un sistema en <strong>Power Pivot y Power BI</strong> para calcular métricas clave de calidad y operativas a lo largo del tiempo.</p>
                <p>Puse especial atención en el <strong>diseño y la experiencia de usuario (UI/UX)</strong>, la visualización final, es de mi completa autoría.</p>
                
                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>¿Para Qué Podemos Usar Esto en la Vida Real?</h4>
                <p>Un dashboard de inventario como este es una herramienta vital para cualquier negocio que maneje productos físicos. Permite a los gerentes:</p>
                <ul class='list-disc list-inside mt-2 space-y-2'>
                    <li><strong>Evitar la falta de stock:</strong> Identificar rápidamente los productos que se están agotando para reponerlos a tiempo y no perder ventas.</li>
                    <li><strong>Optimizar las compras:</strong> Analizar qué productos tienen mayor rotación para saber cuánto y cuándo comprar, evitando el exceso de inventario que inmoviliza capital.</li>
                    <li><strong>Mejorar la rentabilidad:</strong> Monitorear el margen de ganancia (GMROI) por producto para enfocarse en los artículos más rentables y ajustar la estrategia de precios.</li>
                    <li><strong>Reducir pérdidas:</strong> Controlar las salidas de inventario por mermas o daños para tomar acciones correctivas y proteger las ganancias.</li>
                </ul>
                <p class='mt-2'>En definitiva, un dashboard así transforma los datos de inventario en decisiones inteligentes que impulsan la eficiencia y la rentabilidad del negocio.</p>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>Medidas DAX Implementadas</h4>
                <div class='dax-accordion'>
                    <!-- Medida: Ventas Totales -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Totales</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el ingreso total multiplicando el precio por la cantidad para todas las transacciones de venta.</p>
                            <pre><code>Ventas Totales = \nSUMX(\n    FILTER(Principal, Principal[Clave de Concepto] = 41),\n    Principal[Precio] * Principal[Monto]\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Compras Totales -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Compras Totales</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el costo total de los productos adquiridos.</p>
                            <pre><code>Compras Totales = \nSUMX(\n    FILTER(Principal, [Clave de Concepto] = 1),\n    [Costo] * [Monto]\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Todas las Entradas -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Todas las Entradas</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Suma el valor de todas las entradas de inventario (compras, devoluciones, etc.).</p>
                            <pre><code>Todas las Entradas = \nSUMX(\n    FILTER(Principal, [Clave de Concepto] <= 4),\n    [Costo] * [Monto]\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Todas las Salidas -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Todas las Salidas</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Suma el valor de todas las salidas de inventario (ventas, mermas, etc.).</p>
                            <pre><code>Todas las Salidas = \nSUMX(\n    FILTER(Principal, [Clave de Concepto] > 4),\n    [Costo] * [Monto]\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Entradas acumuladas -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Entradas Acumuladas</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el total de entradas de inventario hasta el día anterior al período seleccionado.</p>
                            <pre><code>Entradas acumuladas = \nCALCULATE(\n    [Todas las Entradas],\n    FILTER(ALL('Calendario'), 'Calendario'[Date] < MIN('Calendario'[Date]))\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Salidas acumuladas -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Salidas Acumuladas</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el total de salidas de inventario hasta el día anterior al período seleccionado.</p>
                            <pre><code>Salidas acumuladas = \nCALCULATE(\n    [Todas las Salidas],\n    FILTER(ALL('Calendario'), 'Calendario'[Date] < MIN('Calendario'[Date]))\n)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Inventario Inicial (Master) -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Inventario Inicial (Master)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Valoriza el inventario inicial total multiplicando las unidades iniciales por su costo inicial.</p>
                            <pre><code>Inventario Inicial (Master) = \nSUMX(Productos, Productos[Inventario Inicial] * Productos[Costo Inicial])</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Inventario inicial (el bueno) -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Inventario Inicial (Bueno)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Ajusta el inventario inicial master con las entradas y salidas acumuladas para obtener el stock real al inicio del período.</p>
                            <pre><code>Inventario inicial (el bueno) = [Inventario Inicial (Master)] + [Entradas acumuladas] - [Salidas acumuladas]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Inventario final (el bueno) -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Inventario Final (Bueno)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el inventario disponible al final del período seleccionado.</p>
                            <pre><code>Inventario final (el bueno) = [Inventario inicial (el bueno)] + [Todas las Entradas] - [Todas las Salidas]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Inventario Final (Master) -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Inventario Final (Master)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el valor final del inventario basado en el inventario inicial master y los movimientos del período.</p>
                            <pre><code>Inventario Final (Master) = [Inventario Inicial (Master)] + [Todas las Entradas] - [Todas las Salidas]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Costo de Ventas -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Costo de Ventas</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el costo de la mercancía vendida durante el período.</p>
                            <pre><code>Costo de Ventas = [Inventario inicial (el bueno)] + [Compras Totales] - [Inventario final (el bueno)]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Margen Bruto -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Margen Bruto</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Diferencia entre las ventas totales y el costo de ventas.</p>
                            <pre><code>Margen Bruto = [Ventas Totales] - [Costo de Ventas]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Margen Bruto en % -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Margen Bruto en %</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Expresa el margen bruto como un porcentaje de las ventas totales.</p>
                            <pre><code>Margen Bruto en % = [Margen Bruto] / [Ventas Totales]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Inventario Promedio -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Inventario Promedio</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el valor promedio del inventario durante un período.</p>
                            <pre><code>Inventario Promedio = ([Inventario inicial (el bueno)] + [Inventario final (el bueno)]) / 2</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Rotacion de inventario -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Rotación de Inventario</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Indica cuántas veces se ha vendido y reemplazado el inventario en un período.</p>
                            <pre><code>Rotacion de inventario = [Costo de Ventas] / [Inventario Promedio]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: GMROI -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>GMROI</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Retorno de Inversión del Margen Bruto, una métrica clave de rentabilidad del inventario.</p>
                            <pre><code>GMROI = [Margen Bruto en %] * [Rotacion de inventario]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Dias en el Periodo -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Días en el Período</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Cuenta el número total de días en el contexto de fecha actual.</p>
                            <pre><code>Dias en el Periodo = COUNTROWS(Calendario)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Ventas diarias -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Ventas Diarias</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el promedio de ventas por día en el período seleccionado.</p>
                            <pre><code>Ventas diarias = [Ventas Totales] / [Dias en el Periodo]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Dias de inventario -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Días de Inventario</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Número promedio de días que un artículo permanece en el inventario antes de ser vendido.</p>
                            <pre><code>Dias de inventario = DIVIDE([Inventario Promedio], [Ventas diarias], 0)</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Consumo Promedio diario -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Consumo Promedio Diario</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Valor promedio de las salidas de inventario por día.</p>
                            <pre><code>Consumo Promedio diario = [Todas las Salidas] / [Dias en el Periodo]</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Inventario Minimo -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Inventario Mínimo</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Calcula el stock de seguridad basado en 7 días de consumo promedio.</p>
                            <pre><code>Inventario Minimo = [Consumo Promedio diario] * 7</code></pre>
                        </div>
                    </div>
                    <!-- Medida: Inventario Maximo -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Inventario Máximo</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p>Establece el nivel máximo de inventario como el doble del mínimo.</p>
                            <pre><code>Inventario Maximo = [Inventario Minimo] * 2</code></pre>
                        </div>
                    </div>
                </div>
            `,
            categories: ['power bi', 'dax'],
            tags: ['Power BI', 'DAX', 'Power Pivot', 'Gestión de Inventario', 'UI/UX'],
            media: [
                { type: 'video', src: 'https://res.cloudinary.com/dlo3r0you/video/upload/v1754598637/Grabaci%C3%B3n_2025-08-07_162723_mdkunl.mp4' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754598990/dashboard_inventario_z2h6n0.png' }
            ],
            githubUrl: null,
            liveUrl: null
        },
        {
            title: 'Análisis de Datos con Pandas',
            desc: 'Colección de scripts de Python en Google Colab que demuestran la creación y manipulación de DataFrames con la librería Pandas.',
            longDesc: `
                <p>Este proyecto es una serie de notebooks prácticos desarrollados en <strong>Google Colab</strong> para ilustrar los fundamentos del análisis de datos en Python utilizando la poderosa librería <strong>Pandas</strong>. El objetivo es mostrar, paso a paso, cómo abordar dos de las tareas más comunes en la ciencia de datos: la creación de estructuras de datos y su posterior manipulación para la limpieza y el análisis.</p>
                <p>Los notebooks están diseñados para ser interactivos y educativos, sirviendo como una guía de referencia rápida o como material de aprendizaje para quienes se inician en el mundo de los datos con Python.</p>
                <h4 class="text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white">Scripts Disponibles:</h4>
                <ul class="list-disc list-inside space-y-2">
                    <li>
                        <strong>Creando DataFrames:</strong> Un recorrido por las diversas formas de construir un DataFrame desde cero, ya sea a partir de diccionarios, listas, archivos CSV y más.
                        <a href="https://colab.research.google.com/drive/1ORVuDCDGeOuBvAA5iCIXK1rDu1QF7fSD?usp=sharing" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center ml-2">Ver en Colab <i data-lucide="arrow-up-right" class="w-4 h-4 ml-1"></i></a>
                    </li>
                    <li>
                        <strong>Manipulando DataFrames:</strong> Demostración de las técnicas esenciales para seleccionar, filtrar, limpiar, agrupar y transformar datos dentro de un DataFrame.
                        <a href="https://colab.research.google.com/drive/1M_4R1qkp56Gprj4js3ZgfIdVFAB9APIp?usp=sharing" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center ml-2">Ver en Colab <i data-lucide="arrow-up-right" class="w-4 h-4 ml-1"></i></a>
                    </li>
                </ul>
            `,
            categories: ['python', 'data analysis'],
            tags: ['Python', 'Pandas', 'Google Colab', 'DataFrames', 'Data Manipulation'],
            media: [
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754601005/dashboard_inventario_nw0myh.png' }
            ],
            githubUrl: null,
            liveUrl: null
        },
        {
            title: 'Portafolio Personal',
            desc: 'El propio sitio web que estás viendo. Un proyecto personal para centralizar mi experiencia, habilidades y proyectos en un solo lugar.',
            longDesc: '<p>Este portafolio es en sí mismo un proyecto clave, desarrollado para servir como mi carta de presentación digital. Fue construido desde cero utilizando <strong>HTML</strong>, <strong>CSS con Tailwind CSS</strong> y <strong>JavaScript</strong> puro para asegurar un rendimiento óptimo y un control total sobre el diseño y la interactividad.</p><p>El objetivo era crear una experiencia de usuario limpia, moderna y totalmente responsiva, donde la navegación fuera intuitiva. Todas las funcionalidades, desde los filtros dinámicos de proyectos y el carrusel, hasta los modales interactivos y el cambio de tema (claro/oscuro), fueron implementadas con JavaScript para demostrar mis habilidades en el desarrollo front-end.</p>',
            categories: ['web'],
            tags: ['Web', 'HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'UI/UX'],
            media: [
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754601382/potafolio_persnal_meix1a.png' }
            ],
            githubUrl: null,
            liveUrl: null
        },
        {
            title: 'Análisis de Experimentos (A/B Testing) con SQL',
            desc: 'Análisis de resultados de pruebas A/B utilizando SQL para evaluar métricas binarias y continuas, aplicando técnicas estadísticas para determinar la significancia.',
            longDesc: `
                <p>Este proyecto demuestra cómo utilizar <strong>SQL</strong> para analizar los resultados de diferentes tipos de experimentos (A/B tests). A partir de una tabla de datos sin procesar, se aplican diversas consultas para agregar y comparar el rendimiento entre grupos de control y variantes.</p>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>¿Para Qué Podemos Usar Esto en la Vida Real?</h4>
                <p>El A/B testing es fundamental para tomar decisiones basadas en datos. Por ejemplo, una empresa podría usarlo para:</p>
                <ul class='list-disc list-inside mt-2 space-y-2'>
                    <li><strong>Decidir el diseño de una página web:</strong> Probar si un botón de 'Comprar ahora' de color verde (variante A) genera más clics que uno de color azul (variante B).</li>
                    <li><strong>Optimizar campañas de marketing:</strong> Enviar dos versiones de un correo electrónico con diferentes asuntos para ver cuál tiene una mayor tasa de apertura.</li>
                    <li><strong>Mejorar una aplicación móvil:</strong> Mostrar a un grupo de usuarios una nueva función (variante A) y a otro no (control) para medir si aumenta el tiempo de uso de la app.</li>
                </ul>
                <p class='mt-2'>En resumen, el A/B testing permite a las empresas probar cambios de forma controlada y elegir la opción que mejor funcione para alcanzar sus objetivos.</p>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>Ejemplo de los Datos Utilizados</h4>
                <div class='dax-accordion'>
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Tabla: PAGINAWEB</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <pre><code>
        user_id | variant | views | clicks | purchased_items | experiment_date | lastpurch_date | country
        --------|---------|-------|--------|-----------------|-----------------|----------------|----------
        1       | control | 12    | 0      | 4               | 2020-01-01      | 2020-01-10     | Argentina
        ...     | ...     | ...   | ...    | ...             | ...             | ...            | ...</code></pre>
                        </div>
                    </div>
                </div>
                
                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>Consultas SQL Implementadas</h4>
                <div class='dax-accordion'>
                    <!-- 1. Experimentos Binarios -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>1. Experimentos Binarios (Prueba de Chi-cuadrado)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Agrupa los resultados de una métrica binaria (hizo clic / no hizo clic). Arroja una tabla de contingencia y la tasa de conversión por variante, datos listos para una prueba de Chi-cuadrado.</p>
                            <pre><code class='mt-4'>-- Conteo para tabla de contingencia
        SELECT
            variant,
            COUNT(CASE WHEN clicks = 1 THEN user_id END) AS si_click,
            COUNT(CASE WHEN clicks = 0 THEN user_id END) AS no_click
        FROM 
            paginaweb
        GROUP BY 1;

        -- Cálculo de tasa de conversión
        SELECT
            variant,
            COUNT(user_id) AS usuarios_totales,
            COUNT(CASE WHEN clicks = 1 THEN user_id END) AS accion_realizada,
            COUNT(CASE WHEN clicks = 1 THEN user_id END) / COUNT(user_id) AS pct_clicks
        FROM 
            paginaweb
        GROUP BY 1;</code></pre>
                        </div>
                    </div>
                    <!-- 2. Experimentos Continuos -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>2. Experimentos Continuos (Prueba T-Student)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Calcula los estadísticos descriptivos para una métrica continua (como el número de vistas). Arroja la media y la desviación estándar por variante, datos necesarios para una prueba T-Student.</p>
                            <pre><code class='mt-4'>SELECT
            variant,
            COUNT(user_id) AS cohort_total,
            AVG(views) AS media,
            ROUND(STD(views),4) AS desv
        FROM
            paginaweb
        GROUP BY 1;</code></pre>
                        </div>
                    </div>
                    <!-- 3. Métrica Continua a Binaria -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>3. Conversión de Métrica Continua a Binaria</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Transforma una métrica continua (artículos comprados) en una binaria (¿compró o no?). Arroja el número y porcentaje de usuarios que realizaron la compra por variante.</p>
                            <pre><code class='mt-4'>SELECT
            variant,
            COUNT(DISTINCT user_id) AS cohort_total,
            COUNT(CASE WHEN purchased_items > 0 THEN user_id END) AS compras,
            COUNT(CASE WHEN purchased_items = 0 THEN user_id END) AS no_compras,
            COUNT(CASE WHEN purchased_items > 0 THEN user_id END) / COUNT(DISTINCT user_id) AS pct_compra
        FROM
            paginaweb
        GROUP BY 1;</code></pre>
                        </div>
                    </div>
                    <!-- 4. Cajas de Tiempo -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>4. Análisis con Cajas de Tiempo (Timeboxing)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Analiza el comportamiento de los usuarios dentro de un período de tiempo fijo (ej. 15 días). Arroja el promedio y la desviación estándar de una métrica para los usuarios que actuaron en ese plazo.</p>
                            <pre><code class='mt-4'>SELECT
            variant,
            COUNT(user_id) AS total_cohort,
            AVG(purchased_items) AS prom_articulos,
            ROUND(STDDEV(purchased_items),4) AS desv_articulos
        FROM(
            SELECT
                TIMESTAMPDIFF(DAY, experiment_date, lastpurch_date) AS dif_dias,
                variant,
                user_id,
                purchased_items
            FROM
                paginaweb
            WHERE TIMESTAMPDIFF(DAY, experiment_date, lastpurch_date) <= 15
        ) a
        GROUP BY 1;</code></pre>
                        </div>
                    </div>
                    <!-- 5. Análisis Pre/Post -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>5. Análisis Pre/Post</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Compara el rendimiento antes y después de un cambio, sin un grupo de control. Arroja la tasa de conversión para los períodos definidos como 'PRE' y 'POST'.</p>
                            <pre><code class='mt-4'>SELECT
            CASE 
                WHEN experiment_date BETWEEN '2020-01-01' AND '2020-01-05' THEN 'PRE'
                WHEN experiment_date BETWEEN '2020-01-06' AND '2020-01-10' THEN 'POST' 
            END AS variante,
            COUNT(user_id) AS total_cohort,
            COUNT(CASE WHEN purchased_items > 0 THEN user_id END) AS compra,
            COUNT(CASE WHEN purchased_items > 0 THEN user_id END) / COUNT(user_id) AS pct_compra
        FROM paginaweb
        GROUP BY 1;</code></pre>
                        </div>
                    </div>
                    <!-- 6. Experimentos Naturales -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>6. Análisis de Experimentos Naturales</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Utiliza una segmentación existente (como el país) para comparar grupos no asignados aleatoriamente. Arroja la tasa de conversión por cada segmento (país).</p>
                            <pre><code class='mt-4'>SELECT
            country AS pais,
            COUNT(user_id) AS cohort_total,
            COUNT(CASE WHEN purchased_items > 0 THEN user_id END) AS compras,
            COUNT(CASE WHEN purchased_items > 0 THEN user_id END) / COUNT(user_id) AS pct_compras
        FROM
            paginaweb
        WHERE country IN ('Chile', 'Argentina')
        GROUP BY 1;</code></pre>
                        </div>
                    </div>
                </div>
            `,
            categories: ['sql', 'data analysis', 'a/b testing'],
            tags: ['SQL', 'A/B Testing', 'Estadística', 'Análisis de Datos', 'Chi-cuadrada', 'T-Student'],
            media: [
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754602870/0._tabla_wsx2dt.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754602871/1._Experimentos_Binarios_Prueba_de_Chi-cuadrada_wgc0bj.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754602875/2._Experimentos_Continuos_Prueba_T-Student_nrahyq.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754603086/3._Conversi%C3%B3n_de_M%C3%A9trica_Continua_a_Binaria_oiskci.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754602876/4._An%C3%A1lisis_con_Cajas_de_Tiempo_Timeboxing_rwvow8.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754602876/5._An%C3%A1lisis_Pre-Post_vqn9l8.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754602878/6._An%C3%A1lisis_de_Experimentos_Naturales_kcw4ct.png' }
            ],
            githubUrl: null,
            liveUrl: null
        },
        {
            title: 'Análisis de Cohorte con SQL',
            desc: 'Proyecto de análisis de datos en SQL para entender el comportamiento de cohortes de clientes y legisladores, midiendo retención, supervivencia y valor.',
            longDesc: `
                <p>Este proyecto es un análisis profundo de cohortes utilizando <strong>SQL</strong> para entender patrones de comportamiento a lo largo del tiempo. Se aplicaron varias técnicas avanzadas de análisis generacional a dos conjuntos de datos distintos: una supertienda y legisladores de EE. UU.</p>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>¿Para Qué Podemos Usar Esto en la Vida Real?</h4>
                <p>Imagina que tienes una <strong>tienda online</strong>. Con un análisis de cohorte, puedes responder preguntas cruciales como:</p>
                <ul class='list-disc list-inside mt-2 space-y-2'>
                    <li><strong>¿Los clientes que atraemos con la campaña de Navidad gastan más a largo plazo que los que llegan por la campaña de verano?</strong> Esto te ayuda a optimizar tu presupuesto de marketing.</li>
                    <li><strong>¿Qué porcentaje de los nuevos usuarios de nuestra app móvil siguen activos después de 3 meses?</strong> Si la retención es baja, quizás necesites mejorar la experiencia inicial (onboarding) de la app.</li>
                    <li><strong>¿Los clientes que compran primero un producto de bajo costo (categoría A) tienden a comprar luego productos más caros (categoría B)?</strong> Esto te permite crear estrategias de venta cruzada (cross-selling) y aumentar el valor de vida del cliente (CLV).</li>
                </ul>
                <p class='mt-2'>En esencia, el análisis de cohorte te permite pasar de métricas generales a un entendimiento profundo de grupos específicos de usuarios, tomando decisiones más inteligentes y estratégicas para el negocio.</p>

                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>Ejemplo de los Datos Utilizados</h4>
                <div class='dax-accordion'>
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Tabla: SUPERTIENDA</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <pre><code>
        ID_Orden         | Categoria                | Nombre_Cliente   | Fecha_Orden  | Ventas
        -----------------|--------------------------|------------------|--------------|----------
        US-2019-103800   | Suministros de Oficina   | Darren Powers    | 2019-01-03   | 16.448
        US-2019-112326   | Suministros de Oficina   | Phillina Ober    | 2019-01-04   | 3.54
        US-2019-167199   | Muebles                  | Maria Etezadi    | 2019-01-06   | 2573.82
        US-2019-167199   | Tecnología               | Maria Etezadi    | 2019-01-06   | 755.96
        ...              | ...                      | ...              | ...          | ...</code></pre>
                        </div>
                    </div>
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Tabla: LEGISLADORES</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <pre><code>
        IDLegislador  | DipSen  | InicioPeriodo  | FinPeriodo   | Estado
        --------------|---------|----------------|--------------|---------
        B000944       | rep     | 1993-01-05     | 1995-01-03   | OH
        C001070       | sen     | 2007-01-04     | 2013-01-03   | PA
        F000062       | sen     | 1992-11-10     | 1995-01-03   | CA
        ...           | ...     | ...            | ...          | ...</code></pre>
                        </div>
                    </div>
                </div>

                <p class='mt-6'>El análisis se divide en cuatro áreas clave: <strong>Análisis de Retención</strong> para ver cuántos clientes permanecen activos, <strong>Análisis de Supervivencia</strong> para medir la permanencia en períodos definidos, <strong>Análisis de Retorno</strong> para identificar ventas cruzadas, y <strong>Cálculos Acumulativos</strong> para determinar el Valor de Vida del Cliente (CLV).</p>
                
                <h4 class='text-lg font-bold mt-6 mb-2 text-slate-800 dark:text-white'>Consultas SQL Implementadas</h4>
                <div class='dax-accordion'>
                    <!-- Query: Retención de Clientes (Supertienda) -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Análisis de Retención de Clientes</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Calcula el porcentaje de clientes que regresan en los meses posteriores a su primera compra. Arroja el año de la cohorte, los meses transcurridos, el número de clientes retenidos y el porcentaje de retención.</p>
                            <pre><code class='mt-4'>SELECT \n    primer_ano,\n    periodos,\n    clientes_retenidos,\n    FIRST_VALUE(clientes_retenidos) OVER (PARTITION BY primer_ano ORDER BY periodos) AS tamano_cohorte,\n    ROUND(clientes_retenidos / FIRST_VALUE(clientes_retenidos) OVER (PARTITION BY primer_ano ORDER BY periodos), 2) AS pct_retenido\nFROM (\n    SELECT\n        EXTRACT(YEAR FROM primera_orden) AS primer_ano,\n        TIMESTAMPDIFF(MONTH, a.primera_orden, b.fecha_de_orden) AS periodos,\n        COUNT(DISTINCT a.Nombre_del_Cliente) AS clientes_retenidos\n    FROM (\n        SELECT\n            nombre_del_cliente,\n            MIN(fecha_de_orden) AS primera_orden\n        FROM supertienda\n        GROUP BY 1\n    ) AS a\n    JOIN supertienda b ON a.nombre_del_cliente = b.nombre_del_cliente\n    GROUP BY 1, 2\n) AS aa;</code></pre>
                        </div>
                    </div>
                    <!-- Query: Retención de Legisladores -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Análisis de Retención de Legisladores</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Mide cuántos legisladores de la cohorte del año 2000 continúan en su cargo en los años siguientes. Arroja el tipo de legislador (DipSen), los años transcurridos, el número de legisladores retenidos y el porcentaje de retención.</p>
                            <pre><code class='mt-4'>SELECT\n    dipsen,\n    periodo,\n    cohorte_retenido,\n    FIRST_VALUE(cohorte_retenido) OVER (PARTITION BY dipsen ORDER BY periodo) AS tamano_cohorte,\n    cohorte_retenido / FIRST_VALUE(cohorte_retenido) OVER (PARTITION BY dipsen ORDER BY periodo) AS porcentaje_retenido\nFROM (\n    SELECT\n        a.dipsen,\n        COALESCE(TIMESTAMPDIFF(YEAR, a.primerperiodo, c.fecha), 0) AS periodo,\n        COUNT(DISTINCT a.IDlegislador) AS cohorte_retenido\n    FROM (\n        SELECT\n            DISTINCT IDlegislador,\n            dipsen,\n            DATE('2000-01-01') AS primerperiodo,\n            MIN(inicioperiodo) AS iniciomin\n        FROM legisladoresusa\n        WHERE Inicioperiodo <= '2000-12-31' AND finperiodo >= '2000-01-01'\n        GROUP BY 1, 2, 3\n    ) AS a\n    JOIN legisladoresusa b ON a.IDlegislador = b.IDlegislador AND b.inicioperiodo >= a.iniciomin\n    LEFT JOIN tablafechas c ON c.fecha BETWEEN b.inicioperiodo AND b.finperiodo AND c.year >= 2000\n    GROUP BY 1, 2\n) AS aa;</code></pre>
                        </div>
                    </div>
                    <!-- Query: Análisis de Supervivencia -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Análisis de Supervivencia</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Calcula el porcentaje de legisladores que se mantienen en el cargo por 10 años o más. Arroja el siglo en que iniciaron, el tamaño de la cohorte, el número de legisladores que 'sobrevivieron' 10 años y el porcentaje correspondiente.</p>
                            <pre><code class='mt-4'>SELECT\n    siglo,\n    COUNT(DISTINCT IDlegislador) AS tamano_cohorte,\n    COUNT(DISTINCT CASE WHEN permanencia >= 10 THEN IDLegislador END) AS clubde10,\n    COUNT(DISTINCT CASE WHEN permanencia >= 10 THEN IDLegislador END) / COUNT(DISTINCT IDlegislador) AS pctclubde10\nFROM (\n    SELECT\n        IDlegislador,\n        FLOOR((YEAR(MIN(inicioperiodo)) + 99) / 100) AS siglo,\n        TIMESTAMPDIFF(YEAR, MIN(inicioperiodo), MAX(inicioperiodo)) AS permanencia\n    FROM legisladoresusa\n    GROUP BY 1\n) a\nGROUP BY 1;</code></pre>
                        </div>
                    </div>
                    <!-- Query: Análisis de Retorno (Cross-Selling) -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Análisis de Retorno (Venta Cruzada)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Mide el porcentaje de clientes que, tras comprar 'Suministros de Oficina', retornan para comprar 'Tecnología' en un plazo de 12 meses. Arroja el año de la cohorte, el número de clientes iniciales y el porcentaje de retorno para la venta cruzada.</p>
                            <pre><code class='mt-4'>SELECT\n    aa.cohort_anual,\n    ofi AS cohorte_inicial_oficina,\n    ofitec AS retornaron_por_tecnologia,\n    bb.ofitec / aa.ofi AS pct_retorno\nFROM (\n    SELECT\n        EXTRACT(YEAR FROM a.primera_orden) AS cohort_anual,\n        COUNT(DISTINCT a.Nombre_del_Cliente) AS ofi\n    FROM (\n        SELECT\n            Nombre_del_Cliente,\n            MIN(fecha_de_orden) AS primera_orden\n        FROM supertienda\n        WHERE categoria = 'Suministros de Oficina'\n        GROUP BY 1\n    ) a\n    GROUP BY 1\n) aa\nLEFT JOIN (\n    SELECT\n        EXTRACT(YEAR FROM a.primera_orden) AS cohort_anual,\n        COUNT(DISTINCT a.Nombre_del_Cliente) AS ofitec\n    FROM (\n        SELECT\n            Nombre_del_Cliente,\n            MIN(fecha_de_orden) AS primera_orden\n        FROM supertienda\n        WHERE categoria = 'Suministros de Oficina'\n        GROUP BY 1\n    ) a\n    JOIN supertienda b ON a.Nombre_del_Cliente = b.Nombre_del_Cliente\n        AND b.categoria = 'Tecnologia' AND b.Fecha_de_Orden > a.primera_orden\n    WHERE TIMESTAMPDIFF(MONTH, a.primera_orden, b.fecha_de_orden) <= 12\n    GROUP BY 1\n) bb ON aa.cohort_anual = bb.cohort_anual;</code></pre>
                        </div>
                    </div>
                    <!-- Query: Cálculos Acumulativos (CLV) -->
                    <div class='dax-accordion-item'>
                        <div class='dax-accordion-header' onclick='this.nextElementSibling.classList.toggle("open")'>
                            <h4>Análisis Acumulativo (CLV)</h4>
                            <i data-lucide='chevron-down'></i>
                        </div>
                        <div class='dax-accordion-content'>
                            <p class='mb-2'>Calcula el Valor de Vida del Cliente (CLV) promedio durante sus primeros 10 meses. Arroja el año, la primera categoría comprada por la cohorte, el número de órdenes promedio y el CLV.</p>
                            <pre><code class='mt-4'>SELECT\n    EXTRACT(YEAR FROM a.primera_orden) AS ano,\n    primera_categoria,\n    COUNT(DISTINCT a.nombre_del_cliente) AS cohort,\n    COUNT(b.fecha_de_orden) / COUNT(DISTINCT a.nombre_del_cliente) AS ordenes_por_cliente,\n    ROUND(SUM(b.ventas), 2) / COUNT(DISTINCT a.nombre_del_cliente) AS CLV\nFROM (\n    SELECT\n        DISTINCT nombre_del_cliente,\n        FIRST_VALUE(categoria) OVER (PARTITION BY nombre_del_cliente ORDER BY fecha_de_orden) AS primera_categoria,\n        MIN(fecha_de_orden) OVER (PARTITION BY nombre_del_cliente) AS primera_orden,\n        MIN(fecha_de_orden) OVER (PARTITION BY nombre_del_cliente) + INTERVAL 10 MONTH AS primeros_10\n    FROM supertienda\n) a\nLEFT JOIN supertienda b ON a.nombre_del_cliente = b.nombre_del_cliente\n    AND b.fecha_de_orden BETWEEN a.primera_orden AND a.primeros_10\nGROUP BY 1, 2;</code></pre>
                        </div>
                    </div>
                </div>
            `,
            categories: ['sql', 'data science'],
            tags: ['SQL', 'Análisis de Cohorte', 'Retención', 'CLV', 'MySQL'],
            media: [
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754683644/1._An%C3%A1lisis_de_Retenci%C3%B3n_de_Clientes_cffxtp.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754683644/2._An%C3%A1lisis_de_Retenci%C3%B3n_de_Legisladores_l8lux5.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754683645/3._An%C3%A1lisis_de_Supervivencia_wqhnrg.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754683668/4._An%C3%A1lisis_de_Retorno_Venta_Cruzada_l5nnox.png' },
                { type: 'image', src: 'https://res.cloudinary.com/dlo3r0you/image/upload/v1754683668/5._An%C3%A1lisis_Acumulativo_CLV_ohp5j5.png' }
            ],
            githubUrl: null,
            liveUrl: null
        }









    ];

    const filterButtonsContainer = document.getElementById('project-filters');
    const carouselContainer = document.getElementById('carousel-container');
    
    const projectModal = document.getElementById('project-modal');
    const modalContentBox = document.getElementById('modal-content-box');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalMediaContainer = document.getElementById('modal-media-container'); 
    const modalDesc = document.getElementById('modal-desc');
    const modalTags = document.getElementById('modal-tags');
    const modalLongDesc = document.getElementById('modal-long-desc');
    const modalGithubLink = document.getElementById('modal-github-link');
    const modalLiveLink = document.getElementById('modal-live-link');
    const modalPrevBtn = document.getElementById('modal-prev-btn');
    const modalNextBtn = document.getElementById('modal-next-btn');
    const modalExpandBtn = document.getElementById('modal-expand-btn');

    const fullscreenModal = document.getElementById('fullscreen-modal');
    const fullscreenMediaContainer = document.getElementById('fullscreen-media-container');
    const fullscreenCloseBtn = document.getElementById('fullscreen-close-btn');
    const fullscreenPrevBtn = document.getElementById('fullscreen-prev-btn');
    const fullscreenNextBtn = document.getElementById('fullscreen-next-btn');
    
    let currentProjectMedia = [];
    let currentMediaIndex = 0;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    const categoryStyles = {
        'power bi': 'tag-power-bi',
        'python': 'tag-python',
        'sql': 'tag-sql',
        'web': 'tag-web',
        'excel': 'tag-excel',
        'javascript': 'tag-web',
        'dax': 'tag-power-bi',
    };
    
    const categoryNames = {
        'all': 'Todos',
        'python': 'Python',
        'power bi': 'Power BI',
        'sql': 'SQL',
        'web': 'Web',
        'excel': 'Excel',
    };

    // ***** INICIO DEL CAMBIO: Lógica de búsqueda y generación de filtros *****
    function generateDynamicFilters() {
        filterButtonsContainer.innerHTML = '';
        const mainCategories = ['all', 'python', 'power bi', 'sql', 'web','excel'];
        
        mainCategories.forEach(cat => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.filter = cat;
            button.textContent = categoryNames[cat] || cat;
            if (cat === 'all') button.classList.add('active');
            button.addEventListener('click', () => applyFilter(cat));
            filterButtonsContainer.appendChild(button);
        });

        const allTags = [...new Set(projectData.flatMap(p => p.tags))].filter(tag => !mainCategories.map(c => categoryNames[c]).includes(tag)).sort();
        if (allTags.length > 0) {
            const dropdownContainer = document.createElement('div');
            dropdownContainer.className = 'dropdown';
            
            // Se añade el input de búsqueda dentro del HTML del menú
            dropdownContainer.innerHTML = `
                <button id="dropdown-btn" class="filter-btn dropdown-btn flex items-center relative">Filtrar por<i data-lucide="chevron-down" class="w-4 h-4 ml-2 absolute right-4 top-1/2 -translate-y-1/2"></i></button>
                <div id="dropdown-menu" class="dropdown-menu">
                    <div class="dropdown-search-container">
                        <input type="text" id="dropdown-search-input" class="dropdown-search-input" placeholder="Buscar etiqueta...">
                    </div>
                    <div id="dropdown-items-container">
                        ${allTags.map(tag => `<button class="dropdown-item" data-filter="${tag}">${tag}</button>`).join('')}
                    </div>
                </div>
            `;
            filterButtonsContainer.appendChild(dropdownContainer);
            lucide.createIcons();
            
            const dropdownBtn = document.getElementById('dropdown-btn');
            const dropdownMenu = document.getElementById('dropdown-menu');
            const searchInput = document.getElementById('dropdown-search-input');
            const itemsContainer = document.getElementById('dropdown-items-container');

            dropdownBtn.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                const isHidden = dropdownMenu.style.display === 'none' || dropdownMenu.style.display === '';
                dropdownMenu.style.display = isHidden ? 'block' : 'none';
                if (isHidden) {
                    searchInput.focus(); // Enfocar el input al abrir
                }
            });

            // Event listener para filtrar mientras se escribe
            searchInput.addEventListener('keyup', () => {
                const filter = searchInput.value.toLowerCase();
                const items = itemsContainer.querySelectorAll('.dropdown-item');
                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(filter)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
            
            itemsContainer.querySelectorAll('.dropdown-item').forEach(item => { 
                item.addEventListener('click', () => { 
                    applyFilter(item.dataset.filter, true); 
                    dropdownMenu.style.display = 'none'; 
                }); 
            });

            window.addEventListener('click', (e) => { 
                if (!dropdownContainer.contains(e.target)) { 
                    dropdownMenu.style.display = 'none'; 
                } 
            });
        }
    }
    // ***** FIN DEL CAMBIO *****

    function applyFilter(filter, isSubcategory = false) {
        const allButtons = filterButtonsContainer.querySelectorAll('.filter-btn');
        const dropdownBtn = document.getElementById('dropdown-btn');
        allButtons.forEach(btn => btn.classList.remove('active'));

        if (isSubcategory) {
            if(dropdownBtn) {
                dropdownBtn.classList.add('active');
                dropdownBtn.innerHTML = `${filter} <i data-lucide="chevron-down" class="w-4 h-4 ml-2 absolute right-4 top-1/2 -translate-y-1/2"></i>`;
            }
        } else {
            const activeButton = filterButtonsContainer.querySelector(`.filter-btn[data-filter="${filter}"]`);
            if (activeButton) activeButton.classList.add('active');
            if(dropdownBtn) {
                dropdownBtn.innerHTML = `Filtrar por <i data-lucide="chevron-down" class="w-4 h-4 ml-2 absolute right-4 top-1/2 -translate-y-1/2"></i>`;
            }
        }
        lucide.createIcons();
        renderProjects(filter);
    }

    // --- RENDERIZADO DE PROYECTOS (ACTUALIZADO) ---
    function renderProjects(filter = 'all') {
        carouselContainer.innerHTML = '';
        const allUniqueCategories = [...new Set(projectData.flatMap(p => p.categories))];
        let projectsToShow;
        if (filter === 'all') { projectsToShow = projectData; }
        else if (allUniqueCategories.includes(filter)) { projectsToShow = projectData.filter(p => p.categories.includes(filter)); }
        else { projectsToShow = projectData.filter(p => p.tags.includes(filter)); }
        
        projectsToShow.forEach(project => {
            if (!project) return;
            const card = document.createElement('div');
            card.className = `w-[90%] sm:w-1/2 lg:w-[31%] flex-shrink-0 snap-center`;
            
            let mediaHTML = '';
            const firstMedia = project.media[0];
            if (firstMedia.type === 'video') {
                mediaHTML = `<video src="${firstMedia.src}" class="w-full h-full object-cover" autoplay loop muted playsinline title="Vista previa de ${project.title}"></video>`;
            } else {
                mediaHTML = `<img src="${firstMedia.src}" alt="Vista previa de ${project.title}" class="w-full h-full object-cover">`;
            }

            const tagsHTML = project.tags.map(tag => {
                const categoryKey = Object.keys(categoryNames).find(key => categoryNames[key] === tag);
                const isMainCategory = categoryKey && project.categories.includes(categoryKey);
                const styleClass = isMainCategory ? categoryStyles[categoryKey] : 'tag-generic';
                return `<span class="tag-base ${styleClass}">${tag}</span>`;
            }).join('');
            
            // ***** INICIO DEL CAMBIO *****
            // Lógica para el título y la insignia de desarrollo
            let titleHTML = `<h3 class="text-base font-bold mb-2 text-slate-800 dark:text-white">${project.title}</h3>`;

            if (project.status === 'development') {
                titleHTML = `
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <h3 class="text-base font-bold text-slate-800 dark:text-white">${project.title}</h3>
                        <span class="bg-amber-400 text-amber-900 text-xs font-mono font-bold px-2 py-0.5 rounded-md dark:bg-amber-500 dark:text-slate-900 flex items-center gap-1.5 shrink-0" title="En desarrollo">
                            <i data-lucide="construction" class="w-3.5 h-3.5"></i>
                            <span>DEV</span>
                        </span>
                    </div>`;
            }
            // ***** FIN DEL CAMBIO *****
            
            card.innerHTML = `
                <div class="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full min-h-[320px] cursor-pointer">
                    <div class="aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                        ${mediaHTML}
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        ${titleHTML}
                        <p class="text-slate-600 dark:text-slate-400 text-sm flex-grow mb-4">${project.desc}</p>
                        <div class="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 font-mono">
                            ${tagsHTML}
                        </div>
                    </div>
                </div>`;
            card.addEventListener('click', () => openModal(project));
            carouselContainer.appendChild(card);
        });

        // Asegurarse de que los nuevos íconos se rendericen
        lucide.createIcons();
    }

    // --- LÓGICA DEL MODAL (ACTUALIZADA) ---
    function openModal(project) {
        // ***** INICIO DEL CAMBIO *****
        let titleHTML = project.title;
        if (project.status === 'development') {
            titleHTML = `
                <div class="flex items-center gap-3">
                    <span>${project.title}</span>
                    <span class="bg-amber-400 text-amber-900 text-xs font-mono font-bold px-2 py-0.5 rounded-md dark:bg-amber-500 dark:text-slate-900 flex items-center gap-1.5" title="En desarrollo">
                        <i data-lucide="construction" class="w-3.5 h-3.5"></i>
                        <span>DEV</span>
                    </span>
                </div>
            `;
        }
        modalTitle.innerHTML = titleHTML;
        // ***** FIN DEL CAMBIO *****
        
        modalDesc.textContent = project.desc;
        modalLongDesc.innerHTML = project.longDesc || '';
        
        currentProjectMedia = project.media;
        currentMediaIndex = 0;
        showMedia(currentMediaIndex, modalMediaContainer);
        
        modalPrevBtn.classList.toggle('hidden', currentProjectMedia.length <= 1);
        modalNextBtn.classList.toggle('hidden', currentProjectMedia.length <= 1);
        
        modalTags.innerHTML = project.tags.map(tag => {
            const categoryKey = Object.keys(categoryNames).find(key => categoryNames[key] === tag);
            const isMainCategory = categoryKey && project.categories.includes(categoryKey);
            const styleClass = isMainCategory ? categoryStyles[categoryKey] : 'tag-generic';
            return `<span class="tag-base ${styleClass}">${tag}</span>`;
        }).join('');
        
        if (project.githubUrl) { modalGithubLink.href = project.githubUrl; modalGithubLink.classList.remove('hidden'); } else { modalGithubLink.classList.add('hidden'); }
        if (project.liveUrl) { modalLiveLink.href = project.liveUrl; modalLiveLink.classList.remove('hidden'); } else { modalLiveLink.classList.add('hidden'); }
        
        projectModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        setTimeout(() => modalContentBox.classList.remove('scale-95', 'opacity-0'), 10);

        // Asegurarse de que los nuevos íconos se rendericen en el modal
        lucide.createIcons();
    }

    function closeModal() {
        modalContentBox.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            projectModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
            modalMediaContainer.innerHTML = ''; 
        }, 300);
    }

    function showMedia(index, container) {
        container.innerHTML = '';
        const media = currentProjectMedia[index];
        
        let element;
        if (media.type === 'video') {
            element = document.createElement('video');
            element.src = media.src;
            element.controls = true;
            element.autoplay = true;
            element.loop = true;
            element.className = 'w-full h-full object-contain max-h-[70vh]';
        } else {
            element = document.createElement('img');
            element.src = media.src;
            element.alt = `Media de ${modalTitle.textContent}`;
            element.className = 'w-full h-full object-contain max-h-[70vh]';
        }
        container.appendChild(element);
        modalExpandBtn.classList.toggle('hidden', media.type === 'video');
    }

    function navigateMedia(direction) {
        currentMediaIndex = (currentMediaIndex + direction + currentProjectMedia.length) % currentProjectMedia.length;
        showMedia(currentMediaIndex, modalMediaContainer);
    }
    
    function navigateFullscreenMedia(direction) {
        currentMediaIndex = (currentMediaIndex + direction + currentProjectMedia.length) % currentProjectMedia.length;
        showMedia(currentMediaIndex, fullscreenMediaContainer);
    }

    modalCloseBtn.addEventListener('click', closeModal);
    projectModal.addEventListener('click', (e) => e.target === projectModal && closeModal());
    modalPrevBtn.addEventListener('click', () => navigateMedia(-1));
    modalNextBtn.addEventListener('click', () => navigateMedia(1));

    modalExpandBtn.addEventListener('click', () => {
        if (currentProjectMedia[currentMediaIndex].type === 'image') {
            showMedia(currentMediaIndex, fullscreenMediaContainer);
            fullscreenModal.classList.remove('hidden');
            fullscreenPrevBtn.classList.toggle('hidden', currentProjectMedia.length <= 1);
            fullscreenNextBtn.classList.toggle('hidden', currentProjectMedia.length <= 1);
        }
    });
    fullscreenCloseBtn.addEventListener('click', () => {
        fullscreenModal.classList.add('hidden');
        fullscreenMediaContainer.innerHTML = '';
    });
    fullscreenPrevBtn.addEventListener('click', () => navigateFullscreenMedia(-1));
    fullscreenNextBtn.addEventListener('click', () => navigateFullscreenMedia(1));

    let isDown = false;
    let startX;
    let scrollLeft;
    carouselContainer.addEventListener('mousedown', (e) => { isDown = true; carouselContainer.classList.add('cursor-grabbing'); startX = e.pageX - carouselContainer.offsetLeft; scrollLeft = carouselContainer.scrollLeft; });
    carouselContainer.addEventListener('mouseleave', () => { isDown = false; carouselContainer.classList.remove('cursor-grabbing'); });
    carouselContainer.addEventListener('mouseup', () => { isDown = false; carouselContainer.classList.remove('cursor-grabbing'); });
    carouselContainer.addEventListener('mousemove', (e) => { if(!isDown) return; e.preventDefault(); const x = e.pageX - carouselContainer.offsetLeft; const walk = (x - startX) * 2; carouselContainer.scrollLeft = scrollLeft - walk; });
    nextBtn.addEventListener('click', () => carouselContainer.scrollBy({ left: carouselContainer.clientWidth / 2, behavior: 'smooth' }));
    prevBtn.addEventListener('click', () => carouselContainer.scrollBy({ left: -carouselContainer.clientWidth / 2, behavior: 'smooth' }));

    // --- LÓGICA PARA CERTIFICACIONES (sin cambios) ---
    const certificationsData = [
        { title: 'Desarrolla procesos ETL con Python y Pandas', issuer: 'Ubits', imageUrls: ['https://res.cloudinary.com/dlo3r0you/image/upload/v1753996007/1717512707152_page-0001_qp2mvr.jpg'] },
        { title: 'SQL para Análisis de Datos', issuer: 'A2 Capacitación', imageUrls: ['https://res.cloudinary.com/dlo3r0you/image/upload/v1753996687/SQL_para_An%C3%A1lisis_de_Datos_hr3rkx.jpg'] },
        { title: 'SQL desde Cero a Experto', issuer: 'A2 Capacitación', imageUrls: ['https://res.cloudinary.com/dlo3r0you/image/upload/v1753996637/SQL_0_-_100_xkwzjc.jpg'] },
        { title: 'Power BI', issuer: 'A2 Capacitación', imageUrls: ['https://res.cloudinary.com/dlo3r0you/image/upload/v1753996636/Power_BI_vjsvep.jpg', 'https://res.cloudinary.com/dlo3r0you/image/upload/v1753996636/Power_BI_-_Detalle_nsornm.jpg'] },
        { title: 'Green Belt de Excel', issuer: 'A2 Capacitación', imageUrls: ['https://res.cloudinary.com/dlo3r0you/image/upload/v1753996635/Excel_-_Certificaci%C3%B3n_yandbu.jpg', 'https://res.cloudinary.com/dlo3r0you/image/upload/v1753996636/Excel_-_Detalle_p1qkii.jpg']},
        { title: 'Python Esencial', issuer: 'LinkedIn', imageUrls: ['https://media.licdn.com/dms/image/v2/D4E22AQGR1Ecfsz_jhQ/feedshare-shrink_1280/feedshare-shrink_1280/0/1688760548680?e=1756944000&v=beta&t=eNQZvAS_2uOPvmbflBZjo99J9VjNMkjAYoVL5RHomCw'] }
    ];
    const certsContainer = document.getElementById('certifications-container');
    const certificationModal = document.getElementById('certification-modal');
    const certificationImage = document.getElementById('certification-image');
    const certificationCloseBtn = document.getElementById('certification-close-btn');
    const certPrevBtn = document.getElementById('cert-prev-btn');
    const certNextBtn = document.getElementById('cert-next-btn');
    let currentCertImages = [];
    let currentCertImageIndex = 0;
    function showCertificationImage(index) { certificationImage.src = currentCertImages[index]; }
    function navigateCertificationImages(direction) { currentCertImageIndex = (currentCertImageIndex + direction + currentCertImages.length) % currentCertImages.length; showCertificationImage(currentCertImageIndex); }
    function openCertificationModal(cert) { currentCertImages = cert.imageUrls; currentCertImageIndex = 0; showCertificationImage(currentCertImageIndex); certPrevBtn.classList.toggle('hidden', currentCertImages.length <= 1); certNextBtn.classList.toggle('hidden', currentCertImages.length <= 1); certificationModal.classList.remove('hidden'); document.body.classList.add('modal-open'); }
    function closeCertificationModal() { certificationModal.classList.add('hidden'); document.body.classList.remove('modal-open'); }
    certificationCloseBtn.addEventListener('click', closeCertificationModal);
    certPrevBtn.addEventListener('click', () => navigateCertificationImages(-1));
    certNextBtn.addEventListener('click', () => navigateCertificationImages(1));
    certificationModal.addEventListener('click', (e) => { if (e.target === certificationModal) { closeCertificationModal(); } });
    function renderCertifications() {
        certsContainer.innerHTML = '';
        certificationsData.forEach((cert) => {
            const card = document.createElement('div');
            card.className = 'cert-card bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-6 flex items-start gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer';
            card.innerHTML = `<div class="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full"><i data-lucide="award" class="w-6 h-6 text-blue-600 dark:text-blue-400"></i></div><div><h4 class="font-bold text-slate-800 dark:text-white">${cert.title}</h4><p class="text-sm text-slate-500 dark:text-slate-400">${cert.issuer}</p></div>`;
            card.addEventListener('click', () => openCertificationModal(cert));
            certsContainer.appendChild(card);
        });
        lucide.createIcons();
    }

    // --- LLAMADAS INICIALES ---
    generateDynamicFilters();
    renderProjects('all');
    renderCertifications();
});
