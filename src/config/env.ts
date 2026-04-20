import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
    const val = process.env[key] ?? fallback;
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
}

export const env = {
    PORT:                     parseInt(process.env['PORT'] ?? '3008', 10),
    NODE_ENV:                 process.env['NODE_ENV'] ?? 'development',

    JWT_SECRET:               requireEnv('JWT_SECRET'),

    ALLOWED_ORIGINS:          process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000',

    // URLs inter-servicios
    APPOINTMENT_SERVICE_URL:  process.env['APPOINTMENT_SERVICE_URL'] ?? 'http://localhost:3005',
    USER_SERVICE_URL:         process.env['USER_SERVICE_URL']        ?? 'http://localhost:3003',
    PET_SERVICE_URL:          process.env['PET_SERVICE_URL']         ?? 'http://localhost:3002',
    BILLING_SERVICE_URL:      process.env['BILLING_SERVICE_URL']     ?? 'http://localhost:3009',

    INTERNAL_SERVICE_KEY:     process.env['INTERNAL_SERVICE_KEY']    ?? 'petwell_internal_secret',
};
