const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const DatabaseManager = require('./src/database/database');
const { autoUpdater } = require('electron-updater');
const license = require('./src/license');

// Variables globales
let mainWindow;
let dbManager;

// ── Multi-DB helpers ──────────────────────────────────────────────────────────
function getDbRegistryPath() {
    return path.join(app.getPath('userData'), 'databases.json');
}

function loadDbRegistry() {
    const p = getDbRegistryPath();
    if (!fs.existsSync(p)) return { active: null, list: [] };
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
    catch { return { active: null, list: [] }; }
}

function saveDbRegistry(registry) {
    fs.writeFileSync(getDbRegistryPath(), JSON.stringify(registry, null, 2), 'utf-8');
}

function getActiveDbPath() {
    const reg = loadDbRegistry();
    if (reg.active && fs.existsSync(reg.active)) return reg.active;
    // fallback a la DB por defecto
    return path.join(__dirname, 'data', 'cementerio.db');
}

function registerDb(dbPath, name) {
    const reg = loadDbRegistry();
    if (!reg.list.find(d => d.path === dbPath)) {
        reg.list.push({ path: dbPath, name, created: new Date().toISOString() });
    }
    reg.active = dbPath;
    saveDbRegistry(reg);
}

// Función para crear la ventana principal
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 800,
        minWidth: 800,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'), // Opcional: agregar icono
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'src', 'preload.js')
        },
        show: true,
        autoHideMenuBar: true
    });
    
    // Cargar la página principal
    mainWindow.loadFile(path.join(__dirname, 'src', 'views', 'index.html'));

    // Mostrar ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus(); // Asegurar que tenga el foco
    });

    // Evento cuando se cierra la ventana
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Abrir DevTools en modo desarrollo
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }
}

// Crear menú de la aplicación
function createMenu() {
    const template = [
        {
            label: 'Archivo',
            submenu: [
                {
                    label: 'Salir',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Ver',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Ayuda',
            submenu: [
                {
                    label: 'Acerca de',
                    click: () => {
                        // Mostrar información de la aplicación
                        mainWindow.webContents.send('show-about');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// ── Activation window ─────────────────────────────────────────────────────────
let activationWindow;

function createActivationWindow(reason) {
    activationWindow = new BrowserWindow({
        width: 480,
        height: 560,
        resizable: false,
        center: true,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'src', 'preload.js')
        },
        autoHideMenuBar: true,
        title: 'Memorix — Activación'
    });

    activationWindow.loadFile(path.join(__dirname, 'src', 'views', 'activation.html'));

    activationWindow.webContents.once('did-finish-load', () => {
        activationWindow.webContents.send('activation-reason', reason);
    });

    activationWindow.on('closed', () => { activationWindow = null; });
}

// Cuando la activación es exitosa, cerrar ventana de activación y abrir la app
ipcMain.handle('activation-success', async () => {
    if (activationWindow) { activationWindow.close(); activationWindow = null; }
    createMainWindow();
    setupAutoUpdater();
});

// ── Auto-updater ──────────────────────────────────────────────────────────────
function setupAutoUpdater() {
    // En desarrollo no busca actualizaciones
    if (process.argv.includes('--dev')) return;

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
        if (mainWindow) mainWindow.webContents.send('update-status', { type: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
        if (mainWindow) mainWindow.webContents.send('update-status', {
            type: 'available',
            version: info.version,
            releaseNotes: info.releaseNotes
        });
    });

    autoUpdater.on('update-not-available', () => {
        // Silencioso — no molestamos al usuario si ya está actualizado
    });

    autoUpdater.on('download-progress', (progress) => {
        if (mainWindow) mainWindow.webContents.send('update-status', {
            type: 'downloading',
            percent: Math.round(progress.percent),
            transferred: progress.transferred,
            total: progress.total
        });
    });

    autoUpdater.on('update-downloaded', (info) => {
        if (mainWindow) mainWindow.webContents.send('update-status', {
            type: 'downloaded',
            version: info.version
        });
    });

    autoUpdater.on('error', (err) => {
        console.error('Auto-updater error:', err);
        if (mainWindow) mainWindow.webContents.send('update-status', {
            type: 'error',
            message: err.message
        });
    });

    // Buscar actualizaciones 5 segundos después de arrancar
    setTimeout(() => { autoUpdater.checkForUpdates().catch(console.error); }, 5000);

    // Y cada 4 horas mientras la app esté abierta
    setInterval(() => { autoUpdater.checkForUpdates().catch(console.error); }, 4 * 60 * 60 * 1000);
}

// IPC: el renderer pide iniciar la descarga
ipcMain.handle('update-download', async () => {
    try { autoUpdater.downloadUpdate(); return { ok: true }; }
    catch (e) { return { error: e.message }; }
});

// IPC: el renderer pide instalar y reiniciar
ipcMain.handle('update-install', async () => {
    autoUpdater.quitAndInstall(false, true);
});

// Eventos de la aplicación
app.whenReady().then(async () => {
    // Registrar la DB por defecto si no hay ninguna registrada
    const defaultDb = path.join(__dirname, 'data', 'cementerio.db');
    const reg = loadDbRegistry();
    if (reg.list.length === 0) {
        registerDb(defaultDb, 'Cementerio Principal');
    }

    // Inicializar base de datos activa
    const activeDb = getActiveDbPath();
    dbManager = new DatabaseManager(activeDb);
    try {
        await dbManager.connect();
        await dbManager.insertSampleData();
        await dbManager.seedDefaultEtiquetas();
    } catch (error) {
        console.error('Error inicializando base de datos:', error);
    }

    Menu.setApplicationMenu(null);

    // Verificar licencia antes de mostrar la app
    const licStatus = await license.check();
    if (!licStatus.valid) {
        createActivationWindow(licStatus.reason);
    } else {
        createMainWindow();
        setupAutoUpdater();
        // Avisar al renderer si la licencia expira en menos de 14 días
        if (licStatus.daysLeft !== Infinity && licStatus.daysLeft <= 14) {
            mainWindow.webContents.once('did-finish-load', () => {
                mainWindow.webContents.send('license-expiring-soon', licStatus.daysLeft);
            });
        }
    }

    // En macOS, recrear ventana cuando se hace clic en el dock
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// Cerrar la aplicación cuando todas las ventanas están cerradas
app.on('window-all-closed', async () => {
    // Cerrar conexión a la base de datos
    if (dbManager) {
        await dbManager.close();
    }
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ── License IPC handlers ──────────────────────────────────────────────────────
ipcMain.handle('license-activate',   async (_e, key) => license.activate(key));
ipcMain.handle('license-check',      async ()        => license.check());
ipcMain.handle('license-deactivate', ()              => { license.deactivate(); return true; });
ipcMain.handle('license-info',       ()              => license.getCachedLicense());
ipcMain.handle('open-external',      (_e, url)       => { require('electron').shell.openExternal(url); });

// Eventos IPC (comunicación entre procesos)
ipcMain.handle('app-version', () => {
    return app.getVersion();
});

ipcMain.handle('app-name', () => {
    return app.getName();
});

// Eventos de base de datos
ipcMain.handle('db-get-estadisticas', async () => {
    try {
        return await dbManager.getEstadisticas();
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-get-difuntos', async (event, options = {}) => {
    try {
        const { limit = 100, offset = 0 } = options;
        return await dbManager.getAllDifuntos(limit, offset);
    } catch (error) {
        console.error('Error obteniendo difuntos:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-search-difuntos', async (event, searchTerm) => {
    try {
        return await dbManager.searchDifuntos(searchTerm);
    } catch (error) {
        console.error('Error buscando difuntos:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-get-difunto', async (event, id) => {
    try {
        return await dbManager.getDifunto(id);
    } catch (error) {
        console.error('Error obteniendo difunto:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-create-difunto', async (event, data) => {
    try {
        return await dbManager.createDifunto(data);
    } catch (error) {
        console.error('Error creando difunto:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-update-difunto', async (event, id, data) => {
    try {
        return await dbManager.updateDifunto(id, data);
    } catch (error) {
        console.error('Error actualizando difunto:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-delete-difunto', async (event, id) => {
    try {
        return await dbManager.deleteDifunto(id);
    } catch (error) {
        console.error('Error eliminando difunto:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-get-parcela', async (event, id) => {
    try {
        return await dbManager.getParcela(id);
    } catch (error) {
        console.error('Error obteniendo parcela:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-create-parcela', async (event, data) => {
    try {
        return await dbManager.createParcela(data);
    } catch (error) {
        console.error('Error creando parcela:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-update-parcela', async (event, id, data) => {
    try {
        return await dbManager.updateParcela(id, data);
    } catch (error) {
        console.error('Error actualizando parcela:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-delete-parcela', async (event, id) => {
    try {
        return await dbManager.deleteParcela(id);
    } catch (error) {
        console.error('Error eliminando parcela:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-check-parcela-dependencies', async (event, id) => {
    try {
        // Verificar si la parcela tiene difuntos asignados
        const difuntosAsignados = await dbManager.all(
            'SELECT id, nombre, apellidos FROM difuntos WHERE parcela_id = ? AND estado != "eliminado"', 
            [id]
        );
        
        const parcela = await dbManager.getParcela(id);
        
        return {
            success: true,
            parcela: parcela,
            difuntosAsignados: difuntosAsignados,
            canDelete: difuntosAsignados.length === 0
        };
    } catch (error) {
        console.error('Error verificando dependencias de parcela:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-force-delete-parcela', async (event, id) => {
    try {
        // Primero liberar todos los difuntos asignados
        await dbManager.run(
            'UPDATE difuntos SET parcela_id = NULL WHERE parcela_id = ? AND estado != "eliminado"',
            [id]
        );
        
        // Luego eliminar la parcela
        const result = await dbManager.deleteParcela(id);
        
        // Actualizar estado de parcelas
        await dbManager.updateParcelasEstado();
        
        return result;
    } catch (error) {
        console.error('Error en eliminación forzada de parcela:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-get-parcelas', async () => {
    try {
        return await dbManager.getParcelas();
    } catch (error) {
        console.error('Error obteniendo todas las parcelas:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-get-parcelas-disponibles', async () => {
    try {
        return await dbManager.getParcelasDisponibles();
    } catch (error) {
        console.error('Error obteniendo parcelas:', error);
        return { error: error.message };
    }
});

ipcMain.handle('select-backup-folder', async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Seleccionar carpeta para el respaldo',
            properties: ['openDirectory', 'createDirectory'],
            buttonLabel: 'Seleccionar Carpeta'
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
            return { success: true, folderPath: result.filePaths[0] };
        } else {
            return { success: false, canceled: true };
        }
    } catch (error) {
        console.error('Error seleccionando carpeta:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-backup', async (event, customPath = null) => {
    try {
        return await dbManager.createBackup(customPath);
    } catch (error) {
        console.error('Error creando respaldo:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-optimize', async () => {
    try {
        return await dbManager.optimizeDatabase();
    } catch (error) {
        console.error('Error optimizando base de datos:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-get-size', async () => {
    try {
        return await dbManager.getDatabaseSize();
    } catch (error) {
        console.error('Error obteniendo tamaño de base de datos:', error);
        return { error: error.message };
    }
});

ipcMain.handle('db-get-recent-activity', async (event, limit = 10) => {
    try {
        return await dbManager.getRecentActivity(limit);
    } catch (error) {
        console.error('Error obteniendo actividad reciente:', error);
        return { error: error.message };
    }
});

// Prevenir navegación externa
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (navigationEvent, navigationURL) => {
        event.preventDefault();
    });
});

// Auth
ipcMain.handle('auth-check-password', async (event, password) => {
    try { return await dbManager.checkPassword(password); }
    catch (e) { return false; }
});
ipcMain.handle('auth-set-password', async (event, newPassword) => {
    try { return await dbManager.setPassword(newPassword); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('auth-has-password', async () => {
    try { return await dbManager.hasPassword(); }
    catch (e) { return false; }
});

// Familiares
ipcMain.handle('db-get-familiares', async (event, difuntoId) => {
    try { return await dbManager.getFamiliares(difuntoId); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('db-create-familiar', async (event, data) => {
    try { return await dbManager.createFamiliar(data); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('db-update-familiar', async (event, id, data) => {
    try { return await dbManager.updateFamiliar(id, data); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('db-delete-familiar', async (event, id) => {
    try { return await dbManager.deleteFamiliar(id); }
    catch (e) { return { error: e.message }; }
});

// Pagos
ipcMain.handle('db-get-pagos', async (event, difuntoId) => {
    try { return await dbManager.getPagosByDifunto(difuntoId); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('db-create-pago', async (event, data) => {
    try { return await dbManager.createPago(data); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('db-delete-pago', async (event, id) => {
    try { return await dbManager.deletePago(id); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('db-get-total-pagado', async (event, difuntoId) => {
    try { return await dbManager.getTotalPagadoByDifunto(difuntoId); }
    catch (e) { return 0; }
});

// Reportes PDF
ipcMain.handle('print-to-pdf', async (event, htmlContent) => {
    try {
        const { shell, BrowserWindow } = require('electron');
        const os = require('os');
        const pdfPath = path.join(os.tmpdir(), `cementerio_reporte_${Date.now()}.pdf`);
        const tmpHtml = path.join(os.tmpdir(), `reporte_${Date.now()}.html`);

        fs.writeFileSync(tmpHtml, htmlContent, 'utf-8');

        const win = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
        await win.loadFile(tmpHtml);

        const pdfData = await win.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4'
        });
        win.close();
        fs.writeFileSync(pdfPath, pdfData);
        fs.unlinkSync(tmpHtml);
        await shell.openPath(pdfPath);
        return { success: true, path: pdfPath };
    } catch (e) {
        return { error: e.message };
    }
});


// Etiquetas
ipcMain.handle('etiquetas-get', async (event, categoria) => {
    try { return await dbManager.getEtiquetas(categoria); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('etiquetas-get-all', async () => {
    try { return await dbManager.getAllEtiquetas(); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('etiquetas-create', async (event, data) => {
    try { return await dbManager.createEtiqueta(data); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('etiquetas-update', async (event, id, data) => {
    try { return await dbManager.updateEtiqueta(id, data); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('etiquetas-delete', async (event, id) => {
    try { return await dbManager.deleteEtiqueta(id); }
    catch (e) { return { error: e.message }; }
});
ipcMain.handle('etiquetas-count-parcelas', async (event, categoria, valor) => {
    try { return await dbManager.countParcelasByEtiqueta(categoria, valor); }
    catch (e) { return 0; }
});

ipcMain.handle('db-get-all-pagos', async () => {
    try { return await dbManager.getAllPagos(); }
    catch (e) { return { error: e.message }; }
});

ipcMain.handle('db-delete-sample-data', async () => {
    try { return await dbManager.deleteSampleData(); }
    catch (e) { return { error: e.message }; }
});

// ── Exportar Excel ────────────────────────────────────────────────────────────
ipcMain.handle('export-excel', async (event, { sheets, filename }) => {
    try {
        const XLSX = require('xlsx');
        const os   = require('os');
        const wb   = XLSX.utils.book_new();
        for (const { name, headers, rows, totals } of sheets) {
            const wsData = [headers, ...rows];
            if (totals) wsData.push(totals);
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = headers.map((h, i) => ({
                wch: Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length), 12)
            }));
            XLSX.utils.book_append_sheet(wb, ws, name);
        }
        const dest = path.join(os.homedir(), 'Downloads', filename);
        XLSX.writeFile(wb, dest);
        return { success: true, path: dest };
    } catch (e) { return { error: e.message }; }
});

// ── Multi-DB IPC ──────────────────────────────────────────────────────────────
ipcMain.handle('multidb-list', () => {
    const reg = loadDbRegistry();
    return { list: reg.list, active: getActiveDbPath() };
});

ipcMain.handle('multidb-create', async (event, { name, folder }) => {
    try {
        const safeName = name.replace(/[^a-zA-Z0-9_\-áéíóúüñÁÉÍÓÚÜÑ ]/g, '').trim() || 'cementerio';
        const filename  = safeName.toLowerCase().replace(/\s+/g, '_') + '.db';
        const dbPath    = path.join(folder, filename);
        if (fs.existsSync(dbPath)) return { error: 'Ya existe una base de datos con ese nombre en esa carpeta.' };
        const newDb = new DatabaseManager(dbPath);
        await newDb.connect();
        await newDb.seedDefaultEtiquetas();
        await newDb.close();
        registerDb(dbPath, name);
        return { success: true, path: dbPath };
    } catch (e) { return { error: e.message }; }
});

ipcMain.handle('multidb-open', async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Abrir base de datos existente',
            filters: [{ name: 'Base de Datos SQLite', extensions: ['db', 'sqlite', 'sqlite3'] }],
            properties: ['openFile']
        });
        if (result.canceled || !result.filePaths.length) return { canceled: true };
        const dbPath = result.filePaths[0];
        const name   = path.basename(dbPath, path.extname(dbPath));
        registerDb(dbPath, name);
        return { success: true, path: dbPath };
    } catch (e) { return { error: e.message }; }
});

ipcMain.handle('multidb-switch', async (event, dbPath) => {
    try {
        if (!fs.existsSync(dbPath)) return { error: 'Archivo no encontrado.' };
        const reg  = loadDbRegistry();
        reg.active = dbPath;
        saveDbRegistry(reg);
        // Cerrar DB actual y reiniciar
        await dbManager.close();
        app.relaunch();
        app.exit(0);
        return { success: true };
    } catch (e) { return { error: e.message }; }
});

ipcMain.handle('multidb-select-folder', async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Seleccionar carpeta para la nueva base de datos',
            properties: ['openDirectory', 'createDirectory']
        });
        if (result.canceled || !result.filePaths.length) return { canceled: true };
        return { success: true, folder: result.filePaths[0] };
    } catch (e) { return { error: e.message }; }
});
