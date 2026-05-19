// Gestión de Cementerio - Frontend
class CementerioApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentPage = 1;
        this.pageSize = 10;
        this.searchFilters = {};
        this.currentSortColumn = null;
        this.currentSortDirection = 'asc';
        this.originalData = {}; // Para almacenar datos originales sin ordenar
        this.lastSearchData = null; // Para almacenar la última búsqueda realizada
        this.difuntosPagina = 1;
        this.parcelasPagina = 1;
        this.registrosPorPagina = 50;
        this.init();
    }

    async init() {
        // Aplicar tema e idioma guardados al arrancar
        const savedTheme = localStorage.getItem('cementerio-theme') || 'light';
        this.applyTheme(savedTheme);
        if (window.i18n) window.i18n.applyToDOM();

        await this.initLogin();

        this.bindNavigationEvents();
        this.bindModalEvents();
        this.bindFormEvents();
        this.bindSearchEvents();
        this.bindTableSortEvents();
        this.bindParcelasFilters();
        
        // Inicializar ciudades populares
        this.inicializarCiudadesPopulares();
        
        // Cargar dashboard inicial
        await this.loadDashboard();
        this.showSection('dashboard');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Navegación
    bindNavigationEvents() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
        }

        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

        // Cargar datos según la sección
        this.loadSectionData(sectionName);
    }

    async loadSectionData(sectionName) {
        try {
            switch (sectionName) {
                case 'dashboard':
                    // Siempre actualizar dashboard al navegar a él
                    await this.loadDashboard();
                    break;
                case 'difuntos':
                    await this.loadDifuntos();
                    break;
                case 'parcelas':
                    await this.loadParcelas();
                    break;
                case 'busqueda':
                    // La búsqueda se carga bajo demanda
                    break;
                case 'reportes':
                break;
            case 'configuracion':
                    await this.loadConfigurationInfo();
                    await this.loadEtiquetas();
                    break;
            }
        } catch (error) {
            this.showNotification(t('err.load_data').replace('{n}', error.message), 'error');
        }
    }

    // Dashboard
    async loadDashboard() {
        try {
            // Mostrar indicadores de carga en las estadísticas
            this.showDashboardLoading(true);
            
            const stats = await window.electronAPI.getEstadisticas();
            this.updateDashboardStats(stats);
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Cargar actividad reciente
            await this.loadRecentActivity();
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            this.showNotification(t('err.load_stats'), 'error');
        } finally {
            this.showDashboardLoading(false);
        }
    }

    // Mostrar/ocultar indicadores de carga en el dashboard
    showDashboardLoading(show) {
        const statsCards = ['total-difuntos', 'total-parcelas', 'parcelas-ocupadas', 'parcelas-disponibles'];
        
        statsCards.forEach(cardId => {
            const card = document.getElementById(cardId);
            if (card) {
                if (show) {
                    card.textContent = '⟳';
                    card.style.opacity = '0.6';
                } else {
                    card.style.opacity = '1';
                }
            }
        });
    }

    async loadRecentActivity(showNotification = false) {
        try {
            // Mostrar animación de carga en el botón
            const refreshButton = document.querySelector('.refresh-activity');
            if (refreshButton && showNotification) {
                refreshButton.innerHTML = t('dash.refreshing');
                refreshButton.disabled = true;
                refreshButton.style.opacity = '0.6';
            }

            const recentActivity = await window.electronAPI.getRecentActivity(8);
            this.updateRecentActivity(recentActivity);

            // Mostrar notificación de éxito si se solicitó
            if (showNotification) {
                this.showNotification(t('msg.activity_updated'), 'success');

                // Indicador visual temporal en el header
                const activityHeader = document.querySelector('.activity-header span');
                if (activityHeader) {
                    const originalText = activityHeader.textContent;
                    activityHeader.textContent = t('dash.activity_updated');
                    activityHeader.style.color = '#28a745';
                    
                    // Restaurar después de 2 segundos
                    setTimeout(() => {
                        activityHeader.textContent = originalText;
                        activityHeader.style.color = '';
                    }, 2000);
                }
            }

            // Restaurar botón
            if (refreshButton && showNotification) {
                setTimeout(() => {
                    refreshButton.innerHTML = t('btn.refresh');
                    refreshButton.disabled = false;
                    refreshButton.style.opacity = '1';
                }, 500);
            }

        } catch (error) {
            console.error('Error cargando actividad reciente:', error);
            
            if (showNotification) {
                this.showNotification(t('err.refresh_activity'), 'error');
            }
            
            // Restaurar botón en caso de error
            const refreshButton = document.querySelector('.refresh-activity');
            if (refreshButton && showNotification) {
                refreshButton.innerHTML = '↻ Actualizar';
                refreshButton.disabled = false;
                refreshButton.style.opacity = '1';
            }
            
            // Mostrar mensaje por defecto si hay error
            this.updateRecentActivity([]);
        }
    }

    updateRecentActivity(activities) {
        const recentList = document.getElementById('recentList');
        if (!recentList) return;

        if (!activities || activities.length === 0) {
            recentList.innerHTML = `
                <div class="no-activity" style="padding: 32px 24px; text-align: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="48" height="48" style="opacity:0.4; margin-bottom:4px;"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    <h3 style="margin: 0 0 8px; font-size: 1.1rem; color: var(--text-primary);">${t('dash.welcome')}</h3>
                    <p style="margin: 0 0 20px; color: var(--text-secondary); font-size: 0.9rem;">${t('dash.no_activity_sub')}</p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="app.showSection('parcelas')" style="font-size: 0.85rem; padding: 8px 16px;">+ ${t('nav.plots')}</button>
                        <button class="btn btn-secondary" onclick="app.showSection('difuntos')" style="font-size: 0.85rem; padding: 8px 16px;">+ ${t('nav.deceased')}</button>
                    </div>
                </div>
            `;
            return;
        }

        const activitiesHtml = activities.map(activity => {
            const actionClass = this.getActivityActionClass(activity.accion, activity.tipo);
            const badge = this.getActivityBadge(activity.tipo);
            const desc = this.formatActivityDescription(activity.descripcion, activity.tipo);
            const iconSvg = this.getActivityIconSvg(activity.tipo);

            return `
                <div class="activity-item ${actionClass}">
                    <div class="activity-icon-wrap activity-icon-${activity.tipo}">${iconSvg}</div>
                    <div class="activity-content">
                        <div class="activity-title">${desc}</div>
                        <div class="activity-action">${this.translateAction(activity.accion)}</div>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-badge activity-badge-${activity.tipo}">${badge}</span>
                        <div class="activity-time">${activity.fecha}</div>
                    </div>
                </div>
            `;
        }).join('');

        recentList.innerHTML = `
            <div class="activity-header">
                <div class="activity-header-left">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <span>${t('dash.recent')}</span>
                </div>
                <button class="refresh-activity" onclick="app.loadRecentActivity(true)" title="${t('btn.refresh')}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    ${t('btn.refresh')}
                </button>
            </div>
            ${activitiesHtml}
        `;
    }

    getActivityIcon(tipo) {
        const icons = {
            'difunto': '👤',
            'parcela': '🏛️',
            'sistema': '⚙️',
            'backup': '💾',
            'optimizacion': '⚡'
        };
        return icons[tipo] || '📝';
    }

    getActivityClass(tipo) {
        const classes = {
            'difunto': 'activity-difunto',
            'parcela': 'activity-parcela',
            'sistema': 'activity-sistema',
            'backup': 'activity-backup',
            'optimizacion': 'activity-optimize'
        };
        return classes[tipo] || 'activity-default';
    }

    getActivityActionClass(accion, tipo) {
        // Determinar color basado en la acción
        if (accion === 'Eliminado' || accion === 'Eliminada') {
            return 'activity-deleted';
        } else if (accion === 'Modificado' || accion === 'Modificada') {
            return 'activity-modified';
        } else if (accion === 'Nuevo registro' || accion === 'Nueva parcela') {
            return 'activity-created';
        }
        
        // Fallback a la clase basada en tipo
        return this.getActivityClass(tipo);
    }

    getActivityBadge(tipo) {
        const badges = {
            'difunto': t('badge.difunto'),
            'parcela': t('badge.parcela'),
            'sistema': t('badge.sistema'),
            'backup': t('badge.respaldo'),
            'optimizacion': t('badge.optimizado')
        };
        return badges[tipo] || t('badge.accion');
    }

    shortParcelaCode(codigo) {
        if (!codigo) return null;
        const match = codigo.match(/^([A-Z]-\d+-\d+)/);
        return match ? match[1] : codigo.substring(0, 10);
    }

    formatActivityDescription(descripcion, tipo) {
        if (tipo === 'parcela') {
            const match = descripcion.match(/([A-Z]-\d+-\d+)/);
            if (match) return `${t('nav.plots').replace(/s$/,'')} <strong>${match[1]}</strong>`;
        }
        return descripcion.replace(/^(Parcela|Difunto)\s+/i, '<strong>$&</strong>');
    }

    translateAction(accion) {
        const map = {
            'Eliminado':     t('act.deleted_m'),
            'Eliminada':     t('act.deleted_f'),
            'Modificado':    t('act.modified_m'),
            'Modificada':    t('act.modified_f'),
            'Nuevo registro':t('act.new_record'),
            'Nueva parcela': t('act.new_plot'),
            'Respaldo':      t('act.backup'),
            'Optimizado':    t('act.optimized'),
        };
        return map[accion] || accion;
    }

    getActivityIconSvg(tipo) {
        const icons = {
            'difunto': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            'parcela': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
            'sistema': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
        };
        return icons[tipo] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/></svg>';
    }

    updateDashboardStats(stats) {
        const statsCards = {
            'total-difuntos': stats.totalDifuntos || 0,
            'total-parcelas': stats.totalParcelas || 0,
            'parcelas-ocupadas': stats.parcelasOcupadas || 0,
            'parcelas-disponibles': stats.parcelasDisponibles || 0
        };

        Object.keys(statsCards).forEach(cardId => {
            const card = document.getElementById(cardId);
            if (card) card.textContent = statsCards[cardId];
        });

        const ingresosMes = document.getElementById('ingresos-mes');
        if (ingresosMes) {
            const v = parseFloat(stats.ingresosEsteMes || 0);
            ingresosMes.textContent = (Number.isInteger(v) ? v : v.toFixed(2)) + ' €';
        }
        const ocupPct = document.getElementById('ocupacion-pct');
        if (ocupPct) ocupPct.textContent = (stats.ocupacionPct || 0) + '%';

        // Hacer clickeables las tarjetas de estadísticas
        this.makeStatsCardsClickable();
    }

    makeStatsCardsClickable() {
        // Tarjeta de Total Difuntos -> Sección Difuntos
        const totalDifuntosCard = document.getElementById('total-difuntos');
        if (totalDifuntosCard && totalDifuntosCard.parentElement) {
            const cardContainer = totalDifuntosCard.parentElement;
            cardContainer.style.cursor = 'pointer';
            cardContainer.title = t('dash.tip_deceased');
            
            // Remover event listeners previos
            cardContainer.replaceWith(cardContainer.cloneNode(true));
            const newCardContainer = document.getElementById('total-difuntos').parentElement;
            
            newCardContainer.addEventListener('click', () => {
                this.showSection('difuntos');
            });
        }

        // Tarjeta de Total Parcelas -> Sección Parcelas
        const totalParcelasCard = document.getElementById('total-parcelas');
        if (totalParcelasCard && totalParcelasCard.parentElement) {
            const cardContainer = totalParcelasCard.parentElement;
            cardContainer.style.cursor = 'pointer';
            cardContainer.title = t('dash.tip_plots');
            
            cardContainer.replaceWith(cardContainer.cloneNode(true));
            const newCardContainer = document.getElementById('total-parcelas').parentElement;
            
            newCardContainer.addEventListener('click', () => {
                this.showSection('parcelas');
            });
        }

        // Tarjeta de Parcelas Ocupadas -> Sección Parcelas
        const parcelasOcupadasCard = document.getElementById('parcelas-ocupadas');
        if (parcelasOcupadasCard && parcelasOcupadasCard.parentElement) {
            const cardContainer = parcelasOcupadasCard.parentElement;
            cardContainer.style.cursor = 'pointer';
            cardContainer.title = t('dash.tip_occupied');
            
            cardContainer.replaceWith(cardContainer.cloneNode(true));
            const newCardContainer = document.getElementById('parcelas-ocupadas').parentElement;
            
            newCardContainer.addEventListener('click', () => {
                this.showSection('parcelas');
            });
        }

        // Tarjeta de Parcelas Disponibles -> Sección Parcelas
        const parcelasDisponiblesCard = document.getElementById('parcelas-disponibles');
        if (parcelasDisponiblesCard && parcelasDisponiblesCard.parentElement) {
            const cardContainer = parcelasDisponiblesCard.parentElement;
            cardContainer.style.cursor = 'pointer';
            cardContainer.title = t('dash.tip_available');
            
            cardContainer.replaceWith(cardContainer.cloneNode(true));
            const newCardContainer = document.getElementById('parcelas-disponibles').parentElement;
            
            newCardContainer.addEventListener('click', () => {
                this.showSection('parcelas');
            });
        }
    }

    // Gestión de Difuntos
    async loadDifuntos() {
        try {
            this.showLoading('difuntos-table-container');
            const difuntos = await window.electronAPI.getDifuntos();
            this.originalData.difuntos = difuntos; // Guardar datos originales
            this.difuntosPagina = 1;

            // Aplicar ordenamiento por defecto: ID ascendente
            this.currentSortColumn = 'id';
            this.currentSortDirection = 'asc';
            const sortedDifuntos = this.sortData(difuntos, 'id');
            
            this.renderDifuntosTable(sortedDifuntos);
            this.updateSortIcons('difuntos', 'id'); // Mostrar indicador visual
        } catch (error) {
            console.error('Error cargando difuntos:', error);
            this.showNotification(t('err.load_dec'), 'error');
        } finally {
            this.hideLoading('difuntos-table-container');
        }
    }

    renderDifuntosTable(difuntos) {
        const tableBody = document.querySelector('#difuntos-table tbody');
        if (!tableBody) return;

        const total = difuntos.length;
        const rpp = this.registrosPorPagina;
        const totalPaginas = Math.max(1, Math.ceil(total / rpp));
        if (this.difuntosPagina > totalPaginas) this.difuntosPagina = totalPaginas;
        const inicio = (this.difuntosPagina - 1) * rpp;
        const fin = Math.min(inicio + rpp, total);
        const pagina = difuntos.slice(inicio, fin);

        tableBody.innerHTML = '';

        if (total === 0) {
            const cols = tableBody.closest('table').querySelectorAll('thead th').length;
            tableBody.innerHTML = `
                <tr><td colspan="${cols}" class="table-empty-state">
                    <div class="table-empty-inner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="48" height="48"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <p>${t('empty.no_deceased')}</p>
                        <button class="btn btn-primary btn-sm" onclick="app.openModal('modal-difunto')">+ ${t('empty.add_deceased')}</button>
                    </div>
                </td></tr>`;
            return;
        }

        pagina.forEach(difunto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${difunto.id}</td>
                <td><strong>${difunto.nombre} ${difunto.apellidos}</strong></td>
                <td>${this.formatDate(difunto.fecha_nacimiento)}</td>
                <td>${this.formatDate(difunto.fecha_defuncion)}</td>
                <td>${difunto.parcela_codigo ? `<span class="parcela-code" title="${difunto.parcela_codigo}">${this.shortParcelaCode(difunto.parcela_codigo)}</span>` : `<span class="badge badge-sin-asignar">${t('msg.sin_asignar')}</span>`}</td>
                <td class="action-buttons">
                    <button class="btn-icon btn-icon-edit" onclick="app.editDifunto(${difunto.id})" title="${t('btn.edit')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="btn-icon btn-icon-family" onclick="app.abrirFamiliares(${difunto.id}, '${difunto.nombre} ${difunto.apellidos}')" title="${t('nav.deceased')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button>
                    <button class="btn-icon btn-icon-pay" onclick="app.abrirPagos(${difunto.id}, '${difunto.nombre} ${difunto.apellidos}')" title="${t('rep.payments')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></button>
                    <button class="btn-icon btn-icon-delete" onclick="app.deleteDifunto(${difunto.id})" title="${t('btn.delete')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Paginación
        const container = document.getElementById('difuntos-table-container');
        let pagBar = container.querySelector('.pagination-bar');
        if (!pagBar) {
            pagBar = document.createElement('div');
            container.appendChild(pagBar);
        }
        if (total <= rpp) {
            pagBar.innerHTML = '';
            return;
        }
        const mostrandoInicio = total === 0 ? 0 : inicio + 1;
        pagBar.className = 'pagination-bar';
        pagBar.innerHTML = `
            <span class="pagination-info">${t('pag.showing')} ${mostrandoInicio}-${fin} ${t('pag.of')} ${total} ${t('pag.records')}</span>
            <div class="pagination-controls">
                <button class="pag-btn" id="dif-pag-prev" ${this.difuntosPagina <= 1 ? 'disabled' : ''}>${t('pag.prev')}</button>
                <span class="pag-pages">${t('pag.page')} ${this.difuntosPagina} ${t('pag.of')} ${totalPaginas}</span>
                <button class="pag-btn" id="dif-pag-next" ${this.difuntosPagina >= totalPaginas ? 'disabled' : ''}>${t('pag.next')}</button>
            </div>`;
        pagBar.querySelector('#dif-pag-prev')?.addEventListener('click', () => {
            if (this.difuntosPagina > 1) { this.difuntosPagina--; this.renderDifuntosTable(difuntos); }
        });
        pagBar.querySelector('#dif-pag-next')?.addEventListener('click', () => {
            if (this.difuntosPagina < totalPaginas) { this.difuntosPagina++; this.renderDifuntosTable(difuntos); }
        });
    }

    // Gestión de Parcelas
    async loadParcelas() {
        try {
            this.showLoading('parcelas-table-container');
            const parcelas = await window.electronAPI.getParcelas();
            this.originalData.parcelas = parcelas; // Guardar datos originales
            this.populateParcelasFilterSelects();
            this.parcelasPagina = 1;

            // Aplicar ordenamiento por defecto: Código ascendente
            this.currentSortColumn = 'codigo';
            this.currentSortDirection = 'asc';
            const sortedParcelas = this.sortData(parcelas, 'codigo');
            
            this.renderParcelasTable(sortedParcelas);
            this.updateSortIcons('parcelas', 'codigo'); // Mostrar indicador visual
        } catch (error) {
            console.error('Error cargando parcelas:', error);
            this.showNotification(t('err.load_plots'), 'error');
        } finally {
            this.hideLoading('parcelas-table-container');
        }
    }

    renderParcelasTable(parcelas) {
        const tableBody = document.querySelector('#parcelas-table tbody');
        if (!tableBody) return;

        const total = parcelas.length;
        const rpp = this.registrosPorPagina;
        const totalPaginas = Math.max(1, Math.ceil(total / rpp));
        if (this.parcelasPagina > totalPaginas) this.parcelasPagina = totalPaginas;
        const inicio = (this.parcelasPagina - 1) * rpp;
        const fin = Math.min(inicio + rpp, total);
        const pagina = parcelas.slice(inicio, fin);

        tableBody.innerHTML = '';

        if (total === 0) {
            const cols = tableBody.closest('table').querySelectorAll('thead th').length;
            tableBody.innerHTML = `
                <tr><td colspan="${cols}" class="table-empty-state">
                    <div class="table-empty-inner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="48" height="48"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                        <p>${t('empty.no_plots')}</p>
                        <button class="btn btn-primary btn-sm" onclick="app.openModal('modal-parcela')">+ ${t('empty.add_plot')}</button>
                    </div>
                </td></tr>`;
            return;
        }

        pagina.forEach(parcela => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${parcela.codigo}</td>
                <td><span class="badge badge-${parcela.tipo}">${parcela.tipo}</span></td>
                <td><span class="badge badge-zona-${parcela.zona?.toLowerCase()}">${parcela.zona || 'N/A'}</span></td>
                <td>${parcela.seccion}-${parcela.numero}</td>
                <td>${parcela.fila || 'S/N'}</td>
                <td><span class="badge badge-ubicacion">${parcela.ubicacion || 'N/A'}</span></td>
                <td><span class="badge badge-${parcela.estado}">${this.translateStatus(parcela.estado)}</span></td>
                <td>${parcela.precio ? '$' + parcela.precio.toFixed(2) : 'N/A'}</td>
                <td class="action-buttons">
                    <button class="btn-icon btn-icon-edit" onclick="app.editParcela(${parcela.id})" title="${t('btn.edit')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="btn-icon btn-icon-delete" onclick="app.deleteParcela(${parcela.id})" title="${t('btn.delete')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Paginación
        const container = document.getElementById('parcelas-table-container');
        let pagBar = container.querySelector('.pagination-bar');
        if (!pagBar) {
            pagBar = document.createElement('div');
            container.appendChild(pagBar);
        }
        if (total <= rpp) {
            pagBar.innerHTML = '';
            return;
        }
        const mostrandoInicio = total === 0 ? 0 : inicio + 1;
        pagBar.className = 'pagination-bar';
        pagBar.innerHTML = `
            <span class="pagination-info">${t('pag.showing')} ${mostrandoInicio}-${fin} ${t('pag.of')} ${total} ${t('pag.records')}</span>
            <div class="pagination-controls">
                <button class="pag-btn" id="par-pag-prev" ${this.parcelasPagina <= 1 ? 'disabled' : ''}>${t('pag.prev')}</button>
                <span class="pag-pages">${t('pag.page')} ${this.parcelasPagina} ${t('pag.of')} ${totalPaginas}</span>
                <button class="pag-btn" id="par-pag-next" ${this.parcelasPagina >= totalPaginas ? 'disabled' : ''}>${t('pag.next')}</button>
            </div>`;
        pagBar.querySelector('#par-pag-prev')?.addEventListener('click', () => {
            if (this.parcelasPagina > 1) { this.parcelasPagina--; this.renderParcelasTable(parcelas); }
        });
        pagBar.querySelector('#par-pag-next')?.addEventListener('click', () => {
            if (this.parcelasPagina < totalPaginas) { this.parcelasPagina++; this.renderParcelasTable(parcelas); }
        });
    }

    // Modales
    bindModalEvents() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            const cancelBtn = modal.querySelector('.btn-secondary');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modal.id));
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.closeModal(modal.id));
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Botones para abrir modales
        document.getElementById('btn-nuevo-difunto')?.addEventListener('click', async () => {
            // Limpiar modo edición
            const form = document.getElementById('form-difunto');
            if (form) {
                delete form.dataset.editingId;
                form.reset();
            }
            
            // Cargar parcelas disponibles
            await this.loadParcelasDisponibles();
            
            // Restaurar título del modal
            const modalTitle = document.getElementById('modal-difunto-title');
            if (modalTitle) modalTitle.textContent = t('dec.new');
            
            this.openModal('modal-difunto');
        });

        document.getElementById('btn-nueva-parcela')?.addEventListener('click', async () => {
            const form = document.getElementById('form-parcela');
            if (form) {
                delete form.dataset.editingId;
                form.reset();
            }

            const modalTitle = document.getElementById('modal-parcela-title');
            if (modalTitle) modalTitle.textContent = t('plot.new');

            await this.populateParcelaSelects();
            this.openModal('modal-parcela');
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.resetForm(modal);
        }
    }

    resetForm(modal) {
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            // Limpiar cualquier error de validación
            form.querySelectorAll('.error').forEach(el => el.remove());
        }
    }

    // Formularios
    bindFormEvents() {
        const formDifunto = document.getElementById('form-difunto');
        const formParcela = document.getElementById('form-parcela');

        if (formDifunto) {
            formDifunto.addEventListener('submit', (e) => this.handleDifuntoSubmit(e));
        }

        if (formParcela) {
            formParcela.addEventListener('submit', (e) => this.handleParcelaSubmit(e));
        }
    }

    async handleDifuntoSubmit(e) {
        e.preventDefault();

        // Validación
        const f = e.target;
        const isValid = this.validateForm([
            { el: f.querySelector('[name="nombre"]'),         rules: { required: true, minLength: 2 } },
            { el: f.querySelector('[name="apellidos"]'),      rules: { required: true, minLength: 2 } },
            { el: f.querySelector('[name="fecha_defuncion"]'),rules: { required: true } },
            { el: f.querySelector('[name="fecha_nacimiento"]'),rules: { beforeDate: 'fecha_defuncion' } },
        ]);
        if (!isValid) return;

        const formData = new FormData(e.target);
        const difuntoData = {
            nombre: formData.get('nombre'),
            apellidos: formData.get('apellidos'),
            cedula: formData.get('cedula'),
            sexo: formData.get('sexo') || 'M', // Valor por defecto si no se selecciona
            fecha_nacimiento: formData.get('fecha_nacimiento'),
            fecha_defuncion: formData.get('fecha_defuncion'),
            lugar_nacimiento: formData.get('lugar_nacimiento'),
            causa_muerte: formData.get('causa_muerte'),
            observaciones: formData.get('observaciones'),
            parcela_id: formData.get('parcela_id') || null
        };

        try {
            const editingId = e.target.dataset.editingId;
            
            if (editingId) {
                // Actualizar difunto existente
                await window.electronAPI.updateDifunto(editingId, difuntoData);
                this.showNotification(t('msg.dec_updated'), 'success');
            } else {
                // Crear nuevo difunto
                await window.electronAPI.createDifunto(difuntoData);
                this.showNotification(t('msg.dec_saved'), 'success');
            }
            
            this.closeModal('modal-difunto');
            
            // Actualizar la sección actual si corresponde
            if (this.currentSection === 'difuntos') {
                await this.loadDifuntos();
            }
            if (this.currentSection === 'parcelas') {
                await this.loadParcelas();
            }
            if (this.currentSection === 'busqueda') {
                // Refrescar la búsqueda si estamos en esa sección
                await this.refreshLastSearch();
            }
            
            // SIEMPRE actualizar dashboard para refrescar estadísticas
            await this.loadDashboard();
            await this.loadRecentActivity(); // Actualizar actividad reciente
        } catch (error) {
            console.error('Error procesando difunto:', error);
            this.showNotification(t('err.save_dec').replace('{n}', error.message), 'error');
        }
    }

    async handleParcelaSubmit(e) {
        e.preventDefault();

        // Validación
        const f = e.target;
        const isValid = this.validateForm([
            { el: f.querySelector('[name="codigo"]'),   rules: { required: true } },
            { el: f.querySelector('[name="tipo"]'),     rules: { required: true } },
            { el: f.querySelector('[name="zona"]'),     rules: { required: true } },
            { el: f.querySelector('[name="ubicacion"]'),rules: { required: true } },
            { el: f.querySelector('[name="seccion"]'),  rules: { required: true } },
            { el: f.querySelector('[name="numero"]'),   rules: { required: true, gt: 0 } },
            { el: f.querySelector('[name="precio"]'),   rules: { min: 0 } },
        ]);
        if (!isValid) return;

        const formData = new FormData(e.target);
        const parcelaData = {
            codigo: formData.get('codigo'),
            tipo: formData.get('tipo'),
            zona: formData.get('zona'),
            seccion: formData.get('seccion'),
            fila: parseInt(formData.get('fila')) || null,
            numero: parseInt(formData.get('numero')),
            ubicacion: formData.get('ubicacion'),
            precio: parseFloat(formData.get('precio')) || 0,
            observaciones: formData.get('observaciones')
        };

        try {
            const editingId = e.target.dataset.editingId;
            
            if (editingId) {
                // Actualizar parcela existente
                await window.electronAPI.updateParcela(editingId, parcelaData);
                this.showNotification(t('msg.plot_updated'), 'success');
            } else {
                // Crear nueva parcela
                await window.electronAPI.createParcela(parcelaData);
                this.showNotification(t('msg.plot_saved'), 'success');
            }
            
            this.closeModal('modal-parcela');
            
            // Actualizar la sección actual si corresponde
            if (this.currentSection === 'parcelas') {
                await this.loadParcelas();
            }
            
            // SIEMPRE actualizar dashboard para refrescar estadísticas
            await this.loadDashboard();
            await this.loadRecentActivity(); // Actualizar actividad reciente
        } catch (error) {
            console.error('Error procesando parcela:', error);
            this.showNotification(t('err.save_plot').replace('{n}', error.message), 'error');
        }
    }

    // Búsqueda
    bindSearchEvents() {
        const globalInput = document.getElementById('global-search-input');
        if (globalInput) {
            globalInput.addEventListener('input', this.debounce(() => this.handleGlobalSearch(), 250));
            globalInput.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeGlobalSearch(); });
            document.addEventListener('click', (e) => { if (!e.target.closest('.sidebar-search')) this.closeGlobalSearch(); });
        }

        const advancedFields = ['search-nombre','search-apellidos','search-estado','search-ciudad','search-parcela','search-fecha-desde','search-fecha-hasta'];
        advancedFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', this.debounce(() => this.handleAdvancedSearch(), 300));
        });

        const clearBtn = document.getElementById('search-clear-btn');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearAdvancedSearch());
    }

    async handleGlobalSearch() {
        const input = document.getElementById('global-search-input');
        const dropdown = document.getElementById('global-search-results');
        const q = input.value.trim();
        if (q.length < 2) { dropdown.style.display = 'none'; return; }

        const difuntos = await window.electronAPI.searchDifuntos(q);
        const results = (difuntos || []).slice(0, 8);

        if (!results.length) {
            dropdown.innerHTML = `<div class="gsr-empty">${t('msg.no_results')}</div>`;
        } else {
            dropdown.innerHTML = results.map(d =>
                '<div class="gsr-item" onclick="app.closeGlobalSearch(); app.showSection(\'difuntos\'); app.editDifunto(' + d.id + ')">' +
                '<span class="gsr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>' +
                '<span class="gsr-name">' + d.nombre + ' ' + d.apellidos + '</span>' +
                '<span class="gsr-meta">' + (d.parcela_codigo || t('msg.sin_parcela')) + '</span>' +
                '</div>'
            ).join('');
        }
        dropdown.style.display = 'block';
    }

    closeGlobalSearch() {
        const dropdown = document.getElementById('global-search-results');
        const input = document.getElementById('global-search-input');
        if (dropdown) dropdown.style.display = 'none';
        if (input) input.value = '';
    }

    async handleAdvancedSearch() {
        const get = (id) => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');
        const nombre = get('search-nombre');
        const apellidos = get('search-apellidos');
        const estado = get('search-estado');
        const ciudad = get('search-ciudad');
        const parcela = get('search-parcela');
        const desde = get('search-fecha-desde');
        const hasta = get('search-fecha-hasta');
        const results = document.getElementById('search-results');
        const countEl = document.getElementById('search-count');

        if (!nombre && !apellidos && !estado && !ciudad && !parcela && !desde && !hasta) {
            results.innerHTML = `<p class="search-placeholder">${t('search.placeholder')}</p>`;
            if (countEl) countEl.textContent = '';
            return;
        }

        results.innerHTML = `<p class="search-placeholder">${t('msg.searching')}</p>`;
        const difuntos = await window.electronAPI.getDifuntos({ limit: 9999 });
        let filtered = difuntos || [];

        if (nombre) filtered = filtered.filter(d => this.normalize(d.nombre).includes(this.normalize(nombre)));
        if (apellidos) filtered = filtered.filter(d => this.normalize(d.apellidos).includes(this.normalize(apellidos)));
        if (estado) filtered = filtered.filter(d => d.estado === estado);
        if (ciudad) filtered = filtered.filter(d => this.normalize(d.ciudad_defuncion).includes(this.normalize(ciudad)));
        if (parcela) filtered = filtered.filter(d => this.normalize(d.parcela_codigo).includes(this.normalize(parcela)));
        if (desde) filtered = filtered.filter(d => d.fecha_defuncion >= desde);
        if (hasta) filtered = filtered.filter(d => d.fecha_defuncion <= hasta);

        if (countEl) countEl.textContent = filtered.length + ' ' + t(filtered.length !== 1 ? 'search.count_many' : 'search.count_one');

        if (!filtered.length) {
            results.innerHTML = `<p class="search-placeholder">${t('msg.no_results')}</p>`;
            return;
        }

        const rows = filtered.map(d =>
            '<tr>' +
            '<td><strong>' + d.nombre + ' ' + d.apellidos + '</strong></td>' +
            '<td>' + this.formatDate(d.fecha_defuncion) + '</td>' +
            '<td>' + (d.ciudad_defuncion || '—') + '</td>' +
            '<td>' + (d.parcela_codigo ? '<span class="parcela-code" title="' + d.parcela_codigo + '">' + this.shortParcelaCode(d.parcela_codigo) + '</span>' : '—') + '</td>' +
            '<td><span class="badge badge-' + d.estado + '">' + this.translateStatus(d.estado) + '</span></td>' +
            '<td class="action-buttons">' +
            '<button class="btn-icon btn-icon-edit" onclick="app.showSection(\'difuntos\'); app.editDifunto(' + d.id + ')" title="' + t('btn.edit') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
            '<button class="btn-icon btn-icon-family" onclick="app.abrirFamiliares(' + d.id + ', \'' + d.nombre + ' ' + d.apellidos + '\')" title="' + t('nav.deceased') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button>' +
            '<button class="btn-icon btn-icon-pay" onclick="app.abrirPagos(' + d.id + ', \'' + d.nombre + ' ' + d.apellidos + '\')" title="' + t('rep.payments') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></button>' +
            '</td>' +
            '</tr>'
        ).join('');

        results.innerHTML = '<table class="search-table"><thead><tr><th>' + t('th.name') + '</th><th>' + t('th.death_date_short') + '</th><th>' + t('th.city') + '</th><th>' + t('th.plot_short') + '</th><th>' + t('th.status_short') + '</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
    }

    clearAdvancedSearch() {
        ['search-nombre','search-apellidos','search-estado','search-ciudad','search-parcela','search-fecha-desde','search-fecha-hasta'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const results = document.getElementById('search-results');
        if (results) results.innerHTML = `<p class="search-placeholder">${t('search.placeholder')}</p>`;
        const countEl = document.getElementById('search-count');
        if (countEl) countEl.textContent = '';
    }



    async handleSearch(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const searchData = {
            nombre: formData.get('search-nombre'),
            apellidos: formData.get('search-apellidos'),
            fecha_desde: formData.get('search-fecha-desde'),
            fecha_hasta: formData.get('search-fecha-hasta')
        };

        // Solo buscar si hay al menos un campo con datos
        const hasSearchData = Object.values(searchData).some(value => value && value.trim() !== '');
        
        if (!hasSearchData) {
            this.showNotification(t('msg.search_empty'), 'info');
            return;
        }

        // Guardar los datos de búsqueda para poder repetir la búsqueda más tarde
        this.lastSearchData = searchData;

        try {
            this.showLoading('search-results');
            const results = await window.electronAPI.searchDifuntos(searchData);
            this.renderSearchResults(results);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showNotification('Error en la búsqueda: ' + error.message, 'error');
        } finally {
            this.hideLoading('search-results');
        }
    }

    renderSearchResults(results) {
        this._lastSearchResults = results;
        const container = document.getElementById('search-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `<p class="empty">${t('msg.no_results')}</p>`;
            container.className = 'search-results empty';
            return;
        }

        container.className = 'search-results';
        container.innerHTML = `
            <table class="records-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>${t('th.full_name')}</th>
                        <th>${t('th.deathdate')}</th>
                        <th>${t('dec.plot')}</th>
                        <th class="action-header">${t('th.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => `
                        <tr>
                            <td>${result.id}</td>
                            <td>${result.nombre} ${result.apellidos}</td>
                            <td>${this.formatDate(result.fecha_defuncion)}</td>
                            <td>
                                ${result.parcela_codigo 
                                    ? `<span class="parcela-code">${this.shortParcelaCode(result.parcela_codigo) || result.parcela_codigo}</span>`
                                    : `<span class="badge badge-sin-asignar">${t('msg.sin_asignar')}</span>`
                                }
                            </td>
                            <td class="action-buttons">
                                <button class="btn-icon btn-icon-edit" onclick="app.editDifunto(${result.id})" title="${t('btn.edit')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Función para repetir la última búsqueda realizada
    async refreshLastSearch() {
        if (!this.lastSearchData) {
            return; // No hay búsqueda previa para repetir
        }

        try {
            this.showLoading('search-results');
            const results = await window.electronAPI.searchDifuntos(this.lastSearchData);
            this.renderSearchResults(results);
        } catch (error) {
            console.error('Error refrescando búsqueda:', error);
            this.showNotification(t('err.search').replace('{n}', error.message), 'error');
        } finally {
            this.hideLoading('search-results');
        }
    }

    // Funciones de ordenamiento de tablas
    bindTableSortEvents() {
        // Event listeners para tabla de difuntos
        document.addEventListener('click', (e) => {
            if (e.target.closest('#difuntos-table th.sortable')) {
                const th = e.target.closest('th.sortable');
                const column = th.dataset.column;
                this.sortTable('difuntos', column);
            }
        });

        // Event listeners para tabla de parcelas
        document.addEventListener('click', (e) => {
            if (e.target.closest('#parcelas-table th.sortable')) {
                const th = e.target.closest('th.sortable');
                const column = th.dataset.column;
                this.sortTable('parcelas', column);
            }
        });
    }

    sortTable(tableType, column) {
        // Determinar dirección de ordenamiento
        if (this.currentSortColumn === column) {
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortDirection = 'asc';
        }
        this.currentSortColumn = column;

        // Actualizar iconos visuales
        this.updateSortIcons(tableType, column);

        // Ordenar datos
        if (tableType === 'difuntos') {
            const sortedData = this.sortData(this.originalData.difuntos || [], column);
            this.renderDifuntosTable(sortedData);
        } else if (tableType === 'parcelas') {
            const sortedData = this.sortData(this.originalData.parcelas || [], column);
            this.renderParcelasTable(sortedData);
        }
    }

    updateSortIcons(tableType, column) {
        // Limpiar iconos anteriores
        const table = document.getElementById(`${tableType}-table`);
        const headers = table.querySelectorAll('th.sortable');
        headers.forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });

        // Agregar icono al header actual
        const currentHeader = table.querySelector(`th[data-column="${column}"]`);
        if (currentHeader) {
            currentHeader.classList.add(`sort-${this.currentSortDirection}`);
        }
    }

    sortData(data, column) {
        return [...data].sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            // Manejar casos especiales
            if (column === 'nombre') {
                aVal = `${a.nombre} ${a.apellidos}`;
                bVal = `${b.nombre} ${b.apellidos}`;
            } else if (column === 'precio') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (column === 'id' || column === 'fila') {
                aVal = parseInt(aVal) || 0;
                bVal = parseInt(bVal) || 0;
            } else if (column.includes('fecha')) {
                aVal = new Date(aVal || '1900-01-01');
                bVal = new Date(bVal || '1900-01-01');
            }

            // Manejar valores null/undefined
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            // Comparación
            let result = 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                result = aVal.localeCompare(bVal);
            } else {
                result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            }

            return this.currentSortDirection === 'desc' ? -result : result;
        });
    }

    // Método para cargar parcelas disponibles en el select
    async loadParcelasDisponibles() {
        try {
            const parcelas = await window.electronAPI.getParcelasDisponibles();
            const select = document.getElementById('parcela_id');
            
            if (select) {
                // Limpiar opciones existentes excepto la primera
                select.innerHTML = `<option value="">${t('dec.no_plot')}</option>`;
                
                // Agregar parcelas disponibles
                parcelas.forEach(parcela => {
                    const option = document.createElement('option');
                    option.value = parcela.id;
                    option.textContent = `${parcela.codigo} - ${parcela.seccion}-${parcela.numero} (${parcela.tipo})`;
                    select.appendChild(option);
                });
                
                // Inicializar mensaje
                this.updateParcelaMessage('', '');
            }
        } catch (error) {
            console.error('Error cargando parcelas disponibles:', error);
        }
    }

    // Método para actualizar el mensaje de parcela seleccionada
    updateParcelaMessage(parcelaId, parcelaText) {
        const statusDiv = document.getElementById('parcela-status');
        const messageSpan = document.getElementById('parcela-message');
        
        if (!statusDiv || !messageSpan) return;
        
        if (parcelaId && parcelaId !== '') {
            // Parcela seleccionada
            statusDiv.style.display = 'flex';
            statusDiv.className = 'parcela-status-right';
            
            // Extraer información más clara de la parcela
            let parcelaInfo = t('dec.plot_selected');
            if (parcelaText && parcelaText.trim() !== '') {
                // Si el texto viene en formato "CÓDIGO - SECCIÓN-NUMERO (TIPO)"
                // Extraer solo la parte más importante
                const match = parcelaText.match(/([A-Z\d]+)\s*-\s*([A-Z\d]+)-(\d+)/);
                if (match) {
                    const [, codigo, seccion, numero] = match;
                    parcelaInfo = `${codigo} - ${seccion}-${numero}`;
                } else {
                    parcelaInfo = parcelaText;
                }
            } else {
                // Si no hay texto, intentar obtenerlo del select
                const selectElement = document.getElementById('parcela_id');
                if (selectElement && selectElement.selectedIndex > 0) {
                    const selectedOption = selectElement.options[selectElement.selectedIndex];
                    const text = selectedOption.textContent;
                    const match = text.match(/([A-Z\d]+)\s*-\s*([A-Z\d]+)-(\d+)/);
                    if (match) {
                        const [, codigo, seccion, numero] = match;
                        parcelaInfo = `${codigo} - ${seccion}-${numero}`;
                    } else {
                        parcelaInfo = text;
                    }
                }
            }
            
            messageSpan.textContent = `${t('dec.plot_assigned')}: ${parcelaInfo}`;
        } else {
            // Sin parcela
            statusDiv.style.display = 'flex';
            statusDiv.className = 'parcela-status-right sin-asignar';
            messageSpan.textContent = t('dec.no_plot');
        }
    }

    // Método específico para actualizar mensaje de parcela durante la edición
    async updateParcelaMensajeEnEdicion(parcelaId) {
        if (!parcelaId) {
            // Sin parcela asignada
            this.updateParcelaMessage('', '');
            return;
        }

        try {
            // Obtener información completa de la parcela desde el select
            const selectElement = document.getElementById('parcela_id');
            if (selectElement) {
                // Buscar la opción correspondiente
                const option = Array.from(selectElement.options).find(opt => opt.value === parcelaId.toString());
                if (option && option.textContent) {
                    this.updateParcelaMessage(parcelaId, option.textContent);
                    return;
                }
            }

            // Si no se encuentra en el select, intentar obtener de la API
            const parcela = await window.electronAPI.getParcela(parcelaId);
            if (parcela) {
                const parcelaInfo = `${parcela.codigo} - ${parcela.seccion}-${parcela.numero} (${parcela.tipo})`;
                this.updateParcelaMessage(parcelaId, parcelaInfo);
            } else {
                this.updateParcelaMessage(parcelaId, t('dec.no_plot'));
            }
        } catch (error) {
            console.error('Error obteniendo información de parcela:', error);
            this.updateParcelaMessage(parcelaId, t('dec.no_plot'));
        }
    }

    // Método para buscar ciudades dinámicamente
    async buscarCiudades(termino) {
        if (!termino || termino.length < 1) {
            // Si no hay término o es muy corto, mostrar ciudades populares
            this.inicializarCiudadesPopulares();
            return;
        }

        // Cancelar búsqueda anterior si existe
        if (this.busquedaTimeout) {
            clearTimeout(this.busquedaTimeout);
        }

        // Debouncing - esperar 200ms antes de buscar (reducido para mejor UX)
        this.busquedaTimeout = setTimeout(async () => {
            await this.realizarBusquedaCiudades(termino);
        }, 200);
    }

    async realizarBusquedaCiudades(termino) {
        const loadingIndicator = document.getElementById('ciudades-loading');

        try {
            // Mostrar indicador de carga
            if (loadingIndicator) {
                loadingIndicator.style.display = 'flex';
            }

            // Buscar primero en la base de datos local (más rápido y confiable)
            let ciudades = this.buscarCiudadesLocal(termino);

            // Si hay menos de 5 ciudades locales, buscar en APIs para complementar
            if (ciudades.length < 5) {
                try {
                    const ciudadesAPI = await this.buscarCiudadesEnAPI(termino);
                    // Combinar resultados evitando duplicados
                    ciudadesAPI.forEach(ciudad => {
                        if (!ciudades.some(c => c.toLowerCase() === ciudad.toLowerCase())) {
                            ciudades.push(ciudad);
                        }
                    });
                } catch (apiError) {
                }
            }

            // Actualizar la lista de opciones - mostrar hasta 50 resultados
            this.actualizarListaCiudades(ciudades.slice(0, 50));

        } catch (error) {
            console.error('Error buscando ciudades:', error);
            // En caso de error, usar solo búsqueda local
            const ciudadesLocal = this.buscarCiudadesLocal(termino);
            this.actualizarListaCiudades(ciudadesLocal.slice(0, 20));
        } finally {
            // Ocultar indicador de carga
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    // Búsqueda local rápida y confiable
    buscarCiudadesLocal(termino) {
        const terminoLower = termino.toLowerCase();
        const todasLasCiudades = this.obtenerCiudadesInternacionales();
        
        return todasLasCiudades
            .filter(ciudad => ciudad.toLowerCase().includes(terminoLower))
            .sort((a, b) => {
                // Priorizar ciudades que empiecen con el término
                const aStartsWith = a.toLowerCase().startsWith(terminoLower);
                const bStartsWith = b.toLowerCase().startsWith(terminoLower);
                
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return a.localeCompare(b);
            });
    }

    // Buscar ciudades en APIs externas (mejorado y más completo)
    async buscarCiudadesEnAPI(termino) {
        const ciudades = [];
        
        // 1. API de REST Countries para capitales
        try {
            const response = await fetch(`https://restcountries.com/v3.1/all?fields=name,capital`, {
                signal: AbortSignal.timeout(3000)
            });
            
            if (response.ok) {
                const paises = await response.json();
                const terminoLower = termino.toLowerCase();
                
                paises.forEach(pais => {
                    if (pais.capital && pais.capital[0]) {
                        const capital = pais.capital[0];
                        const paisNombre = pais.name.common;
                        if (capital.toLowerCase().includes(terminoLower)) {
                            ciudades.push(`${capital}, ${paisNombre}`);
                        }
                    }
                });
            }
        } catch (error) {
        }

        // 2. API de OpenStreetMap Nominatim (alternativa gratuita y robusta)
        try {
            const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(termino)}&format=json&addressdetails=1&limit=20&countrycodes=es&featuretype=city`;
            
            const response = await fetch(nominatimUrl, {
                headers: {
                    'User-Agent': 'CementerioApp/1.0'
                },
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                const resultados = await response.json();
                resultados.forEach(resultado => {
                    if (resultado.display_name && resultado.address) {
                        let ciudad = resultado.address.city || 
                                   resultado.address.town || 
                                   resultado.address.village || 
                                   resultado.address.municipality ||
                                   resultado.name;
                        
                        if (ciudad) {
                            const pais = resultado.address.country || 'España';
                            const ciudadFormateada = `${ciudad}, ${pais}`;
                            
                            // Evitar duplicados
                            if (!ciudades.some(c => c.toLowerCase() === ciudadFormateada.toLowerCase())) {
                                ciudades.push(ciudadFormateada);
                            }
                        }
                    }
                });
            }
        } catch (error) {
        }

        // 3. API adicional para ciudades españolas (usando API del gobierno)
        try {
            // Esta API es específica para España y muy completa
            const spainUrl = `https://apiv1.geoapi.es/municipios?q=${encodeURIComponent(termino)}`;
            
            const response = await fetch(spainUrl, {
                signal: AbortSignal.timeout(4000)
            });
            
            if (response.ok) {
                const resultados = await response.json();
                if (resultados && resultados.data) {
                    resultados.data.forEach(municipio => {
                        if (municipio.NOMBRE_MUNICIPIO) {
                            const ciudadFormateada = `${municipio.NOMBRE_MUNICIPIO}, España`;
                            if (!ciudades.some(c => c.toLowerCase() === ciudadFormateada.toLowerCase())) {
                                ciudades.push(ciudadFormateada);
                            }
                        }
                    });
                }
            }
        } catch (error) {
        }

        return ciudades.slice(0, 15); // Limitar resultados de API para no saturar
    }

    // Base de datos local de ciudades internacionales
    obtenerCiudadesInternacionales() {
        return [
            // España - Lista expandida de ciudades y pueblos
            'Madrid, España', 'Barcelona, España', 'Valencia, España', 'Sevilla, España',
            'Zaragoza, España', 'Málaga, España', 'Murcia, España', 'Palma de Mallorca, España',
            'Las Palmas, España', 'Bilbao, España', 'Alicante, España', 'Córdoba, España',
            'Valladolid, España', 'Vigo, España', 'Gijón, España', 'A Coruña, España',
            'Vitoria, España', 'Granada, España', 'Elche, España', 'Oviedo, España',
            'Santa Cruz de Tenerife, España', 'Badalona, España', 'Cartagena, España',
            'Terrassa, España', 'Jerez de la Frontera, España', 'Sabadell, España',
            'Móstoles, España', 'Alcalá de Henares, España', 'Pamplona, España',
            'Fuenlabrada, España', 'Almería, España', 'Leganés, España', 'San Sebastián, España',
            'Burgos, España', 'Santander, España', 'Castellón, España', 'Alcorcón, España',
            'Albacete, España', 'Getafe, España', 'Salamanca, España', 'Huelva, España',
            'Badajoz, España', 'Logroño, España', 'Tarragona, España', 'León, España',
            'Cádiz, España', 'Lérida, España', 'Marbella, España', 'Dos Hermanas, España',
            'Mataró, España', 'Santa Coloma de Gramanet, España', 'Torrejón de Ardoz, España',
            'Parla, España', 'Alcobendas, España', 'Reus, España', 'Torrelavega, España',
            
            // Más ciudades españolas (expandida significativamente)
            'Cáceres, España', 'Toledo, España', 'Ávila, España', 'Cuenca, España', 'Guadalajara, España',
            'Huesca, España', 'Jaén, España', 'Orense, España', 'Palencia, España', 'Segovia, España',
            'Soria, España', 'Teruel, España', 'Zamora, España', 'Ceuta, España', 'Melilla, España',
            
            // Ciudades y pueblos importantes de España
            'Alcoy, España', 'Elda, España', 'Petrer, España', 'Villena, España', 'Denia, España',
            'Xàbia, España', 'Calpe, España', 'Altea, España', 'Benidorm, España', 'Torrevieja, España',
            'Orihuela, España', 'Crevillente, España', 'Aspe, España', 'Novelda, España', 'Monóvar, España',
            'Alcantarilla, España', 'Molina de Segura, España', 'Las Torres de Cotillas, España',
            'Cieza, España', 'Yecla, España', 'Jumilla, España', 'Caravaca de la Cruz, España',
            'Lorca, España', 'Águilas, España', 'Mazarrón, España', 'San Javier, España',
            
            // Comunidad Valenciana
            'Sagunto, España', 'Gandia, España', 'Alzira, España', 'Xàtiva, España', 'Cullera, España',
            'Sueca, España', 'Ontinyent, España', 'Alcoi, España', 'Elche, España', 'Santa Pola, España',
            'Guardamar del Segura, España', 'Pilar de la Horadada, España', 'San Vicente del Raspeig, España',
            'Campello, España', 'Muchamiel, España', 'San Juan de Alicante, España', 'Mutxamel, España',
            
            // Cataluña
            'Girona, España', 'Figueres, España', 'Olot, España', 'Blanes, España', 'Lloret de Mar, España',
            'Manresa, España', 'Vic, España', 'Igualada, España', 'Vilafranca del Penedès, España',
            'Sitges, España', 'Vilanova i la Geltrú, España', 'Martorell, España', 'Cornellà de Llobregat, España',
            'Sant Boi de Llobregat, España', 'Mollet del Vallès, España', 'Cerdanyola del Vallès, España',
            
            // Andalucía
            'Antequera, España', 'Ronda, España', 'Estepona, España', 'Fuengirola, España', 'Mijas, España',
            'Torremolinos, España', 'Benalmádena, España', 'Vélez-Málaga, España', 'Nerja, España',
            'Motril, España', 'Baza, España', 'Guadix, España', 'Linares, España', 'Andújar, España',
            'Martos, España', 'Úbeda, España', 'Baeza, España', 'Alcalá la Real, España',
            'Sanlúcar de Barrameda, España', 'Chiclana de la Frontera, España', 'Conil de la Frontera, España',
            'Barbate, España', 'Tarifa, España', 'Algeciras, España', 'La Línea de la Concepción, España',
            'Arcos de la Frontera, España', 'Rota, España', 'El Puerto de Santa María, España',
            'Lebrija, España', 'Utrera, España', 'Écija, España', 'Osuna, España', 'Estepa, España',
            'Marchena, España', 'Morón de la Frontera, España', 'Carmona, España', 'Alcalá de Guadaíra, España',
            'Dos Hermanas, España', 'Mairena del Aljarafe, España', 'Coria del Río, España',
            'Ayamonte, España', 'Isla Cristina, España', 'Lepe, España', 'Cartaya, España',
            'Almonte, España', 'Moguer, España', 'Palos de la Frontera, España', 'La Palma del Condado, España',
            
            // Castilla y León
            'Ponferrada, España', 'Astorga, España', 'Bembibre, España', 'La Bañeza, España',
            'Medina del Campo, España', 'Aranda de Duero, España', 'Miranda de Ebro, España',
            'Soria, España', 'Ávila, España', 'Arévalo, España', 'Béjar, España', 'Ciudad Rodrigo, España',
            'Peñaranda de Bracamonte, España', 'Alba de Tormes, España', 'Guijuelo, España',
            'Villablino, España', 'Villaquilambre, España', 'San Andrés del Rabanedo, España',
            
            // Galicia
            'Santiago de Compostela, España', 'Lugo, España', 'Ferrol, España', 'Pontevedra, España',
            'Ourense, España', 'Vilagarcía de Arousa, España', 'Redondela, España', 'Cangas, España',
            'Marín, España', 'Tui, España', 'O Grove, España', 'Cambados, España', 'Lalín, España',
            'Ribeira, España', 'Noia, España', 'Padrón, España', 'Carballo, España', 'Betanzos, España',
            'Viveiro, España', 'Monforte de Lemos, España', 'Verín, España', 'O Barco de Valdeorras, España',
            
            // Asturias
            'Langreo, España', 'Mieres, España', 'Avilés, España', 'Siero, España', 'Castrillón, España',
            'Llanera, España', 'Corvera de Asturias, España', 'Carreño, España', 'Gozón, España',
            'Villaviciosa, España', 'Cangas de Onís, España', 'Llanes, España', 'Ribadesella, España',
            
            // Cantabria
            'Camargo, España', 'Piélagos, España', 'Santa María de Cayón, España', 'El Astillero, España',
            'Laredo, España', 'Castro-Urdiales, España', 'Santoña, España', 'Reinosa, España',
            'Los Corrales de Buelna, España', 'Torrelavega, España',
            
            // País Vasco
            'Donostia, España', 'Irún, España', 'Errenteria, España', 'Pasaia, España', 'Hondarribia, España',
            'Zarautz, España', 'Getaria, España', 'Azpeitia, España', 'Tolosa, España', 'Beasain, España',
            'Arrasate, España', 'Eibar, España', 'Ermua, España', 'Durango, España', 'Gernika, España',
            'Leioa, España', 'Getxo, España', 'Portugalete, España', 'Santurtzi, España', 'Basauri, España',
            'Galdakao, España', 'Llodio, España', 'Amurrio, España',
            
            // Latinoamérica - Capitales y ciudades principales
            'Buenos Aires, Argentina', 'Córdoba, Argentina', 'Rosario, Argentina', 'La Plata, Argentina',
            'Mar del Plata, Argentina', 'Tucumán, Argentina', 'Salta, Argentina', 'Mendoza, Argentina',
            'La Paz, Bolivia', 'Santa Cruz de la Sierra, Bolivia', 'Cochabamba, Bolivia', 'Sucre, Bolivia',
            'São Paulo, Brasil', 'Rio de Janeiro, Brasil', 'Brasília, Brasil', 'Salvador, Brasil',
            'Fortaleza, Brasil', 'Belo Horizonte, Brasil', 'Manaus, Brasil', 'Curitiba, Brasil',
            'Recife, Brasil', 'Porto Alegre, Brasil', 'Santiago, Chile', 'Valparaíso, Chile',
            'Concepción, Chile', 'Antofagasta, Chile', 'Viña del Mar, Chile', 'Valdivia, Chile',
            'Bogotá, Colombia', 'Medellín, Colombia', 'Cali, Colombia', 'Barranquilla, Colombia',
            'Cartagena, Colombia', 'Bucaramanga, Colombia', 'Pereira, Colombia', 'Ibagué, Colombia',
            'San José, Costa Rica', 'Cartago, Costa Rica', 'Puntarenas, Costa Rica', 'Alajuela, Costa Rica',
            'Quito, Ecuador', 'Guayaquil, Ecuador', 'Cuenca, Ecuador', 'Ambato, Ecuador',
            'San Salvador, El Salvador', 'Santa Ana, El Salvador', 'San Miguel, El Salvador',
            'Guatemala, Guatemala', 'Quetzaltenango, Guatemala', 'Antigua Guatemala, Guatemala',
            'Tegucigalpa, Honduras', 'San Pedro Sula, Honduras', 'La Ceiba, Honduras',
            'Ciudad de México, México', 'Guadalajara, México', 'Monterrey, México', 'Puebla, México',
            'Tijuana, México', 'León, México', 'Juárez, México', 'Torreón, México',
            'Querétaro, México', 'Mérida, México', 'Managua, Nicaragua', 'León, Nicaragua',
            'Ciudad de Panamá, Panamá', 'Colón, Panamá', 'Asunción, Paraguay', 'Ciudad del Este, Paraguay',
            'Lima, Perú', 'Arequipa, Perú', 'Trujillo, Perú', 'Chiclayo, Perú',
            'Cusco, Perú', 'Iquitos, Perú', 'Santo Domingo, República Dominicana', 'Santiago, República Dominicana',
            'Montevideo, Uruguay', 'Salto, Uruguay', 'Paysandú, Uruguay', 'Caracas, Venezuela',
            'Maracaibo, Venezuela', 'Valencia, Venezuela', 'Barquisimeto, Venezuela',
            
            // Estados Unidos - Ciudades principales
            'New York, Estados Unidos', 'Los Angeles, Estados Unidos', 'Chicago, Estados Unidos',
            'Houston, Estados Unidos', 'Phoenix, Estados Unidos', 'Philadelphia, Estados Unidos',
            'San Antonio, Estados Unidos', 'San Diego, Estados Unidos', 'Dallas, Estados Unidos',
            'San Jose, Estados Unidos', 'Miami, Estados Unidos', 'Boston, Estados Unidos',
            'Seattle, Estados Unidos', 'Denver, Estados Unidos', 'Washington, Estados Unidos',
            'Las Vegas, Estados Unidos', 'Portland, Estados Unidos', 'Detroit, Estados Unidos',
            
            // Europa - Capitales y ciudades principales
            'Paris, Francia', 'Lyon, Francia', 'Marseille, Francia', 'Nice, Francia',
            'Berlin, Alemania', 'Munich, Alemania', 'Hamburg, Alemania', 'Cologne, Alemania',
            'Rome, Italia', 'Milan, Italia', 'Naples, Italia', 'Turin, Italia',
            'Florence, Italia', 'Venice, Italia', 'London, Reino Unido', 'Manchester, Reino Unido',
            'Birmingham, Reino Unido', 'Liverpool, Reino Unido', 'Edinburgh, Reino Unido',
            'Amsterdam, Países Bajos', 'Rotterdam, Países Bajos', 'The Hague, Países Bajos',
            'Brussels, Bélgica', 'Antwerp, Bélgica', 'Zurich, Suiza', 'Geneva, Suiza',
            'Vienna, Austria', 'Salzburg, Austria', 'Stockholm, Suecia', 'Gothenburg, Suecia',
            'Oslo, Noruega', 'Bergen, Noruega', 'Copenhagen, Dinamarca', 'Helsinki, Finlandia',
            
            // Otras regiones importantes
            'Tokyo, Japón', 'Osaka, Japón', 'Kyoto, Japón', 'Beijing, China',
            'Shanghai, China', 'Hong Kong, China', 'Seoul, Corea del Sur', 'Mumbai, India',
            'Delhi, India', 'Bangalore, India', 'Sydney, Australia', 'Melbourne, Australia',
            'Toronto, Canadá', 'Vancouver, Canadá', 'Montreal, Canadá'
        ];
    }

    // Actualizar la lista de opciones del datalist
    actualizarListaCiudades(ciudades) {
        const datalist = document.getElementById('ciudades');
        if (!datalist) return;

        // Limpiar opciones existentes
        datalist.innerHTML = '';

        // Agregar nuevas opciones
        ciudades.forEach(ciudad => {
            const option = document.createElement('option');
            option.value = ciudad;
            datalist.appendChild(option);
        });
    }

    // Limpiar la lista de ciudades
    limpiarListaCiudades() {
        const datalist = document.getElementById('ciudades');
        if (datalist) {
            datalist.innerHTML = '';
        }
    }

    // Cargar ciudades por defecto en caso de error
    cargarCiudadesPorDefecto(termino = '') {
        const ciudadesDefecto = [
            'Madrid, España', 'Barcelona, España', 'Valencia, España', 'Sevilla, España',
            'Zaragoza, España', 'Málaga, España', 'Murcia, España', 'Bilbao, España',
            'Alicante, España', 'Córdoba, España', 'Granada, España', 'Pamplona, España',
            'Buenos Aires, Argentina', 'São Paulo, Brasil', 'Santiago, Chile', 'Bogotá, Colombia',
            'Ciudad de México, México', 'Lima, Perú', 'Caracas, Venezuela', 'Montevideo, Uruguay'
        ];
        
        // Filtrar por término si se proporciona
        const ciudadesFiltradas = termino ? 
            ciudadesDefecto.filter(ciudad => 
                ciudad.toLowerCase().includes(termino.toLowerCase())
            ) : ciudadesDefecto;
            
        this.actualizarListaCiudades(ciudadesFiltradas);
    }

    // Inicializar con ciudades populares al cargar la aplicación
    inicializarCiudadesPopulares() {
        const ciudadesPopulares = [
            'Madrid, España', 'Barcelona, España', 'Valencia, España', 'Sevilla, España',
            'Buenos Aires, Argentina', 'São Paulo, Brasil', 'Ciudad de México, México',
            'Bogotá, Colombia', 'Lima, Perú', 'Santiago, Chile', 'Caracas, Venezuela',
            'Paris, Francia', 'London, Reino Unido', 'Rome, Italia', 'Berlin, Alemania',
            'New York, Estados Unidos', 'Los Angeles, Estados Unidos', 'Miami, Estados Unidos'
        ];
        this.actualizarListaCiudades(ciudadesPopulares);
    }

    // Operaciones CRUD
    async editDifunto(id) {
        try {
            const difunto = await window.electronAPI.getDifunto(id);
            
            // Cargar parcelas disponibles primero
            await this.loadParcelasDisponibles();
            
            this.populateDifuntoForm(difunto);
            
            // Marcar el formulario como en modo edición
            const form = document.getElementById('form-difunto');
            form.dataset.editingId = id;
            
            // Cambiar el título del modal
            const modalTitle = document.getElementById('modal-difunto-title');
            if (modalTitle) modalTitle.textContent = t('dec.edit');
            
            this.openModal('modal-difunto');
        } catch (error) {
            console.error('Error editando difunto:', error);
            this.showNotification(t('err.load_dec_data'), 'error');
        }
    }

    async deleteDifunto(id) {
        try {
            // Obtener información del difunto
            const difunto = await window.electronAPI.getDifunto(id);
            if (!difunto) {
                this.showNotification('No se pudo encontrar el registro del difunto', 'error');
                return;
            }

            const parcelaCode = difunto.parcela_codigo ? this.shortParcelaCode(difunto.parcela_codigo) : null;
            const message = `
                <div class="confirm-delete-body">
                    <div class="confirm-delete-icon confirm-delete-icon--danger">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </div>
                    <p class="confirm-delete-title">${t('dlg.delete_record_q')}</p>
                    <div class="confirm-delete-card">
                        <div class="confirm-delete-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            <strong>${difunto.nombre} ${difunto.apellidos}</strong>
                        </div>
                        ${difunto.fecha_defuncion ? `<div class="confirm-delete-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            <span>${this.formatDate(difunto.fecha_nacimiento)} — ${this.formatDate(difunto.fecha_defuncion)}</span>
                        </div>` : ''}
                        ${difunto.lugar_nacimiento ? `<div class="confirm-delete-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span>${difunto.lugar_nacimiento}</span>
                        </div>` : ''}
                        ${parcelaCode ? `<div class="confirm-delete-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                            <span>Parcela: <code>${parcelaCode}</code> — se liberará automáticamente</span>
                        </div>` : ''}
                    </div>
                    <p class="confirm-delete-warning">${t('dlg.cannot_undo')}</p>
                </div>`;

            const result = await this.showCustomDialog({
                title: t('dlg.confirm_delete'),
                message,
                buttons: [
                    { id: 'btn-cancel',  class: 'btn-secondary',     text: t('btn.cancel'),        value: 'cancel' },
                    { id: 'btn-confirm', class: 'btn-danger-modern',  text: t('btn.delete_record'), value: 'confirm' }
                ]
            });

            if (result === 'confirm') {
                try {
                    await window.electronAPI.deleteDifunto(id);
                    this.showNotification(t('msg.dec_deleted'), 'success');
                    
                    // Actualizar la sección actual si corresponde
                    if (this.currentSection === 'difuntos') {
                        await this.loadDifuntos();
                    }
                    if (this.currentSection === 'parcelas') {
                        await this.loadParcelas(); // Actualizar porque una parcela puede haberse liberado
                    }
                    
                    // SIEMPRE actualizar dashboard para refrescar estadísticas
                    await this.loadDashboard();
                    await this.loadRecentActivity(); // Actualizar actividad reciente
                } catch (error) {
                    this.showNotification(t('err.del_record'), 'error');
                }
            }

        } catch (error) {
            console.error('Error en deleteDifunto:', error);
            this.showNotification(t('err.load_dec_info'), 'error');
        }
    }

    async editParcela(id) {
        try {
            const parcela = await window.electronAPI.getParcela(id);
            this.populateParcelaForm(parcela);
            await this.populateParcelaSelects({ tipo: parcela.tipo, zona: parcela.zona, ubicacion: parcela.ubicacion });

            // Marcar el formulario como en modo edición
            const form = document.getElementById('form-parcela');
            form.dataset.editingId = id;

            // Cambiar el título del modal
            const modalTitle = document.getElementById('modal-parcela-title');
            if (modalTitle) modalTitle.textContent = t('plot.edit');

            this.openModal('modal-parcela');
        } catch (error) {
            console.error('Error editando parcela:', error);
            this.showNotification(t('err.load_plot_data'), 'error');
        }
    }

    async deleteParcela(id) {
        try {
            // Primero verificar si la parcela tiene difuntos asignados
            const dependencies = await window.electronAPI.checkParcelaDependencies(id);
            
            if (dependencies.error) {
                this.showNotification(t('err.verify_plot').replace('{n}', dependencies.error), 'error');
                return;
            }
            
            const { parcela, difuntosAsignados, canDelete } = dependencies;
            
            // Mostrar modal de confirmación personalizado
            this.showParcelaDeleteConfirmation(parcela, difuntosAsignados, canDelete);
            
        } catch (error) {
            console.error('Error en deleteParcela:', error);
            this.showNotification(t('err.del_plot'), 'error');
        }
    }
    
    showParcelaDeleteConfirmation(parcela, difuntosAsignados, canDelete) {
        const code = this.shortParcelaCode(parcela.codigo) || parcela.codigo;
        let message, buttons;

        if (canDelete) {
            message = `
                <div class="confirm-delete-body">
                    <div class="confirm-delete-icon confirm-delete-icon--danger">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </div>
                    <p class="confirm-delete-title">${t('dlg.delete_plot_q')}</p>
                    <div class="confirm-delete-card">
                        <div class="confirm-delete-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <strong><span class="parcela-code">${code}</span> — ${parcela.tipo}</strong>
                        </div>
                        <div class="confirm-delete-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                            <span>${parcela.zona} · Sección ${parcela.seccion} · Nº ${parcela.numero}</span>
                        </div>
                        <div class="confirm-delete-row confirm-delete-row--ok">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>${t('plot.del_safe')}</span>
                        </div>
                    </div>
                    <p class="confirm-delete-warning">${t('dlg.cannot_undo')}</p>
                </div>`;
            buttons = [
                { id: 'btn-cancel',  class: 'btn-secondary',    text: t('btn.cancel'),      value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-danger-modern', text: t('btn.delete_plot'), value: 'confirm' }
            ];
        } else {
            const lista = difuntosAsignados.map(d =>
                `<div class="confirm-delete-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>${d.nombre} ${d.apellidos}</span></div>`
            ).join('');
            message = `
                <div class="confirm-delete-body">
                    <div class="confirm-delete-icon confirm-delete-icon--warning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <p class="confirm-delete-title">${t(difuntosAsignados.length !== 1 ? 'plot.del_with_many' : 'plot.del_with_one').replace('{n}', difuntosAsignados.length)}</p>
                    <div class="confirm-delete-card">
                        <div class="confirm-delete-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <strong><span class="parcela-code">${code}</span> — ${parcela.tipo}</strong>
                        </div>
                        ${lista}
                        <div class="confirm-delete-row confirm-delete-row--warn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span>${t('msg.dec_unassigned')}</span>
                        </div>
                    </div>
                    <p class="confirm-delete-warning">${t('dlg.cannot_undo')}</p>
                </div>`;
            buttons = [
                { id: 'btn-cancel',  class: 'btn-secondary',      text: t('btn.cancel'),         value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-warning-modern',  text: t('btn.release_delete'), value: 'confirm' }
            ];
        }

        this.showCustomDialog({ title: t('dlg.confirm_delete'), message, buttons })
            .then(result => { if (result === 'confirm') this.performParcelaDelete(parcela.id, !canDelete); });
    }
    
    async performParcelaDelete(id, isForced) {
        try {
            let result;
            
            if (isForced) {
                // Eliminación forzada: liberar difuntos primero
                result = await window.electronAPI.forceDeleteParcela(id);
                this.showNotification(t('msg.plot_del_freed'), 'success');
            } else {
                // Eliminación normal
                result = await window.electronAPI.deleteParcela(id);
                this.showNotification(t('msg.plot_deleted'), 'success');
            }
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            // Actualizar todas las secciones relevantes
            if (this.currentSection === 'parcelas') {
                await this.loadParcelas();
            }
            if (this.currentSection === 'difuntos') {
                await this.loadDifuntos(); // Actualizar porque algunos difuntos pueden perder su parcela
            }
            
            // SIEMPRE actualizar dashboard para refrescar estadísticas
            await this.loadDashboard();
            await this.loadRecentActivity(); // Actualizar actividad reciente
            
        } catch (error) {
            console.error('Error eliminando parcela:', error);
            this.showNotification(t('err.del_plot_msg').replace('{n}', error.message), 'error');
        }
    }

    populateDifuntoForm(difunto) {
        const form = document.getElementById('form-difunto');
        if (!form) return;

        form.querySelector('[name="nombre"]').value = difunto.nombre || '';
        form.querySelector('[name="apellidos"]').value = difunto.apellidos || '';
        form.querySelector('[name="cedula"]').value = difunto.cedula || '';
        form.querySelector('[name="sexo"]').value = difunto.sexo || 'M';
        form.querySelector('[name="fecha_nacimiento"]').value = difunto.fecha_nacimiento || '';
        form.querySelector('[name="fecha_defuncion"]').value = difunto.fecha_defuncion || '';
        form.querySelector('[name="lugar_nacimiento"]').value = difunto.lugar_nacimiento || '';
        form.querySelector('[name="causa_muerte"]').value = difunto.causa_muerte || '';
        form.querySelector('[name="observaciones"]').value = difunto.observaciones || '';
        form.querySelector('[name="parcela_id"]').value = difunto.parcela_id || '';
        
        // Actualizar mensaje informativo de parcela con información completa
        this.updateParcelaMensajeEnEdicion(difunto.parcela_id);
        
        form.dataset.editId = difunto.id;
    }

    async populateParcelaSelects(selected = {}) {
        const all = await window.electronAPI.getAllEtiquetas();
        const byCategoria = { tipo: [], zona: [], ubicacion: [] };
        if (Array.isArray(all)) {
            all.forEach(e => { if (byCategoria[e.categoria]) byCategoria[e.categoria].push(e.valor); });
        }

        ['tipo', 'zona', 'ubicacion'].forEach(cat => {
            const sel = document.querySelector(`#form-parcela [name="${cat}"]`);
            if (!sel) return;
            const current = sel.value || selected[cat] || '';
            sel.innerHTML = `<option value="">${t('form.select_ph')}</option>` +
                byCategoria[cat].map(v => `<option value="${v}"${v === current ? ' selected' : ''}>${v}</option>`).join('');
        });
    }

    populateParcelaForm(parcela) {
        const form = document.getElementById('form-parcela');
        if (!form) return;

        form.querySelector('[name="codigo"]').value = parcela.codigo || '';
        form.querySelector('[name="seccion"]').value = parcela.seccion || '';
        form.querySelector('[name="fila"]').value = parcela.fila || '';
        form.querySelector('[name="numero"]').value = parcela.numero || '';
        form.querySelector('[name="precio"]').value = parcela.precio || '';
        form.querySelector('[name="observaciones"]').value = parcela.observaciones || '';

        form.dataset.editId = parcela.id;
    }

    // Utilidades
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.classList.add('loading');
        }
    }

    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.classList.remove('loading');
        }
    }

    showNotification(message, type = 'info') {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>',
            error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        };
        // Limpiar emojis residuales del mensaje
        const cleanMsg = message.replace(/^[✅❌⚠️ℹ️🔔]+\s*/, '');

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<span class="notif-icon">${icons[type] || icons.info}</span><span class="notif-text">${cleanMsg}</span>`;

        document.body.appendChild(notification);
        setTimeout(() => { notification.style.opacity = '0'; setTimeout(() => notification.remove(), 300); }, 4000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Funciones de configuración
    
    // Helper para crear diálogos personalizados
    showCustomDialog(config) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'custom-dialog-overlay';
            
            let buttonsHtml = '';
            if (config.buttons) {
                buttonsHtml = config.buttons.map(btn => 
                    `<button id="${btn.id}" class="btn ${btn.class}">${btn.text}</button>`
                ).join('');
            } else {
                buttonsHtml = `<button id="btn-ok" class="btn btn-primary">Aceptar</button>`;
            }

            dialog.innerHTML = `
                <div class="custom-dialog ${config.type === 'info' ? 'info-dialog' : ''}">
                    <div class="dialog-header ${config.headerClass || ''}">
                        <h3>${config.title}</h3>
                    </div>
                    <button class="dialog-close-btn" id="dialog-close">×</button>
                    <div class="dialog-content">
                        <div class="dialog-message">${config.message}</div>
                        <div class="dialog-buttons">
                            ${buttonsHtml}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            if (config.onMounted) config.onMounted(dialog);

            // Event listener para el botón de cerrar (X)
            dialog.querySelector('#dialog-close').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve('cancel');
            });

            // Agregar event listeners
            if (config.buttons) {
                config.buttons.forEach(btn => {
                    dialog.querySelector(`#${btn.id}`).addEventListener('click', () => {
                        document.body.removeChild(dialog);
                        resolve(btn.value || btn.id);
                    });
                });
            } else {
                dialog.querySelector('#btn-ok').addEventListener('click', () => {
                    document.body.removeChild(dialog);
                    resolve('ok');
                });
            }

            // Cerrar con Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(dialog);
                    document.removeEventListener('keydown', handleEscape);
                    resolve('cancel');
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Cerrar al hacer clic fuera del diálogo (solo si no es crítico)
            if (!config.critical) {
                dialog.addEventListener('click', (e) => {
                    if (e.target === dialog) {
                        document.body.removeChild(dialog);
                        resolve('cancel');
                    }
                });
            }
        });
    }

    showBackupDialog() {
        return this.showCustomDialog({
            title: t('cfg.backup_title'),
            message: `<p style="margin:0;color:#64748b">${t('cfg.backup_where')}</p>`,
            buttons: [
                { id: 'btn-cancel',  class: 'btn-secondary', text: t('btn.cancel'),                                        value: 'cancel' },
                { id: 'btn-default', class: 'btn-secondary',  text: t('cfg.backup') + ' (default)',                        value: 'default' },
                { id: 'btn-custom',  class: 'btn-primary',    text: t('cfg.backup') + ' (' + t('btn.search') + '...)',     value: 'custom' }
            ]
        });
    }

    async backupDatabase() {
        try {
            // Mostrar diálogo personalizado con tres opciones
            const userChoice = await this.showBackupDialog();
            
            if (userChoice === 'cancel') {
                this.showNotification(t('cfg.backup_cancelled'), 'info');
                return;
            }
            
            let customPath = null;
            
            if (userChoice === 'custom') {
                // Mostrar diálogo de selección de carpeta
                const folderResult = await window.electronAPI.selectBackupFolder();
                
                if (folderResult.error) {
                    throw new Error(folderResult.error);
                }
                
                if (folderResult.canceled) {
                    this.showNotification(t('cfg.folder_cancelled'), 'info');
                    return;
                }
                
                if (folderResult.success) {
                    customPath = folderResult.folderPath;
                }
            }
            
            this.showNotification(t('cfg.backup_starting'), 'info');
            
            const result = await window.electronAPI.backupDatabase(customPath);
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            if (result.success) {
                const locationText = result.customPath ?
                    t('cfg.backup_custom_loc') :
                    t('cfg.backup_default_loc');

                this.showNotification(t('cfg.backup_done'), 'success');

                // Mostrar información detallada en diálogo personalizado
                setTimeout(() => {
                    this.showCustomDialog({
                        title: t('cfg.backup_done'),
                        message: `
                            <div class="result-dialog">
                                <div class="result-dialog-icon result-success">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <div class="result-dialog-title">${t('cfg.backup_done')}</div>
                                <div class="result-dialog-rows">
                                    <div class="result-row"><span>${t('cfg.file')}</span><strong>${result.fileName}</strong></div>
                                    <div class="result-row"><span>${t('cfg.size')}</span><strong>${result.size}</strong></div>
                                    <div class="result-row"><span>${t('cfg.location')}</span><strong>${locationText}</strong></div>
                                    <div class="result-row"><span>${t('cfg.date')}</span><strong>${result.date}</strong></div>
                                </div>
                                <div class="result-path"><code>${result.backupPath}</code></div>
                            </div>`,
                        type: 'info'
                    });
                }, 500);
            }
        } catch (error) {
            console.error('Error al crear respaldo:', error);
            this.showNotification(t('err.backup').replace('{n}', error.message), 'error');
        }
    }

    async optimizeDatabase() {
        try {
            this.showNotification(t('cfg.optimizing'), 'info');
            
            const result = await window.electronAPI.optimizeDatabase();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            if (result.success) {
                const message = `Optimización completada\n` +
                              `Operaciones realizadas:\n${result.results.join('\n')}\n` +
                              `Tiempo de ejecución: ${result.executionTime}\n` +
                              `Fecha: ${result.date}`;
                
                this.showNotification(t('cfg.optimize_done'), 'success');

                // Mostrar información detallada en diálogo personalizado
                setTimeout(() => {
                    this.showCustomDialog({
                        title: t('cfg.optimize_done'),
                        message: `
                            <div class="result-dialog">
                                <div class="result-dialog-icon result-success">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                                </div>
                                <div class="result-dialog-title">${t('cfg.optimize_done')}</div>
                                <div class="result-dialog-rows">
                                    <div class="result-row"><span>${t('cfg.exec_time')}</span><strong>${result.executionTime}</strong></div>
                                    <div class="result-row"><span>${t('cfg.date')}</span><strong>${result.date}</strong></div>
                                </div>
                                <div class="result-ops">
                                    ${result.results.map(op => `<div class="result-op"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>${op}</div>`).join('')}
                                </div>
                            </div>`,
                        type: 'info'
                    });
                }, 500);
            }
        } catch (error) {
            console.error('Error al optimizar:', error);
            this.showNotification(t('err.optimize').replace('{n}', error.message), 'error');
        }
    }

    savePreferences() {
        try {
            const theme = document.getElementById('theme-select').value;
            const recordsPerPage = document.getElementById('records-per-page').value;

            // Guardar en localStorage
            localStorage.setItem('cementerio-theme', theme);
            localStorage.setItem('cementerio-records-per-page', recordsPerPage);

            // Aplicar tema inmediatamente
            this.applyTheme(theme);

            // Actualizar registros por página
            this.registrosPorPagina = parseInt(recordsPerPage) || 50;

            this.showNotification(t('cfg.prefs_saved'), 'success');
        } catch (error) {
            this.showNotification(t('err.save_prefs').replace('{n}', error.message), 'error');
        }
    }

    changeLanguage(lang) {
        if (!window.i18n) return;
        window.i18n.setLocale(lang);
        this.showNotification(t('msg.lang_changed'), 'success');
        // Re-render JS-generated content so translated values (status, badges) update immediately
        this._rerenderCurrentSection();
    }

    _rerenderCurrentSection() {
        const sec = this.currentSection;
        // Always re-render recent activity (dashboard) since it's always loaded
        this.updateRecentActivity(false);
        if (sec === 'parcelas' && this.originalData.parcelas) {
            this.renderParcelasTable(this.originalData.parcelas);
            this.populateParcelasFilterSelects();
        } else if (sec === 'difuntos' && this.originalData.difuntos) {
            this.renderDifuntosTable(this.originalData.difuntos);
        } else if (sec === 'busqueda' && this._lastSearchResults) {
            this.renderSearchResults(this._lastSearchResults);
        }
    }

    applyTheme(theme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    getThemeDisplayName(theme) {
        const themes = { 'light': t('cfg.theme_light'), 'dark': t('cfg.theme_dark'), 'auto': t('cfg.theme_auto') };
        return themes[theme] || theme;
    }

    async resetPreferences() {
        const userChoice = await this.showCustomDialog({
            title: t('cfg.restore_title'),
            message: `<p style="margin:0;color:#64748b">${t('cfg.restore_msg')}</p>`,
            buttons: [
                { id: 'btn-cancel',  class: 'btn-secondary', text: t('btn.cancel'),  value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-primary',    text: t('btn.restore'), value: 'confirm' }
            ]
        });

        if (userChoice === 'confirm') {
            try {
                localStorage.removeItem('cementerio-theme');
                localStorage.removeItem('cementerio-records-per-page');
                document.getElementById('theme-select').value = 'light';
                document.getElementById('records-per-page').value = '50';
                this.applyTheme('light');
                this.registrosPorPagina = 50;
                this.showNotification(t('cfg.restore_done'), 'success');
            } catch (error) {
                this.showNotification(t('err.restore_cfg').replace('{n}', error.message), 'error');
            }
        }
    }

    // ── ETIQUETAS ─────────────────────────────────────────────────────────────
    async loadEtiquetas() {
        const categorias = ['tipo', 'zona', 'ubicacion'];
        for (const cat of categorias) {
            const items = await window.electronAPI.getEtiquetas(cat);
            this.renderEtiquetas(cat, items || []);
        }
    }

    renderEtiquetas(categoria, items) {
        const list = document.getElementById('list-' + categoria);
        if (!list) return;
        if (!items.length) {
            list.innerHTML = `<p class="etiqueta-empty">${t('etq.empty')}</p>`;
            return;
        }
        list.innerHTML = items.map(item => `
            <div class="etiqueta-item" data-id="${item.id}">
                <span class="etiqueta-valor">${item.valor}</span>
                <div class="etiqueta-actions">
                    <button class="etiqueta-btn etiqueta-btn-edit" onclick="app.editEtiqueta(${item.id}, '${categoria}', '${item.valor.replace(/'/g, "\\'")}')" title="${t('btn.edit')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="etiqueta-btn etiqueta-btn-delete" onclick="app.deleteEtiqueta(${item.id}, '${categoria}', '${item.valor.replace(/'/g, "\\'")}')" title="${t('btn.delete')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async addEtiqueta(categoria) {
        const nombres = { tipo: t('etq.plot_type'), zona: t('etq.zones'), ubicacion: t('etq.location') };
        let capturedVal = '';
        const result = await this.showCustomDialog({
            title: t('etq.new_label') + ' — ' + nombres[categoria],
            message: `
                <div class="form-group" style="margin:0">
                    <label>${t('etq.name')}</label>
                    <input type="text" id="etiq-input" placeholder="${t('etq.new_ph')}" style="margin-top:6px">
                </div>`,
            buttons: [
                { id: 'btn-cancel', class: 'btn-secondary', text: t('btn.cancel'),    value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-primary',   text: t('btn.add_label'), value: 'confirm' }
            ],
            onMounted: (dialog) => {
                const inp = dialog.querySelector('#etiq-input');
                if (inp) {
                    inp.focus();
                    inp.addEventListener('input', () => { capturedVal = inp.value; });
                    dialog.querySelector('#btn-confirm').addEventListener('click', () => { capturedVal = inp.value; }, true);
                }
            }
        });
        if (result !== 'confirm') return;
        const val = capturedVal.trim();
        if (!val) { this.showNotification(t('etq.empty_name'), 'error'); return; }

        // Comprobar duplicado antes de insertar
        const existentes = await window.electronAPI.getEtiquetas(categoria);
        const yaExiste = existentes.some(e => e.valor.toLowerCase() === val.toLowerCase());
        if (yaExiste) { this.showNotification(`"${val}" ${t('etq.dup_error')}`, 'error'); return; }

        await window.electronAPI.createEtiqueta({ categoria, valor: val });
        await this.loadEtiquetas();
        await this.populateParcelasFilterSelects();
        this.showNotification(t('etq.added'), 'success');
    }

    async editEtiqueta(id, categoria, valorActual) {
        let capturedVal = valorActual;
        const result = await this.showCustomDialog({
            title: t('etq.edit_label'),
            message: `
                <div class="form-group" style="margin:0">
                    <label>${t('etq.name')}</label>
                    <input type="text" id="etiq-edit-input" value="${valorActual}" style="margin-top:6px">
                </div>`,
            buttons: [
                { id: 'btn-cancel', class: 'btn-secondary', text: t('btn.cancel'), value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-primary',   text: t('btn.save'),   value: 'confirm' }
            ],
            onMounted: (dialog) => {
                const inp = dialog.querySelector('#etiq-edit-input');
                if (inp) {
                    inp.focus();
                    inp.select();
                    inp.addEventListener('input', () => { capturedVal = inp.value; });
                    dialog.querySelector('#btn-confirm').addEventListener('click', () => { capturedVal = inp.value; }, true);
                }
            }
        });
        if (result !== 'confirm') return;
        const val = capturedVal.trim();
        if (!val) return;
        if (val === valorActual) { this.showNotification(t('etq.no_changes'), 'info'); return; }

        // Comprobar duplicado
        const existentes = await window.electronAPI.getEtiquetas(categoria);
        const yaExiste = existentes.some(e => e.id !== id && e.valor.toLowerCase() === val.toLowerCase());
        if (yaExiste) { this.showNotification(`"${val}" ${t('etq.dup_error')}`, 'error'); return; }

        // Advertir si hay parcelas usando el valor actual
        const enUso = parseInt(await window.electronAPI.countParcelasByEtiqueta(categoria, valorActual)) || 0;
        if (enUso > 0) {
            const inUseMsg = enUso === 1
                ? `<strong>1</strong> ${t('etq.in_use_edit_msg').replace('{v}', valorActual)}`
                : `<strong>${enUso}</strong> ${t('etq.in_use_edit_msg_pl').replace('{v}', valorActual)}`;
            const aviso = await this.showCustomDialog({
                title: t('etq.in_use'),
                message: `<p style="margin:0;color:#64748b">${inUseMsg}</p>`,
                buttons: [
                    { id: 'btn-cancel', class: 'btn-secondary', text: t('btn.cancel'), value: 'cancel' },
                    { id: 'btn-confirm', class: 'btn-primary',   text: t('btn.save'),   value: 'confirm' }
                ]
            });
            if (aviso !== 'confirm') return;
        }

        await window.electronAPI.updateEtiqueta(id, { valor: val });
        await this.loadEtiquetas();
        await this.populateParcelasFilterSelects();
        this.showNotification(t('etq.updated'), 'success');
    }

    async deleteEtiqueta(id, categoria, valor) {
        // Advertir si hay parcelas usando esta etiqueta
        const enUso = valor ? parseInt(await window.electronAPI.countParcelasByEtiqueta(categoria, valor)) || 0 : 0;

        const msg = enUso > 0
            ? `<p style="margin:0;color:#64748b"><strong>${enUso}</strong> ${enUso === 1 ? t('etq.in_use_del_msg') : t('etq.in_use_del_msg_pl').replace('{n}', enUso)}</p>`
            : `<p style="margin:0;color:#64748b">${t('etq.del_safe')}</p>`;

        const confirmed = await this.showCustomDialog({
            title: t('etq.del_label'),
            message: msg,
            buttons: [
                { id: 'btn-cancel', class: 'btn-secondary',     text: t('btn.cancel'), value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-danger-modern', text: t('btn.delete'), value: 'confirm' }
            ]
        });
        if (confirmed !== 'confirm') return;
        await window.electronAPI.deleteEtiqueta(id);
        await this.loadEtiquetas();
        await this.populateParcelasFilterSelects();
        this.showNotification(t('etq.deleted'), 'success');
    }

    openManual() {
        const lang = window.i18n?.locale || 'en';
        const file = lang === 'es' ? 'MANUAL.pdf' : 'MANUAL_EN.pdf';
        if (window.electronAPI?.openManual) {
            window.electronAPI.openManual(file);
        }
    }

    showAbout() {
        this.showCustomDialog({
            title: t('cfg.about') + ' Memorix',
            message: `
                <div class="about-dialog">
                    <div class="about-hero">
                        <div class="about-logo-wrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </div>
                        <div>
                            <div class="about-name">Memorix</div>
                            <div class="about-tagline">${t('app.tagline')}</div>
                        </div>
                        <span class="about-version">v1.0.0</span>
                    </div>

                    <div class="about-stack">
                        <span class="about-tech">Electron</span>
                        <span class="about-tech">Node.js</span>
                        <span class="about-tech">SQLite</span>
                    </div>

                    <div class="about-section-title">${t('about.developer')}</div>
                    <div class="about-dev">
                        <div class="about-dev-avatar">AP</div>
                        <div>
                            <div class="about-dev-name">Alejandro Pastor Mayor</div>
                            <div class="about-dev-role">${t('about.dev_role')}</div>
                        </div>
                    </div>

                    <div class="about-section-title">${t('about.features')}</div>
                    <div class="about-features">
                        <div class="about-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            ${t('about.feat_deceased')}
                        </div>
                        <div class="about-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${t('about.feat_plots')}
                        </div>
                        <div class="about-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            ${t('about.feat_search')}
                        </div>
                        <div class="about-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            ${t('about.feat_backup')}
                        </div>
                        <div class="about-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                            ${t('about.feat_reports')}
                        </div>
                        <div class="about-feat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            ${t('about.feat_family')}
                        </div>
                    </div>

                    <div class="about-copyright">© 2025 Alejandro Pastor Mayor · ${t('about.rights')}</div>
                </div>
            `,
            headerClass: 'about-header',
            type: 'info'
        });
    }

    async loadConfigurationInfo() {
        try {
            // Cargar información del sistema si la sección está activa
            if (this.currentSection === 'configuracion') {
                document.getElementById('app-version').textContent = '1.0.0';
                document.getElementById('platform').textContent = navigator.platform;
                document.getElementById('electron-version').textContent = window.electronAPI.getElectronVersion() || 'N/A';
                
                // Obtener tamaño real de la base de datos
                try {
                    const dbInfo = await window.electronAPI.getDatabaseSize();
                    if (dbInfo.success) {
                        const displaySize = dbInfo.fileSize.mb;
                        document.getElementById('db-size').textContent = displaySize;
                        
                        // Agregar tooltip con información detallada
                        const dbElement = document.getElementById('db-size');
                        if (dbElement) {
                            dbElement.title = `Espacio usado: ${dbInfo.database.usedSpace}\n` +
                                            `Espacio libre: ${dbInfo.database.freeSpace}\n` +
                                            `Páginas totales: ${dbInfo.database.totalPages}\n` +
                                            `Última modificación: ${dbInfo.lastModified}`;
                        }
                    } else {
                        document.getElementById('db-size').textContent = 'Error al obtener';
                    }
                } catch (error) {
                    console.error('Error obteniendo tamaño de BD:', error);
                    document.getElementById('db-size').textContent = 'No disponible';
                }
                
                // Cargar preferencias guardadas
                const validThemes = ['light', 'dark', 'auto'];
                const validRecords = ['25', '50', '100'];
                const rawTheme = localStorage.getItem('cementerio-theme');
                const rawRecords = localStorage.getItem('cementerio-records-per-page');
                const savedTheme = validThemes.includes(rawTheme) ? rawTheme : 'light';
                const savedRecordsPerPage = validRecords.includes(rawRecords) ? rawRecords : '50';
                
                document.getElementById('theme-select').value = savedTheme;
                document.getElementById('records-per-page').value = savedRecordsPerPage;
                const langSelect = document.getElementById('lang-select');
                if (langSelect) langSelect.value = window.i18n?.locale || 'es';
                this.registrosPorPagina = parseInt(savedRecordsPerPage) || 50;

                // Cargar info de organización
                const org = this.getOrgInfo();
                const orgNombre = document.getElementById('org-nombre');
                const orgDir = document.getElementById('org-direccion');
                const orgTel = document.getElementById('org-telefono');
                if (orgNombre) orgNombre.value = org.nombre === 'Memorix' ? '' : org.nombre;
                if (orgDir) orgDir.value = org.direccion;
                if (orgTel) orgTel.value = org.telefono;

                // Cargar info de licencia
                this.loadLicenseInfo();
            }
        } catch (error) {
            console.error('Error cargando información de configuración:', error);
        }
    }

    async loadLicenseInfo() {
        const el = document.getElementById('license-info-block');
        if (!el || !window.electronAPI.licenseInfo) return;
        const lic = await window.electronAPI.licenseInfo();
        if (!lic) {
            el.innerHTML = `<p class="config-meta" style="margin:0">${t('cfg.lic_no_license')}</p>`;
            return;
        }
        const exp = lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : null;
        const now = Date.now();
        const daysLeft = lic.expiresAt ? Math.ceil((lic.expiresAt - now) / 86400000) : null;
        const expColor = daysLeft !== null && daysLeft <= 14 ? 'var(--warning, #f59e0b)' : 'var(--success, #22c55e)';
        el.innerHTML = `
            <div class="license-status-row">
                <span class="license-badge">${t('cfg.lic_active')}</span>
                <span class="config-meta">${lic.email || '—'}</span>
            </div>
            ${exp ? `<p class="config-meta" style="margin:6px 0 0;color:${expColor}">${t('cfg.lic_expires')} ${exp}${daysLeft !== null ? ` (${daysLeft} ${t('cfg.lic_days')})` : ''}</p>` : `<p class="config-meta" style="margin:6px 0 0">${t('cfg.lic_perpetual')}</p>`}
        `;
    }

    async deactivateLicense() {
        const ok = await this.showCustomDialog({
            title: t('cfg.lic_deact_title'),
            message: `<p style="color:#64748b;margin:0">${t('cfg.lic_deact_msg')}</p>`,
            buttons: [
                { id: 'btn-cancel',  class: 'btn-secondary', text: t('cfg.lic_deact_cancel'),  value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-danger',    text: t('cfg.lic_deact_confirm'), value: 'confirm' }
            ]
        });
        if (ok !== 'confirm') return;
        await window.electronAPI.licenseDeactivate();
        this.showNotification(t('cfg.lic_deact_done'), 'info');
        setTimeout(() => window.electronAPI && window.close(), 2000);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    async initLogin() {
        try {
            const hasPass = await window.electronAPI.hasPassword();
            if (!hasPass) await window.electronAPI.setPassword('1234');
            const hint = document.getElementById('login-default-hint');
            const passwordChanged = localStorage.getItem('memorix-password-changed');
            if (hint && passwordChanged) hint.style.display = 'none';
        } catch(e) {}

        const overlay = document.getElementById('login-overlay');
        if (!overlay) return;
        overlay.style.display = 'flex';

        const form = document.getElementById('login-form');
        if (!form) return;

        // Remove any previous listener by cloning
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pwdInput = document.getElementById('login-password');
            const pwd = pwdInput ? pwdInput.value : '';
            let ok = false;
            try { ok = await window.electronAPI.checkPassword(pwd); } catch(err) { console.error('[LOGIN] checkPassword error:', err); }
            if (ok) {
                overlay.style.transition = 'opacity 0.3s';
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.style.opacity = '';
                    this.checkOnboarding();
                }, 300);
            } else {
                const err = document.getElementById('login-error');
                if (err) err.style.display = 'block';
                if (pwdInput) { pwdInput.value = ''; pwdInput.focus(); }
            }
        });
    }

    async cambiarContrasena() {
        let vals = { actual: '', nueva: '', confirmar: '' };

        const result = await this.showCustomDialog({
            title: t('cfg.change_pwd'),
            message: `
                <div class="pwd-form">
                    <div class="pwd-form-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <p class="pwd-form-desc">${t('pwd.desc')}</p>
                    <div class="form-group">
                        <label>${t('pwd.current')}</label>
                        <input type="password" id="pwd-actual" placeholder="••••••••" autocomplete="current-password">
                    </div>
                    <div class="form-group">
                        <label>${t('pwd.new')}</label>
                        <input type="password" id="pwd-nueva" placeholder="${t('pwd.new_ph')}" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label>${t('pwd.confirm')}</label>
                        <input type="password" id="pwd-confirmar" placeholder="${t('pwd.confirm_ph')}" autocomplete="new-password">
                    </div>
                </div>`,
            buttons: [
                { id: 'btn-cancel', class: 'btn-secondary', text: t('btn.cancel'), value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-primary',   text: t('cfg.save'),   value: 'confirm' }
            ],
            onMounted: (dialog) => {
                const inp = (id) => dialog.querySelector('#' + id);
                ['pwd-actual', 'pwd-nueva', 'pwd-confirmar'].forEach(id => {
                    inp(id)?.addEventListener('input', () => { vals[id.replace('pwd-', '')] = inp(id).value; });
                });
                inp('pwd-actual')?.focus();
                dialog.querySelector('#btn-confirm').addEventListener('click', () => {
                    vals.actual    = inp('pwd-actual')?.value    || '';
                    vals.nueva     = inp('pwd-nueva')?.value     || '';
                    vals.confirmar = inp('pwd-confirmar')?.value || '';
                }, true);
            }
        });

        if (result !== 'confirm') return;

        const ok = await window.electronAPI.checkPassword(vals.actual);
        if (!ok) { this.showNotification(t('pwd.wrong_current'), 'error'); return; }
        if (vals.nueva.length < 4) { this.showNotification(t('pwd.too_short'), 'error'); return; }
        if (vals.nueva !== vals.confirmar) { this.showNotification(t('pwd.no_match'), 'error'); return; }

        await window.electronAPI.setPassword(vals.nueva);
        localStorage.setItem('memorix-password-changed', '1');
        this.showNotification(t('pwd.changed_ok'), 'success');
    }

    // ── FAMILIARES ────────────────────────────────────────────────────────────
    async abrirFamiliares(difuntoId, nombre) {
        this.currentFamiliarDifuntoId = difuntoId;
        document.getElementById('familiares-difunto-nombre').textContent = nombre;
        document.getElementById('form-familiar-container').style.display = 'none';
        const modal = document.getElementById('modal-familiares');
        modal.style.display = 'flex';
        await this.cargarFamiliares();
        
    }

    async cargarFamiliares() {
        const lista = document.getElementById('familiares-lista');
        lista.innerHTML = `<p>${t('msg.loading')}</p>`;
        const familiares = await window.electronAPI.getFamiliares(this.currentFamiliarDifuntoId);
        if (!familiares || familiares.length === 0) {
            lista.innerHTML = `<p class="text-muted">${t('msg.no_familiares')}</p>`;
            return;
        }
        lista.innerHTML = familiares.map(f => `
            <div class="familiar-item">
                <div class="familiar-info">
                    <strong>${f.nombre} ${f.apellidos}</strong>
                    <span class="badge badge-relacion">${f.relacion}</span>
                    ${f.es_responsable ? '<span class="badge badge-responsable">Responsable</span>' : ''}
                    <div class="familiar-contacto">
                        ${f.telefono ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${f.telefono}</span>` : ''}
                        ${f.email ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> ${f.email}</span>` : ''}
                        ${f.cedula ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> ${f.cedula}</span>` : ''}
                    </div>
                </div>
                <div class="familiar-acciones">
                    <button class="btn-icon btn-icon-edit" onclick="app.editarFamiliar(${f.id})" title="${t('btn.edit')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="btn-icon btn-icon-delete" onclick="app.eliminarFamiliar(${f.id})" title="${t('btn.delete')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>
                </div>
            </div>
        `).join('');
    }

    abrirFormFamiliar(id = null) {
        document.getElementById('form-familiar-container').style.display = 'block';
        document.getElementById('form-familiar-titulo').textContent = id ? t('fam.edit') : t('fam.new');
        document.getElementById('familiar-id').value = id || '';
        if (!id) document.getElementById('form-familiar').reset();
        document.getElementById('form-familiar').onsubmit = (e) => { e.preventDefault(); this.guardarFamiliar(); };
    }

    cancelarFormFamiliar() {
        document.getElementById('form-familiar-container').style.display = 'none';
    }

    async editarFamiliar(id) {
        const fams = await window.electronAPI.getFamiliares(this.currentFamiliarDifuntoId);
        const f = fams.find(x => x.id === id);
        if (!f) return;
        this.abrirFormFamiliar(id);
        document.getElementById('fam-nombre').value = f.nombre || '';
        document.getElementById('fam-apellidos').value = f.apellidos || '';
        document.getElementById('fam-relacion').value = f.relacion || '';
        document.getElementById('fam-telefono').value = f.telefono || '';
        document.getElementById('fam-email').value = f.email || '';
        document.getElementById('fam-cedula').value = f.cedula || '';
        document.getElementById('fam-direccion').value = f.direccion || '';
        document.getElementById('fam-responsable').checked = !!f.es_responsable;
    }

    async guardarFamiliar() {
        // Validación
        const isValid = this.validateForm([
            { el: document.getElementById('fam-nombre'),    rules: { required: true, minLength: 2 } },
            { el: document.getElementById('fam-apellidos'), rules: { required: true, minLength: 2 } },
            { el: document.getElementById('fam-relacion'),  rules: { required: true } },
        ]);
        if (!isValid) return;

        const id = document.getElementById('familiar-id').value;
        const data = {
            difunto_id: this.currentFamiliarDifuntoId,
            nombre: document.getElementById('fam-nombre').value.trim(),
            apellidos: document.getElementById('fam-apellidos').value.trim(),
            relacion: document.getElementById('fam-relacion').value,
            telefono: document.getElementById('fam-telefono').value.trim(),
            email: document.getElementById('fam-email').value.trim(),
            cedula: document.getElementById('fam-cedula').value.trim(),
            direccion: document.getElementById('fam-direccion').value.trim(),
            es_responsable: document.getElementById('fam-responsable').checked
        };
        if (id) {
            await window.electronAPI.updateFamiliar(parseInt(id), data);
            this.showNotification(t('msg.fam_updated'), 'success');
        } else {
            await window.electronAPI.createFamiliar(data);
            this.showNotification(t('fam.added'), 'success');
        }
        document.getElementById('form-familiar-container').style.display = 'none';
        await this.cargarFamiliares();
    }

    async eliminarFamiliar(id) {
        const result = await this.showCustomDialog({
            title: t('fam.del_title'),
            message: `<p style="margin:0;color:#64748b">${t('fam.del_msg')}</p>`,
            buttons: [
                { id: 'btn-cancel',  class: 'btn-secondary',    text: t('btn.cancel'), value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-danger-modern', text: t('btn.delete'), value: 'confirm' }
            ]
        });
        if (result !== 'confirm') return;
        await window.electronAPI.deleteFamiliar(id);
        this.showNotification(t('fam.del_done'), 'success');
        await this.cargarFamiliares();
    }

    // ── PAGOS ─────────────────────────────────────────────────────────────────
    async abrirPagos(difuntoId, nombre) {
        this.currentPagoDifuntoId = difuntoId;
        document.getElementById('pagos-difunto-nombre').textContent = nombre;
        document.getElementById('form-pago-container').style.display = 'none';
        const modal = document.getElementById('modal-pagos');
        modal.style.display = 'flex';
        await this.cargarPagos();
        
    }

    async cargarPagos() {
        const lista = document.getElementById('pagos-lista');
        const totalDiv = document.getElementById('pagos-total');
        lista.innerHTML = `<p>${t('msg.loading')}</p>`;
        const [pagos, total] = await Promise.all([
            window.electronAPI.getPagos(this.currentPagoDifuntoId),
            window.electronAPI.getTotalPagado(this.currentPagoDifuntoId)
        ]);
        totalDiv.innerHTML = `<div class="pagos-resumen">${t('pag.total_collected')}: <strong>${this.formatMoney(total)}</strong></div>`;
        if (!pagos || pagos.length === 0) {
            lista.innerHTML = `<p class="text-muted">${t('msg.no_pagos')}</p>`;
            return;
        }
        const metodoIcon = {
            efectivo:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
            transferencia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
            tarjeta:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
            cheque:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        };
        lista.innerHTML = `
            <table class="pagos-tabla">
                <thead><tr><th>${t('th.birthdate')}</th><th>${t('pag.method','Método')}</th><th>${t('pag.concept','Concepto')}</th><th>${t('pag.amount','Importe')}</th><th></th></tr></thead>
                <tbody>` + pagos.map(p => `
                    <tr>
                        <td>${this.formatDate(p.fecha_pago)}</td>
                        <td><span class="metodo-pago-cell">${metodoIcon[p.metodo_pago] || ''} ${p.metodo_pago}</span></td>
                        <td class="text-muted">${p.concepto || p.referencia || '—'}</td>
                        <td class="pago-importe">${this.formatMoney(p.monto)}</td>
                        <td><button class="btn-icon btn-icon-delete" onclick="app.eliminarPago(${p.id})" title="${t('btn.delete')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button></td>
                    </tr>
                `).join('') + `</tbody>
            </table>`;
    }

    abrirFormPago() {
        document.getElementById('form-pago-container').style.display = 'block';
        document.getElementById('pago-fecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('form-pago').onsubmit = (e) => { e.preventDefault(); this.guardarPago(); };
    }

    cancelarFormPago() {
        document.getElementById('form-pago-container').style.display = 'none';
    }

    async guardarPago() {
        const monto = parseFloat(document.getElementById('pago-monto').value);
        if (!monto || monto <= 0) { this.showNotification(t('pay.invalid_amount'), 'error'); return; }
        const data = {
            difunto_id: this.currentPagoDifuntoId,
            monto,
            fecha_pago: document.getElementById('pago-fecha').value,
            metodo_pago: document.getElementById('pago-metodo').value,
            referencia: document.getElementById('pago-referencia').value.trim(),
            concepto: document.getElementById('pago-concepto').value.trim()
        };
        await window.electronAPI.createPago(data);
        this.showNotification(t('pay.saved'), 'success');
        document.getElementById('form-pago-container').style.display = 'none';
        document.getElementById('form-pago').reset();
        await this.cargarPagos();
    }

    async eliminarPago(id) {
        const result = await this.showCustomDialog({
            title: t('pay.del_title'),
            message: `<p style="margin:0;color:#64748b">${t('pay.del_msg')}</p>`,
            buttons: [
                { id: 'btn-cancel',  class: 'btn-secondary',    text: t('btn.cancel'), value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-danger-modern', text: t('btn.delete'), value: 'confirm' }
            ]
        });
        if (result !== 'confirm') return;
        await window.electronAPI.deletePago(id);
        this.showNotification(t('pay.del_done'), 'success');
        await this.cargarPagos();
    }

    // ── REPORTES ──────────────────────────────────────────────────────────────
    getOrgInfo() {
        return {
            nombre: localStorage.getItem('org-nombre') || 'Memorix',
            direccion: localStorage.getItem('org-direccion') || '',
            telefono: localStorage.getItem('org-telefono') || ''
        };
    }

    saveOrgInfo() {
        const nombre = document.getElementById('org-nombre')?.value.trim();
        const direccion = document.getElementById('org-direccion')?.value.trim();
        const telefono = document.getElementById('org-telefono')?.value.trim();
        if (nombre !== undefined) localStorage.setItem('org-nombre', nombre);
        if (direccion !== undefined) localStorage.setItem('org-direccion', direccion);
        if (telefono !== undefined) localStorage.setItem('org-telefono', telefono);
        this.showNotification(t('msg.org_saved'), 'success');
    }

    buildPDFHeader(org, titulo, totalReg, fecha) {
        const orgLines = [
            org.direccion ? `<div class="pdf-org-sub">${org.direccion}</div>` : '',
            org.telefono  ? `<div class="pdf-org-sub">${org.telefono}</div>`  : ''
        ].join('');
        const logoSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
        return `
        <div class="pdf-header">
            <div class="pdf-header-left">
                <div class="pdf-logo-circle">${logoSvg}</div>
                <div>
                    <div class="pdf-org-name">${org.nombre || 'Memorix'}</div>
                    ${orgLines}
                </div>
            </div>
            <div class="pdf-header-right">
                <div class="pdf-doc-title">${titulo}</div>
                <div class="pdf-doc-meta">${t('rep.issued')}: ${fecha}</div>
                <div class="pdf-doc-meta">${totalReg} ${t('pag.records')}</div>
            </div>
        </div>
        <div class="pdf-divider"></div>`;
    }

    async generarReporte(tipo) {
        const preview = document.getElementById('reporte-preview');
        const contenido = document.getElementById('reporte-contenido');
        const titulo = document.getElementById('reporte-titulo');
        const locale = window.i18n.locale === 'en' ? 'en-GB' : 'es-ES';
        const fecha = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
        contenido.innerHTML = `<p style="padding:16px;color:#64748b">${t('msg.loading')}</p>`;
        preview.style.display = 'block';
        preview.scrollIntoView({ behavior: 'smooth' });
        try {
            if (tipo === 'difuntos') {
                titulo.textContent = t('rep.deceased_list_title');
                const difuntos = await window.electronAPI.getDifuntos({ limit: 9999 });
                contenido.innerHTML = this.buildReporteDifuntos(difuntos, fecha);
            } else if (tipo === 'parcelas') {
                titulo.textContent = t('rep.plots_list_title');
                const parcelas = await window.electronAPI.getParcelas();
                contenido.innerHTML = this.buildReporteParcelas(parcelas, fecha, false);
            } else if (tipo === 'disponibles') {
                titulo.textContent = t('rep.avail_plots_title');
                const parcelas = await window.electronAPI.getParcelasDisponibles();
                contenido.innerHTML = this.buildReporteParcelas(parcelas, fecha, true);
            } else if (tipo === 'pagos') {
                titulo.textContent = t('rep.payments_title');
                const pagos = await window.electronAPI.getAllPagos();
                contenido.innerHTML = this.buildReportePagos(pagos, fecha);
            }
        } catch (e) {
            contenido.innerHTML = '<p style="padding:16px;color:#ef4444">Error generando el reporte: ' + e.message + '</p>';
        }
    }

    buildReporteDifuntos(difuntos, fecha) {
        const org = this.getOrgInfo();
        const filas = difuntos.map((d, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${d.nombre} ${d.apellidos}</strong></td>
                <td>${d.cedula || '-'}</td>
                <td>${this.formatDate(d.fecha_nacimiento)}</td>
                <td>${this.formatDate(d.fecha_defuncion)}</td>
                <td>${d.parcela_codigo ? `<span class="pdf-chip">${this.shortParcelaCode(d.parcela_codigo)}</span>` : `<span style="color:#94a3b8">${t('msg.sin_asignar')}</span>`}</td>
                <td><span class="pdf-badge pdf-badge-${d.estado}">${this.translateStatus(d.estado)}</span></td>
            </tr>`).join('');
        return `<div class="reporte-doc">
            ${this.buildPDFHeader(org, t('rep.deceased_list_title'), difuntos.length, fecha)}
            <table class="reporte-tabla">
                <thead><tr><th>#</th><th>${t('th.full_name')}</th><th>${t('dec.document')}</th><th>${t('th.birthdate')}</th><th>${t('th.deathdate')}</th><th>${t('dec.plot')}</th><th>${t('dec.status')}</th></tr></thead>
                <tbody>${filas || `<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px">${t('msg.no_results')}</td></tr>`}</tbody>
            </table>
        </div>`;
    }

    buildReporteParcelas(parcelas, fecha, soloDisponibles) {
        const org = this.getOrgInfo();
        const titulo = soloDisponibles ? t('rep.avail_plots_title') : t('rep.plots_list_title');
        const filas = parcelas.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${this.shortParcelaCode(p.codigo)}</strong></td>
                <td>${p.tipo}</td>
                <td>${p.zona}</td>
                <td>${p.seccion}-${p.numero}</td>
                <td>${p.ubicacion}</td>
                <td><span class="pdf-badge pdf-badge-${p.estado}">${this.translateStatus(p.estado)}</span></td>
                <td>${p.precio ? parseFloat(p.precio).toFixed(2) + ' €' : '-'}</td>
            </tr>`).join('');
        return `<div class="reporte-doc">
            ${this.buildPDFHeader(org, titulo, parcelas.length, fecha)}
            <table class="reporte-tabla">
                <thead><tr><th>#</th><th>${t('plot.code')}</th><th>${t('plot.type')}</th><th>${t('plot.zone')}</th><th>${t('plot.section')}</th><th>${t('plot.location')}</th><th>${t('plot.status')}</th><th>${t('plot.price')}</th></tr></thead>
                <tbody>${filas || `<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:20px">${t('msg.no_results')}</td></tr>`}</tbody>
            </table>
        </div>`;
    }

    buildReportePagos(pagos, fecha) {
        const org = this.getOrgInfo();
        const total = pagos.reduce((s, p) => s + parseFloat(p.monto || 0), 0);
        const filas = pagos.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${this.formatDate(p.fecha_pago)}</td>
                <td><strong>${p.nombre} ${p.apellidos}</strong></td>
                <td>${p.parcela_codigo ? `<span class="pdf-chip">${this.shortParcelaCode(p.parcela_codigo)}</span>` : '-'}</td>
                <td>${p.concepto || '-'}</td>
                <td>${p.metodo_pago || t('pay.method_cash')}</td>
                <td style="text-align:right"><strong>${parseFloat(p.monto).toFixed(2)} €</strong></td>
            </tr>`).join('');
        return `<div class="reporte-doc">
            ${this.buildPDFHeader(org, t('rep.payments_title'), pagos.length, fecha)}
            <table class="reporte-tabla">
                <thead><tr><th>#</th><th>${t('pay.date')}</th><th>${t('nav.deceased')}</th><th>${t('dec.plot')}</th><th>${t('pay.concept')}</th><th>${t('pag.method')}</th><th style="text-align:right">${t('pay.amount')}</th></tr></thead>
                <tbody>${filas || `<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px">${t('msg.no_results')}</td></tr>`}</tbody>
                <tfoot><tr><td colspan="6" style="text-align:right;font-weight:700;padding:8px 10px;border-top:2px solid #0f172a">${t('pag.total_collected')}:</td><td style="text-align:right;font-weight:700;padding:8px 10px;border-top:2px solid #0f172a">${total.toFixed(2)} €</td></tr></tfoot>
            </table>
        </div>`;
    }

    async imprimirReporte() {
        const contenido = document.getElementById('reporte-contenido');
        if (!contenido) return;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 0; }
  .reporte-doc { padding: 0; }
  .pdf-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px 16px; background: #0f172a; color: #fff; }
  .pdf-header-left { display: flex; align-items: center; gap: 14px; }
  .pdf-logo-circle { width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: #fff; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pdf-org-name { font-size: 15px; font-weight: 700; color: #fff; }
  .pdf-org-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .pdf-header-right { text-align: right; }
  .pdf-doc-title { font-size: 14px; font-weight: 700; color: #fff; }
  .pdf-doc-meta { font-size: 10px; color: #94a3b8; margin-top: 3px; }
  .pdf-divider { height: 3px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  thead th { background: #1e293b; color: #fff; padding: 7px 10px; text-align: left; font-size: 10px; letter-spacing: 0.03em; text-transform: uppercase; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr:hover { background: #eff6ff; }
  tbody td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
  tfoot td { background: #f1f5f9; }
  .pdf-chip { background: #e0e7ff; color: #3730a3; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .pdf-badge { padding: 2px 7px; border-radius: 10px; font-size: 9px; font-weight: 600; }
  .pdf-badge-activo,.pdf-badge-disponible { background:#dcfce7; color:#166534; }
  .pdf-badge-ocupada { background:#fef9c3; color:#854d0e; }
  .pdf-badge-trasladado,.pdf-badge-exhumado { background:#e0e7ff; color:#3730a3; }
  .pdf-badge-mantenimiento,.pdf-badge-reservada { background:#fff7ed; color:#9a3412; }
  @page { margin: 12mm 12mm 18mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>${contenido.innerHTML}</body>
</html>`;

        const result = await window.electronAPI.printToPDF(html);
        if (result.error) this.showNotification(t('err.gen_pdf').replace('{n}', result.error), 'error');
        else this.showNotification(t('msg.pdf_ok'), 'success');
    }

    cerrarReporte() {
        document.getElementById('reporte-preview').style.display = 'none';
    }

    // ── MULTI-DB ──────────────────────────────────────────────────────────────
    async loadMultidbList() {
        const container = document.getElementById('multidb-list');
        if (!container) return;
        try {
            const { list, active } = await window.electronAPI.multidbList();
            if (!list.length) {
                container.innerHTML = `<p class="multidb-empty">${t('db.empty')}</p>`;
                return;
            }
            container.innerHTML = list.map(db => `
                <div class="multidb-item ${db.path === active ? 'multidb-active' : ''}">
                    <div class="multidb-item-info">
                        <div class="multidb-item-name">${db.name}</div>
                        <div class="multidb-item-path" title="${db.path}">${db.path}</div>
                    </div>
                    ${db.path === active
                        ? '<span class="badge badge-disponible" data-i18n="db.current">Activa</span>'
                        : `<button class="btn btn-secondary btn-sm" onclick="app.multidbSwitch('${db.path.replace(/\\/g, '\\\\')}')"><span data-i18n="db.switch">Cambiar</span></button>`
                    }
                </div>
            `).join('');
            if (window.i18n) window.i18n.applyToDOM();
        } catch (e) {
            container.innerHTML = `<p class="multidb-empty">${t('db.load_error')}</p>`;
        }
    }

    async multidbNew() {
        let name = '', folder = '';
        const result = await this.showCustomDialog({
            title: t('db.new', 'Nueva Base de Datos'),
            message: `
                <div style="display:flex;flex-direction:column;gap:14px;">
                    <div class="form-group">
                        <label class="form-label">${t('db.create_name', 'Nombre del cementerio')} *</label>
                        <input id="mdb-name" class="form-control" placeholder="Ej: Cementerio Norte" maxlength="60">
                    </div>
                    <div class="form-group">
                        <label class="form-label">${t('db.folder_label')}</label>
                        <div style="display:flex;gap:8px;">
                            <input id="mdb-folder" class="form-control" placeholder="${t('db.folder_ph')}" readonly>
                            <button class="btn btn-secondary" style="white-space:nowrap" onclick="app._multidbPickFolder()">${t('db.browse')}</button>
                        </div>
                    </div>
                </div>`,
            buttons: [
                { id: 'btn-cancel',  class: 'btn-secondary', text: t('btn.cancel', 'Cancelar'), value: 'cancel' },
                { id: 'btn-ok',      class: 'btn-primary',   text: t('db.create'),              value: 'ok' }
            ]
        });
        if (result !== 'ok') return;
        name   = document.getElementById('mdb-name')?.value.trim();
        folder = document.getElementById('mdb-folder')?.value.trim();
        if (!name || !folder) { this.showNotification(t('db.fill_all'), 'error'); return; }
        const res = await window.electronAPI.multidbCreate({ name, folder });
        if (res.error) { this.showNotification('Error: ' + res.error, 'error'); return; }
        this.showNotification(t('db.created').replace('{n}', name), 'success');
        this.loadMultidbList();
    }

    async _multidbPickFolder() {
        const res = await window.electronAPI.multidbSelectFolder();
        if (res.success) {
            const el = document.getElementById('mdb-folder');
            if (el) el.value = res.folder;
        }
    }

    async multidbOpen() {
        const res = await window.electronAPI.multidbOpen();
        if (res.canceled) return;
        if (res.error) { this.showNotification('Error: ' + res.error, 'error'); return; }
        this.showNotification(t('db.opened'), 'success');
        this.loadMultidbList();
    }

    async multidbSwitch(dbPath) {
        const confirm = await this.showCustomDialog({
            title: t('db.switch_title', 'Cambiar base de datos'),
            message: `<p style="margin:0;color:#64748b">${t('db.switch_confirm', 'La aplicación se reiniciará para cargar la nueva base de datos.')}</p>`,
            buttons: [
                { id: 'btn-cancel',  class: 'btn-secondary', text: t('btn.cancel', 'Cancelar'), value: 'cancel' },
                { id: 'btn-ok',      class: 'btn-primary',   text: t('db.switch', 'Cambiar'),   value: 'ok' }
            ]
        });
        if (confirm !== 'ok') return;
        await window.electronAPI.multidbSwitch(dbPath);
    }

    // ── ONBOARDING ────────────────────────────────────────────────────────────
    checkOnboarding() {
        if (localStorage.getItem('memorix-onboarding-done')) return;
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) overlay.style.display = 'flex';
        this._obStep = 1;
        // Aplicar inglés por defecto al arrancar el onboarding
        if (window.i18n) window.i18n.setLocale('en');
        // Live language switch inside onboarding
        document.querySelectorAll('input[name="ob-lang"]').forEach(radio => {
            radio.addEventListener('change', () => {
                window.i18n.setLocale(radio.value);
                const sel = document.getElementById('lang-select');
                if (sel) sel.value = radio.value;
            });
        });
    }

    onboardingNext() {
        const step = this._obStep || 1;
        if (step === 1) {
            // Seed labels in the chosen language before moving to step 2
            const checkedLang = document.querySelector('input[name="ob-lang"]:checked');
            const lang = checkedLang ? checkedLang.value : 'en';
            if (window.electronAPI?.seedEtiquetas) window.electronAPI.seedEtiquetas(lang);
        }
        if (step < 3) {
            this._obStep = step + 1;
            this._obRender();
        }
    }

    onboardingPrev() {
        const step = this._obStep || 1;
        if (step > 1) {
            this._obStep = step - 1;
            this._obRender();
        }
    }

    _obRender() {
        const s = this._obStep;
        document.querySelectorAll('.onboarding-step').forEach(el => el.classList.remove('active'));
        const active = document.querySelector(`.onboarding-step[data-step="${s}"]`);
        if (active) active.classList.add('active');
        document.querySelectorAll('.ob-dot').forEach(d => d.classList.toggle('active', +d.dataset.dot === s));
        const back   = document.getElementById('ob-back');
        const next   = document.getElementById('ob-next');
        const finish = document.getElementById('ob-finish');
        if (back)   back.style.display   = s > 1 ? '' : 'none';
        if (next)   next.style.display   = s < 3 ? '' : 'none';
        if (finish) finish.style.display = s === 3 ? '' : 'none';
    }

    async onboardingFinish() {
        // Guardar datos de organización
        const nombre    = document.getElementById('ob-nombre')?.value.trim();
        const direccion = document.getElementById('ob-direccion')?.value.trim();
        const telefono  = document.getElementById('ob-telefono')?.value.trim();
        if (nombre) {
            localStorage.setItem('org-nombre',    nombre);
            localStorage.setItem('org-direccion', direccion || '');
            localStorage.setItem('org-telefono',  telefono  || '');
        }

        // Guardar preferencias
        const theme   = document.querySelector('input[name="ob-theme"]:checked')?.value || 'light';
        const records = document.getElementById('ob-records')?.value || '50';
        const lang    = document.querySelector('input[name="ob-lang"]:checked')?.value || 'es';
        localStorage.setItem('cementerio-theme', theme);
        localStorage.setItem('cementerio-records-per-page', records);
        this.applyTheme(theme);
        this.registrosPorPagina = parseInt(records);
        if (window.i18n) window.i18n.setLocale(lang);

        // Insertar datos de ejemplo si la BD está vacía
        if (window.electronAPI?.seedSampleData) await window.electronAPI.seedSampleData(lang);

        // Marcar como completado y cerrar
        localStorage.setItem('memorix-onboarding-done', '1');
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) { overlay.style.opacity = '0'; overlay.style.transition = 'opacity .3s'; setTimeout(() => overlay.style.display = 'none', 300); }
        this.showNotification(t('ob.saved'), 'success');
        // Recargar dashboard y tablas con los datos de ejemplo
        setTimeout(() => { this.loadDashboard(); this.loadParcelas(); this.loadDifuntos(); }, 400);
    }

    // ── EXPORTAR CSV ──────────────────────────────────────────────────────────
    async exportarCSV(tipo) {
        try {
            const org  = this.getOrgInfo();
            const fecha = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
            let rows = [], headers = [], titulo = '', filename = '';

            if (tipo === 'difuntos') {
                const data = await window.electronAPI.getDifuntos({ limit: 9999 });
                titulo = t('exp.dec_list');
                headers = [t('exp.num'), t('exp.name'), t('exp.surnames'), t('exp.id_doc'), t('exp.sex'), t('exp.birthdate'), t('exp.deathdate'), t('exp.birthplace'), t('exp.cause'), t('exp.plot'), t('exp.status'), t('exp.observations')];
                rows = data.map((d, i) => [i+1, d.nombre, d.apellidos, d.cedula || '', d.sexo === 'M' ? t('exp.male') : t('exp.female'), d.fecha_nacimiento || '', d.fecha_defuncion || '', d.lugar_nacimiento || '', d.causa_muerte || '', d.parcela_codigo ? this.shortParcelaCode(d.parcela_codigo) : '', d.estado, d.observaciones || '']);
                filename = 'difuntos';
            } else if (tipo === 'parcelas' || tipo === 'disponibles') {
                const data = tipo === 'disponibles' ? await window.electronAPI.getParcelasDisponibles() : await window.electronAPI.getParcelas();
                titulo = tipo === 'disponibles' ? t('exp.avail_list') : t('exp.plot_list');
                headers = [t('exp.num'), t('exp.code'), t('exp.type'), t('exp.zone'), t('exp.section'), t('exp.row'), t('exp.number'), t('exp.location'), t('exp.status'), t('exp.price_eur'), t('exp.observations')];
                rows = data.map((p, i) => [i+1, this.shortParcelaCode(p.codigo), p.tipo, p.zona, p.seccion, p.fila || '', p.numero, p.ubicacion, p.estado, p.precio ? parseFloat(p.precio).toFixed(2) : '', p.observaciones || '']);
                filename = tipo === 'disponibles' ? 'parcelas_disponibles' : 'parcelas';
            } else if (tipo === 'pagos') {
                const data = await window.electronAPI.getAllPagos();
                titulo = t('exp.pay_report');
                headers = [t('exp.num'), t('exp.date'), t('exp.name'), t('exp.surnames'), t('exp.plot'), t('exp.concept'), t('exp.method'), t('exp.amount_eur')];
                rows = data.map((p, i) => [i+1, p.fecha_pago || '', p.nombre, p.apellidos, p.parcela_codigo ? this.shortParcelaCode(p.parcela_codigo) : '', p.concepto || '', p.metodo_pago || 'Efectivo', parseFloat(p.monto || 0).toFixed(2)]);
                // Fila de total
                const total = rows.reduce((s, r) => s + parseFloat(r[7] || 0), 0);
                rows.push(['', '', '', '', '', '', 'TOTAL', total.toFixed(2)]);
                filename = 'pagos';
            }

            const esc = v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`;

            // Encabezado de organización (comentarios con #)
            const metaLines = [
                `# ${org.nombre || 'Memorix'} — ${titulo}`,
                `# ${t('exp.generated')}: ${fecha}`,
                org.direccion ? `# ${t('exp.address_label')}: ${org.direccion}` : '',
                org.telefono  ? `# ${t('exp.contact')}: ${org.telefono}`        : '',
                `# ${t('exp.total_records')}: ${rows.length}`,
                ''
            ].filter(l => l !== null).join('\r\n');

            const dataLines = [headers, ...rows].map(row => row.map(esc).join(',')).join('\r\n');
            const csvContent = metaLines + dataLines;

            const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `memorix_${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification(t('exp.csv_success').replace('{n}', rows.length), 'success');
        } catch (e) {
            this.showNotification(t('err.export_csv').replace('{n}', e.message), 'error');
        }
    }

    // ── EXPORTAR EXCEL ────────────────────────────────────────────────────────
    async exportarExcel(tipo) {
        try {
            const org   = this.getOrgInfo();
            const fecha = new Date().toISOString().slice(0, 10);
            let sheets = [], filename = '';

            if (tipo === 'difuntos') {
                const data = await window.electronAPI.getDifuntos({ limit: 9999 });
                const headers = [t('exp.num'), t('exp.name'), t('exp.surnames'), t('exp.id_doc'), t('exp.sex'), t('exp.birthdate'), t('exp.deathdate'), t('exp.birthplace'), t('exp.cause'), t('exp.plot'), t('exp.status'), t('exp.observations')];
                const rows = data.map((d, i) => [i+1, d.nombre, d.apellidos, d.cedula || '', d.sexo === 'M' ? t('exp.male') : t('exp.female'), d.fecha_nacimiento || '', d.fecha_defuncion || '', d.lugar_nacimiento || '', d.causa_muerte || '', d.parcela_codigo ? this.shortParcelaCode(d.parcela_codigo) : '', d.estado, d.observaciones || '']);
                sheets = [{ name: t('exp.dec_sheet'), headers, rows }];
                filename = `memorix_difuntos_${fecha}.xlsx`;
            } else if (tipo === 'parcelas' || tipo === 'disponibles') {
                const data = tipo === 'disponibles' ? await window.electronAPI.getParcelasDisponibles() : await window.electronAPI.getParcelas();
                const headers = [t('exp.num'), t('exp.code'), t('exp.type'), t('exp.zone'), t('exp.section'), t('exp.row'), t('exp.number'), t('exp.location'), t('exp.status'), t('exp.price_eur'), t('exp.observations')];
                const rows = data.map((p, i) => [i+1, this.shortParcelaCode(p.codigo), p.tipo, p.zona, p.seccion, p.fila || '', p.numero, p.ubicacion, p.estado, p.precio ? parseFloat(p.precio) : 0, p.observaciones || '']);
                sheets = [{ name: tipo === 'disponibles' ? t('exp.avail_sheet') : t('exp.plot_sheet'), headers, rows }];
                filename = `memorix_${tipo === 'disponibles' ? 'parcelas_disponibles' : 'parcelas'}_${fecha}.xlsx`;
            } else if (tipo === 'pagos') {
                const data = await window.electronAPI.getAllPagos();
                const headers = [t('exp.num'), t('exp.date'), t('exp.name'), t('exp.surnames'), t('exp.plot'), t('exp.concept'), t('exp.method'), t('exp.amount_eur')];
                const rows = data.map((p, i) => [i+1, p.fecha_pago || '', p.nombre, p.apellidos, p.parcela_codigo ? this.shortParcelaCode(p.parcela_codigo) : '', p.concepto || '', p.metodo_pago || 'Efectivo', parseFloat(p.monto || 0)]);
                const total = rows.reduce((s, r) => s + r[7], 0);
                sheets = [{ name: 'Pagos', headers, rows, totals: ['', '', '', '', '', '', 'TOTAL', total] }];
                filename = `memorix_pagos_${fecha}.xlsx`;
            }

            if (!sheets.length) return;
            const res = await window.electronAPI.exportToExcel({ sheets, filename });
            if (res.error) throw new Error(res.error);
            this.showNotification(t('exp.excel_saved').replace('{n}', filename), 'success');
        } catch (e) {
            this.showNotification(t('err.export_excel').replace('{n}', e.message), 'error');
        }
    }

    // ── BORRAR DATOS DE EJEMPLO ───────────────────────────────────────────────
    async borrarDatosEjemplo() {
        const result = await this.showCustomDialog({
            title: t('cfg.delete_demo'),
            message: `<div class="confirm-delete-body">
                <div class="confirm-delete-icon confirm-delete-icon--danger">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </div>
                <div class="confirm-delete-title">${t('del.all_title')}</div>
                <p style="text-align:center;color:#64748b;font-size:13px;margin:8px 0 16px">${t('del.all_desc')}</p>
                <div class="confirm-delete-warning">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                    ${t('del.all_warning')}
                </div>
            </div>`,
            buttons: [
                { id: 'btn-cancel', class: 'btn-secondary', text: t('btn.cancel'), value: 'cancel' },
                { id: 'btn-confirm', class: 'btn-danger',    text: t('btn.delete'), value: 'confirm' }
            ]
        });
        if (result !== 'confirm') return;
        try {
            await window.electronAPI.deleteSampleData();
            this.showNotification(t('del.all_done'), 'success');
            await this.loadDashboard();
        } catch (e) {
            this.showNotification(t('err.del_data').replace('{n}', e.message), 'error');
        }
    }

    translateStatus(estado) {
        const map = {
            'activo':        t('status.active'),
            'trasladado':    t('status.transferred'),
            'exhumado':      t('status.exhumed'),
            'eliminado':     t('status.deleted'),
            'disponible':    t('status.available'),
            'ocupada':       t('status.occupied'),
            'reservada':     t('status.reserved'),
            'mantenimiento': t('status.maintenance'),
        };
        return map[(estado || '').toLowerCase()] || estado;
    }

    normalize(str) { return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

    formatMoney(val) {
        const n = parseFloat(val);
        if (isNaN(n)) return '0 €';
        return (Number.isInteger(n) ? n.toString() : n.toFixed(2)) + ' €';
    }

    // ── FILTROS PARCELAS ──────────────────────────────────────────────────────
    bindParcelasFilters() {
        const run = () => {
            const texto = (document.getElementById('pf-texto')?.value || '').toLowerCase().trim();
            const tipo  = document.getElementById('pf-tipo')?.value  || '';
            const zona  = document.getElementById('pf-zona')?.value  || '';
            const estado= document.getElementById('pf-estado')?.value || '';

            let datos = this.originalData.parcelas || [];
            if (texto)  datos = datos.filter(p => (p.codigo || '').toLowerCase().includes(texto) || (p.seccion || '').toLowerCase().includes(texto));
            if (tipo)   datos = datos.filter(p => p.tipo === tipo);
            if (zona)   datos = datos.filter(p => p.zona === zona);
            if (estado) datos = datos.filter(p => p.estado === estado);

            this.parcelasPagina = 1;
            this.renderParcelasTable(datos);
        };

        ['pf-texto', 'pf-tipo', 'pf-zona', 'pf-estado'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', run);
        });

        document.getElementById('pf-clear')?.addEventListener('click', () => {
            ['pf-texto'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            ['pf-tipo','pf-zona','pf-estado'].forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
            this.parcelasPagina = 1;
            this.renderParcelasTable(this.originalData.parcelas || []);
        });
    }

    async populateParcelasFilterSelects() {
        try {
            const etiquetas = await window.electronAPI.getAllEtiquetas();
            const tipos = etiquetas.filter(e => e.categoria === 'tipo').map(e => e.valor).sort();
            const zonas = etiquetas.filter(e => e.categoria === 'zona').map(e => e.valor).sort();

            const selTipo = document.getElementById('pf-tipo');
            if (selTipo) {
                selTipo.innerHTML = `<option value="">${t('pf.all_types')}</option>` +
                    tipos.map(v => `<option value="${v}">${v}</option>`).join('');
            }
            const selZona = document.getElementById('pf-zona');
            if (selZona) {
                selZona.innerHTML = `<option value="">${t('pf.all_zones')}</option>` +
                    zonas.map(z => `<option value="${z}">${z}</option>`).join('');
            }
        } catch(e) {
            // fallback: derive from loaded data
            const parcelas = this.originalData.parcelas || [];
            const selTipo = document.getElementById('pf-tipo');
            if (selTipo) {
                const vals = [...new Set(parcelas.map(p => p.tipo).filter(Boolean))].sort();
                selTipo.innerHTML = `<option value="">${t('pf.all_types')}</option>` + vals.map(v => `<option value="${v}">${v}</option>`).join('');
            }
            const selZona = document.getElementById('pf-zona');
            if (selZona) {
                const vals = [...new Set(parcelas.map(p => p.zona).filter(Boolean))].sort();
                selZona.innerHTML = `<option value="">${t('pf.all_zones')}</option>` + vals.map(v => `<option value="${v}">${v}</option>`).join('');
            }
        }
    }

    // ── VALIDACIÓN DE FORMULARIOS ─────────────────────────────────────────────
    validateForm(fields) {
        let valid = true;
        fields.forEach(({el, rules}) => {
            const msg = this.validateField(el, rules);
            this.setFieldError(el, msg);
            if (msg) valid = false;
        });
        return valid;
    }

    validateField(el, rules) {
        const val = el.value.trim();
        if (rules.required && !val) return t('val.required');
        if (rules.minLength && val.length < rules.minLength) return t('val.min_length').replace('{n}', rules.minLength);
        if (rules.min !== undefined && val !== '' && parseFloat(val) < rules.min) return t('val.min_value').replace('{n}', rules.min);
        if (rules.gt !== undefined && val !== '' && parseFloat(val) <= rules.gt) return t('val.gt_value').replace('{n}', rules.gt);
        if (rules.beforeDate) {
            const other = document.getElementById(rules.beforeDate);
            if (other && other.value && val && val >= other.value) return t('val.before_death');
        }
        return null;
    }

    setFieldError(el, msg) {
        el.classList.toggle('input-error', !!msg);
        let errEl = el.parentElement.querySelector('.field-error');
        if (msg) {
            if (!errEl) { errEl = document.createElement('span'); errEl.className = 'field-error'; el.parentElement.appendChild(errEl); }
            errEl.textContent = msg;
        } else if (errEl) errEl.remove();
    }

}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CementerioApp();
    
    // Event listeners para parcela y autocompletado de ciudades
    const parcelaSelect = document.getElementById('parcela_id');
    if (parcelaSelect) {
        parcelaSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            window.app.updateParcelaMessage(this.value, selectedOption ? selectedOption.text : '');
        });
    }

    const lugarNacimiento = document.getElementById('lugar_nacimiento');
    if (lugarNacimiento) {
        lugarNacimiento.addEventListener('input', function() {
            window.app.buscarCiudades(this.value);
        });
        lugarNacimiento.addEventListener('focus', function() {
            window.app.buscarCiudades(this.value);
        });
    }

    // Aviso de licencia próxima a expirar
    if (window.electronAPI && window.electronAPI.onLicenseExpiringSoon) {
        window.electronAPI.onLicenseExpiringSoon((days) => {
            if (window.app) {
                const msg = days <= 1
                    ? 'Tu licencia expira mañana. Renuévala para no perder el acceso.'
                    : `Tu licencia expira en ${days} días. Renuévala para continuar usando Memorix.`;
                window.app.showNotification(msg, 'warning');
            }
        });
    }

    // Auto-updater UI
    if (window.electronAPI && window.electronAPI.onUpdateStatus) {
        window.electronAPI.onUpdateStatus((data) => {
            const banner  = document.getElementById('update-banner');
            const msg     = document.getElementById('update-banner-msg');
            const btn     = document.getElementById('update-banner-btn');
            if (!banner || !msg || !btn) return;

            if (data.type === 'available') {
                msg.textContent = `Nueva versión disponible: v${data.version}`;
                btn.textContent = 'Descargar';
                btn.onclick = () => { window.electronAPI.updateDownload(); btn.textContent = 'Descargando...'; btn.disabled = true; };
                banner.style.display = 'flex';
            } else if (data.type === 'downloading') {
                msg.textContent = `Descargando actualización... ${data.percent}%`;
                btn.textContent = `${data.percent}%`;
                btn.disabled = true;
                banner.style.display = 'flex';
            } else if (data.type === 'downloaded') {
                msg.textContent = `v${data.version} lista para instalar. Se instalará al cerrar la app.`;
                btn.textContent = 'Instalar ahora';
                btn.disabled = false;
                btn.onclick = () => window.electronAPI.updateInstall();
                banner.style.display = 'flex';
            } else if (data.type === 'error') {
                console.warn('Update error:', data.message);
            }
        });
    }
});
