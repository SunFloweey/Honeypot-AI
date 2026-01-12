const Log = require('../models/Log');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const analyzer = async (req, res, next) => {
    const start = Date.now();
    const requestId = uuidv4();

    // 1. Generazione Session Key (Hash IP + UA) - Punto 4.2
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.socket?.remoteAddress;
    const sessionKey = crypto.createHash('md5').update(ip + userAgent).digest('hex');

    // 2. Redaction (Mascheramento password) - Punto 4.1
    const bodyCopy = { ...req.body };
    if (bodyCopy.password) bodyCopy.password = '********';

    const logEntry = {
        request_id: requestId,
        session_key: sessionKey,
        timestamp: new Date(),
        ip: ip,
        method: req.method,
        path: req.originalUrl,
        headers: { 'user-agent': userAgent },
        body: bodyCopy,
        query: req.query,
        analysis: {
            type: 'Normal',
            riskScore: 0,
            evidence: []
        }
    };

    // --- Tua logica di checkPatterns (va bene così com'è) ---
    const checkPatterns = (str, label) => {
        if (!str) return;
        const s = typeof str === 'string' ? str.toLowerCase() : JSON.stringify(str).toLowerCase();

        if (s.match(/('|"|%27|%22)\s*(or|and)\s*('|"|%27|%22)?.*(\=|>|<)/) || s.includes('union select')) {
            logEntry.analysis.type = 'SQL Injection';
            logEntry.analysis.riskScore += 50;
            logEntry.analysis.evidence.push(`SQLi in ${label}`);
        }
        // ... (aggiungi gli altri tuoi check XSS e Traversal qui)
    };

    checkPatterns(req.originalUrl, 'URL');
    checkPatterns(req.query, 'Query');
    checkPatterns(req.body, 'Body');

    // Clamp del riskScore a 100 (Punto 5)
    logEntry.analysis.riskScore = Math.min(logEntry.analysis.riskScore, 100);

    // 3. Salvataggio al termine della risposta (per catturare status e tempo)
    res.on('finish', async () => {
        logEntry.status_code = res.statusCode;
        logEntry.response_time_ms = Date.now() - start;

        try {
            await Log.create(logEntry);
        } catch (err) {
            console.error("[Analyzer] Errore DB:", err.message);
        }
    });

    req.analysis = logEntry.analysis; // Passa l'analisi alle rotte se serve
    next();
};

module.exports = analyzer;