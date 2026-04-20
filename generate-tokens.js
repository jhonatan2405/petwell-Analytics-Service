/**
 * generate-tokens.js
 * Genera tokens JWT firmados con el mismo secret del ecosistema PetWell.
 * Uso: node generate-tokens.js
 */

const jwt = require('jsonwebtoken');

const SECRET = 'petwell_super_secret_key_2026_cambiar_en_produccion';
const EXP    = '2h';

const tokens = {
    petwellAdmin: jwt.sign(
        { sub: 'admin-001', id: 'admin-001', email: 'admin@petwell.co', role: 'PETWELL_ADMIN' },
        SECRET, { expiresIn: EXP }
    ),
    clinicAdminA: jwt.sign(
        { sub: 'clinic-user-001', id: 'clinic-user-001', email: 'admin@clinicA.co', role: 'CLINIC_ADMIN', clinic_id: 'CLINIC_A' },
        SECRET, { expiresIn: EXP }
    ),
    clinicAdminB: jwt.sign(
        { sub: 'clinic-user-002', id: 'clinic-user-002', email: 'admin@clinicB.co', role: 'CLINIC_ADMIN', clinic_id: 'CLINIC_B' },
        SECRET, { expiresIn: EXP }
    ),
    veterinario: jwt.sign(
        { sub: 'vet-001', id: 'vet-001', email: 'vet@clinicA.co', role: 'VETERINARIO', clinic_id: 'CLINIC_A' },
        SECRET, { expiresIn: EXP }
    ),
};

console.log('\n=== TOKENS DE PRUEBA — Analytics Service ===\n');
Object.entries(tokens).forEach(([name, token]) => {
    console.log(`[${name}]`);
    console.log(token);
    console.log('');
});
