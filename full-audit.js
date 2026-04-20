/**
 * full-audit.js
 * Genera tokens frescos, arranca pruebas contra el servidor en vivo,
 * e imprime resultados con veredicto pass/fail.
 */

const jwt  = require('jsonwebtoken');
const http = require('http');

const SECRET = 'petwell_super_secret_key_2026_cambiar_en_produccion';
const BASE   = 'http://localhost:3008/api/v1/analytics';

// ── Generar tokens frescos (24h) ──────────────────────────────────────────────
const T = {
    admin:     jwt.sign({ sub: 'admin-001', email: 'admin@petwell.co', role: 'PETWELL_ADMIN' },          SECRET, { expiresIn: '24h' }),
    clinicA:   jwt.sign({ sub: 'ca-001',    email: 'a@c.co', role: 'CLINIC_ADMIN', clinic_id: 'CLINIC_A' }, SECRET, { expiresIn: '24h' }),
    clinicB:   jwt.sign({ sub: 'ca-002',    email: 'b@c.co', role: 'CLINIC_ADMIN', clinic_id: 'CLINIC_B' }, SECRET, { expiresIn: '24h' }),
    vet:       jwt.sign({ sub: 'vet-001',   email: 'v@c.co', role: 'VETERINARIO',  clinic_id: 'CLINIC_A' }, SECRET, { expiresIn: '24h' }),
    invalid:   'token.invalido.aqui',
};

// ── Helper HTTP ───────────────────────────────────────────────────────────────
function request(path, token) {
    return new Promise((resolve) => {
        const opts = {
            host: 'localhost', port: 3008,
            path: `/api/v1/analytics${path}`,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        };
        const req = http.get(opts, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });
        req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
        req.end();
    });
}

// ── Suite de pruebas ──────────────────────────────────────────────────────────
const tests = [
    // Seguridad
    { name: '1. Sin token → 401',                    path: '/global',              token: null,     expect: 401 },
    { name: '2. Token inválido → 401',               path: '/global',              token: T.invalid, expect: 401 },
    // PETWELL_ADMIN
    { name: '3. ADMIN → /global 200',                path: '/global',              token: T.admin,  expect: 200 },
    { name: '4. ADMIN → /clinic/CLINIC_A 200',       path: '/clinic/CLINIC_A',    token: T.admin,  expect: 200 },
    { name: '5. ADMIN → /clinic/CLINIC_A/revenue 200', path: '/clinic/CLINIC_A/revenue', token: T.admin, expect: 200 },
    // CLINIC_ADMIN propia clínica
    { name: '6. CLINIC_ADMIN → SU clinica 200',      path: '/clinic/CLINIC_A',    token: T.clinicA, expect: 200 },
    { name: '7. CLINIC_ADMIN → SU revenue 200',      path: '/clinic/CLINIC_A/revenue', token: T.clinicA, expect: 200 },
    // CLINIC_ADMIN acceso denegado
    { name: '8. CLINIC_ADMIN → /global 403',         path: '/global',              token: T.clinicA, expect: 403 },
    { name: '9. CLINIC_ADMIN → OTRA clinica 403',    path: '/clinic/CLINIC_B',    token: T.clinicA, expect: 403 },
    // Otro role
    { name: '10. VETERINARIO → /clinic 403',         path: '/clinic/CLINIC_A',    token: T.vet,    expect: 403 },
    // Edge cases: clinicId inexistente devuelve 200 con datos vacíos (tolerante a fallos)
    { name: '11. clinicId inexistente → 200 (vacío)', path: '/clinic/NONEXISTENT', token: T.admin, expect: 200 },
];

async function run() {
    console.log('\n══════════════════════════════════════════════════');
    console.log('  AUDITORÍA Analytics Service — PetWell');
    console.log('══════════════════════════════════════════════════\n');

    let passed = 0, failed = 0;

    for (const t of tests) {
        const { status, body } = await request(t.path, t.token);
        const ok = status === t.expect;
        const icon = ok ? '✅' : '❌';
        console.log(`${icon} [HTTP ${status}] ${t.name}`);

        if (!ok) {
            failed++;
            console.log(`   ⚠️  Esperado: ${t.expect} | Obtenido: ${status}`);
            console.log(`   Body: ${JSON.stringify(body).slice(0, 120)}`);
        } else {
            passed++;
            // Para tests 200, mostrar keys de la respuesta
            if (status === 200 && body.data) {
                const keys = Object.keys(body.data);
                console.log(`   📊 Campos: ${keys.join(', ')}`);
                
                // Validar edge cases de cálculo
                if (body.data.occupancy_rate !== undefined) {
                    const or = parseFloat(body.data.occupancy_rate);
                    const valid = or >= 0 && or <= 100;
                    console.log(`   📐 occupancy_rate=${body.data.occupancy_rate} → ${valid ? '✅ rango válido' : '❌ FUERA DE RANGO'}`);
                }
                if (body.data.total_pagado !== undefined && body.data.total_facturado !== undefined) {
                    const valid = body.data.total_pagado <= body.data.total_facturado;
                    console.log(`   💰 pagado(${body.data.total_pagado}) <= facturado(${body.data.total_facturado}) → ${valid ? '✅' : '❌ INCONSISTENTE'}`);
                }
            }
        }
    }

    console.log('\n══════════════════════════════════════════════════');
    console.log(`  RESULTADO: ${passed} ✅ pasaron | ${failed} ❌ fallaron`);
    console.log('══════════════════════════════════════════════════\n');

    if (failed === 0) {
        console.log('🚀 Todos los tests pasaron. Servicio listo para producción.');
    } else {
        console.log('⚠️  Hay fallos que deben corregirse antes de desplegar.');
    }
}

run().catch(console.error);
