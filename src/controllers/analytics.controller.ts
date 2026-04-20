import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess, sendError } from '../utils/response.util';

const analyticsService = new AnalyticsService();

// ─── Analytics Controller ─────────────────────────────────────────────────────

export const analyticsController = {

    /**
     * GET /api/v1/analytics/global
     * Acceso: PETWELL_ADMIN
     */
    async globalDashboard(req: Request, res: Response): Promise<void> {
        const token = req.headers.authorization?.split(' ')[1] ?? '';
        try {
            const data = await analyticsService.getGlobalDashboard(token);
            sendSuccess(res, data, 'Dashboard global generado exitosamente');
        } catch (err) {
            const e = err as { message?: string };
            console.error('[Analytics] Error en globalDashboard:', e.message);
            sendError(res, e.message ?? 'Error generando dashboard global', 502);
        }
    },

    /**
     * GET /api/v1/analytics/clinic/:clinicId
     * Acceso: PETWELL_ADMIN | CLINIC_ADMIN (solo su clínica)
     */
    async clinicDashboard(req: Request, res: Response): Promise<void> {
        const { clinicId } = req.params;
        const token = req.headers.authorization?.split(' ')[1] ?? '';
        try {
            const data = await analyticsService.getClinicDashboard(clinicId, token);
            sendSuccess(res, data, 'Dashboard de clínica generado exitosamente');
        } catch (err) {
            const e = err as { message?: string };
            console.error('[Analytics] Error en clinicDashboard:', e.message);
            sendError(res, e.message ?? 'Error generando dashboard de clínica', 502);
        }
    },

    /**
     * GET /api/v1/analytics/clinic/:clinicId/revenue
     * Acceso: PETWELL_ADMIN | CLINIC_ADMIN (solo su clínica)
     */
    async clinicRevenue(req: Request, res: Response): Promise<void> {
        const { clinicId } = req.params;
        const token = req.headers.authorization?.split(' ')[1] ?? '';
        try {
            const data = await analyticsService.getClinicRevenue(clinicId, token);
            sendSuccess(res, data, 'Revenue de clínica calculado exitosamente');
        } catch (err) {
            const e = err as { message?: string };
            console.error('[Analytics] Error en clinicRevenue:', e.message);
            sendError(res, e.message ?? 'Error calculando revenue de clínica', 502);
        }
    },
};
