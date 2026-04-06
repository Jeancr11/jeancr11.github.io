        // --- NAVEGACIÓN SPA ---
        function switchTab(tabId) {
            document.getElementById('view-dashboard').classList.add('hidden');
            document.getElementById('view-comparator').classList.add('hidden');
            
            document.getElementById('nav-dashboard').classList.remove('active');
            document.getElementById('nav-comparator').classList.remove('active');
            
            document.getElementById(`view-${tabId}`).classList.remove('hidden');
            document.getElementById(`nav-${tabId}`).classList.add('active');

            if(tabId === 'dashboard') {
                if(equityChartInstance) equityChartInstance.resize();
                if(compoundChartInstance) compoundChartInstance.resize();
            }
            if(tabId === 'comparator' && comparatorChartInstance) comparatorChartInstance.resize();
        }

        // --- MANEJO DE DROPDOWNS MULTI-SELECT ---
        document.addEventListener('click', (e) => {
            if(!e.target.closest('.custom-select-container')) {
                document.querySelectorAll('.custom-select-dropdown').forEach(el => el.classList.add('hidden'));
            }
        });

        function toggleDropdown(id) {
            const el = document.getElementById(id);
            const isHidden = el.classList.contains('hidden');
            document.querySelectorAll('.custom-select-dropdown').forEach(d => d.classList.add('hidden'));
            if(isHidden) el.classList.remove('hidden');
        }

        let activeFilters = {
            symbols: [],
            years: [],
            months: []
        };

        function updateMultiSelect(type, val, checked) {
            let arr = activeFilters[type];
            if (val === 'ALL') {
                // Si hace click en TODOS, limpia el arreglo
                arr.length = 0;
                let cbs = document.querySelectorAll(`.cb-${type}`);
                cbs.forEach(cb => { if(cb.value !== 'ALL') cb.checked = false; else cb.checked = true; });
            } else {
                // Desmarcar "ALL" si se marca algo específico
                document.querySelector(`.cb-${type}[value="ALL"]`).checked = false;
                
                if (checked) {
                    if (!arr.includes(val)) arr.push(val);
                } else {
                    arr = arr.filter(v => v !== val);
                    activeFilters[type] = arr;
                }
                
                // Si desmarcó todo, volver a marcar "ALL"
                if (arr.length === 0) {
                    document.querySelector(`.cb-${type}[value="ALL"]`).checked = true;
                }
            }

            // Actualizar Label Visual
            let labelId = type === 'symbols' ? 'labelSymbols' : (type === 'years' ? 'labelYears' : 'labelMonths');
            let baseText = type === 'symbols' ? 'Pares' : (type === 'years' ? 'Años' : 'Meses');
            let elLabel = document.getElementById(labelId);
            
            if (activeFilters[type].length === 0) {
                elLabel.innerText = `Todos`;
                elLabel.classList.remove('text-blue-400', 'font-bold');
            } else if (activeFilters[type].length === 1) {
                // Si es mes, mostrar nombre en lugar de número
                let displayVal = activeFilters[type][0];
                if (type === 'months') displayVal = monthNames[parseInt(displayVal)-1];
                elLabel.innerText = displayVal;
                elLabel.classList.add('text-blue-400', 'font-bold');
            } else {
                elLabel.innerText = `${activeFilters[type].length} selec.`;
                elLabel.classList.add('text-blue-400', 'font-bold');
            }

            // Aplicar Filtros Globales (pero si es manual, limpiar el badge de portafolio)
            if (activePortfolioConfig && type === 'symbols') {
                activePortfolioConfig = null;
                document.getElementById('activePortfolioBadge').classList.add('hidden');
            }
            applyFilters();
        }


        // --- VARIABLES GLOBALES DASHBOARD ---
        let rawData = [];
        let filteredData = [];
        let compChartDataObj = []; 
        let dashFiles = [];
        const storageKey = 'mt5_trading_data_v21'; 
        
        let activePortfolioConfig = null; // Guardará {name: "...", symbols: ["EURUSD", ...]}

        let equityChartInstance = null;
        let compoundChartInstance = null; 
        
        let cTH = null, cTD = null, cTM = null; 
        let cPH = null, cPD = null, cPM = null; 
        let scatterChartInstance = null;

        let calMode = 'YEARS'; // YEARS, MONTHS, DAYS
        let calYear = null;
        let calMonth = null;
        
        let isDetailedCalendar = false; // NUEVO: Estado para alternar la vista de líneas de tiempo en los días

        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const daysArrFull = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const daysArr = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

        const colorPalette = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
            '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'
        ];
        let nextColorIndex = 0;
        let comparedFiles = [];

        // --- HELPERS BÁSICOS Y DESTRUCTORES DE CHARTJS ---
        const safeDestroy = (chart) => {
            if (chart) {
                try { chart.destroy(); } catch(e) { console.warn("Error destruyendo chart", e); }
            }
        };

        function fmtMoney(val, decimals = 2) {
            return (val < 0 ? '-' : '') + '$' + Math.abs(parseFloat(val)).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        }

        function cleanNumber(val) {
            if (val === undefined || val === null) return 0;
            if (typeof val === 'number') return val;
            let str = String(val).replace(/\s/g, '').replace(/,/g, '');
            let num = parseFloat(str);
            return isNaN(num) ? 0 : num;
        }

        function formatDurationText(hours) {
            if(typeof hours !== 'number' || isNaN(hours) || !isFinite(hours)) return "-";
            if(hours < 1) return (hours * 60).toFixed(0) + " min";
            if(hours > 24) return (hours / 24).toFixed(1) + " días";
            return hours.toFixed(1) + " h";
        }
        
        function formatShortDate(d) {
            if(!d) return '';
            let date = new Date(d);
            if(isNaN(date.getTime())) return '';
            return date.toLocaleDateString('es-ES', {day:'2-digit', month:'short', year:'numeric'});
        }

        // --- INICIALIZACIÓN ---
        window.onload = () => {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                try {
                    dashFiles = JSON.parse(savedData);
                    processDashFiles(); 
                } catch(e) { console.error("Error al recuperar datos:", e); }
            }
        };

        // --- LÓGICA DE PARSEO MT5 CLÁSICO (.XLSX) ---
        function parseMT5Data(data) {
            let parsedRows = [];
            
            // Intento de detectar el depósito inicial
            let initialDeposit = 10000;
            let depositRow = data.find(r => !(r.Symbol || '').trim() && cleanNumber(r.Profit) > 0);
            if(depositRow) initialDeposit = cleanNumber(depositRow.Profit);

            data.forEach(row => {
                let dateObj;
                if (row.Time instanceof Date) dateObj = row.Time;
                else if (typeof row.Time === 'number') dateObj = new Date(Math.round((row.Time - 25569) * 86400 * 1000));
                else if (typeof row.Time === 'string') {
                    let cleanStr = row.Time.replace(/\./g, '-');
                    if (cleanStr.includes(' ')) {
                        let parts = cleanStr.split(' ');
                        cleanStr = parts[0] + 'T' + parts[1];
                        if (cleanStr.length <= 16) cleanStr += ':00'; // Asegurar segundos
                    }
                    dateObj = new Date(cleanStr);
                }
                
                if (dateObj && !isNaN(dateObj.getTime())) {
                    row.parsedTime = dateObj;
                    parsedRows.push(row);
                }
            });
            parsedRows.sort((a,b) => a.parsedTime - b.parsedTime);

            let processed = [];
            let openPositions = {}; 

            parsedRows.forEach(row => {
                let sym = (row.Symbol || '').trim();
                if (!sym) return;

                let dirStr = String(row.Direction || '').toLowerCase().trim();
                let rawProfit = cleanNumber(row.Profit);

                if (dirStr === 'in') {
                    if (!openPositions[sym]) openPositions[sym] = [];
                    openPositions[sym].push(row.parsedTime);
                } 
                else if (dirStr === 'out' || dirStr === 'in/out' || rawProfit !== 0) {
                    if (rawProfit === 0 && dirStr !== 'out') return; 
                    
                    let entryTime = row.parsedTime; 
                    if (openPositions[sym] && openPositions[sym].length > 0) {
                        entryTime = openPositions[sym].shift(); 
                    }

                    let exitTime = row.parsedTime;
                    let durationHours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
                    if(isNaN(durationHours) || !isFinite(durationHours)) durationHours = 0; 
                    if(durationHours < 0) durationHours = 0; 

                    let comm = cleanNumber(row.Commission);
                    let swap = cleanNumber(row.Swap);
                    let netProfit = rawProfit + comm + swap;

                    processed.push({
                        Time: exitTime, 
                        EntryTime: entryTime, 
                        DurationHours: durationHours,
                        Symbol: sym,
                        NetProfit: netProfit,
                        Year: exitTime.getFullYear(),
                        Month: exitTime.getMonth() + 1,
                        ExitMonth: exitTime.getMonth(), 
                        DayOfWeek: entryTime.getDay(), 
                        EntryHour: entryTime.getHours(),
                        DateOnly: exitTime.toISOString().split('T')[0]
                    });
                }
            });

            processed.sort((a, b) => a.Time - b.Time);

            let currentBalance = initialDeposit;
            processed.forEach(d => {
                currentBalance += d.NetProfit;
                d.BalanceAfter = currentBalance;
            });

            return processed;
        }

        // =========================================================
        // --- NUEVO MOTOR DE LECTURA DE TEXTO PURO (.CSV GRAPH) ---
        // =========================================================
        function parseRawMT5Graph(csvText, sourceName = 'Estrategia') {
            let lines = csvText.split(/\r?\n/);
            if(lines.length < 2) return [];

            let delimiter = '\t'; 
            let headerLine = lines[0];
            
            let headerIdx = 0;
            for(let i=0; i<Math.min(lines.length, 10); i++) {
                let upper = lines[i].toUpperCase();
                if(upper.includes('<DATE>') || upper.includes('DATE') || upper.includes('TIME')) {
                    headerLine = lines[i];
                    headerIdx = i;
                    if(headerLine.includes('\t')) delimiter = '\t';
                    else if(headerLine.includes(';')) delimiter = ';';
                    else if(headerLine.includes(',')) delimiter = ',';
                    break;
                }
            }

            let headers = headerLine.split(delimiter).map(h => h.trim().toUpperCase());
            let dateIdx = headers.findIndex(h => h.includes('DATE') || h.includes('TIME'));
            let balIdx = headers.findIndex(h => h.includes('BALANCE'));

            if(dateIdx === -1 || balIdx === -1) return []; 

            let processed = [];
            let prevBalance = null;

            for(let i = headerIdx + 1; i < lines.length; i++) {
                let rowStr = lines[i].trim();
                if(!rowStr) continue; 
                
                let cols = rowStr.split(delimiter);
                if(cols.length <= Math.max(dateIdx, balIdx)) continue; 

                let dateStr = cols[dateIdx].trim();
                let balStr = cols[balIdx].trim();
                let balance = cleanNumber(balStr);

                let cleanStr = dateStr.replace(/\./g, '-');
                if (cleanStr.includes(' ')) {
                    let parts = cleanStr.split(' ');
                    cleanStr = parts[0] + 'T' + parts[1];
                    if (cleanStr.length <= 16) cleanStr += ':00'; 
                }
                
                let dateObj = new Date(cleanStr);
                if (isNaN(dateObj.getTime())) continue;

                if (prevBalance === null) {
                    prevBalance = balance;
                    continue; // No considerar la primera línea (depósito inicial)
                }

                let netProfit = balance - prevBalance;
                
                processed.push({
                    Time: dateObj,
                    EntryTime: dateObj, 
                    DurationHours: 0, 
                    Symbol: sourceName,
                    NetProfit: netProfit,
                    Year: dateObj.getFullYear(),
                    Month: dateObj.getMonth() + 1,
                    ExitMonth: dateObj.getMonth(),
                    DayOfWeek: dateObj.getDay(),
                    EntryHour: dateObj.getHours(),
                    DateOnly: dateObj.toISOString().split('T')[0],
                    BalanceAfter: balance
                });
                
                prevBalance = balance;
            }
            
            processed.sort((a, b) => a.Time - b.Time);
            return processed;
        }

        // --- FUNCIONES DE CARGA (LOADER) ---
        function showLoader() { document.getElementById('globalLoader').classList.remove('hidden'); document.getElementById('globalLoader').classList.add('flex'); }
        function hideLoader() { document.getElementById('globalLoader').classList.add('hidden'); document.getElementById('globalLoader').classList.remove('flex'); }


        // --- MANEJADORES GLOBALES DE ARCHIVOS (SUBIDA Y DRAG & DROP) ---

        function handleDashboardClassicFiles(files) {
            if (files.length === 0) return;
            showLoader(); 
            let processedCount = 0;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    setTimeout(() => {
                        try {
                            const data = new Uint8Array(event.target.result);
                            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                            const jsonResult = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {defval: ""});
                            const parsedData = parseMT5Data(jsonResult);
                            
                            if (parsedData.length > 0) {
                                dashFiles.push({ id: Date.now() + Math.random(), name: file.name, data: parsedData });
                            } else {
                                alert(`No se encontraron operaciones compatibles en el archivo: ${file.name}\n\nAsegúrate de que sea un reporte de MT5 con encabezados en Inglés (Time, Symbol, Profit).`);
                            }
                        } catch (err) { alert(`Error al leer el archivo Excel: ${file.name}`); console.error(err); } 
                        finally { 
                            processedCount++;
                            if (processedCount === files.length) {
                                try { processDashFiles(); } catch (e) { console.error("Error processDashFiles:", e); alert("Error inesperado al procesar las gráficas: " + e.message); }
                                hideLoader();
                            }
                        }
                    }, 50);
                };
                reader.readAsArrayBuffer(file);
            });
        }

        function handleDashboardGraphFiles(files) {
            if (files.length === 0) return;
            showLoader(); 
            let processedCount = 0;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    setTimeout(() => {
                        try {
                            const text = event.target.result;
                            const parsedData = parseRawMT5Graph(text, file.name); // Pasamos el nombre para el compound individual
                            
                            if (parsedData.length > 0) {
                                dashFiles.push({ id: Date.now() + Math.random(), name: file.name, data: parsedData });
                            } else {
                                alert(`El archivo ${file.name} está vacío o no es un formato de Gráfico válido (.csv/.txt).`);
                            }
                        } catch (err) { alert(`Error al leer el archivo de Gráfico: ${file.name}`); console.error(err); } 
                        finally { 
                            processedCount++;
                            if (processedCount === files.length) {
                                try { processDashFiles(); } catch (e) { console.error("Error processDashFiles:", e); alert("Error inesperado al procesar las gráficas: " + e.message); }
                                hideLoader();
                            }
                        }
                    }, 50);
                };
                reader.readAsText(file); 
            });
        }

        // 1. DASHBOARD - HISTORIAL CLASSIC (.XLSX)
        document.getElementById('dashInputClassic').addEventListener('change', function(e) {
            handleDashboardClassicFiles(Array.from(e.target.files));
            e.target.value = '';
        });

        // 2. DASHBOARD - GRÁFICO (.CSV / .TSV)
        document.getElementById('dashInputGraph').addEventListener('change', function(e) {
            handleDashboardGraphFiles(Array.from(e.target.files));
            e.target.value = '';
        });

        function processDashFiles() {
            if(dashFiles.length === 0) return;

            rawData = [];
            dashFiles.forEach(f => {
                f.data.forEach(d => {
                    if (typeof d.Time === 'string') d.Time = new Date(d.Time);
                    if (typeof d.EntryTime === 'string') d.EntryTime = new Date(d.EntryTime);
                });
                rawData = rawData.concat(f.data);
            });

            rawData.sort((a, b) => a.Time - b.Time);

            let currentBalance = 10000;
            rawData.forEach(d => {
                currentBalance += (d.NetProfit || 0);
                d.BalanceAfter = currentBalance;
            });

            try { localStorage.setItem(storageKey, JSON.stringify(dashFiles)); } catch(e) {}
            
            renderDashFilesTags();
            initDashboard();
            syncMainFileToComparator();
        }

        function renderDashFilesTags() {
            const listDiv = document.getElementById('dashFilesList');
            if (dashFiles.length === 0) {
                listDiv.innerHTML = '';
                return;
            }
            listDiv.innerHTML = dashFiles.map(f => `
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-600 bg-gray-800 shadow-sm">
                    <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span class="text-sm font-semibold truncate max-w-[150px]" title="${f.name}">${f.name}</span>
                    <button onclick="removeDashFile(${f.id})" class="ml-1 text-gray-400 hover:text-red-500 font-bold">×</button>
                </div>
            `).join('');
        }

        function removeDashFile(id) {
            dashFiles = dashFiles.filter(f => f.id !== id);
            
            if (dashFiles.length === 0) {
                localStorage.removeItem(storageKey);
                rawData = [];
                filteredData = [];
                activePortfolioConfig = null;
                document.getElementById('dashboardContent').classList.add('hidden');
                document.getElementById('welcomeScreen').classList.remove('hidden');
                document.getElementById('clearBtn').classList.add('hidden');
                renderDashFilesTags();
                
                let idx = comparedFiles.findIndex(f => f.name.includes("Estrategia Principal"));
                if(idx > -1) removeFileFromComparator(comparedFiles[idx].id);
            } else {
                try { processDashFiles(); } catch (e) { console.error(e); }
            }
        }

        function initDashboard() {
            if (rawData.length === 0) return; 

            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('dashboardContent').classList.remove('hidden');
            document.getElementById('clearBtn').classList.remove('hidden');

            activePortfolioConfig = null; // Reset portfolio filter en inicio
            document.getElementById('activePortfolioBadge').classList.add('hidden');

            activeFilters = { symbols: [], years: [], months: [] }; // Limpiar arrays visuales
            populateFilters();
            analyzePortfolios(); // Ejecutar motor algorítmico de portafolios
            applyFilters();
        }

        function populateFilters() {
            // Símbolos
            const symbols = [...new Set(rawData.map(d => d.Symbol))].sort();
            const symbolDropdown = document.getElementById('dropdownSymbols');
            let symHtml = `<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer text-sm text-gray-300 transition-colors"><input type="checkbox" class="cb-symbols custom-checkbox" value="ALL" checked onchange="updateMultiSelect('symbols', 'ALL', this.checked)"> Todos los pares</label>`;
            symbols.forEach(sym => {
                symHtml += `<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer text-sm text-gray-300 transition-colors"><input type="checkbox" class="cb-symbols custom-checkbox" value="${sym}" onchange="updateMultiSelect('symbols', '${sym}', this.checked)"> ${sym}</label>`;
            });
            symbolDropdown.innerHTML = symHtml;

            // Años
            const years = [...new Set(rawData.map(d => d.Year))].sort((a,b) => b-a);
            const yearDropdown = document.getElementById('dropdownYears');
            let yrHtml = `<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer text-sm text-gray-300 transition-colors"><input type="checkbox" class="cb-years custom-checkbox" value="ALL" checked onchange="updateMultiSelect('years', 'ALL', this.checked)"> Todos</label>`;
            years.forEach(y => {
                yrHtml += `<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer text-sm text-gray-300 transition-colors"><input type="checkbox" class="cb-years custom-checkbox" value="${y}" onchange="updateMultiSelect('years', '${y}', this.checked)"> ${y}</label>`;
            });
            yearDropdown.innerHTML = yrHtml;

            // Meses
            const monthDropdown = document.getElementById('dropdownMonths');
            let moHtml = `<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer text-sm text-gray-300 transition-colors"><input type="checkbox" class="cb-months custom-checkbox" value="ALL" checked onchange="updateMultiSelect('months', 'ALL', this.checked)"> Todos</label>`;
            monthNames.forEach((m, idx) => {
                moHtml += `<label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer text-sm text-gray-300 transition-colors"><input type="checkbox" class="cb-months custom-checkbox" value="${idx + 1}" onchange="updateMultiSelect('months', '${idx + 1}', this.checked)"> ${m}</label>`;
            });
            monthDropdown.innerHTML = moHtml;

            // Set labels to empty
            document.getElementById('labelSymbols').innerText = `Todos`;
            document.getElementById('labelYears').innerText = `Todos`;
            document.getElementById('labelMonths').innerText = `Todos`;
        }

        // ==========================================
        // MANEJO DE FILTROS: PORTAFOLIO Y GLOBAL
        // ==========================================
        function applyPortfolioFilter(name, symbolsArr) {
            // Aplicar el filtro de portafolio
            activePortfolioConfig = { name, symbols: symbolsArr };
            
            // Limpiar selección manual de símbolos visualmente
            activeFilters.symbols = [];
            let cbs = document.querySelectorAll('.cb-symbols');
            cbs.forEach(cb => { if(cb.value === 'ALL') cb.checked = true; else cb.checked = false; });
            let elLabel = document.getElementById('labelSymbols');
            elLabel.innerText = `Todos`;
            elLabel.classList.remove('text-blue-400', 'font-bold');
            
            // Mostrar el badge
            document.getElementById('portfolioBadgeName').innerText = name;
            document.getElementById('activePortfolioBadge').classList.remove('hidden');
            
            applyFilters();
        }

        function clearPortfolioFilter(e) {
            if(e) e.stopPropagation();
            activePortfolioConfig = null;
            document.getElementById('activePortfolioBadge').classList.add('hidden');
            applyFilters();
        }

        function clearGlobalFilters() {
            activeFilters = { symbols: [], years: [], months: [] };
            
            ['symbols', 'years', 'months'].forEach(type => {
                document.querySelectorAll(`.cb-${type}`).forEach(cb => {
                    if(cb.value === 'ALL') cb.checked = true; else cb.checked = false;
                });
                let elLabel = document.getElementById(type === 'symbols' ? 'labelSymbols' : (type === 'years' ? 'labelYears' : 'labelMonths'));
                elLabel.innerText = `Todos`;
                elLabel.classList.remove('text-blue-400', 'font-bold');
            });
            
            activePortfolioConfig = null;
            document.getElementById('activePortfolioBadge').classList.add('hidden');

            applyFilters();
        }

        function applyFilters() {
            // filteredData ahora afecta a TODO el dashboard excepto Leaderboard y Combinaciones
            filteredData = rawData.filter(d => {
                let matchSym = true;
                
                if (activePortfolioConfig && activePortfolioConfig.symbols.length > 0) {
                    matchSym = activePortfolioConfig.symbols.includes(d.Symbol);
                } else {
                    matchSym = (activeFilters.symbols.length === 0) ? true : activeFilters.symbols.includes(d.Symbol);
                }

                let matchYear = (activeFilters.years.length === 0) ? true : (d.Year ? activeFilters.years.includes(d.Year.toString()) : false);
                let matchMonth = (activeFilters.months.length === 0) ? true : (d.Month ? activeFilters.months.includes(d.Month.toString()) : false);
                let isNotZero = Math.abs(d.NetProfit || 0) >= 0.00001; 
                
                return matchSym && matchYear && matchMonth && isNotZero;
            });

            updateKPIs();
            updateChart();
            updateSmartCalendar();
            updateAnalyticsCharts(); 
            
            // Estas secciones usan SIEMPRE rawData (No son afectadas por filtros)
            updateLeaderboard(); 
        }

        // ==========================================
        // MOTOR ALGORÍTMICO DE PORTAFOLIOS
        // ==========================================
        
        // Helper: Calcula las estadísticas COMBINADAS (curva real) de un grupo de símbolos
        function calcCombinedStats(symbols) {
            if (!symbols || symbols.length === 0) return { prof: 0, maxDD: 0, rec: 0, wr: 0, trades: 0, maxLossStreak: 0, maxWinStreak: 0 };
            
            // Filtrar y ordenar cronológicamente
            let trades = rawData.filter(d => symbols.includes(d.Symbol)).sort((a,b) => a.Time - b.Time);
            
            let balance = 0, peak = 0, maxDD = 0, wins = 0;
            let currentLossStreak = 0, maxLossStreak = 0;
            let currentWinStreak = 0, maxWinStreak = 0;

            trades.forEach(t => {
                let p = t.NetProfit || 0;
                balance += p;
                
                if (balance > peak) {
                    peak = balance;
                } else {
                    let dd = peak - balance;
                    if (dd > maxDD) maxDD = dd;
                }
                
                if (p > 0) {
                    wins++;
                    currentLossStreak = 0;
                    currentWinStreak++;
                    if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
                } else if (p < 0) {
                    currentLossStreak++;
                    currentWinStreak = 0;
                    if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
                }
            });

            let prof = balance;
            let rec = maxDD > 0 ? prof / maxDD : (prof > 0 ? 999 : 0);
            let wr = trades.length > 0 ? (wins / trades.length) * 100 : 0;

            return { prof, maxDD, rec, wr, trades: trades.length, maxLossStreak, maxWinStreak };
        }

        function analyzePortfolios() {
            let allSymbolsInSystem = [...new Set(rawData.map(d => d.Symbol).filter(Boolean))];
            const container = document.getElementById('portfoliosContainer');

            if (allSymbolsInSystem.length === 0) {
                container.innerHTML = '<div class="text-xs text-gray-500 text-center py-4">No hay suficientes datos.</div>';
                return;
            }

            let portfolios = [];
            
            let currentCombo = [...allSymbolsInSystem];

            // 2. Backward Elimination (Eliminación Inversa)
            // Quitamos el "peor" par uno a uno, y guardamos el resultado como una nueva opción.
            let maxSteps = Math.min(9, allSymbolsInSystem.length - 1);
            
            for (let step = 1; step <= maxSteps; step++) {
                let bestScore = -Infinity;
                let bestCombo = null;
                let bestStats = null;

                for (let i = 0; i < currentCombo.length; i++) {
                    let testCombo = [...currentCombo];
                    testCombo.splice(i, 1); // Remover temporalmente
                    let testStats = calcCombinedStats(testCombo);
                    
                    let score = (testStats.wr * 100) - (testStats.maxLossStreak * 50) + (testStats.prof * 0.001);

                    if (score > bestScore) {
                        bestScore = score;
                        bestCombo = testCombo;
                        bestStats = testStats;
                    }
                }

                if (bestCombo) {
                    currentCombo = bestCombo;
                    portfolios.push({
                        name: `Óptimo -${step} Par${step > 1 ? 'es' : ''}`,
                        symbols: [...currentCombo],
                        stats: bestStats
                    });
                } else {
                    break;
                }
            }

            // --- AQUI ESTA LA CORRECCION #1 ---
            // Ordenamiento Forma Normal: Mayor Net Profit primero.
            portfolios.sort((a, b) => {
                if (b.stats.prof !== a.stats.prof) {
                    return b.stats.prof - a.stats.prof;
                }
                // Si empatan en profit, evaluamos WinRate
                return b.stats.wr - a.stats.wr;
            });
            
            let html = '';
            portfolios.forEach((p, index) => {
                let safeSymbolsArr = JSON.stringify(p.symbols).replace(/"/g, "'");

                // Iconos y colores basados en su nueva posición ordenada (el #1 tendrá la gráfica o el fueguito)
                let icon = index === 0 ? '📊' : (index === 1 ? '🔥' : (index === 2 ? '⚡' : '✨'));
                let colorClass = index === 0 ? 'text-blue-400' : (index === 1 ? 'text-orange-400' : (index === 2 ? 'text-yellow-400' : 'text-purple-400'));

                let discardedSyms = allSymbolsInSystem.filter(s => !p.symbols.includes(s));
                let tooltipText = `PARES UTILIZADOS (${p.symbols.length}):\n${p.symbols.join(', ')}\n\nPARES DESCARTADOS (${discardedSyms.length}):\n${discardedSyms.length > 0 ? discardedSyms.join(', ') : 'Ninguno'}`;

                html += `
                    <div onclick="applyPortfolioFilter('${p.name}', ${safeSymbolsArr})" title="${tooltipText}" class="bg-gray-700/30 hover:bg-gray-700 cursor-pointer p-3 rounded-lg border border-gray-600 transition-colors group relative shadow-sm">
                        
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-bold ${colorClass} flex items-center gap-1">
                                ${icon} ${p.name}
                            </span>
                            <span class="text-sm font-mono font-bold ${p.stats.prof >= 0 ? 'text-green-400' : 'text-red-400'}">${fmtMoney(p.stats.prof, 0)}</span>
                        </div>
                        
                        <div class="flex justify-between gap-1 text-[9px] md:text-[10px] uppercase tracking-wide mb-2 mt-2 bg-gray-900/50 p-1.5 rounded border border-gray-700/50">
                            <span class="flex flex-col text-gray-500">Win Rate: <b class="text-blue-400 font-mono tracking-normal text-[11px] mt-0.5">${p.stats.wr.toFixed(1)}%</b></span>
                            <span class="flex flex-col text-gray-500 border-l border-gray-700 pl-1.5">Pérd. Seq: <b class="text-red-400 font-mono tracking-normal text-[11px] mt-0.5">${p.stats.maxLossStreak}</b></span>
                            <span class="flex flex-col text-gray-500 border-l border-gray-700 pl-1.5">Gana Seq: <b class="text-green-400 font-mono tracking-normal text-[11px] mt-0.5">${p.stats.maxWinStreak}</b></span>
                        </div>
                        
                        <div class="flex justify-between items-center border-t border-gray-600/50 pt-2 mt-1">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">${p.symbols.length} Pares Activos</span>
                                <span class="text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-600">${discardedSyms.length} Descartados</span>
                            </div>
                            <span class="text-[10px] text-gray-500 italic underline decoration-dotted hidden md:inline">Ver Detalles</span>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        // ==========================================
        // CÁLCULO DE MÉTRICAS GLOBALES
        // ==========================================
        function calculateMetrics(dataArr) {
            let totalProfit = 0; let grossProfit = 0; let grossLoss = 0;
            let winningTrades = 0; let losingTrades = 0;
            let currentWinStreak = 0; let currentLossStreak = 0;
            let maxWinStreak = 0; let maxLossStreak = 0;
            let cumulative = 0; let peak = 0;

            let winStreaks = [];
            let lossStreaks = [];

            let currentConsecutiveLoss = 0;
            let maxConsecutiveLoss = 0;
            let balanceAtStreakStart = 0;
            let maxConsDrawdownPct = 0;
            let maxConsDate = null;
            
            let maxSingleLoss = 0; 
            let maxSingleLossPct = 0;
            let maxSingleDate = null;

            let dayProfits = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
            let dayCounts = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0};

            let totalTrades = dataArr.length;
            
            let minDate = new Date(8640000000000000);
            let maxDate = new Date(-8640000000000000);

            // CALCULAR MAX TRADES SIMULTÁNEOS (Con salvavidas de fechas)
            let simEvents = [];
            dataArr.forEach(d => {
                if (d.EntryTime && typeof d.EntryTime.getTime === 'function') {
                    simEvents.push({ time: d.EntryTime.getTime(), type: 1 });
                } else if (d.Time && typeof d.Time.getTime === 'function') {
                    simEvents.push({ time: d.Time.getTime(), type: 1 });
                }
                
                if (d.Time && typeof d.Time.getTime === 'function') {
                    simEvents.push({ time: d.Time.getTime(), type: -1 });
                }
            });
            // Si el tiempo es exacto, procesamos apertura antes que cierre
            simEvents.sort((a, b) => a.time === b.time ? b.type - a.type : a.time - b.time);
            
            let currentSimultaneous = 0;
            let maxSimultaneous = 0;
            simEvents.forEach(e => {
                currentSimultaneous += e.type;
                if(currentSimultaneous > maxSimultaneous) maxSimultaneous = currentSimultaneous;
            });

            // MÉTRICAS PRINCIPALES
            dataArr.forEach(d => {
                if (d.Time && d.Time < minDate) minDate = d.Time;
                if (d.Time && d.Time > maxDate) maxDate = d.Time;

                totalProfit += d.NetProfit || 0;
                cumulative += d.NetProfit || 0;

                if (cumulative > peak) peak = cumulative;

                if (d.DayOfWeek !== undefined) {
                    dayProfits[d.DayOfWeek] += d.NetProfit || 0;
                    dayCounts[d.DayOfWeek]++;
                }

                if (d.NetProfit > 0) {
                    if (currentLossStreak > 0) {
                        lossStreaks.push(currentLossStreak);
                        currentLossStreak = 0;
                    }

                    winningTrades++;
                    grossProfit += d.NetProfit; 
                    currentWinStreak++;
                    currentConsecutiveLoss = 0; 
                    if(currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
                } else if (d.NetProfit < 0) {
                    if (currentWinStreak > 0) {
                        winStreaks.push(currentWinStreak);
                        currentWinStreak = 0;
                    }

                    losingTrades++;
                    grossLoss += d.NetProfit;
                    
                    if (d.NetProfit < maxSingleLoss) {
                        maxSingleLoss = d.NetProfit;
                        let currentBalance = d.BalanceAfter !== undefined ? d.BalanceAfter : (10000 + cumulative);
                        let balanceBefore = currentBalance - d.NetProfit;
                        maxSingleLossPct = balanceBefore > 0 ? (d.NetProfit / balanceBefore) * 100 : 0;
                        maxSingleDate = d.Time;
                    }
                    
                    if (currentLossStreak === 0) {
                        balanceAtStreakStart = d.BalanceAfter !== undefined ? (d.BalanceAfter - d.NetProfit) : (10000 + cumulative - d.NetProfit);
                    }

                    currentLossStreak++;
                    currentWinStreak = 0;
                    currentConsecutiveLoss += Math.abs(d.NetProfit);
                    
                    if(currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;

                    if(currentConsecutiveLoss > maxConsecutiveLoss) {
                        maxConsecutiveLoss = currentConsecutiveLoss;
                        let baseCapital = balanceAtStreakStart > 0 ? balanceAtStreakStart : 10000;
                        maxConsDrawdownPct = (maxConsecutiveLoss / baseCapital) * 100;
                        maxConsDate = d.Time;
                    }
                }
            });

            if (currentWinStreak > 0) winStreaks.push(currentWinStreak);
            if (currentLossStreak > 0) lossStreaks.push(currentLossStreak);

            const avgWinStreak = winStreaks.length > 0 ? winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length : 0;
            const avgLossStreak = lossStreaks.length > 0 ? lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length : 0;

            const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
            const avgTrade = totalTrades > 0 ? totalProfit / totalTrades : 0;
            const absoluteGrossLoss = Math.abs(grossLoss);
            const profitFactor = absoluteGrossLoss > 0 ? (grossProfit / absoluteGrossLoss) : (grossProfit > 0 ? 99.99 : 0);
            const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
            const avgLoss = losingTrades > 0 ? absoluteGrossLoss / losingTrades : 0;
            const riskReward = avgLoss > 0 ? (avgWin / avgLoss) : (avgWin > 0 ? 99.99 : 0);

            // =====================================================
            // --- AQUI ESTA LA CORRECCION #2 ---
            // CÁLCULO DE INTERÉS COMPUESTO (1% Riesgo Real Unificado)
            // =====================================================
            
            // PASO 1: Calcular la pérdida promedio real (1R)
            let symTrades = {};
            dataArr.forEach(d => {
                let sym = d.Symbol || 'Estrategia';
                if(!symTrades[sym]) symTrades[sym] = { wins: [], losses: [] };
                if(d.NetProfit < 0) symTrades[sym].losses.push(Math.abs(d.NetProfit));
                else if(d.NetProfit > 0) symTrades[sym].wins.push(d.NetProfit);
            });

            let symbolStats = {};
            Object.keys(symTrades).forEach(sym => {
                let losses = symTrades[sym].losses.sort((a,b) => b - a); // Ordenar de mayor a menor
                let wins = symTrades[sym].wins;

                let oneR = 1;
                if(losses.length > 0) {
                    // Para encontrar el verdadero "Stop Loss" (1R), promediamos el 25% de las pérdidas más grandes.
                    // Esto elimina el sesgo de los break-evens y cierres parciales diminutos.
                    let topCount = Math.max(1, Math.ceil(losses.length * 0.25));
                    let sum = 0;
                    for(let i=0; i<topCount; i++) sum += losses[i];
                    oneR = sum / topCount;
                } else if (wins.length > 0) {
                    let sum = wins.reduce((a,b) => a+b, 0);
                    oneR = sum / wins.length;
                }
                symbolStats[sym] = { oneR: oneR };
            });

            // Aseguramos orden estrictamente cronológico absoluto
            let sortedDataForComp = [...dataArr].sort((a, b) => a.Time - b.Time);

            // PASO 2: Simulación Cronológica Dinámica en 1 sola cuenta de 10k
            let compBalance = 10000; 
            compChartDataObj = []; 
            
            let compPeak = 10000;
            let compPeakDate = sortedDataForComp.length > 0 ? sortedDataForComp[0].Time : null;
            let maxCompDDMoney = 0;
            let maxCompDDPct = 0;
            let maxCompDDStartDate = null;
            let maxCompDDEndDate = null;
            
            let compDailyDDs = {};
            let prevDateStr = null;
            let currentDayPeak = 10000;
            let prevCompBalance = 10000;

            // Variables para Drawdowns de Capital Real
            let realBalance = 10000;
            let realPeak = 10000;
            let realPeakDate = sortedDataForComp.length > 0 ? sortedDataForComp[0].Time : null;
            let maxRealDDMoney = 0;
            let maxRealDDPct = 0;
            let maxRealDDStartDate = null;
            let maxRealDDEndDate = null;
            
            let realDailyDDs = {};
            let prevRealDateStr = null;
            let currentRealDayPeak = 10000;
            let prevRealBalance = 10000;

            sortedDataForComp.forEach(d => {
                let dateStr = d.DateOnly;
                if (!dateStr) {
                    let timeVal = d.Time instanceof Date ? d.Time : new Date(d.Time);
                    dateStr = isNaN(timeVal.getTime()) ? '1970-01-01' : timeVal.toISOString().split('T')[0];
                }

                // ========================================================
                // --- CÁLCULO DE DRAWDOWNS PARA EL CAPITAL REAL (NORMAL) ---
                // ========================================================
                realBalance += (d.NetProfit || 0);

                if (realBalance > realPeak) {
                    realPeak = realBalance;
                    realPeakDate = d.Time;
                } else {
                    let currentRealDDMoney = realPeak - realBalance;
                    let currentRealDDPct = (currentRealDDMoney / realPeak) * 100;
                    if (currentRealDDPct > maxRealDDPct) {
                        maxRealDDMoney = currentRealDDMoney;
                        maxRealDDPct = currentRealDDPct;
                        maxRealDDStartDate = realPeakDate;
                        maxRealDDEndDate = d.Time;
                    }
                }

                if (dateStr !== prevRealDateStr) {
                    currentRealDayPeak = prevRealBalance;
                    if (!realDailyDDs[dateStr]) realDailyDDs[dateStr] = { maxPct: 0, maxMoney: 0 };
                    prevRealDateStr = dateStr;
                }

                if (realBalance > currentRealDayPeak) {
                    currentRealDayPeak = realBalance;
                }

                let currentRealDailyDDMoney = currentRealDayPeak - realBalance;
                let currentRealDailyDDPct = currentRealDayPeak > 0 ? (currentRealDailyDDMoney / currentRealDayPeak) * 100 : 0;

                if (currentRealDailyDDPct > realDailyDDs[dateStr].maxPct) {
                    realDailyDDs[dateStr].maxPct = currentRealDailyDDPct;
                    realDailyDDs[dateStr].maxMoney = currentRealDailyDDMoney;
                }

                prevRealBalance = realBalance;


                // ========================================================
                // --- CÁLCULO DE DRAWDOWNS PARA LA PROYECCIÓN COMPUESTA ---
                // ========================================================
                let sym = d.Symbol || 'Estrategia';
                let oneR = symbolStats[sym].oneR;
                
                let R = d.NetProfit / oneR;
                
                // Límites estrictos para evitar que eventos anómalos rompan la curva exponencial
                if(R > 30) R = 30;  // Máximo +30R (Ej. un super trend)
                if(R < -15) R = -15; // Máximo -15R (Ej. flash crash o deslizamiento grave)

                compBalance *= (1 + (R * 0.01));
                
                if (compBalance < 0) compBalance = 0; 
                if (isNaN(compBalance)) compBalance = 10000; 
                compBalance = Math.min(compBalance, 1000000000000); 

                if (compBalance > compPeak) {
                    compPeak = compBalance;
                    compPeakDate = d.Time;
                } else {
                    let currentDDMoney = compPeak - compBalance;
                    let currentDDPct = (currentDDMoney / compPeak) * 100;
                    if (currentDDPct > maxCompDDPct) {
                        maxCompDDMoney = currentDDMoney;
                        maxCompDDPct = currentDDPct;
                        maxCompDDStartDate = compPeakDate;
                        maxCompDDEndDate = d.Time;
                    }
                }
                
                if (dateStr !== prevDateStr) {
                    currentDayPeak = prevCompBalance; 
                    if (!compDailyDDs[dateStr]) compDailyDDs[dateStr] = { maxPct: 0, maxMoney: 0 };
                    prevDateStr = dateStr;
                }

                if (compBalance > currentDayPeak) {
                    currentDayPeak = compBalance;
                }

                let currentDailyDDMoney = currentDayPeak - compBalance;
                let currentDailyDDPct = currentDayPeak > 0 ? (currentDailyDDMoney / currentDayPeak) * 100 : 0;

                if (currentDailyDDPct > compDailyDDs[dateStr].maxPct) {
                    compDailyDDs[dateStr].maxPct = currentDailyDDPct;
                    compDailyDDs[dateStr].maxMoney = currentDailyDDMoney;
                }

                prevCompBalance = compBalance;
                
                compChartDataObj.push({ time: d.Time, balance: compBalance });
            });
            
            // Estadísticas diarias de DD Real
            let maxRealDailyDDPct = 0;
            let maxRealDailyDDMoney = 0;
            let sumRealDailyDDPct = 0;
            let sumRealDailyDDMoney = 0;
            let realTradingDaysCount = 0;
            let maxRealDailyDDDate = null;

            for (let date in realDailyDDs) {
                let dayStats = realDailyDDs[date];
                if (dayStats.maxPct > maxRealDailyDDPct) {
                    maxRealDailyDDPct = dayStats.maxPct;
                    maxRealDailyDDMoney = dayStats.maxMoney;
                    maxRealDailyDDDate = date;
                }
                sumRealDailyDDPct += dayStats.maxPct;
                sumRealDailyDDMoney += dayStats.maxMoney;
                realTradingDaysCount++;
            }

            let avgRealDailyDDPct = realTradingDaysCount > 0 ? (sumRealDailyDDPct / realTradingDaysCount) : 0;
            let avgRealDailyDDMoney = realTradingDaysCount > 0 ? (sumRealDailyDDMoney / realTradingDaysCount) : 0;

            // Estadísticas diarias de DD Compuesto
            let maxCompDailyDDPct = 0;
            let maxCompDailyDDMoney = 0;
            let sumCompDailyDDPct = 0;
            let sumCompDailyDDMoney = 0;
            let tradingDaysCount = 0;
            let maxCompDailyDDDate = null;

            for (let date in compDailyDDs) {
                let dayStats = compDailyDDs[date];
                if (dayStats.maxPct > maxCompDailyDDPct) {
                    maxCompDailyDDPct = dayStats.maxPct;
                    maxCompDailyDDMoney = dayStats.maxMoney;
                    maxCompDailyDDDate = date;
                }
                sumCompDailyDDPct += dayStats.maxPct;
                sumCompDailyDDMoney += dayStats.maxMoney;
                tradingDaysCount++;
            }

            let avgCompDailyDDPct = tradingDaysCount > 0 ? (sumCompDailyDDPct / tradingDaysCount) : 0;
            let avgCompDailyDDMoney = tradingDaysCount > 0 ? (sumCompDailyDDMoney / tradingDaysCount) : 0;

            const finalCompBalance = compBalance;
            const compReturnPct = ((finalCompBalance - 10000) / 10000) * 100;

            let monthsSpan = 1;
            if(totalTrades > 0 && maxDate > minDate) {
                monthsSpan = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
                if(monthsSpan <= 0) monthsSpan = 1;
            }
            const tradesPerMonth = totalTrades > 0 ? (totalTrades / monthsSpan) : 0;

            let maxDayProf = -Infinity; let minDayProf = Infinity;
            let bestDayIndex = 0; let worstDayIndex = 0;
            let hasDataDay = false;
            
            for(let i=0; i<=6; i++) {
                if(dayCounts[i] > 0) {
                    if(dayProfits[i] > maxDayProf) { maxDayProf = dayProfits[i]; bestDayIndex = i; }
                    if(dayProfits[i] < minDayProf) { minDayProf = dayProfits[i]; worstDayIndex = i; }
                    hasDataDay = true;
                }
            }

            return {
                totalProfit, grossProfit, grossLoss, absoluteGrossLoss,
                totalTrades, winningTrades, losingTrades, winRate, avgTrade, tradesPerMonth,
                profitFactor, riskReward, maxConsDrawdownPct, maxConsecutiveLoss, maxConsDate, maxSingleLoss, maxSingleLossPct, maxSingleDate, 
                maxWinStreak, maxLossStreak, avgWinStreak, avgLossStreak,
                bestDayIndex, worstDayIndex, hasDataDay,
                maxSimultaneous, finalCompBalance, compReturnPct,
                maxRealDDMoney, maxRealDDPct, maxRealDDStartDate, maxRealDDEndDate,
                maxRealDailyDDPct, maxRealDailyDDMoney, maxRealDailyDDDate, avgRealDailyDDPct, avgRealDailyDDMoney,
                maxCompDDMoney, maxCompDDPct, maxCompDDStartDate, maxCompDDEndDate,
                maxCompDailyDDPct, maxCompDailyDDMoney, maxCompDailyDDDate, avgCompDailyDDPct, avgCompDailyDDMoney
            };
        }

        function updateLeaderboard() {
            const container = document.getElementById('leaderboardContainer');
            
            let pairData = {};
            rawData.forEach(d => {
                if(!d.Symbol) return;
                if(!pairData[d.Symbol]) pairData[d.Symbol] = { profit: 0, count: 0 };
                pairData[d.Symbol].profit += d.NetProfit || 0;
                pairData[d.Symbol].count += 1;
            });

            let sortedPairs = Object.keys(pairData).sort((a,b) => pairData[b].profit - pairData[a].profit);
            container.innerHTML = '';
            
            if (sortedPairs.length === 0) {
                container.innerHTML = '<div class="text-xs text-gray-500 text-center py-4">Sin operaciones</div>';
                return;
            }

            let html = '';
            sortedPairs.forEach((p, index) => {
                let prof = pairData[p].profit;
                let count = pairData[p].count;
                let colorClass = prof >= 0 ? 'text-green-400' : 'text-red-400';
                let bgClass = index % 2 === 0 ? 'bg-gray-700/30' : 'bg-transparent';
                let prefix = prof > 0 ? '+' : '';
                
                html += `
                    <div class="flex justify-between items-center text-sm p-3 rounded hover:bg-gray-700 transition-colors ${bgClass}">
                        <div class="flex items-center gap-2 truncate pr-2">
                            <span class="text-xs font-bold text-gray-500 w-5 shrink-0">${index + 1}.</span>
                            <span class="font-semibold text-gray-200 truncate text-sm" title="${p}">${p}</span>
                            <span class="text-[11px] text-gray-400 shrink-0 ml-1">${count}</span>
                        </div>
                        <span class="font-bold font-mono text-sm ${colorClass} shrink-0">${prefix}${fmtMoney(prof, 2)}</span>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }

        function updateKPIs() {
            const metrics = calculateMetrics(filteredData);

            document.getElementById('kpiTotalProfit').innerText = fmtMoney(metrics.totalProfit);
            document.getElementById('kpiTotalProfit').className = `text-2xl lg:text-3xl font-bold mt-1 ${metrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`;
            document.getElementById('kpiGrossProfit').lastElementChild.innerText = fmtMoney(metrics.grossProfit);
            document.getElementById('kpiGrossLoss').lastElementChild.innerText = fmtMoney(metrics.absoluteGrossLoss);
            
            document.getElementById('kpiTotalTrades').innerText = metrics.totalTrades;
            document.getElementById('kpiSimultaneous').innerText = `Simultáneos: ${metrics.maxSimultaneous}`;
            
            document.getElementById('kpiWinRate').innerText = `${metrics.winRate.toFixed(1)}%`;
            document.getElementById('kpiWinRateSub').innerText = `${metrics.winningTrades} / ${metrics.totalTrades} Victorias`;
            
            document.getElementById('kpiAvgTrade').innerText = fmtMoney(metrics.avgTrade);
            document.getElementById('kpiAvgTrade').className = `text-xl lg:text-2xl font-bold leading-none mt-1 ${metrics.avgTrade >= 0 ? 'text-green-400' : 'text-red-400'}`;
            document.getElementById('kpiTradesPerMonth').innerText = metrics.tradesPerMonth.toFixed(1);

            document.getElementById('kpiProfitFactor').innerText = metrics.profitFactor === 99.99 ? '∞' : metrics.profitFactor.toFixed(2);
            document.getElementById('kpiProfitFactor').className = `text-2xl lg:text-3xl font-bold mt-1 ${metrics.profitFactor >= 1.5 ? 'text-green-400' : (metrics.profitFactor >= 1 ? 'text-blue-400' : 'text-red-400')}`;
            document.getElementById('kpiRiskReward').innerText = metrics.riskReward === 99.99 ? `1:∞` : `1:${metrics.riskReward.toFixed(2)}`;
            
            document.getElementById('kpiMaxWinStreak').innerText = metrics.maxWinStreak;
            document.getElementById('kpiMaxLossStreak').innerText = metrics.maxLossStreak;
            document.getElementById('kpiAvgWinStreak').innerText = metrics.avgWinStreak.toFixed(0);
            document.getElementById('kpiAvgLossStreak').innerText = metrics.avgLossStreak.toFixed(0);

            const baseCapital = 10000;
            document.getElementById('kpiLinearFinal').innerText = fmtMoney(baseCapital + metrics.totalProfit, 0);

            let linearReturnPct = (metrics.totalProfit / baseCapital) * 100;
            let kpiLinearPctEl = document.getElementById('kpiLinearPct');
            kpiLinearPctEl.innerText = (linearReturnPct > 0 ? '+' : '') + linearReturnPct.toFixed(2) + '%';
            kpiLinearPctEl.className = `text-xs font-semibold block ${linearReturnPct >= 0 ? 'text-blue-400' : 'text-red-400'}`;

            // Drawdowns Reales
            let realDDContainer = document.getElementById('realDDContainer');
            if (metrics.maxRealDDPct > 0) {
                realDDContainer.classList.remove('hidden');
                document.getElementById('kpiRealDDPct').innerText = `-${metrics.maxRealDDPct.toFixed(2)}%`;
                document.getElementById('kpiRealDDMoney').innerText = `-${fmtMoney(metrics.maxRealDDMoney)}`;
                document.getElementById('realDDHistDiv').title = `Desde: ${formatShortDate(metrics.maxRealDDStartDate)}\nHasta: ${formatShortDate(metrics.maxRealDDEndDate)}`;
                document.getElementById('kpiRealDailyDDPct').innerText = `-${metrics.maxRealDailyDDPct.toFixed(2)}%`;
                document.getElementById('kpiRealDailyDDMoney').innerText = `-${fmtMoney(metrics.maxRealDailyDDMoney)}`;
                document.getElementById('realDDDailyDiv').title = `Día: ${metrics.maxRealDailyDDDate}`;
                document.getElementById('kpiRealAvgDailyDDPct').innerText = `-${metrics.avgRealDailyDDPct.toFixed(2)}%`;
                document.getElementById('kpiRealAvgDailyDDMoney').innerText = `-${fmtMoney(metrics.avgRealDailyDDMoney)}`;
            } else {
                realDDContainer.classList.add('hidden');
            }

            let renderComp = isNaN(metrics.finalCompBalance) ? 10000 : metrics.finalCompBalance;
            let renderCompPct = isNaN(metrics.compReturnPct) ? 0 : metrics.compReturnPct;
            document.getElementById('kpiCompFinal').innerText = fmtMoney(renderComp, 0);
            document.getElementById('kpiCompPct').innerText = (renderCompPct > 0 ? '+' : '') + renderCompPct.toFixed(2) + '%';
            document.getElementById('kpiCompPct').className = `text-xs font-semibold block ${renderCompPct >= 0 ? 'text-purple-400' : 'text-red-400'}`;
            
            // Drawdowns Compuestos
            let compDDContainer = document.getElementById('compoundDDContainer');
            if (metrics.maxCompDDPct > 0) {
                compDDContainer.classList.remove('hidden');
                document.getElementById('kpiCompDDPct').innerText = `-${metrics.maxCompDDPct.toFixed(2)}%`;
                document.getElementById('kpiCompDDMoney').innerText = `-${fmtMoney(metrics.maxCompDDMoney)}`;
                document.getElementById('compDDHistDiv').title = `Desde: ${formatShortDate(metrics.maxCompDDStartDate)}\nHasta: ${formatShortDate(metrics.maxCompDDEndDate)}`;
                document.getElementById('kpiCompDailyDDPct').innerText = `-${metrics.maxCompDailyDDPct.toFixed(2)}%`;
                document.getElementById('kpiCompDailyDDMoney').innerText = `-${fmtMoney(metrics.maxCompDailyDDMoney)}`;
                document.getElementById('compDDDailyDiv').title = `Día: ${metrics.maxCompDailyDDDate}`;
                document.getElementById('kpiCompAvgDailyDDPct').innerText = `-${metrics.avgCompDailyDDPct.toFixed(2)}%`;
                document.getElementById('kpiCompAvgDailyDDMoney').innerText = `-${fmtMoney(metrics.avgCompDailyDDMoney)}`;
            } else {
                compDDContainer.classList.add('hidden');
            }
        }

        function updateChart() {
            const ctxEq = document.getElementById('equityChart').getContext('2d');
            let cumulative = 0; let chartLabels = []; let chartData = [];

            filteredData.forEach(d => {
                cumulative += d.NetProfit || 0;
                let timeVal = d.Time instanceof Date ? d.Time : new Date(d.Time);
                if(isNaN(timeVal.getTime())) timeVal = new Date();
                chartLabels.push(timeVal);
                chartData.push(cumulative);
            });

            safeDestroy(equityChartInstance);

            equityChartInstance = new Chart(ctxEq, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Beneficio Lineal ($)', data: chartData,
                        borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2, fill: true, pointRadius: 0, pointHoverRadius: 5,
                        tension: 0.4, cubicInterpolationMode: 'monotone'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return 'Beneficio: ' + fmtMoney(context.parsed.y); } } } },
                    scales: {
                        x: { type: 'time', time: { tooltipFormat: 'dd MMM yyyy, HH:mm' }, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
                        y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af', callback: (v) => fmtMoney(v, 0) } }
                    }
                }
            });

            const ctxComp = document.getElementById('compoundChart').getContext('2d');
            let compLabels = compChartDataObj.map(d => {
                let timeVal = d.time instanceof Date ? d.time : new Date(d.time);
                return isNaN(timeVal.getTime()) ? new Date() : timeVal;
            });
            
            let compData = compChartDataObj.map(d => isNaN(d.balance) ? 0 : (d.balance - 10000));

            safeDestroy(compoundChartInstance);

            compoundChartInstance = new Chart(ctxComp, {
                type: 'line',
                data: {
                    labels: compLabels,
                    datasets: [{
                        label: 'Beneficio Compuesto ($)', data: compData,
                        borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        borderWidth: 2, fill: true, pointRadius: 0, pointHoverRadius: 5,
                        tension: 0.4, cubicInterpolationMode: 'monotone'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return 'Beneficio: ' + fmtMoney(context.parsed.y); } } } },
                    scales: {
                        x: { type: 'time', time: { tooltipFormat: 'dd MMM yyyy, HH:mm' }, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
                        y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af', callback: (v) => fmtMoney(v, 0) } }
                    }
                }
            });
        }

        function updateAnalyticsCharts() {
            let tHour = new Array(24).fill(0); 
            let pHourWin = new Array(24).fill(0);
            let pHourLoss = new Array(24).fill(0);
            
            let tDay = new Array(7).fill(0);  
            let pDayWin = new Array(7).fill(0);
            let pDayLoss = new Array(7).fill(0);
            
            let tMonth = new Array(12).fill(0); 
            let pMonthWin = new Array(12).fill(0);
            let pMonthLoss = new Array(12).fill(0);
            
            let scatterData = [];
            
            let realTradesCount = 0;
            let totalDur = 0; let maxDur = 0; let minDur = Infinity;

            filteredData.forEach(d => {
                realTradesCount++;
                
                if (d.EntryHour !== undefined) tHour[d.EntryHour]++;  
                if (d.DayOfWeek !== undefined) tDay[d.DayOfWeek]++;   
                if (d.ExitMonth !== undefined) tMonth[d.ExitMonth]++; 
                
                if(d.NetProfit > 0) {
                    if (d.EntryHour !== undefined) pHourWin[d.EntryHour] += d.NetProfit;
                    if (d.DayOfWeek !== undefined) pDayWin[d.DayOfWeek] += d.NetProfit;
                    if (d.ExitMonth !== undefined) pMonthWin[d.ExitMonth] += d.NetProfit;
                } else if(d.NetProfit < 0) {
                    if (d.EntryHour !== undefined) pHourLoss[d.EntryHour] += Math.abs(d.NetProfit);
                    if (d.DayOfWeek !== undefined) pDayLoss[d.DayOfWeek] += Math.abs(d.NetProfit);
                    if (d.ExitMonth !== undefined) pMonthLoss[d.ExitMonth] += Math.abs(d.NetProfit);
                }
                
                let dur = d.DurationHours;
                if (dur === undefined || isNaN(dur) || !isFinite(dur)) dur = 0;
                scatterData.push({ x: dur, y: d.NetProfit || 0 });
                
                totalDur += dur;
                if(dur > maxDur) maxDur = dur;
                if(dur < minDur) minDur = dur;
            });

            if(realTradesCount === 0) {
                minDur = 0; maxDur = 0; avgDur = 0;
            }
            
            let avgDur = realTradesCount > 0 ? (totalDur / realTradesCount) : 0;

            document.getElementById('statHoldMin').innerText = formatDurationText(minDur);
            document.getElementById('statHoldAvg').innerText = formatDurationText(avgDur);
            document.getElementById('statHoldMax').innerText = formatDurationText(maxDur);

            const barOptions = {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: {size: 10} } },
                    y: { grid: { color: '#374151', drawBorder: false }, ticks: { color: '#9ca3af', font: {size: 10} } }
                }
            };
            
            const barOptionsMoneyGrouped = {
                responsive: true, maintainAspectRatio: false,
                plugins: { 
                    legend: { display: true, position: 'top', labels: { color: '#9ca3af', boxWidth: 10, font: {size: 10} } },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmtMoney(ctx.raw)}` } }
                },
                scales: { 
                    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: {size: 10} } },
                    y: { grid: { color: '#374151', drawBorder: false }, ticks: { color: '#9ca3af', font: {size: 10}, callback: (v) => fmtMoney(v, 0) } }
                }
            };

            let hourColors = tHour.map((_, h) => {
                if (h >= 8 && h < 13) return '#3b82f6';
                if (h >= 13 && h < 22) return '#10b981';
                return '#8b5cf6';
            });
            let hourLabels = Array.from({length: 24}, (_, i) => i + 'h');

            safeDestroy(cTH); cTH = new Chart(document.getElementById('cTradesHour'), { type: 'bar', data: { labels: hourLabels, datasets: [{ data: tHour, backgroundColor: hourColors, borderRadius: 2 }] }, options: barOptions });
            safeDestroy(cTD); cTD = new Chart(document.getElementById('cTradesDay'), { type: 'bar', data: { labels: daysArr, datasets: [{ data: tDay, backgroundColor: '#3b82f6', borderRadius: 2 }] }, options: barOptions });
            safeDestroy(cTM); cTM = new Chart(document.getElementById('cTradesMonth'), { type: 'bar', data: { labels: monthNames, datasets: [{ data: tMonth, backgroundColor: '#3b82f6', borderRadius: 2 }] }, options: barOptions });

            safeDestroy(cPH); cPH = new Chart(document.getElementById('cProfitHour'), { type: 'bar', data: { labels: hourLabels, datasets: [ { label: 'Ganancia', data: pHourWin, backgroundColor: '#10b981', borderRadius: 2, barPercentage: 0.9, categoryPercentage: 0.8 }, { label: 'Pérdida.', data: pHourLoss, backgroundColor: '#ef4444', borderRadius: 2, barPercentage: 0.9, categoryPercentage: 0.8 } ] }, options: barOptionsMoneyGrouped });
            safeDestroy(cPD); cPD = new Chart(document.getElementById('cProfitDay'), { type: 'bar', data: { labels: daysArr, datasets: [ { label: 'Ganancia', data: pDayWin, backgroundColor: '#10b981', borderRadius: 2, barPercentage: 0.9, categoryPercentage: 0.8 }, { label: 'Pérdida.', data: pDayLoss, backgroundColor: '#ef4444', borderRadius: 2, barPercentage: 0.9, categoryPercentage: 0.8 } ] }, options: barOptionsMoneyGrouped });
            safeDestroy(cPM); cPM = new Chart(document.getElementById('cProfitMonth'), { type: 'bar', data: { labels: monthNames, datasets: [ { label: 'Ganancia', data: pMonthWin, backgroundColor: '#10b981', borderRadius: 2, barPercentage: 0.9, categoryPercentage: 0.8 }, { label: 'Pérdida.', data: pMonthLoss, backgroundColor: '#ef4444', borderRadius: 2, barPercentage: 0.9, categoryPercentage: 0.8 } ] }, options: barOptionsMoneyGrouped });

            safeDestroy(scatterChartInstance);
            scatterChartInstance = new Chart(document.getElementById('scatterChart'), {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Operación', data: scatterData,
                        backgroundColor: scatterData.map(d => d.y >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
                        borderColor: scatterData.map(d => d.y >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'),
                        borderWidth: 1, pointRadius: 4, pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { let timeStr = formatDurationText(ctx.parsed.x); return `Retención: ${timeStr} | Profit: ${fmtMoney(ctx.parsed.y)}`; } } } },
                    scales: {
                        x: { title: { display: true, text: 'Tiempo retenido (Horas)', color: '#9ca3af' }, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
                        y: { title: { display: true, text: 'Profit ($)', color: '#9ca3af' }, grid: { color: '#374151' }, ticks: { color: '#9ca3af', callback: (v) => fmtMoney(v, 0) } }
                    }
                }
            });
        }

        // --- DASHBOARD: CALENDARIO ---
        function getCellColorClass(profit) {
            if (profit === undefined || profit === null || profit === 0) return "bg-gray-800/50 border-gray-700 text-gray-500 hover:border-gray-500";
            if (profit > 0) return "bg-green-900/40 border-green-600 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:border-green-400";
            return "bg-red-900/40 border-red-600 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:border-red-400";
        }

        window.calZoomInYear = function(year) { calYear = parseInt(year); calMode = 'MONTHS'; updateSmartCalendar(); };
        window.calZoomInMonth = function(month) { calMonth = parseInt(month); calMode = 'DAYS'; updateSmartCalendar(); };
        window.calZoomOut = function() {
            if (calMode === 'DAYS') calMode = 'MONTHS';
            else if (calMode === 'MONTHS') calMode = 'YEARS';
            updateSmartCalendar();
        };
        window.calZoomIn = function() {
            let calData = filteredData; 
            if (calMode === 'YEARS') {
                let years = [...new Set(calData.map(d => d.Year).filter(Boolean))].sort((a,b) => b-a);
                if (years.length > 0) calZoomInYear(years[0]);
            } else if (calMode === 'MONTHS') {
                let months = [...new Set(calData.filter(d => d.Year === calYear).map(d => d.Month).filter(Boolean))].sort((a,b) => b-a);
                if (months.length > 0) calZoomInMonth(months[0]);
                else calZoomInMonth(1);
            }
        };
        window.calNavigate = function(dir) {
            if (calMode === 'MONTHS') calYear += dir;
            else if (calMode === 'DAYS') {
                calMonth += dir;
                if (calMonth > 12) { calMonth = 1; calYear++; }
                if (calMonth < 1) { calMonth = 12; calYear--; }
            }
            updateSmartCalendar();
        };

        function toggleCalendarDetail() {
            isDetailedCalendar = !isDetailedCalendar;
            const btn = document.getElementById('btnToggleCalendarDetail');
            if (isDetailedCalendar) {
                btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg><span class="hidden md:inline">Ver Resumen</span>`;
                btn.className = "ml-2 md:ml-4 px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs md:text-sm font-semibold transition-colors flex items-center gap-1 shadow-md";
            } else {
                btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg><span class="hidden md:inline">Ver Ruta de Trades</span>`;
                btn.className = "ml-2 md:ml-4 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs md:text-sm font-semibold transition-colors flex items-center gap-1 shadow-md";
            }
            updateSmartCalendar();
        }

        function updateSmartCalendar() {
            const container = document.getElementById('calendarContainer');
            const indicator = document.getElementById('calendarModeIndicator');
            const btnPrev = document.getElementById('btnCalPrev');
            const btnNext = document.getElementById('btnCalNext');
            const btnZoomOut = document.getElementById('btnCalZoomOut');
            const btnZoomIn = document.getElementById('btnCalZoomIn');
            const btnDetail = document.getElementById('btnToggleCalendarDetail');

            let calData = filteredData; 
            container.innerHTML = ''; 

            btnPrev.disabled = (calMode === 'YEARS');
            btnNext.disabled = (calMode === 'YEARS');
            btnZoomOut.disabled = (calMode === 'YEARS');
            if (btnZoomIn) btnZoomIn.disabled = (calMode === 'DAYS');
            
            // Solo habilitar botón de ruta en vista de Días
            if (btnDetail) {
                btnDetail.disabled = (calMode !== 'DAYS');
                if (calMode !== 'DAYS') btnDetail.classList.add('opacity-30', 'cursor-not-allowed');
                else btnDetail.classList.remove('opacity-30', 'cursor-not-allowed');
            }

            if (calData.length === 0) {
                indicator.innerText = "Sin Datos";
                container.innerHTML = '<div class="text-gray-500 py-8 text-center border border-dashed border-gray-700 rounded-xl">No hay operaciones registradas.</div>';
                return;
            }

            if (calMode === 'YEARS') {
                indicator.innerText = "Vista: Años"; renderYearsGrid(container, calData);
            } else if (calMode === 'MONTHS') {
                indicator.innerText = `Año ${calYear}`; renderMonthsGrid(container, calData, calYear);
            } else if (calMode === 'DAYS') {
                indicator.innerText = `${monthNames[(calMonth || 1)-1]} ${calYear}`; renderDaysGrid(container, calData, calYear, calMonth);
            }
        }

        function renderYearsGrid(container, data) {
            let yearlyData = {};
            data.forEach(d => {
                if(!d.Year) return;
                if(!yearlyData[d.Year]) yearlyData[d.Year] = 0;
                yearlyData[d.Year] += d.NetProfit || 0;
            });
            let years = Object.keys(yearlyData).sort((a,b) => b - a); 
            let html = `<div class="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">`;
            years.forEach(year => {
                let profit = yearlyData[year];
                let colorClass = getCellColorClass(profit);
                html += `
                    <div onclick="calZoomInYear('${year}')" class="h-28 flex flex-col items-center justify-center rounded-xl border ${colorClass} p-4 transition-transform hover:-translate-y-1 cursor-pointer relative group">
                        <span class="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-black/30 px-2 py-1 rounded">Ver Meses 🔍</span>
                        <span class="text-sm font-semibold mb-2 opacity-75">Año ${year}</span>
                        <span class="text-2xl font-bold truncate-text w-full text-center">${fmtMoney(profit, 2)}</span>
                    </div>`;
            });
            html += `</div>`; container.innerHTML = html;
        }

        function renderMonthsGrid(container, data, year) {
            let monthlyData = {};
            let monthlyTrades = {};
            data.forEach(d => {
                if (d.Year === year && d.Month) {
                    if(!monthlyData[d.Month]) { monthlyData[d.Month] = 0; monthlyTrades[d.Month] = 0; }
                    monthlyData[d.Month] += d.NetProfit || 0;
                    monthlyTrades[d.Month]++;
                }
            });
            let html = `<div class="grid grid-cols-3 md:grid-cols-4 gap-4 fade-in">`;
            for(let i = 1; i <= 12; i++) {
                let profit = monthlyData[i];
                let trades = monthlyTrades[i] || 0;
                let colorClass = getCellColorClass(profit);
                let displayProfit = profit !== undefined ? fmtMoney(profit, 2) : 'Sin trades';
                html += `
                    <div onclick="calZoomInMonth('${i}')" class="h-24 flex flex-col items-center justify-center rounded-xl border ${colorClass} p-2 transition-transform hover:-translate-y-1 cursor-pointer relative group">
                        <span class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-black/30 px-2 py-1 rounded">Ver Días 🔍</span>
                        <span class="text-xs font-semibold mb-1 opacity-75 uppercase">${monthNames[i-1]}</span>
                        <span class="text-lg font-bold truncate-text w-full text-center">${displayProfit}</span>
                        <span class="text-[10px] text-gray-400 mt-1">${trades} trades</span>
                    </div>`;
            }
            html += `</div>`; container.innerHTML = html;
        }

        function renderDaysGrid(container, data, year, month) {
            let daysInMonth = new Date(year, month, 0).getDate();
            let firstDay = new Date(year, month - 1, 1).getDay();

            let html = `<div class="w-full max-w-6xl mx-auto fade-in">`;
            html += `<div class="grid grid-cols-7 text-center text-xs text-gray-400 font-bold mb-2">`;
            daysArr.forEach(d => html += `<div class="py-2">${d}</div>`);
            html += `</div><div class="grid grid-cols-7 gap-1 md:gap-2">`;
            
            for(let i = 0; i < firstDay; i++) { html += `<div class="min-h-[80px] rounded border border-transparent"></div>`; }

            if (!isDetailedCalendar) {
                // ========================================================
                // VISTA ORIGINAL CON TRADES DETALLADOS (Hora, Simbolo, Profit)
                // ========================================================
                let dailyData = {};
                data.forEach(d => {
                    if (d.Year === year && d.Month === month && d.Time) {
                        let day = d.Time.getDate();
                        if(!dailyData[day]) dailyData[day] = { total: 0, trades: [] };
                        dailyData[day].total += d.NetProfit || 0;
                        
                        dailyData[day].trades.push({
                            sym: d.Symbol || '-',
                            prof: d.NetProfit || 0,
                            time: d.EntryTime || d.Time 
                        });
                    }
                });

                for(let i = 1; i <= daysInMonth; i++) {
                    let dayData = dailyData[i];
                    let profit = dayData ? dayData.total : undefined;
                    let colorClass = getCellColorClass(profit);
                    let displayProfit = profit !== undefined ? fmtMoney(profit, 2) : '-';
                    
                    let tradesHtml = '';
                    if (dayData) {
                        dayData.trades.sort((a,b) => a.time - b.time).forEach(t => {
                            let hh = t.time && t.time.getHours ? t.time.getHours().toString().padStart(2, '0') : '--';
                            let mm = t.time && t.time.getMinutes ? t.time.getMinutes().toString().padStart(2, '0') : '--';
                            let tProf = t.prof;
                            let sColorClass = tProf >= 0 ? 'text-green-300' : 'text-red-300';
                            let sPrefix = tProf > 0 ? '+' : '';
                            
                            tradesHtml += `<div class="flex justify-between w-full items-center gap-1 border-b border-white/5 pb-[2px] last:border-0 opacity-90 hover:opacity-100">
                                <span class="text-[8px] text-gray-500 font-mono tracking-tighter shrink-0" title="Hora de entrada">${hh}:${mm}</span>
                                <span class="truncate max-w-[35px] md:max-w-[45px] text-[8px] text-gray-400" title="${t.sym}">${t.sym}</span>
                                <span class="${sColorClass} font-mono shrink-0 text-[9px]">${sPrefix}${fmtMoney(tProf, 0)}</span>
                            </div>`;
                        });
                    }
                    
                    html += `
                        <div class="min-h-[85px] max-h-[120px] flex flex-col items-center justify-start rounded-lg border ${colorClass} bg-gray-800/60 p-1 transition-transform hover:scale-105 cursor-default overflow-hidden shadow-sm" title="Día ${i}\nNeto: ${profit !== undefined ? fmtMoney(profit, 2) : '0.00'}">
                            <div class="text-[10px] md:text-xs font-semibold opacity-90 border-b border-white/20 w-full text-center pb-1 mb-1 flex flex-col">
                                <span class="text-gray-300">${i}</span>
                                <span class="font-bold text-[10px] md:text-[11px]">${displayProfit}</span>
                            </div>
                            <div class="w-full flex flex-col gap-[2px] overflow-y-auto cell-scrollbar px-[2px]">
                                ${tradesHtml}
                            </div>
                        </div>`;
                }
            } else {
                // ========================================================
                // VISTA DE RUTA DE TRADES (Líneas Multidía)
                // ========================================================
                let monthStartMs = new Date(year, month - 1, 1).getTime();
                let monthEndMs = new Date(year, month, 0, 23, 59, 59).getTime();

                let monthTrades = data.filter(d => {
                    let st = d.EntryTime || d.Time;
                    let et = d.Time;
                    return st.getTime() <= monthEndMs && et.getTime() >= monthStartMs;
                });
                
                monthTrades.sort((a,b) => (a.EntryTime||a.Time) - (b.EntryTime||b.Time));

                // Algoritmo de asignación de pistas (Tracks)
                let tracks = [];
                monthTrades.forEach(t => {
                    let st = t.EntryTime || t.Time;
                    let et = t.Time;
                    
                    let dStart = 1;
                    if (st.getFullYear() === year && (st.getMonth()+1) === month) dStart = st.getDate();
                    
                    let dEnd = daysInMonth;
                    if (et.getFullYear() === year && (et.getMonth()+1) === month) dEnd = et.getDate();

                    let trackIdx = 0;
                    while(true) {
                        if (!tracks[trackIdx]) { tracks[trackIdx] = []; break; }
                        let overlaps = tracks[trackIdx].some(interval => !(dEnd < interval.start || dStart > interval.end));
                        if (!overlaps) break;
                        trackIdx++;
                    }
                    tracks[trackIdx].push({ start: dStart, end: dEnd, trade: t });
                });

                let numTracks = tracks.length;

                for(let i = 1; i <= daysInMonth; i++) {
                    let dayHtml = '';
                    
                    for(let tr = 0; tr < numTracks; tr++) {
                        let segment = tracks[tr].find(item => item.start <= i && item.end >= i);
                        
                        if (segment) {
                            let t = segment.trade;
                            let st = t.EntryTime || t.Time;
                            let et = t.Time;

                            let isActualStart = (st.getFullYear() === year && (st.getMonth()+1) === month && st.getDate() === i);
                            let isActualEnd   = (et.getFullYear() === year && (et.getMonth()+1) === month && et.getDate() === i);

                            let isWin = t.NetProfit >= 0;
                            let bgBase = isWin ? 'bg-green-600/20 text-green-300 border-green-500/50' : 'bg-red-600/20 text-red-300 border-red-500/50';

                            let sTime = st ? `${st.getHours().toString().padStart(2,'0')}:${st.getMinutes().toString().padStart(2,'0')}` : '--:--';
                            let eTime = et ? `${et.getHours().toString().padStart(2,'0')}:${et.getMinutes().toString().padStart(2,'0')}` : '--:--';
                            let symStr = t.Symbol || 'UNK';
                            if(symStr.length > 8) symStr = symStr.substring(0,8) + '..';

                            let content = '';
                            let classes = `h-[22px] mb-1 text-[9.5px] font-mono flex items-center px-1 border-y border-x truncate shadow-sm transition-opacity hover:opacity-100 ${isActualStart || isActualEnd ? 'opacity-90' : 'opacity-70'}`;

                            if (isActualStart && isActualEnd) {
                                // Abre y Cierra el mismo día
                                classes += ` rounded-md ${bgBase} justify-between`;
                                content = `<span class="truncate pr-1 opacity-80">[${sTime}] ${symStr}</span><span class="font-bold">${fmtMoney(t.NetProfit,0)}</span>`;
                            } 
                            else if (isActualStart) {
                                // Día que Abre (y continúa)
                                classes += ` rounded-l-md border-r-0 mr-[-6px] ${bgBase} justify-start`;
                                content = `<span class="font-bold opacity-80">[${sTime}] ${symStr} <span class="text-[8px]">➔</span></span>`;
                            } 
                            else if (isActualEnd) {
                                // Día que Cierra (venía de antes)
                                classes += ` rounded-r-md border-l-0 ml-[-6px] ${bgBase} justify-between`;
                                content = `<span class="opacity-40 text-[8px] mr-1">➔</span><span class="font-bold ml-auto">${fmtMoney(t.NetProfit,0)} <span class="opacity-80">[${eTime}]</span></span>`;
                            } 
                            else {
                                // Día Intermedio (en tránsito)
                                classes += ` rounded-none border-x-0 mx-[-6px] ${bgBase} justify-center bg-opacity-10`;
                                content = `<span class="opacity-50 tracking-widest uppercase">〰️ ${symStr} 〰️</span>`;
                            }

                            dayHtml += `<div class="${classes}" title="${t.Symbol}\nApertura: ${sTime}\nCierre: ${eTime}\nDuración: ${formatDurationText(t.DurationHours)}\nGanancia: ${fmtMoney(t.NetProfit)}">${content}</div>`;
                        } else {
                            // Espaciador para mantener la alineación vertical de las pistas
                            dayHtml += `<div class="h-[22px] mb-1"></div>`; 
                        }
                    }

                    html += `
                        <div class="min-h-[100px] flex flex-col rounded-lg border border-gray-700 bg-gray-800/40 p-1.5 shadow-sm overflow-hidden group">
                            <span class="text-xs font-bold opacity-80 mb-1 border-b border-gray-700/50 pb-1 w-full text-center text-gray-400 group-hover:text-blue-400 transition-colors">${i}</span>
                            <div class="flex flex-col flex-1 overflow-visible">
                                ${dayHtml || '<span class="text-[9px] text-gray-600 m-auto italic">Libre</span>'}
                            </div>
                        </div>`;
                }
            }
            
            html += `</div></div>`; container.innerHTML = html;
        }

        function clearData() {
            if(confirm("¿Estás seguro de borrar todos los datos guardados en tu navegador?")) {
                localStorage.removeItem(storageKey);
                location.reload();
            }
        }

        // ==========================================
        // FUNCIONES DEL COMPARADOR
        // ==========================================
        function syncMainFileToComparator() {
            if(rawData && rawData.length > 0) {
                let idx = comparedFiles.findIndex(f => f.name.includes("Principal"));
                if(idx > -1) { 
                    comparedFiles[idx].data = rawData; 
                    comparedFiles[idx].filteredData = rawData; 
                } else { 
                    addFileToComparator("Estrategia Principal", rawData); 
                }
                populateComparatorFilters();
            }
        }

        function handleComparatorClassicFiles(files) {
            if (files.length === 0) return;
            showLoader();
            let processedCount = 0;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    setTimeout(() => {
                        try {
                            const workbook = XLSX.read(new Uint8Array(event.target.result), { type: 'array', cellDates: true });
                            const jsonResult = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {defval: ""});
                            const extractedData = parseMT5Data(jsonResult);
                            
                            if (extractedData.length > 0) {
                                addFileToComparator(file.name, extractedData);
                                } else {
                                alert(`No se encontraron operaciones compatibles en el archivo: ${file.name}`);
                            }
                        } catch (err) { 
                            alert(`Error al leer el archivo Excel: ${file.name}`); 
                            console.error(err); 
                        } finally { 
                            processedCount++;
                            if (processedCount === files.length) {
                                hideLoader();
                            }
                        }
                    }, 50);
                };
                reader.readAsArrayBuffer(file);
            });
        }

        function handleComparatorGraphFiles(files) {
            if (files.length === 0) return;
            showLoader();
            let processedCount = 0;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    setTimeout(() => {
                        try {
                            const text = event.target.result;
                            const extractedData = parseRawMT5Graph(text, file.name);
                            
                            if (extractedData.length > 0) {
                                addFileToComparator(file.name, extractedData);
                            } else {
                                alert(`El archivo ${file.name} está vacío o no es válido.`);
                            }
                        } catch (err) { 
                            alert(`Error al leer el archivo de Gráfico: ${file.name}`); 
                            console.error(err); 
                        } finally { 
                            processedCount++;
                            if (processedCount === files.length) {
                                hideLoader();
                            }
                        }
                    }, 50);
                };
                reader.readAsText(file);
            });
        }

        document.getElementById('compInputClassic').addEventListener('change', function(e) {
            handleComparatorClassicFiles(Array.from(e.target.files));
            e.target.value = '';
        });

        document.getElementById('compInputGraph').addEventListener('change', function(e) {
            handleComparatorGraphFiles(Array.from(e.target.files));
            e.target.value = '';
        });

        function addFileToComparator(name, dataArr) {
            let color = colorPalette[nextColorIndex % colorPalette.length];
            nextColorIndex++;
            
            let cleanName = name.replace(/\.[^/.]+$/, "");
            
            comparedFiles.push({
                id: Date.now() + Math.random(),
                name: cleanName,
                data: dataArr,
                filteredData: dataArr,
                color: color
            });
            
            populateComparatorFilters();
            updateComparatorUI();
        }

        function removeFileFromComparator(id) {
            comparedFiles = comparedFiles.filter(f => f.id !== id);
            populateComparatorFilters();
            updateComparatorUI();
        }

        function clearComparisons() {
            comparedFiles = [];
            nextColorIndex = 0;
            resetComparatorFilters();
            updateComparatorUI();
        }

        function updateComparatorUI() {
            const listDiv = document.getElementById('comparedFilesList');
            const contentDiv = document.getElementById('comparatorContent');
            
            if (comparedFiles.length < 1) {
                listDiv.innerHTML = '<div class="text-sm text-gray-500 italic mt-2">Aún no hay archivos en el comparador. Sube al menos dos para comparar.</div>';
                contentDiv.classList.add('hidden');
                contentDiv.classList.remove('flex');
                return;
            }
            
            contentDiv.classList.remove('hidden');
            contentDiv.classList.add('flex');
            
            listDiv.innerHTML = comparedFiles.map(f => `
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-600 bg-gray-800 shadow-sm transition-transform hover:scale-105">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${f.color}"></span>
                    <span class="text-sm font-semibold truncate max-w-[150px] md:max-w-[200px]" title="${f.name}">${f.name}</span>
                    ${!f.name.includes("Estrategia Principal") ? `<button onclick="removeFileFromComparator(${f.id})" class="ml-1 text-gray-400 hover:text-red-500 font-bold focus:outline-none">×</button>` : ''}
                </div>
            `).join('');
            
            applyComparatorFilters();
        }

        function populateComparatorFilters() {
            let allSymbols = new Set();
            let allYears = new Set();
            let allMonths = new Set();
            
            comparedFiles.forEach(f => {
                f.data.forEach(d => {
                    if(d.Symbol) allSymbols.add(d.Symbol);
                    if(d.Year) allYears.add(d.Year);
                    if(d.Month) allMonths.add(d.Month);
                });
            });
            
            const symSelect = document.getElementById('compFilterSymbol');
            const currentSym = symSelect.value;
            symSelect.innerHTML = '<option value="ALL">Todos los Pares</option>' + 
                Array.from(allSymbols).sort().map(s => `<option value="${s}">${s}</option>`).join('');
            if(Array.from(allSymbols).includes(currentSym)) symSelect.value = currentSym;
            
            const yearSelect = document.getElementById('compFilterYear');
            const currentYear = yearSelect.value;
            yearSelect.innerHTML = '<option value="ALL">Todos los Años</option>' + 
                Array.from(allYears).sort((a,b)=>b-a).map(y => `<option value="${y}">${y}</option>`).join('');
            if(Array.from(allYears).includes(parseInt(currentYear))) yearSelect.value = currentYear;
            
            const monthSelect = document.getElementById('compFilterMonth');
            const currentMonth = monthSelect.value;
            monthSelect.innerHTML = '<option value="ALL">Todos los Meses</option>' + 
                Array.from(allMonths).sort((a,b)=>a-b).map(m => `<option value="${m}">${monthNames[m-1]}</option>`).join('');
            if(Array.from(allMonths).includes(parseInt(currentMonth))) monthSelect.value = currentMonth;
        }

        function resetComparatorFilters() {
            document.getElementById('compFilterSymbol').value = 'ALL';
            document.getElementById('compFilterYear').value = 'ALL';
            document.getElementById('compFilterMonth').value = 'ALL';
            applyComparatorFilters();
        }

        function applyComparatorFilters() {
            const symFilter = document.getElementById('compFilterSymbol').value;
            const yearFilter = document.getElementById('compFilterYear').value;
            const monthFilter = document.getElementById('compFilterMonth').value;
            
            comparedFiles.forEach(f => {
                f.filteredData = f.data.filter(d => {
                    let matchSym = symFilter === 'ALL' || d.Symbol === symFilter;
                    let matchYear = yearFilter === 'ALL' || d.Year == yearFilter;
                    let matchMonth = monthFilter === 'ALL' || d.Month == monthFilter;
                    let isNotZero = Math.abs(d.NetProfit || 0) >= 0.00001;
                    return matchSym && matchYear && matchMonth && isNotZero;
                });
            });
            
            updateComparatorChart();
            updateComparatorTable();
        }

        let comparatorChartInstance = null;
        function updateComparatorChart() {
            const ctx = document.getElementById('comparatorChart').getContext('2d');
            
            let datasets = comparedFiles.map(f => {
                let cumulative = 0;
                let chartData = [];
                f.filteredData.forEach(d => {
                    cumulative += d.NetProfit || 0;
                    chartData.push({ x: d.Time, y: cumulative });
                });
                return {
                    label: f.name,
                    data: chartData,
                    borderColor: f.color,
                    backgroundColor: f.color + '20',
                    borderWidth: 2, fill: false, pointRadius: 0, pointHoverRadius: 4,
                    tension: 0.2
                };
            });

            safeDestroy(comparatorChartInstance);

            comparatorChartInstance = new Chart(ctx, {
                type: 'line',
                data: { datasets: datasets },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'nearest', axis: 'x', intersect: false },
                    plugins: { 
                        legend: { display: true, position: 'top', labels: { color: '#d1d5db', usePointStyle: true, boxWidth: 8 } },
                        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmtMoney(ctx.parsed.y)}` } }
                    },
                    scales: {
                        x: { type: 'time', time: { tooltipFormat: 'dd MMM yyyy' }, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
                        y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af', callback: (v) => fmtMoney(v, 0) } }
                    }
                }
            });
        }

        function updateComparatorTable() {
            const headerTr = document.getElementById('compTableHeader');
            const bodyTbody = document.getElementById('compTableBody');
            
            headerTr.innerHTML = '<th class="p-3 text-left w-1/4">Métrica</th>';
            comparedFiles.forEach(f => {
                headerTr.innerHTML += `<th class="p-3 text-center truncate max-w-[150px]" style="color: ${f.color}">${f.name}</th>`;
            });
            
            let metricsMap = [
                { id: 'totalProfit', name: 'Ganancia Neta', formatter: v => `<span class="${v>=0?'text-green-400':'text-red-400'} font-bold">${fmtMoney(v)}</span>` },
                { id: 'totalTrades', name: 'Total Trades', formatter: v => v },
                { id: 'winRate', name: 'Win Rate (%)', formatter: v => `<span class="${v>=50?'text-blue-400':'text-orange-400'}">${v.toFixed(2)}%</span>` },
                { id: 'profitFactor', name: 'Profit Factor', formatter: v => `<span class="${v>=1.5?'text-green-400':(v>=1?'text-blue-400':'text-red-400')}">${v===99.99?'∞':v.toFixed(2)}</span>` },
                { id: 'maxRealDDPct', name: 'Max Drawdown (%)', formatter: v => `<span class="text-red-400">-${v.toFixed(2)}%</span>` },
                { id: 'avgTrade', name: 'Promedio x Trade', formatter: v => `<span class="${v>=0?'text-green-400':'text-red-400'}">${fmtMoney(v)}</span>` },
                { id: 'maxWinStreak', name: 'Racha Ganadora', formatter: v => `<span class="text-green-400">${v}</span>` },
                { id: 'maxLossStreak', name: 'Racha Perdedora', formatter: v => `<span class="text-red-400">${v}</span>` },
                { id: 'compReturnPct', name: 'Retorno Compuesto', formatter: v => `<span class="${v>=0?'text-purple-400':'text-red-400'} font-bold">${(v>0?'+':'')}${v.toFixed(2)}%</span>` }
            ];

            let calculatedMetrics = comparedFiles.map(f => calculateMetrics(f.filteredData));
            
            let rowsHtml = '';
            metricsMap.forEach((m, i) => {
                let bgClass = i % 2 === 0 ? 'bg-gray-800/50' : 'bg-transparent';
                rowsHtml += `<tr class="hover:bg-gray-700/50 transition-colors ${bgClass}">
                    <td class="p-3 font-medium text-gray-300">${m.name}</td>`;
                calculatedMetrics.forEach(cm => {
                    rowsHtml += `<td class="p-3 text-center font-mono text-sm">${m.formatter(cm[m.id])}</td>`;
                });
                rowsHtml += `</tr>`;
            });
            
            bodyTbody.innerHTML = rowsHtml;
        }

        // ==========================================
        // DRAG AND DROP GLOBAL
        // ==========================================
        const dndOverlay = document.getElementById('dndOverlay');
        let dragCounter = 0;

        window.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dragCounter++;
            if (dragCounter === 1) {
                dndOverlay.classList.remove('hidden');
                dndOverlay.classList.add('flex');
            }
        });

        window.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter === 0) {
                dndOverlay.classList.add('hidden');
                dndOverlay.classList.remove('flex');
            }
        });

        window.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        window.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            dndOverlay.classList.add('hidden');
            dndOverlay.classList.remove('flex');

            const files = Array.from(e.dataTransfer.files);
            if(files.length === 0) return;

            let xlsxFiles = files.filter(f => f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls'));
            let csvFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.txt') || f.name.toLowerCase().endsWith('.tsv'));

            const isDashboardActive = !document.getElementById('view-dashboard').classList.contains('hidden');

            if (isDashboardActive) {
                if(xlsxFiles.length > 0) handleDashboardClassicFiles(xlsxFiles);
                if(csvFiles.length > 0) handleDashboardGraphFiles(csvFiles);
            } else {
                if(xlsxFiles.length > 0) handleComparatorClassicFiles(xlsxFiles);
                if(csvFiles.length > 0) handleComparatorGraphFiles(csvFiles);
            }
        });