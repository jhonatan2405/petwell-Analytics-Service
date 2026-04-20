import { AnalyticsRepository, Appointment, Invoice } from '../repositories/analytics.repository';

const repo = new AnalyticsRepository();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countByField<T>(items: T[], field: keyof T): Record<string, number> {
    return items.reduce((acc, item) => {
        const key = String(item[field] ?? 'UNKNOWN');
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}

function calcOccupancyRate(appointments: Appointment[]): number {
    const total = appointments.length;
    if (total === 0) return 0;
    const active = appointments.filter(a =>
        a.status === 'CONFIRMED' || a.status === 'COMPLETED'
    ).length;
    return Math.round((active / total) * 100 * 100) / 100;
}

function calcTelemedRate(appointments: Appointment[]): number {
    const total = appointments.length;
    if (total === 0) return 0;
    const telemed = appointments.filter(a =>
        a.type?.toUpperCase() === 'TELEMEDICINA'
    ).length;
    return Math.round((telemed / total) * 100 * 100) / 100;
}

function calcRevenue(invoices: Invoice[]) {
    const total_facturado = invoices.reduce((acc, inv) => acc + (inv.total_amount ?? 0), 0);
    const total_pagado = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((acc, inv) => acc + (inv.total_amount ?? 0), 0);
    const tasa_de_pago = total_facturado > 0
        ? Math.round((total_pagado / total_facturado) * 100 * 100) / 100
        : 0;
    return { total_facturado, total_pagado, tasa_de_pago };
}

// ─── Analytics Service ───────────────────────────────────────────────────────

export class AnalyticsService {

    /**
     * GET /analytics/global
     * Solo PETWELL_ADMIN — datos agregados de toda la plataforma.
     */
    async getGlobalDashboard(token: string) {
        console.log('[Analytics] Calculando dashboard global...');

        const [appointments, clinics, pets, invoices] = await Promise.all([
            repo.getAllAppointments(token),
            repo.getAllClinics(token),
            repo.getAllPets(token),
            repo.getInvoices(token),
        ]);

        const byStatus = countByField(appointments, 'status');
        const byType   = countByField(appointments, 'type');
        const revenue  = calcRevenue(invoices);

        return {
            total_clinics:            clinics.length,
            total_pets:               pets.length,
            total_appointments:       appointments.length,
            total_revenue:            revenue.total_pagado,
            appointments_by_status:   byStatus,
            appointments_by_type:     byType,
            telemed_usage_rate:       `${calcTelemedRate(appointments)}%`,
        };
    }

    /**
     * GET /analytics/clinic/:clinicId
     * PETWELL_ADMIN o CLINIC_ADMIN (solo su clínica).
     */
    async getClinicDashboard(clinicId: string, token: string) {
        console.log(`[Analytics] Calculando dashboard para clínica ${clinicId}...`);

        const [appointments, invoices] = await Promise.all([
            repo.getAppointmentsByClinic(clinicId, token),
            repo.getInvoices(token, clinicId),
        ]);

        const byStatus = countByField(appointments, 'status');
        const byType   = countByField(appointments, 'type');
        const revenue  = calcRevenue(invoices);

        return {
            clinic_id:              clinicId,
            total_appointments:     appointments.length,
            completed:              byStatus['COMPLETED']        ?? 0,
            confirmed:              byStatus['CONFIRMED']        ?? 0,
            cancelled:              byStatus['CANCELLED']        ?? 0,
            no_show:                byStatus['NO_SHOW']          ?? 0,
            pending:                byStatus['PENDING']          ?? 0,
            pending_payment:        byStatus['PENDING_PAYMENT']  ?? 0,
            appointments_by_type:   byType,
            revenue_total:          revenue.total_facturado,
            revenue_paid:           revenue.total_pagado,
            occupancy_rate:         `${calcOccupancyRate(appointments)}%`,
            telemed_usage_rate:     `${calcTelemedRate(appointments)}%`,
        };
    }

    /**
     * GET /analytics/clinic/:clinicId/revenue
     * Analítica financiera detallada de una clínica.
     */
    async getClinicRevenue(clinicId: string, token: string) {
        console.log(`[Analytics] Calculando revenue para clínica ${clinicId}...`);

        const invoices = await repo.getInvoices(token, clinicId);
        const revenue  = calcRevenue(invoices);

        const byStatus = countByField(invoices, 'status');

        return {
            clinic_id:       clinicId,
            total_invoices:  invoices.length,
            invoices_by_status: byStatus,
            ...revenue,
        };
    }
}
