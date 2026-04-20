import axios, { AxiosError } from 'axios';
import { env } from '../config/env';

// ─── Tipos de dominio consumidos de otros servicios ───────────────────────────

export interface Appointment {
    id: string;
    clinic_id: string;
    owner_id: string;
    veterinarian_id?: string;
    status: string;       // PENDING | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW | PENDING_PAYMENT
    type: string;         // PRESENCIAL | TELEMEDICINA
    scheduled_at?: string;
    created_at: string;
}

export interface Invoice {
    id: string;
    clinic_id: string;
    owner_id: string;
    total_amount: number;
    status: string;       // DRAFT | PENDING_PAYMENT | PAID | CANCELLED
}

// ─── Helper: headers con auth ────────────────────────────────────────────────

function buildHeaders(token: string) {
    return {
        Authorization: `Bearer ${token}`,
        'x-internal-service-key': env.INTERNAL_SERVICE_KEY,
    };
}

// ─── Helper: safe fetch — nunca lanza, devuelve [] en fallo ─────────────────

async function safeFetch<T>(url: string, token: string, label: string): Promise<T[]> {
    try {
        const { data } = await axios.get<{ data: T[]; success: boolean }>(url, {
            headers: buildHeaders(token),
            timeout: 5000,
        });
        return data?.data ?? [];
    } catch (err) {
        const e = err as AxiosError;
        console.error(`[Analytics] ⚠️  ${label} no disponible (${e.message})`);
        return [];
    }
}

// ─── Analytics Repository ────────────────────────────────────────────────────

export class AnalyticsRepository {

    /** Todas las citas (sin filtro de clínica) */
    async getAllAppointments(token: string): Promise<Appointment[]> {
        return safeFetch<Appointment>(
            `${env.APPOINTMENT_SERVICE_URL}/api/v1/appointments`,
            token,
            'Appointment Service',
        );
    }

    /** Citas filtradas por clinic_id vía query param */
    async getAppointmentsByClinic(clinicId: string, token: string): Promise<Appointment[]> {
        return safeFetch<Appointment>(
            `${env.APPOINTMENT_SERVICE_URL}/api/v1/appointments?clinic_id=${clinicId}`,
            token,
            'Appointment Service (clinic)',
        );
    }

    /** Todas las clínicas registradas */
    async getAllClinics(token: string): Promise<unknown[]> {
        return safeFetch<unknown>(
            `${env.USER_SERVICE_URL}/api/v1/clinics`,
            token,
            'User Service (clinics)',
        );
    }

    /** Todas las mascotas */
    async getAllPets(token: string): Promise<unknown[]> {
        return safeFetch<unknown>(
            `${env.PET_SERVICE_URL}/api/v1/pets`,
            token,
            'Pet Service',
        );
    }

    /** Facturas — todas o filtradas por clínica */
    async getInvoices(token: string, clinicId?: string): Promise<Invoice[]> {
        const url = clinicId
            ? `${env.BILLING_SERVICE_URL}/api/v1/billing/invoices?clinic_id=${clinicId}`
            : `${env.BILLING_SERVICE_URL}/api/v1/billing/invoices`;
        return safeFetch<Invoice>(url, token, 'Billing Service');
    }
}
