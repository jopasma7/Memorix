const { net } = require('electron');
const crypto  = require('crypto');
const Store   = require('electron-store');
const { machineIdSync } = require('node-machine-id');

// ── Config ────────────────────────────────────────────────────────────────────
const GUMROAD_PRODUCT_ID = 'hzuuae';           // Permalink del producto en Gumroad
const GRACE_DAYS         = 3;                  // Días de gracia sin internet antes de bloquear
const RECHECK_DAYS       = 7;                  // Re-verificar con Gumroad cada 7 días

// Clave de cifrado derivada del machine-id (fija por dispositivo)
function getEncKey() {
    const mid = machineIdSync({ original: true });
    return crypto.createHash('sha256').update(mid + 'memorix-salt-v1').digest();
}

function encrypt(text) {
    const iv  = crypto.randomBytes(16);
    const key = getEncKey();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + enc.toString('hex');
}

function decrypt(data) {
    try {
        const [ivHex, encHex] = data.split(':');
        const iv  = Buffer.from(ivHex, 'hex');
        const key = getEncKey();
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const dec = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]);
        return dec.toString('utf8');
    } catch {
        return null;
    }
}

// ── Storage ───────────────────────────────────────────────────────────────────
const store = new Store({ name: 'license', encryptionKey: 'memorix-store-v1' });

function saveLicense(data) {
    store.set('lic', encrypt(JSON.stringify(data)));
}

function loadLicense() {
    const raw = store.get('lic');
    if (!raw) return null;
    const dec = decrypt(raw);
    if (!dec) return null;
    try { return JSON.parse(dec); } catch { return null; }
}

function clearLicense() {
    store.delete('lic');
}

// ── Gumroad API ───────────────────────────────────────────────────────────────
function verifyWithGumroad(licenseKey) {
    return new Promise((resolve, reject) => {
        const body = `product_permalink=${encodeURIComponent(GUMROAD_PRODUCT_ID)}&license_key=${encodeURIComponent(licenseKey)}&increment_uses_count=false`;

        const req = net.request({
            method: 'POST',
            url: 'https://api.gumroad.com/v2/licenses/verify',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        let data = '';
        req.on('response', (res) => {
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch {
                    reject(new Error('Invalid Gumroad response'));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Activa una nueva licencia. Llama a Gumroad, guarda localmente si es válida.
 * Returns: { ok, error, expiresAt, email }
 */
async function activate(licenseKey) {
    let gum;
    try {
        gum = await verifyWithGumroad(licenseKey.trim());
    } catch (e) {
        return { ok: false, error: 'Sin conexión. Comprueba tu internet e inténtalo de nuevo.' };
    }

    if (!gum.success) {
        return { ok: false, error: 'Clave de licencia inválida o ya utilizada.' };
    }

    const purchase   = gum.purchase;
    const expiresAt  = purchase.subscription_ended_at
        ? new Date(purchase.subscription_ended_at).getTime()
        : null; // null = vitalicia (por si añades ese modelo)

    const email = purchase.email || '';

    if (expiresAt && Date.now() > expiresAt) {
        return { ok: false, error: 'Esta licencia ha expirado. Por favor, renuévala en tu cuenta de Gumroad.' };
    }

    saveLicense({
        key:        licenseKey.trim(),
        email,
        expiresAt,
        activatedAt: Date.now(),
        lastCheck:   Date.now()
    });

    return { ok: true, email, expiresAt };
}

/**
 * Comprueba el estado de la licencia guardada.
 * Returns: { valid, reason, email, expiresAt, daysLeft }
 */
async function check() {
    const lic = loadLicense();

    if (!lic) return { valid: false, reason: 'no_license' };

    // ¿Ha expirado localmente?
    if (lic.expiresAt && Date.now() > lic.expiresAt) {
        clearLicense();
        return { valid: false, reason: 'expired' };
    }

    const now         = Date.now();
    const daysSince   = (now - (lic.lastCheck || 0)) / 86400000;
    const daysToDie   = lic.expiresAt ? (lic.expiresAt - now) / 86400000 : Infinity;

    // Si no toca re-verificar aún, aceptar la caché
    if (daysSince < RECHECK_DAYS) {
        return {
            valid: true,
            email: lic.email,
            expiresAt: lic.expiresAt,
            daysLeft: Math.ceil(daysToDie)
        };
    }

    // Toca re-verificar con Gumroad
    try {
        const gum = await verifyWithGumroad(lic.key);
        if (!gum.success) {
            clearLicense();
            return { valid: false, reason: 'revoked' };
        }

        const purchase  = gum.purchase;
        const expiresAt = purchase.subscription_ended_at
            ? new Date(purchase.subscription_ended_at).getTime()
            : lic.expiresAt;

        if (expiresAt && Date.now() > expiresAt) {
            clearLicense();
            return { valid: false, reason: 'expired' };
        }

        // Actualizar caché
        saveLicense({ ...lic, expiresAt, lastCheck: now });

        return {
            valid: true,
            email: purchase.email || lic.email,
            expiresAt,
            daysLeft: expiresAt ? Math.ceil((expiresAt - now) / 86400000) : Infinity
        };

    } catch {
        // Sin internet — usar grace period
        const daysSinceCheck = (now - lic.lastCheck) / 86400000;
        if (daysSinceCheck > GRACE_DAYS) {
            return { valid: false, reason: 'no_internet' };
        }
        return {
            valid: true,
            email: lic.email,
            expiresAt: lic.expiresAt,
            daysLeft: lic.expiresAt ? Math.ceil((lic.expiresAt - now) / 86400000) : Infinity,
            offline: true
        };
    }
}

/**
 * Desactiva la licencia en este dispositivo.
 */
function deactivate() {
    clearLicense();
}

/**
 * Devuelve la licencia guardada sin verificar con Gumroad (para mostrar info en UI).
 */
function getCachedLicense() {
    return loadLicense();
}

module.exports = { activate, check, deactivate, getCachedLicense };
