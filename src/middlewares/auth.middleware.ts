import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.util';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request { user?: JwtPayload; }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Token no proporcionado' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = verifyToken(token);
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
}

/**
 * Solo permite acceso a ADMIN (PETWELL_ADMIN)
 */
export function requirePetwellAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Acceso restringido a ADMIN' });
        return;
    }
    next();
}

/**
 * Permite acceso a ADMIN o CLINIC_ADMIN solo sobre su propia clínica.
 * Valida que req.params.clinicId coincida con el clinic_id del token cuando el rol es CLINIC_ADMIN.
 */
export function requireClinicAccess(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
    }

    const { role, clinic_id } = req.user;
    const paramClinicId = req.params['clinicId'];

    if (role === 'ADMIN') {
        next();
        return;
    }

    if (role === 'CLINIC_ADMIN') {
        if (!clinic_id || clinic_id !== paramClinicId) {
            res.status(403).json({ success: false, message: 'Sin acceso a esta clínica' });
            return;
        }
        next();
        return;
    }

    res.status(403).json({ success: false, message: 'Rol sin permisos para analytics de clínica' });
}
