import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, requirePetwellAdmin, requireClinicAccess } from '../middlewares/auth.middleware';

const router = Router();

// ── Dashboard Global (solo PETWELL_ADMIN) ───────────────────────────────────
router.get(
    '/global',
    authenticate,
    requirePetwellAdmin,
    analyticsController.globalDashboard,
);

// ── Dashboard por clínica (PETWELL_ADMIN o CLINIC_ADMIN de esa clínica) ─────
router.get(
    '/clinic/:clinicId',
    authenticate,
    requireClinicAccess,
    analyticsController.clinicDashboard,
);

// ── Revenue por clínica ──────────────────────────────────────────────────────
router.get(
    '/clinic/:clinicId/revenue',
    authenticate,
    requireClinicAccess,
    analyticsController.clinicRevenue,
);

export default router;
