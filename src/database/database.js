const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseManager {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.ensureDataDirectory();
    }

    // Asegurar que el directorio de datos existe
    ensureDataDirectory() {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    // Conectar a la base de datos
    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.initializeTables()
                        .then(() => this.fixParcelasEstado())
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // Inicializar tablas
    async initializeTables() {
        const tables = [
            // Tabla de difuntos
            `CREATE TABLE IF NOT EXISTS difuntos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                apellidos TEXT NOT NULL,
                fecha_nacimiento DATE,
                fecha_defuncion DATE NOT NULL,
                cedula TEXT UNIQUE,
                sexo TEXT CHECK(sexo IN ('M', 'F')) NOT NULL,
                lugar_nacimiento TEXT,
                causa_muerte TEXT,
                estado TEXT DEFAULT 'activo' CHECK(estado IN ('activo', 'trasladado', 'exhumado', 'eliminado')),
                observaciones TEXT,
                parcela_id INTEGER REFERENCES parcelas(id),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tabla de parcelas/nichos
            `CREATE TABLE IF NOT EXISTS parcelas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo TEXT UNIQUE NOT NULL,
                tipo TEXT NOT NULL,
                zona TEXT NOT NULL DEFAULT 'New',
                seccion TEXT NOT NULL,
                fila INTEGER,
                numero INTEGER,
                ubicacion TEXT NOT NULL DEFAULT 'Center',
                estado TEXT DEFAULT 'disponible' CHECK(estado IN ('disponible', 'ocupada', 'reservada', 'mantenimiento', 'eliminada')),
                precio DECIMAL(10,2),
                observaciones TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tabla de familiares/responsables
            `CREATE TABLE IF NOT EXISTS familiares (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                difunto_id INTEGER,
                nombre TEXT NOT NULL,
                apellidos TEXT NOT NULL,
                relacion TEXT NOT NULL,
                telefono TEXT,
                email TEXT,
                direccion TEXT,
                cedula TEXT,
                es_responsable BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (difunto_id) REFERENCES difuntos (id)
            )`,

            // Tabla de asignaciones (relaciona difuntos con parcelas)
            `CREATE TABLE IF NOT EXISTS asignaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                difunto_id INTEGER,
                parcela_id INTEGER,
                fecha_asignacion DATE NOT NULL,
                fecha_vencimiento DATE,
                tipo_servicio TEXT CHECK(tipo_servicio IN ('perpetuo', 'temporal', 'arrendamiento')),
                costo DECIMAL(10,2),
                estado TEXT DEFAULT 'activa' CHECK(estado IN ('activa', 'vencida', 'cancelada', 'eliminada')),
                observaciones TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (difunto_id) REFERENCES difuntos (id),
                FOREIGN KEY (parcela_id) REFERENCES parcelas (id)
            )`,

            // Tabla de pagos
            `CREATE TABLE IF NOT EXISTS pagos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asignacion_id INTEGER,
                monto DECIMAL(10,2) NOT NULL,
                fecha_pago DATE NOT NULL,
                metodo_pago TEXT CHECK(metodo_pago IN ('efectivo', 'transferencia', 'cheque', 'tarjeta')),
                referencia TEXT,
                concepto TEXT,
                estado TEXT DEFAULT 'completado' CHECK(estado IN ('pendiente', 'completado', 'cancelado')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asignacion_id) REFERENCES asignaciones (id)
            )`,

            // Tabla de configuración
            `CREATE TABLE IF NOT EXISTS configuracion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clave TEXT UNIQUE NOT NULL,
                valor TEXT,
                descripcion TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            // Tabla de etiquetas (tipos de parcela, zonas, ubicaciones)
            `CREATE TABLE IF NOT EXISTS etiquetas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categoria TEXT NOT NULL,
                valor TEXT NOT NULL,
                orden INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(categoria, valor)
            )`
        ];

        for (const sql of tables) {
            await this.run(sql);
        }

        // Indices para optimizar busquedas frecuentes
        const indices = [
            `CREATE INDEX IF NOT EXISTS idx_difuntos_nombre ON difuntos(nombre)`,
            `CREATE INDEX IF NOT EXISTS idx_difuntos_apellidos ON difuntos(apellidos)`,
            `CREATE INDEX IF NOT EXISTS idx_difuntos_estado ON difuntos(estado)`,
            `CREATE INDEX IF NOT EXISTS idx_difuntos_parcela_id ON difuntos(parcela_id)`,
            `CREATE INDEX IF NOT EXISTS idx_difuntos_fecha_defuncion ON difuntos(fecha_defuncion)`,
            `CREATE INDEX IF NOT EXISTS idx_parcelas_estado ON parcelas(estado)`,
            `CREATE INDEX IF NOT EXISTS idx_parcelas_codigo ON parcelas(codigo)`
        ];

        for (const sql of indices) {
            await this.run(sql);
        }


        // Insertar configuración inicial
        await this.insertInitialConfig();

        // Importar datos desde respaldo si existe
        await this.importFromBackup();
    }

    // Arreglar estado de parcelas existentes
    async fixParcelasEstado() {
        try {
            const result = await this.run(`
                UPDATE parcelas 
                SET estado = 'disponible' 
                WHERE estado IS NULL OR estado = ''
            `);
            
            // Limpiar asignaciones duplicadas antes de reasignar
            await this.limpiarAsignacionesDuplicadas();

            // Actualizar estado de parcelas basándose en asignaciones
            await this.updateParcelasEstado();
            
            // Asignar parcelas a difuntos que no las tienen
            await this.asignarParcelasAleatorias();
        } catch (error) {
            console.error('Error corrigiendo estado de parcelas:', error);
        }
    }

    // Limpiar asignaciones duplicadas
    async limpiarAsignacionesDuplicadas() {
        try {
            
            // Encontrar parcelas con múltiples difuntos
            const duplicados = await this.all(`
                SELECT parcela_id, GROUP_CONCAT(id) as difunto_ids, COUNT(*) as count
                FROM difuntos 
                WHERE parcela_id IS NOT NULL AND estado != 'eliminado'
                GROUP BY parcela_id 
                HAVING COUNT(*) > 1
            `);
            
            let limpiados = 0;
            
            for (const duplicado of duplicados) {
                const difuntoIds = duplicado.difunto_ids.split(',');
                
                // Mantener solo el primer difunto, quitar la asignación a los demás
                for (let i = 1; i < difuntoIds.length; i++) {
                    await this.run(`
                        UPDATE difuntos 
                        SET parcela_id = NULL 
                        WHERE id = ?
                    `, [difuntoIds[i]]);
                    limpiados++;
                }
            }
            
            if (limpiados > 0) {
            } else {
            }
            
        } catch (error) {
            console.error('Error limpiando duplicados:', error);
        }
    }

    // Asignar parcelas aleatorias a difuntos sin parcela
    async asignarParcelasAleatorias() {
        try {
            
            // Obtener difuntos sin parcela
            const difuntosSinParcela = await this.all(`
                SELECT id FROM difuntos 
                WHERE parcela_id IS NULL AND estado != 'eliminado'
            `);
            
            // Obtener parcelas realmente disponibles (sin difuntos asignados)
            const parcelasDisponibles = await this.all(`
                SELECT id FROM parcelas 
                WHERE estado != 'eliminada' 
                AND id NOT IN (
                    SELECT DISTINCT parcela_id 
                    FROM difuntos 
                    WHERE parcela_id IS NOT NULL AND estado != 'eliminado'
                )
                ORDER BY RANDOM()
            `);
            
            let asignaciones = 0;
            let parcelaIndex = 0;
            
            
            for (const difunto of difuntosSinParcela) {
                // 80% de probabilidad de asignar parcela
                if (Math.random() > 0.2 && parcelaIndex < parcelasDisponibles.length) {
                    const parcelaId = parcelasDisponibles[parcelaIndex].id;
                    
                    await this.run(`
                        UPDATE difuntos 
                        SET parcela_id = ? 
                        WHERE id = ?
                    `, [parcelaId, difunto.id]);
                    
                    asignaciones++;
                    parcelaIndex++; // Usar la siguiente parcela disponible para evitar duplicados
                }
            }
            
            if (asignaciones > 0) {
                // Actualizar estados después de las asignaciones
                await this.updateParcelasEstado();
            }
            
        } catch (error) {
            console.error('Error asignando parcelas aleatorias:', error);
        }
    }

    // Actualizar estado de parcelas basándose en si tienen difuntos asignados
    async updateParcelasEstado() {
        try {
            
            // Marcar como ocupadas las parcelas que tienen difuntos asignados
            const ocupadasResult = await this.run(`
                UPDATE parcelas 
                SET estado = 'ocupada' 
                WHERE id IN (
                    SELECT DISTINCT p.id 
                    FROM parcelas p 
                    INNER JOIN difuntos d ON p.id = d.parcela_id 
                    WHERE d.estado != 'eliminado' AND p.estado != 'eliminada'
                )
            `);

            // Marcar como disponibles las parcelas que NO tienen difuntos asignados
            const disponiblesResult = await this.run(`
                UPDATE parcelas 
                SET estado = 'disponible' 
                WHERE id NOT IN (
                    SELECT DISTINCT p.id 
                    FROM parcelas p 
                    INNER JOIN difuntos d ON p.id = d.parcela_id 
                    WHERE d.estado != 'eliminado'
                ) AND estado != 'eliminada'
            `);

            
        } catch (error) {
            console.error('Error actualizando estado de parcelas:', error);
        }
    }

    // Importar datos desde respaldo si existe
    async importFromBackup() {
        const backupPath = path.join(__dirname, '..', '..', 'data', 'cementerio_backup.db');
        const fs = require('fs');
        
        if (fs.existsSync(backupPath)) {
            
            try {
                // Conectar a la base de datos de respaldo
                const sqlite3 = require('sqlite3').verbose();
                const backupDb = new sqlite3.Database(backupPath);

                // Importar difuntos (excluyendo los eliminados)
                const difuntos = await new Promise((resolve, reject) => {
                    backupDb.all("SELECT * FROM difuntos WHERE estado != 'eliminado'", (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });

                for (const difunto of difuntos) {
                    try {
                        await this.run(`
                            INSERT OR REPLACE INTO difuntos 
                            (id, nombre, apellidos, fecha_nacimiento, fecha_defuncion, cedula, sexo, lugar_nacimiento, causa_muerte, estado, observaciones, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            difunto.id, difunto.nombre, difunto.apellidos, difunto.fecha_nacimiento, 
                            difunto.fecha_defuncion, difunto.cedula, difunto.sexo, difunto.lugar_nacimiento,
                            difunto.causa_muerte, difunto.estado, difunto.observaciones, difunto.created_at, difunto.updated_at
                        ]);
                    } catch (e) {
                    }
                }

                // Importar parcelas (excluyendo las eliminadas)
                const parcelas = await new Promise((resolve, reject) => {
                    backupDb.all("SELECT * FROM parcelas WHERE estado != 'eliminada'", (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });

                for (const parcela of parcelas) {
                    try {
                        await this.run(`
                            INSERT OR REPLACE INTO parcelas 
                            (id, codigo, tipo, zona, seccion, fila, numero, ubicacion, estado, precio, observaciones, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            parcela.id, parcela.codigo, parcela.tipo, parcela.zona, parcela.seccion,
                            parcela.fila, parcela.numero, parcela.ubicacion, parcela.estado, parcela.precio,
                            parcela.observaciones, parcela.created_at, parcela.updated_at
                        ]);
                    } catch (e) {
                    }
                }

                // Importar asignaciones (excluyendo las eliminadas)
                const asignaciones = await new Promise((resolve, reject) => {
                    backupDb.all("SELECT * FROM asignaciones WHERE estado != 'eliminada'", (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });

                for (const asignacion of asignaciones) {
                    try {
                        await this.run(`
                            INSERT OR REPLACE INTO asignaciones 
                            (id, difunto_id, parcela_id, fecha_asignacion, fecha_vencimiento, tipo_servicio, costo, estado, observaciones, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            asignacion.id, asignacion.difunto_id, asignacion.parcela_id, asignacion.fecha_asignacion,
                            asignacion.fecha_vencimiento, asignacion.tipo_servicio, asignacion.costo, asignacion.estado,
                            asignacion.observaciones, asignacion.created_at
                        ]);
                    } catch (e) {
                    }
                }

                // Cerrar conexión a respaldo
                backupDb.close();
                
                
            } catch (error) {
                console.error('Error durante la importación:', error);
            }
        }
    }

    // Insertar configuración inicial
    async insertInitialConfig() {
        const configs = [
            ['nombre_cementerio', 'Cementerio Municipal', 'Nombre del cementerio'],
            ['direccion', '', 'Dirección del cementerio'],
            ['telefono', '', 'Teléfono de contacto'],
            ['email', '', 'Email de contacto'],
            ['precio_nicho_anual', '0', 'Precio anual de nicho'],
            ['precio_parcela_anual', '0', 'Precio anual de parcela'],
            ['tiempo_mantenimiento_anos', '5', 'Años de mantenimiento incluidos']
        ];

        for (const [clave, valor, descripcion] of configs) {
            await this.run(
                `INSERT OR IGNORE INTO configuracion (clave, valor, descripcion) VALUES (?, ?, ?)`,
                [clave, valor, descripcion]
            );
        }

        // Ejecutar migraciones
        await this.runMigrations();
    }

    // Ejecutar migraciones de la base de datos
    async runMigrations() {
        try {
            // Verificar migraciones para tabla parcelas
            const parcelasInfo = await this.all("PRAGMA table_info(parcelas)");
            const parcelasColumns = parcelasInfo.map(col => col.name);
            
            let needsParcelaMigration = false;
            
            // Verificar si faltan las nuevas columnas en parcelas
            if (!parcelasColumns.includes('zona')) {
                await this.run(`ALTER TABLE parcelas ADD COLUMN zona TEXT DEFAULT 'New'`);
                needsParcelaMigration = true;
            }

            if (!parcelasColumns.includes('ubicacion')) {
                await this.run(`ALTER TABLE parcelas ADD COLUMN ubicacion TEXT DEFAULT 'Center'`);
                needsParcelaMigration = true;
            }

            if (!parcelasColumns.includes('updated_at')) {
                await this.run(`ALTER TABLE parcelas ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
                needsParcelaMigration = true;
            }

            if (needsParcelaMigration) {
                await this.run(`UPDATE parcelas SET zona = 'New' WHERE zona IS NULL OR zona = ''`);
                await this.run(`UPDATE parcelas SET ubicacion = 'Center' WHERE ubicacion IS NULL OR ubicacion = ''`);
            }

            // Verificar migraciones para tabla difuntos
            const difuntosInfo = await this.all("PRAGMA table_info(difuntos)");
            const difuntosColumns = difuntosInfo.map(col => col.name);
            
            let needsDifuntoMigration = false;
            
            // Verificar si falta la columna parcela_id en difuntos
            if (!difuntosColumns.includes('parcela_id')) {
                await this.run(`ALTER TABLE difuntos ADD COLUMN parcela_id INTEGER`);
                needsDifuntoMigration = true;
            }
            
            if (needsDifuntoMigration) {
            }
            
        } catch (error) {
            console.error('❌ Error en migraciones:', error);
        }
    }

    // Validar datos de parcela
    validateParcelaData(data) {
        const validZonas = ['New', 'Old'];
        const validUbicaciones = ['Center', 'Left', 'Right'];
        const validTipos = ['Niche', 'Plot', 'Mausoleum'];

        if (data.zona && !validZonas.includes(data.zona)) {
            throw new Error(`Zona inválida. Debe ser: ${validZonas.join(', ')}`);
        }

        if (data.ubicacion && !validUbicaciones.includes(data.ubicacion)) {
            throw new Error(`Ubicación inválida. Debe ser: ${validUbicaciones.join(', ')}`);
        }

        if (data.tipo && !validTipos.includes(data.tipo)) {
            throw new Error(`Tipo inválido. Debe ser: ${validTipos.join(', ')}`);
        }

        return true;
    }

    // Ejecutar consulta SQL
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('Error ejecutando SQL:', err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Obtener un registro
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('Error obteniendo registro:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Obtener múltiples registros
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Error obteniendo registros:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Cerrar conexión
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // Métodos específicos para difuntos
    async createDifunto(data) {
        // Convertir string vacío a NULL para evitar problemas con UNIQUE constraint
        const cedula = data.cedula && data.cedula.trim() !== '' ? data.cedula : null;
        
        const sql = `
            INSERT INTO difuntos (
                nombre, apellidos, fecha_nacimiento, fecha_defuncion, 
                cedula, sexo, lugar_nacimiento, causa_muerte, observaciones, parcela_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            data.nombre, data.apellidos, data.fecha_nacimiento, data.fecha_defuncion,
            cedula, data.sexo, data.lugar_nacimiento, data.causa_muerte, data.observaciones,
            data.parcela_id || null
        ];
        
        const result = await this.run(sql, params);
        
        // Actualizar estado de la parcela si se asignó una
        if (data.parcela_id) {
            await this.run(`UPDATE parcelas SET estado = 'ocupada' WHERE id = ?`, [data.parcela_id]);
        }
        
        return result;
    }

    async getAllDifuntos(limit = 100, offset = 0) {
        const sql = `
            SELECT d.*, p.codigo as parcela_codigo
            FROM difuntos d
            LEFT JOIN parcelas p ON d.parcela_id = p.id
            WHERE d.estado != 'eliminado'
            ORDER BY d.fecha_defuncion DESC
            LIMIT ? OFFSET ?
        `;
        return await this.all(sql, [limit, offset]);
    }

    async searchDifuntos(searchParams) {
        let sql = `
            SELECT d.*, p.codigo as parcela_codigo
            FROM difuntos d
            LEFT JOIN parcelas p ON d.parcela_id = p.id
            WHERE d.estado != 'eliminado'
        `;
        let params = [];

        // Si es una búsqueda simple (string), buscar en nombre, apellidos y cédula
        if (typeof searchParams === 'string') {
            const searchPattern = `%${searchParams}%`;
            sql += ` AND (d.nombre LIKE ? OR d.apellidos LIKE ? OR d.cedula LIKE ?)`;
            params.push(searchPattern, searchPattern, searchPattern);
        } else {
            // Búsqueda avanzada con múltiples filtros
            if (searchParams.nombre && searchParams.nombre.trim()) {
                sql += ` AND d.nombre LIKE ?`;
                params.push(`%${searchParams.nombre.trim()}%`);
            }
            
            if (searchParams.apellidos && searchParams.apellidos.trim()) {
                sql += ` AND d.apellidos LIKE ?`;
                params.push(`%${searchParams.apellidos.trim()}%`);
            }
            
            if (searchParams.fecha_desde) {
                sql += ` AND d.fecha_defuncion >= ?`;
                params.push(searchParams.fecha_desde);
            }
            
            if (searchParams.fecha_hasta) {
                sql += ` AND d.fecha_defuncion <= ?`;
                params.push(searchParams.fecha_hasta);
            }
            
            if (searchParams.general && searchParams.general.trim()) {
                const searchPattern = `%${searchParams.general.trim()}%`;
                sql += ` AND (d.nombre LIKE ? OR d.apellidos LIKE ? OR d.cedula LIKE ?)`;
                params.push(searchPattern, searchPattern, searchPattern);
            }
        }

        sql += ` ORDER BY d.apellidos, d.nombre`;
        return await this.all(sql, params);
    }

    // Métodos para estadísticas
    async getEstadisticas() {
        const totalDifuntos = await this.get('SELECT COUNT(*) as count FROM difuntos WHERE estado != "eliminado"');
        const difuntosEsteMes = await this.get(`
            SELECT COUNT(*) as count FROM difuntos
            WHERE fecha_defuncion >= date('now', 'start of month')
            AND estado != "eliminado"
        `);
        const totalParcelas = await this.get('SELECT COUNT(*) as count FROM parcelas WHERE estado != "eliminada"');
        const parcelasDisponibles = await this.get('SELECT COUNT(*) as count FROM parcelas WHERE estado = "disponible"');
        const parcelasOcupadas = await this.get('SELECT COUNT(*) as count FROM parcelas WHERE estado = "ocupada"');
        const ingresosEsteMes = await this.get(`
            SELECT COALESCE(SUM(pg.monto), 0) as total
            FROM pagos pg
            WHERE pg.estado = 'completado'
            AND strftime('%Y-%m', pg.fecha_pago) = strftime('%Y-%m', 'now')
        `);
        const ingresosTotal = await this.get(`
            SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE estado = 'completado'
        `);

        return {
            totalDifuntos: totalDifuntos.count,
            difuntosEsteMes: difuntosEsteMes.count,
            totalParcelas: totalParcelas.count,
            parcelasDisponibles: parcelasDisponibles.count,
            parcelasOcupadas: parcelasOcupadas.count,
            ingresosEsteMes: ingresosEsteMes ? ingresosEsteMes.total : 0,
            ingresosTotal: ingresosTotal ? ingresosTotal.total : 0,
            ocupacionPct: totalParcelas.count > 0
                ? Math.round((parcelasOcupadas.count / totalParcelas.count) * 100)
                : 0
        };
    }

    async getAllPagos() {
        return await this.all(`
            SELECT pg.*, d.nombre, d.apellidos, p.codigo as parcela_codigo
            FROM pagos pg
            JOIN asignaciones a ON pg.asignacion_id = a.id
            JOIN difuntos d ON a.difunto_id = d.id
            LEFT JOIN parcelas p ON a.parcela_id = p.id
            WHERE pg.estado = 'completado'
            ORDER BY pg.fecha_pago DESC
        `);
    }

    async deleteSampleData() {
        // Remove difuntos/parcelas created by insertSampleData (id <= 10 and low IDs)
        // Strategy: delete all data then reset sequences
        await this.run('DELETE FROM pagos');
        await this.run('DELETE FROM asignaciones');
        await this.run('DELETE FROM familiares');
        await this.run('UPDATE difuntos SET parcela_id = NULL WHERE id > 0');
        await this.run('DELETE FROM difuntos');
        await this.run('UPDATE parcelas SET estado = "disponible"');
        await this.run('DELETE FROM parcelas');
        await this.run("DELETE FROM sqlite_sequence WHERE name IN ('difuntos','parcelas','familiares','pagos','asignaciones')");
        return { success: true };
    }

    // Métodos para parcelas
    async createParcela(data) {
        // Validar datos antes de insertar
        this.validateParcelaData(data);
        
        const sql = `
            INSERT INTO parcelas (codigo, tipo, zona, seccion, fila, numero, ubicacion, estado, precio, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.codigo, 
            data.tipo, 
            data.zona || 'New',
            data.seccion, 
            data.fila, 
            data.numero, 
            data.ubicacion || 'Center',
            data.estado || 'disponible',
            data.precio, 
            data.observaciones
        ];
        return await this.run(sql, params);
    }

    async getParcelasDisponibles() {
        const sql = `
            SELECT p.* FROM parcelas p
            LEFT JOIN difuntos d ON p.id = d.parcela_id AND d.estado != 'eliminado'
            WHERE p.estado != 'eliminada' AND d.parcela_id IS NULL
            ORDER BY p.seccion, p.fila, p.numero
        `;
        return await this.all(sql);
    }

    // Obtener todas las parcelas
    async getParcelas() {
        const sql = `
            SELECT p.*, 
                   CASE 
                       WHEN d.parcela_id IS NOT NULL THEN 'ocupada'
                       ELSE 'disponible'
                   END as estado
            FROM parcelas p
            LEFT JOIN difuntos d ON p.id = d.parcela_id AND d.estado != 'eliminado'
            WHERE p.estado != 'eliminada'
            ORDER BY p.seccion, p.fila, p.numero
        `;
        return await this.all(sql);
    }

    // Obtener todos los difuntos
    async getDifuntos() {
        return await this.all(`
            SELECT d.*, p.codigo as parcela_codigo 
            FROM difuntos d 
            LEFT JOIN parcelas p ON d.parcela_id = p.id 
            ORDER BY d.apellidos, d.nombre
        `);
    }

    // Insertar datos de ejemplo
    async insertSampleData() {
        try {
            // Verificar si ya existen datos
            const existingParcelas = await this.getParcelas();
            const existingDifuntos = await this.getDifuntos();
            
            if (existingParcelas.length > 50 && existingDifuntos.length > 50) {
                return; // Ya hay suficientes datos
            }

            // Generar 120 parcelas de ejemplo
            const tiposParcelas = ['nicho', 'parcela', 'mausoleo']; // Solo tipos válidos
            const zonas = ['Nueva', 'Vieja']; // Solo zonas válidas
            const ubicaciones = ['Centro', 'Izquierda', 'Derecha']; // Solo ubicaciones válidas
            const secciones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            
            let parcelasCreadas = 0;
            const targetParcelas = 120;

            // Solo insertar si no existen muchas parcelas
            if (existingParcelas.length < 50) {
                for (let i = 1; i <= targetParcelas && parcelasCreadas < targetParcelas; i++) {
                    const seccion = secciones[Math.floor(Math.random() * secciones.length)];
                    const fila = Math.floor((i + existingParcelas.length) / 15) + 1;
                    const numero = (((i + existingParcelas.length) - 1) % 15) + 1;
                    const tipo = tiposParcelas[Math.floor(Math.random() * tiposParcelas.length)];
                    
                    const parcela = {
                        codigo: `${seccion}-${fila.toString().padStart(2,'0')}-${numero.toString().padStart(3,'0')}`,
                        tipo: tipo,
                        zona: zonas[Math.floor(Math.random() * zonas.length)],
                        seccion: seccion,
                        fila: fila,
                        numero: numero,
                        ubicacion: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
                        precio: tipo === 'mausoleo' ? 5000 + Math.random() * 5000 : 
                               tipo === 'parcela' ? 2000 + Math.random() * 3000 :
                               1000 + Math.random() * 2000 // nicho
                    };

                    try {
                        await this.createParcela(parcela);
                        parcelasCreadas++;
                    } catch (err) {
                        console.error('Error insertando parcela:', err.message);
                        // Continúa con la siguiente parcela
                    }
                }
            }

            // Generar 100 difuntos de ejemplo
            const nombres = [
                'José', 'Manuel', 'Antonio', 'Francisco', 'Luis', 'Juan', 'Ángel', 'Miguel', 'Jesús', 'Carlos',
                'Rafael', 'Pedro', 'Pablo', 'Alejandro', 'Fernando', 'Eduardo', 'Roberto', 'Sergio', 'Jorge', 'Ricardo',
                'María', 'Carmen', 'Ana', 'Isabel', 'Pilar', 'Mercedes', 'Josefa', 'Dolores', 'Antonia', 'Francisca',
                'Teresa', 'Rosa', 'Concepción', 'Esperanza', 'Ángeles', 'Manuela', 'Cristina', 'Elena', 'Lucía', 'Marta',
                'Victoria', 'Amparo', 'Patricia', 'Raquel', 'Beatriz', 'Silvia', 'Mónica', 'Susana', 'Consuelo', 'Remedios'
            ];
            
            const apellidos = [
                'García', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
                'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez',
                'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez',
                'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias',
                'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez'
            ];

            const ciudades = [
                'Madrid, España', 'Barcelona, España', 'Valencia, España', 'Sevilla, España', 'Zaragoza, España',
                'Málaga, España', 'Murcia, España', 'Palma, España', 'Bilbao, España', 'Alicante, España',
                'Córdoba, España', 'Valladolid, España', 'Vigo, España', 'Gijón, España', 'Granada, España',
                'Vitoria, España', 'Elche, España', 'Oviedo, España', 'Badalona, España', 'Cartagena, España',
                'Alcoy, España', 'Elda, España', 'Petrer, España', 'Villena, España', 'Denia, España'
            ];

            const causas = [
                'Enfermedad cardiovascular', 'Cáncer', 'Enfermedad respiratoria', 'Accidente cerebrovascular',
                'Diabetes', 'Alzheimer', 'Neumonía', 'Enfermedad renal', 'Septicemia', 'Accidente',
                'Enfermedad hepática', 'Enfermedad neurológica', 'Infección', 'Complicaciones quirúrgicas',
                'Causas naturales', 'Enfermedad pulmonar', 'Hipertensión', 'Insuficiencia cardíaca'
            ];

            let difuntosCreados = 0;
            const targetDifuntos = 100;

            // Solo insertar si no existen muchos difuntos
            if (existingDifuntos.length < 50) {
                for (let i = 1; i <= targetDifuntos && difuntosCreados < targetDifuntos; i++) {
                    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
                    const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
                    const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
                    const sexo = Math.random() > 0.5 ? 'M' : 'F';
                    
                    // Generar fechas aleatorias
                    const fechaNac = new Date(1920 + Math.random() * 80, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
                    const fechaDef = new Date(fechaNac.getTime() + (20 + Math.random() * 60) * 365.25 * 24 * 60 * 60 * 1000);
                    
                    const difunto = {
                        nombre: nombre,
                        apellidos: `${apellido1} ${apellido2}`,
                        fecha_nacimiento: fechaNac.toISOString().split('T')[0],
                        fecha_defuncion: fechaDef.toISOString().split('T')[0],
                        sexo: sexo,
                        documento: `${Math.floor(10000000 + Math.random() * 90000000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                        lugar_nacimiento: ciudades[Math.floor(Math.random() * ciudades.length)],
                        causa_muerte: causas[Math.floor(Math.random() * causas.length)],
                        estado: 'activo',
                        parcela_id: Math.random() > 0.2 ? Math.floor(Math.random() * 120) + 1 : null // 80% tienen parcela
                    };

                    try {
                        await this.createDifunto(difunto);
                        difuntosCreados++;
                    } catch (err) {
                        console.error('Error insertando difunto:', err.message);
                        // Continúa con el siguiente difunto
                    }
                }
            }


        } catch (error) {
            console.error('Error generando datos de ejemplo:', error);
            throw error;
        }
    }

    // Métodos CRUD para difuntos individuales
    async getDifunto(id) {
        return await this.get(`
            SELECT d.*, p.codigo as parcela_codigo 
            FROM difuntos d 
            LEFT JOIN parcelas p ON d.parcela_id = p.id 
            WHERE d.id = ?
        `, [id]);
    }

    async updateDifunto(id, data) {
        // Convertir string vacío a NULL para evitar problemas con UNIQUE constraint
        const cedula = data.cedula && data.cedula.trim() !== '' ? data.cedula : null;
        
        // Obtener la parcela anterior del difunto
        const difuntoAnterior = await this.get('SELECT parcela_id FROM difuntos WHERE id = ?', [id]);
        const parcelaAnterior = difuntoAnterior ? difuntoAnterior.parcela_id : null;
        const parcelaNueva = data.parcela_id || null;
        
        const sql = `
            UPDATE difuntos SET 
                nombre = ?, apellidos = ?, fecha_nacimiento = ?, fecha_defuncion = ?,
                cedula = ?, sexo = ?, lugar_nacimiento = ?, causa_muerte = ?, observaciones = ?, parcela_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const params = [
            data.nombre, data.apellidos, data.fecha_nacimiento, data.fecha_defuncion,
            cedula, data.sexo, data.lugar_nacimiento, data.causa_muerte, data.observaciones, 
            parcelaNueva, id
        ];
        
        const result = await this.run(sql, params);
        
        // Actualizar estados de parcelas si hubo cambio
        if (parcelaAnterior !== parcelaNueva) {
            // Si tenía una parcela anterior, verificar si queda disponible
            if (parcelaAnterior) {
                const otrosDifuntos = await this.get(
                    'SELECT COUNT(*) as count FROM difuntos WHERE parcela_id = ? AND id != ? AND estado != "eliminado"', 
                    [parcelaAnterior, id]
                );
                if (otrosDifuntos.count === 0) {
                    await this.run(`UPDATE parcelas SET estado = 'disponible' WHERE id = ?`, [parcelaAnterior]);
                }
            }
            
            // Si tiene nueva parcela, marcarla como ocupada
            if (parcelaNueva) {
                await this.run(`UPDATE parcelas SET estado = 'ocupada' WHERE id = ?`, [parcelaNueva]);
            }
        }
        
        return result;
    }

    async deleteDifunto(id) {
        try {
            // Obtener información del difunto antes de eliminarlo para logging
            const difunto = await this.get('SELECT * FROM difuntos WHERE id = ?', [id]);
            
            // En lugar de eliminar físicamente, marcamos como eliminado
            // Primero actualizamos las asignaciones relacionadas (sin updated_at porque no existe en asignaciones)
            await this.run('UPDATE asignaciones SET estado = "eliminada" WHERE difunto_id = ?', [id]);
            
            // Liberar la parcela asignada (muy importante para que la parcela quede disponible)
            if (difunto && difunto.parcela_id) {
                await this.run('UPDATE difuntos SET parcela_id = NULL WHERE id = ?', [id]);
            }
            
            // Luego marcamos el difunto como eliminado (eliminación lógica)
            const result = await this.run('UPDATE difuntos SET estado = "eliminado", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
            
            // Actualizar estado de parcelas después de la eliminación
            await this.updateParcelasEstado();
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error eliminando difunto ${id}:`, error);
            throw error;
        }
    }

    // Métodos CRUD para parcelas individuales
    async getParcela(id) {
        return await this.get('SELECT * FROM parcelas WHERE id = ?', [id]);
    }

    async updateParcela(id, data) {
        // Validar datos antes de actualizar
        this.validateParcelaData(data);
        
        // Verificar si la columna updated_at existe
        const tableInfo = await this.all("PRAGMA table_info(parcelas)");
        const columnNames = tableInfo.map(col => col.name);
        const hasUpdatedAt = columnNames.includes('updated_at');
        
        const sql = `
            UPDATE parcelas SET 
                codigo = ?, tipo = ?, zona = ?, seccion = ?, fila = ?, numero = ?, ubicacion = ?, precio = ?, observaciones = ?${hasUpdatedAt ? ', updated_at = CURRENT_TIMESTAMP' : ''}
            WHERE id = ?
        `;
        
        const params = [
            data.codigo, 
            data.tipo, 
            data.zona || 'New',
            data.seccion, 
            data.fila, 
            data.numero, 
            data.ubicacion || 'Center',
            data.precio, 
            data.observaciones, 
            id
        ];
        
        return await this.run(sql, params);
    }

    async deleteParcela(id) {
        try {
            // Obtener información de la parcela antes de eliminarla
            const parcela = await this.get('SELECT * FROM parcelas WHERE id = ?', [id]);
            
            // Verificar si hay difuntos activos asignados a esta parcela
            const difuntosAsignados = await this.all(`
                SELECT * FROM difuntos 
                WHERE parcela_id = ? AND estado != 'eliminado'
            `, [id]);
            
            if (difuntosAsignados.length > 0) {
                throw new Error(`No se puede eliminar la parcela porque tiene ${difuntosAsignados.length} difunto(s) asignado(s). Primero debe reasignar o eliminar los difuntos.`);
            }
            
            // Actualizar asignaciones históricas (sin updated_at porque no existe en asignaciones)
            await this.run('UPDATE asignaciones SET estado = "eliminada" WHERE parcela_id = ?', [id]);
            
            // Liberar cualquier difunto que tenga esta parcela asignada (por si acaso)
            const difuntosConParcela = await this.all('SELECT id FROM difuntos WHERE parcela_id = ?', [id]);
            if (difuntosConParcela.length > 0) {
                await this.run('UPDATE difuntos SET parcela_id = NULL WHERE parcela_id = ?', [id]);
            }
            
            // Marcar la parcela como eliminada (eliminación lógica)
            const result = await this.run('UPDATE parcelas SET estado = "eliminada", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error eliminando parcela ${id}:`, error);
            throw error;
        }
    }

    // Crear respaldo de la base de datos

    async checkPassword(password) {
        const row = await this.get("SELECT valor FROM configuracion WHERE clave = 'password_hash'");
        if (!row) return true;
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        return row.valor === hash;
    }

    async setPassword(newPassword) {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(newPassword).digest('hex');
        await this.run(
            `INSERT OR REPLACE INTO configuracion (clave, valor, descripcion) VALUES ('password_hash', ?, 'Contraseña de acceso')`,
            [hash]
        );
        return { success: true };
    }

    async hasPassword() {
        const row = await this.get("SELECT valor FROM configuracion WHERE clave = 'password_hash'");
        return !!row;
    }

    async getFamiliares(difuntoId) {
        return await this.all(
            'SELECT * FROM familiares WHERE difunto_id = ? ORDER BY es_responsable DESC, nombre ASC',
            [difuntoId]
        );
    }

    async createFamiliar(data) {
        const sql = `INSERT INTO familiares (difunto_id, nombre, apellidos, relacion, telefono, email, direccion, cedula, es_responsable)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        return await this.run(sql, [
            data.difunto_id, data.nombre, data.apellidos, data.relacion,
            data.telefono || null, data.email || null, data.direccion || null,
            data.cedula || null, data.es_responsable ? 1 : 0
        ]);
    }

    async updateFamiliar(id, data) {
        const sql = `UPDATE familiares SET nombre=?, apellidos=?, relacion=?, telefono=?, email=?, direccion=?, cedula=?, es_responsable=? WHERE id=?`;
        return await this.run(sql, [
            data.nombre, data.apellidos, data.relacion,
            data.telefono || null, data.email || null, data.direccion || null,
            data.cedula || null, data.es_responsable ? 1 : 0, id
        ]);
    }

    async deleteFamiliar(id) {
        return await this.run('DELETE FROM familiares WHERE id = ?', [id]);
    }

    async getPagosByDifunto(difuntoId) {
        return await this.all(`
            SELECT pg.*, a.tipo_servicio, a.fecha_asignacion
            FROM pagos pg
            JOIN asignaciones a ON pg.asignacion_id = a.id
            JOIN difuntos d ON a.difunto_id = d.id
            WHERE d.id = ? AND a.estado != 'eliminada'
            ORDER BY pg.fecha_pago DESC
        `, [difuntoId]);
    }

    async createPago(data) {
        // Buscar o crear asignación activa para el difunto
        let asignacion = await this.get(
            "SELECT id FROM asignaciones WHERE difunto_id = ? AND estado = 'activa' LIMIT 1",
            [data.difunto_id]
        );
        if (!asignacion) {
            // Buscar parcela_id del difunto si tiene una asignada
            const difunto = await this.get('SELECT parcela_id FROM difuntos WHERE id = ?', [data.difunto_id]);
            const parcelaId = difunto ? difunto.parcela_id : null;
            const res = await this.run(
                "INSERT INTO asignaciones (difunto_id, parcela_id, fecha_asignacion, tipo_servicio, estado) VALUES (?, ?, date('now'), 'perpetuo', 'activa')",
                [data.difunto_id, parcelaId]
            );
            asignacion = { id: res.lastID };
        }
        const sql = `INSERT INTO pagos (asignacion_id, monto, fecha_pago, metodo_pago, referencia, concepto, estado)
                     VALUES (?, ?, ?, ?, ?, ?, 'completado')`;
        return await this.run(sql, [
            asignacion.id, data.monto, data.fecha_pago,
            data.metodo_pago || 'efectivo', data.referencia || null, data.concepto || null
        ]);
    }

    async deletePago(id) {
        return await this.run('DELETE FROM pagos WHERE id = ?', [id]);
    }

    async getTotalPagadoByDifunto(difuntoId) {
        const row = await this.get(`
            SELECT COALESCE(SUM(pg.monto), 0) as total
            FROM pagos pg
            JOIN asignaciones a ON pg.asignacion_id = a.id
            WHERE a.difunto_id = ? AND pg.estado = 'completado'
        `, [difuntoId]);
        return row ? row.total : 0;
    }

    async createBackup(customPath = null) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `cementerio_backup_${timestamp}.db`;
            
            // Usar ruta personalizada o ruta por defecto
            let backupDir;
            if (customPath) {
                backupDir = customPath;
            } else {
                backupDir = path.join(__dirname, '..', '..', 'backups');
            }
            
            const backupPath = path.join(backupDir, backupFileName);

            // Crear directorio de respaldos si no existe
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            // Copiar archivo de base de datos
            await fs.promises.copyFile(this.dbPath, backupPath);

            // Obtener información del respaldo
            const stats = await fs.promises.stat(backupPath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

            return {
                success: true,
                message: 'Respaldo creado exitosamente',
                backupPath: backupPath,
                fileName: backupFileName,
                size: sizeInMB + ' MB',
                date: new Date().toLocaleString('es-ES'),
                customPath: customPath !== null
            };
        } catch (error) {
            console.error('Error creando respaldo:', error);
            throw new Error(`Error al crear respaldo: ${error.message}`);
        }
    }

    // Optimizar base de datos
    async optimizeDatabase() {
        try {
            const startTime = Date.now();
            const results = [];

            // Ejecutar VACUUM para recompilar y optimizar la base de datos
            await new Promise((resolve, reject) => {
                this.db.run('VACUUM', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        results.push('VACUUM ejecutado correctamente');
                        resolve();
                    }
                });
            });

            // Ejecutar ANALYZE para actualizar estadísticas de consulta
            await new Promise((resolve, reject) => {
                this.db.run('ANALYZE', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        results.push('ANALYZE ejecutado correctamente');
                        resolve();
                    }
                });
            });

            // Verificar integridad de la base de datos
            const integrityResult = await new Promise((resolve, reject) => {
                this.db.get('PRAGMA integrity_check', (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            const integrityStatus = integrityResult['integrity_check'] === 'ok' ? 
                'Base de datos íntegra' : 
                'Problemas de integridad detectados';
            results.push(integrityStatus);

            const endTime = Date.now();
            const executionTime = ((endTime - startTime) / 1000).toFixed(2);

            return {
                success: true,
                message: 'Optimización completada exitosamente',
                results: results,
                executionTime: executionTime + ' segundos',
                date: new Date().toLocaleString('es-ES')
            };
        } catch (error) {
            console.error('Error optimizando base de datos:', error);
            throw new Error(`Error al optimizar base de datos: ${error.message}`);
        }
    }

    // Obtener tamaño de la base de datos
    async getDatabaseSize() {
        try {
            const stats = await fs.promises.stat(this.dbPath);
            const sizeInBytes = stats.size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(2);
            const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

            // Obtener información adicional de la base de datos
            const pageCount = await new Promise((resolve, reject) => {
                this.db.get('PRAGMA page_count', (err, row) => {
                    if (err) reject(err);
                    else resolve(row.page_count);
                });
            });

            const pageSize = await new Promise((resolve, reject) => {
                this.db.get('PRAGMA page_size', (err, row) => {
                    if (err) reject(err);
                    else resolve(row.page_size);
                });
            });

            const freePages = await new Promise((resolve, reject) => {
                this.db.get('PRAGMA freelist_count', (err, row) => {
                    if (err) reject(err);
                    else resolve(row.freelist_count);
                });
            });

            const usedSpace = ((pageCount - freePages) * pageSize / (1024 * 1024)).toFixed(2);
            const freeSpace = (freePages * pageSize / (1024 * 1024)).toFixed(2);

            return {
                success: true,
                fileSize: {
                    bytes: sizeInBytes,
                    kb: sizeInKB + ' KB',
                    mb: sizeInMB + ' MB'
                },
                database: {
                    totalPages: pageCount,
                    pageSize: pageSize + ' bytes',
                    usedSpace: usedSpace + ' MB',
                    freeSpace: freeSpace + ' MB',
                    freePages: freePages
                },
                lastModified: stats.mtime.toLocaleString('es-ES')
            };
        } catch (error) {
            console.error('Error obteniendo tamaño de base de datos:', error);
            throw new Error(`Error al obtener información de la base de datos: ${error.message}`);
        }
    }

    // Obtener actividad reciente
    async getRecentActivity(limit = 10) {
        try {
            // Obtener actividad de difuntos (creación, modificación y eliminación)
            const difuntosActivity = await new Promise((resolve, reject) => {
                this.db.all(`
                    SELECT 
                        'difunto' as tipo,
                        CASE 
                            WHEN estado = 'eliminado' THEN 'Eliminado'
                            WHEN updated_at IS NOT NULL AND created_at IS NOT NULL 
                                 AND datetime(updated_at) > datetime(created_at) THEN 'Modificado'
                            ELSE 'Nuevo registro'
                        END as accion,
                        nombre || ' ' || apellidos as descripcion,
                        CASE 
                            WHEN estado = 'eliminado' THEN updated_at
                            WHEN updated_at IS NOT NULL AND created_at IS NOT NULL 
                                 AND datetime(updated_at) > datetime(created_at) THEN updated_at
                            ELSE created_at
                        END as fecha,
                        id
                    FROM difuntos 
                    WHERE (created_at IS NOT NULL OR updated_at IS NOT NULL)
                    ORDER BY 
                        CASE 
                            WHEN estado = 'eliminado' THEN datetime(updated_at)
                            WHEN updated_at IS NOT NULL AND created_at IS NOT NULL 
                                 AND datetime(updated_at) > datetime(created_at) THEN datetime(updated_at)
                            ELSE datetime(created_at)
                        END DESC 
                    LIMIT ?
                `, [Math.ceil(limit * 0.6)], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            // Obtener actividad de parcelas (creación, modificación y eliminación)
            const parcelasActivity = await new Promise((resolve, reject) => {
                this.db.all(`
                    SELECT 
                        'parcela' as tipo,
                        CASE 
                            WHEN estado = 'eliminada' THEN 'Eliminada'
                            WHEN updated_at IS NOT NULL AND created_at IS NOT NULL 
                                 AND datetime(updated_at) > datetime(created_at) THEN 'Modificada'
                            ELSE 'Nueva parcela'
                        END as accion,
                        CASE 
                            WHEN codigo IS NOT NULL AND codigo != '' 
                            THEN 'Parcela ' || codigo || ' (' || tipo || ')'
                            ELSE 'Parcela #' || numero || ' (' || tipo || ')'
                        END as descripcion,
                        CASE 
                            WHEN estado = 'eliminada' THEN updated_at
                            WHEN updated_at IS NOT NULL AND created_at IS NOT NULL 
                                 AND datetime(updated_at) > datetime(created_at) THEN updated_at
                            ELSE created_at
                        END as fecha,
                        id
                    FROM parcelas 
                    WHERE (created_at IS NOT NULL OR updated_at IS NOT NULL)
                    ORDER BY 
                        CASE 
                            WHEN estado = 'eliminada' THEN datetime(updated_at)
                            WHEN updated_at IS NOT NULL AND created_at IS NOT NULL 
                                 AND datetime(updated_at) > datetime(created_at) THEN datetime(updated_at)
                            ELSE datetime(created_at)
                        END DESC 
                    LIMIT ?
                `, [Math.ceil(limit * 0.4)], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            // Combinar y ordenar por fecha
            const allActivity = [...difuntosActivity, ...parcelasActivity]
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, limit)
                .map(item => ({
                    ...item,
                    fecha: new Date(item.fecha).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    fechaRaw: item.fecha
                }));
            return allActivity;
        } catch (error) {
            // Devolver datos de ejemplo si hay error
            return [
                {
                    tipo: 'sistema',
                    accion: 'Sistema iniciado',
                    descripcion: 'Aplicación iniciada correctamente',
                    fecha: new Date().toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    fechaRaw: new Date().toISOString(),
                    id: 'system'
                },
                {
                    tipo: 'sistema',
                    accion: 'Base de datos',
                    descripcion: 'Conexión establecida exitosamente',
                    fecha: new Date(Date.now() - 1000).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    fechaRaw: new Date(Date.now() - 1000).toISOString(),
                    id: 'db'
                }
            ];
        }
    }

    // ── ETIQUETAS ─────────────────────────────────────────────────────────────
    async getEtiquetas(categoria) {
        return this.all('SELECT * FROM etiquetas WHERE categoria = ? ORDER BY orden, valor', [categoria]);
    }

    async getAllEtiquetas() {
        return this.all('SELECT * FROM etiquetas ORDER BY categoria, orden, valor');
    }

    async createEtiqueta(data) {
        return this.run(
            'INSERT INTO etiquetas (categoria, valor, orden) VALUES (?, ?, ?)',
            [data.categoria, data.valor, data.orden || 0]
        );
    }

    async updateEtiqueta(id, data) {
        return this.run(
            'UPDATE etiquetas SET valor = ?, orden = ? WHERE id = ?',
            [data.valor, data.orden || 0, id]
        );
    }

    async deleteEtiqueta(id) {
        return this.run('DELETE FROM etiquetas WHERE id = ?', [id]);
    }

    async countParcelasByEtiqueta(categoria, valor) {
        const col = { tipo: 'tipo', zona: 'zona', ubicacion: 'ubicacion' }[categoria];
        if (!col) return 0;
        const row = await this.get(`SELECT COUNT(*) as n FROM parcelas WHERE ${col} LIKE ?`, [valor]);
        return row ? row.n : 0;
    }

    async seedSampleData(lang = 'en') {
        // Only seed if DB is completely empty
        const existing = await this.get('SELECT COUNT(*) as n FROM parcelas');
        if (existing && existing.n > 0) return;

        const isEs = lang === 'es';

        const parcelas = isEs ? [
            { codigo: 'A-001', tipo: 'Parcela',  zona: 'Nuevo',   seccion: 'A', fila: 1, numero: 1, ubicacion: 'Izquierda', estado: 'ocupada',    precio: 1200, observaciones: '' },
            { codigo: 'B-001', tipo: 'Nicho',    zona: 'Antiguo', seccion: 'B', fila: 1, numero: 1, ubicacion: 'Centro',    estado: 'ocupada',    precio: 800,  observaciones: '' },
            { codigo: 'B-002', tipo: 'Nicho',    zona: 'Antiguo', seccion: 'B', fila: 1, numero: 2, ubicacion: 'Derecha',   estado: 'ocupada',    precio: 800,  observaciones: '' },
            { codigo: 'C-001', tipo: 'Mausoleo', zona: 'Antiguo', seccion: 'C', fila: 1, numero: 1, ubicacion: 'Centro',    estado: 'ocupada',    precio: 5000, observaciones: 'Mausoleo familiar' },
            { codigo: 'A-002', tipo: 'Parcela',  zona: 'Nuevo',   seccion: 'A', fila: 1, numero: 2, ubicacion: 'Centro',    estado: 'disponible', precio: 1200, observaciones: '' },
            { codigo: 'A-003', tipo: 'Parcela',  zona: 'Nuevo',   seccion: 'A', fila: 1, numero: 3, ubicacion: 'Derecha',   estado: 'reservada',  precio: 1200, observaciones: 'Reservada familia García' },
        ] : [
            { codigo: 'A-001', tipo: 'Plot',      zona: 'New', seccion: 'A', fila: 1, numero: 1, ubicacion: 'Left',   estado: 'ocupada',    precio: 1200, observaciones: '' },
            { codigo: 'B-001', tipo: 'Niche',     zona: 'Old', seccion: 'B', fila: 1, numero: 1, ubicacion: 'Center', estado: 'ocupada',    precio: 800,  observaciones: '' },
            { codigo: 'B-002', tipo: 'Niche',     zona: 'Old', seccion: 'B', fila: 1, numero: 2, ubicacion: 'Right',  estado: 'ocupada',    precio: 800,  observaciones: '' },
            { codigo: 'C-001', tipo: 'Mausoleum', zona: 'Old', seccion: 'C', fila: 1, numero: 1, ubicacion: 'Center', estado: 'ocupada',    precio: 5000, observaciones: 'Family mausoleum' },
            { codigo: 'A-002', tipo: 'Plot',      zona: 'New', seccion: 'A', fila: 1, numero: 2, ubicacion: 'Center', estado: 'disponible', precio: 1200, observaciones: '' },
            { codigo: 'A-003', tipo: 'Plot',      zona: 'New', seccion: 'A', fila: 1, numero: 3, ubicacion: 'Right',  estado: 'reservada',  precio: 1200, observaciones: 'Reserved for Johnson family' },
        ];

        const parcelaIds = {};
        for (const p of parcelas) {
            const r = await this.run(
                'INSERT OR IGNORE INTO parcelas (codigo, tipo, zona, seccion, fila, numero, ubicacion, estado, precio, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [p.codigo, p.tipo, p.zona, p.seccion, p.fila, p.numero, p.ubicacion, p.estado, p.precio, p.observaciones]
            );
            parcelaIds[p.codigo] = r.id;
        }

        const difuntos = isEs ? [
            { nombre: 'José',    apellidos: 'Martínez López',   cedula: '12345678A', sexo: 'M', fecha_nacimiento: '1935-04-12', fecha_defuncion: '2018-08-23', lugar_nacimiento: 'Valencia',    causa_muerte: 'Enfermedad cardiovascular', parcela: 'A-001' },
            { nombre: 'María',   apellidos: 'García Fernández', cedula: '87654321B', sexo: 'F', fecha_nacimiento: '1942-11-30', fecha_defuncion: '2021-03-15', lugar_nacimiento: 'Alicante',    causa_muerte: 'Insuficiencia renal',       parcela: 'B-001' },
            { nombre: 'Antonio', apellidos: 'Sánchez Ruiz',     cedula: '11223344C', sexo: 'M', fecha_nacimiento: '1928-06-05', fecha_defuncion: '2015-12-01', lugar_nacimiento: 'Murcia',      causa_muerte: 'Vejez',                     parcela: 'B-002' },
            { nombre: 'Carmen',  apellidos: 'López Moreno',     cedula: '44332211D', sexo: 'F', fecha_nacimiento: '1950-02-18', fecha_defuncion: '2023-07-09', lugar_nacimiento: 'Madrid',      causa_muerte: 'Cáncer',                    parcela: 'C-001' },
        ] : [
            { nombre: 'John',     apellidos: 'Smith',    cedula: '123456789', sexo: 'M', fecha_nacimiento: '1938-03-22', fecha_defuncion: '2019-11-14', lugar_nacimiento: 'New York',    causa_muerte: 'Heart disease',  parcela: 'A-001' },
            { nombre: 'Mary',     apellidos: 'Johnson',  cedula: '987654321', sexo: 'F', fecha_nacimiento: '1945-07-08', fecha_defuncion: '2022-05-30', lugar_nacimiento: 'Chicago',     causa_muerte: 'Kidney failure', parcela: 'B-001' },
            { nombre: 'Robert',   apellidos: 'Williams', cedula: '112233445', sexo: 'M', fecha_nacimiento: '1930-01-15', fecha_defuncion: '2016-09-03', lugar_nacimiento: 'Los Angeles', causa_muerte: 'Old age',        parcela: 'B-002' },
            { nombre: 'Patricia', apellidos: 'Brown',    cedula: '443322110', sexo: 'F', fecha_nacimiento: '1952-09-25', fecha_defuncion: '2023-02-17', lugar_nacimiento: 'Houston',     causa_muerte: 'Cancer',         parcela: 'C-001' },
        ];

        for (const d of difuntos) {
            const pid = parcelaIds[d.parcela] || null;
            await this.run(
                `INSERT OR IGNORE INTO difuntos (nombre, apellidos, cedula, sexo, fecha_nacimiento, fecha_defuncion, lugar_nacimiento, causa_muerte, parcela_id, observaciones)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
                [d.nombre, d.apellidos, d.cedula, d.sexo, d.fecha_nacimiento, d.fecha_defuncion, d.lugar_nacimiento, d.causa_muerte, pid]
            );
        }
    }

    async seedDefaultEtiquetas(lang = 'en') {
        const sets = {
            en: [
                { categoria: 'tipo',      valor: 'Plot',       orden: 0 },
                { categoria: 'tipo',      valor: 'Niche',      orden: 1 },
                { categoria: 'tipo',      valor: 'Mausoleum',  orden: 2 },
                { categoria: 'zona',      valor: 'New',        orden: 0 },
                { categoria: 'zona',      valor: 'Old',        orden: 1 },
                { categoria: 'ubicacion', valor: 'Left',       orden: 0 },
                { categoria: 'ubicacion', valor: 'Center',     orden: 1 },
                { categoria: 'ubicacion', valor: 'Right',      orden: 2 },
            ],
            es: [
                { categoria: 'tipo',      valor: 'Parcela',    orden: 0 },
                { categoria: 'tipo',      valor: 'Nicho',      orden: 1 },
                { categoria: 'tipo',      valor: 'Mausoleo',   orden: 2 },
                { categoria: 'zona',      valor: 'Nuevo',      orden: 0 },
                { categoria: 'zona',      valor: 'Antiguo',    orden: 1 },
                { categoria: 'ubicacion', valor: 'Izquierda',  orden: 0 },
                { categoria: 'ubicacion', valor: 'Centro',     orden: 1 },
                { categoria: 'ubicacion', valor: 'Derecha',    orden: 2 },
            ],
        };
        const defaults = sets[lang] || sets.en;
        // Clear existing defaults and re-seed with the chosen language
        await this.run('DELETE FROM etiquetas');
        for (const e of defaults) {
            await this.run(
                'INSERT INTO etiquetas (categoria, valor, orden) VALUES (?, ?, ?)',
                [e.categoria, e.valor, e.orden]
            );
        }
    }
}

module.exports = DatabaseManager;
