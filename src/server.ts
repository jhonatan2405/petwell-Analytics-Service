import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import promBundle from 'express-prom-bundle';
import { env } from './config/env';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// ─── Security & Logging ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: env.ALLOWED_ORIGINS.split(',').map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());

// ─── Prometheus Metrics ───────────────────────────────────────────────────────
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  promClient: { collectDefaultMetrics: {} },
});
app.use(metricsMiddleware as any);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'analytics-service',
        port: env.PORT,
        env: env.NODE_ENV,
    });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/analytics', analyticsRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
    console.log(`📊 Analytics Service running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`   Appointment: ${env.APPOINTMENT_SERVICE_URL}`);
    console.log(`   User:        ${env.USER_SERVICE_URL}`);
    console.log(`   Pet:         ${env.PET_SERVICE_URL}`);
    console.log(`   Billing:     ${env.BILLING_SERVICE_URL}`);
});

export default app;
