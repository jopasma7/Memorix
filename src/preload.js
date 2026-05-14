const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Información de la aplicación
    getAppVersion: () => ipcRenderer.invoke('app-version'),
    getAppName: () => ipcRenderer.invoke('app-name'),
    getElectronVersion: () => process.versions.electron,
    getNodeVersion: () => process.versions.node,
    
    // Eventos del menú
    onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
    
    // APIs de base de datos
    getEstadisticas: () => ipcRenderer.invoke('db-get-estadisticas'),
    getDifuntos: (options) => ipcRenderer.invoke('db-get-difuntos', options),
    getDifunto: (id) => ipcRenderer.invoke('db-get-difunto', id),
    searchDifuntos: (searchTerm) => ipcRenderer.invoke('db-search-difuntos', searchTerm),
    createDifunto: (data) => ipcRenderer.invoke('db-create-difunto', data),
    updateDifunto: (id, data) => ipcRenderer.invoke('db-update-difunto', id, data),
    deleteDifunto: (id) => ipcRenderer.invoke('db-delete-difunto', id),
    createParcela: (data) => ipcRenderer.invoke('db-create-parcela', data),
    getParcela: (id) => ipcRenderer.invoke('db-get-parcela', id),
    updateParcela: (id, data) => ipcRenderer.invoke('db-update-parcela', id, data),
    deleteParcela: (id) => ipcRenderer.invoke('db-delete-parcela', id),
    checkParcelaDependencies: (id) => ipcRenderer.invoke('db-check-parcela-dependencies', id),
    forceDeleteParcela: (id) => ipcRenderer.invoke('db-force-delete-parcela', id),
    getParcelas: () => ipcRenderer.invoke('db-get-parcelas'),
    getParcelasDisponibles: () => ipcRenderer.invoke('db-get-parcelas-disponibles'),
    
    // Funciones de mantenimiento de base de datos
    selectBackupFolder: () => ipcRenderer.invoke('select-backup-folder'),
    backupDatabase: (customPath) => ipcRenderer.invoke('db-backup', customPath),
    optimizeDatabase: () => ipcRenderer.invoke('db-optimize'),
    getDatabaseSize: () => ipcRenderer.invoke('db-get-size'),
    getRecentActivity: (limit) => ipcRenderer.invoke('db-get-recent-activity', limit),
    

    // Auth
    checkPassword: (p) => ipcRenderer.invoke('auth-check-password', p),
    setPassword: (p) => ipcRenderer.invoke('auth-set-password', p),
    hasPassword: () => ipcRenderer.invoke('auth-has-password'),

    // Familiares
    getFamiliares: (id) => ipcRenderer.invoke('db-get-familiares', id),
    createFamiliar: (data) => ipcRenderer.invoke('db-create-familiar', data),
    updateFamiliar: (id, data) => ipcRenderer.invoke('db-update-familiar', id, data),
    deleteFamiliar: (id) => ipcRenderer.invoke('db-delete-familiar', id),

    // Pagos
    getPagos: (difuntoId) => ipcRenderer.invoke('db-get-pagos', difuntoId),
    createPago: (data) => ipcRenderer.invoke('db-create-pago', data),
    deletePago: (id) => ipcRenderer.invoke('db-delete-pago', id),
    getTotalPagado: (difuntoId) => ipcRenderer.invoke('db-get-total-pagado', difuntoId),

    // Reportes
    printToPDF: (html) => ipcRenderer.invoke('print-to-pdf', html),
    getAllPagos: () => ipcRenderer.invoke('db-get-all-pagos'),
    deleteSampleData: () => ipcRenderer.invoke('db-delete-sample-data'),

    // Etiquetas
    getEtiquetas: (categoria) => ipcRenderer.invoke('etiquetas-get', categoria),
    getAllEtiquetas: () => ipcRenderer.invoke('etiquetas-get-all'),
    createEtiqueta: (data) => ipcRenderer.invoke('etiquetas-create', data),
    updateEtiqueta: (id, data) => ipcRenderer.invoke('etiquetas-update', id, data),
    deleteEtiqueta: (id) => ipcRenderer.invoke('etiquetas-delete', id),
    countParcelasByEtiqueta: (categoria, valor) => ipcRenderer.invoke('etiquetas-count-parcelas', categoria, valor),

    // Exportar Excel (delegado al main process)
    exportToExcel: (data) => ipcRenderer.invoke('export-excel', data),

    // Multi-DB
    multidbList:         ()           => ipcRenderer.invoke('multidb-list'),
    multidbCreate:       (data)       => ipcRenderer.invoke('multidb-create', data),
    multidbOpen:         ()           => ipcRenderer.invoke('multidb-open'),
    multidbSwitch:       (dbPath)     => ipcRenderer.invoke('multidb-switch', dbPath),
    multidbSelectFolder: ()           => ipcRenderer.invoke('multidb-select-folder'),

    // Auto-updater
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_e, data) => callback(data)),
    updateDownload: () => ipcRenderer.invoke('update-download'),
    updateInstall:  () => ipcRenderer.invoke('update-install'),

    // Licencia
    licenseActivate:   (key) => ipcRenderer.invoke('license-activate', key),
    licenseCheck:      ()    => ipcRenderer.invoke('license-check'),
    licenseDeactivate: ()    => ipcRenderer.invoke('license-deactivate'),
    licenseInfo:       ()    => ipcRenderer.invoke('license-info'),
    activationSuccess: ()    => ipcRenderer.invoke('activation-success'),
    onActivationReason: (cb) => ipcRenderer.on('activation-reason', (_e, reason) => cb(reason)),
    onLicenseExpiringSoon: (cb) => ipcRenderer.on('license-expiring-soon', (_e, days) => cb(days)),

    // Shell
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // Remover listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
