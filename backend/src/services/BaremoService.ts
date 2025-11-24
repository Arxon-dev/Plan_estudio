import User from '../models/User';
import Recompensa from '../models/Recompensa';
import Titulacion from '../models/Titulacion';
import Idioma from '../models/Idioma';
import CursoMilitar from '../models/CursoMilitar';

export class BaremoService {

    public static async calculateAll(userId: number): Promise<User> {
        const user = await User.findByPk(userId, {
            include: [
                { model: Recompensa, as: 'recompensas' },
                { model: Titulacion, as: 'titulacion' },
                { model: Idioma, as: 'idiomas' },
                { model: CursoMilitar, as: 'cursosMilitares' }
            ]
        });

        if (!user) throw new Error('Usuario no encontrado');

        const puntosMeritosProfesionales = this.calculateProfessionalMerits(user);
        const puntosMeritosAcademicos = this.calculateAcademicMerits(user);
        const puntosInformesCalificacion = this.calculateReports(user);
        const puntosPruebasFisicas = this.calculatePhysicalTests(user);

        const puntosConcurso = Math.min(100, puntosMeritosProfesionales + puntosMeritosAcademicos + puntosInformesCalificacion + puntosPruebasFisicas);
        const puntosOposicion = this.calculateOpposition(user);

        const puntosTotal = puntosConcurso + puntosOposicion;

        // Update user
        user.puntosMeritosProfesionales = puntosMeritosProfesionales;
        user.puntosMeritosAcademicos = puntosMeritosAcademicos;
        user.puntosInformesCalificacion = puntosInformesCalificacion;
        user.puntosPruebasFisicas = puntosPruebasFisicas;
        user.puntosConcurso = puntosConcurso;
        user.puntosOposicion = puntosOposicion;
        user.puntosTotal = puntosTotal;

        await user.save();
        return user;
    }

    private static calculateProfessionalMerits(user: User): number {
        let points = 0;

        // 1. Tiempo de Servicios
        points += (user.tiempoServiciosUnidadesPreferentes || 0) * 0.08;
        points += (user.tiempoServiciosOtrasUnidades || 0) * 0.04;

        // Operaciones (Max 24 meses computables -> 2.4 puntos)
        const mesesOperaciones = Math.min(24, user.tiempoOperacionesExtranjero || 0);
        points += mesesOperaciones * 0.1;

        // 2. Empleo
        if (user.empleo === 'CABO_PRIMERO') points += 5;
        else if (user.empleo === 'CABO') points += 2;

        // 3. Recompensas
        const recompensas = (user as any).recompensas as Recompensa[];
        if (recompensas) {
            points += recompensas.reduce((sum, r) => sum + Number(r.puntos), 0);
        }

        return Math.min(40, points);
    }

    private static calculateAcademicMerits(user: User): number {
        let points = 0;

        // 1. Titulación (Solo 1, ya filtrado en modelo/DB idealmente, aquí tomamos la que haya)
        const titulacion = (user as any).titulacion as Titulacion;
        if (titulacion) {
            points += Number(titulacion.puntos);
        }

        // 2. Idiomas
        const idiomas = (user as any).idiomas as Idioma[];
        if (idiomas) {
            points += idiomas.reduce((sum, i) => sum + Number(i.puntos), 0);
        }

        // 3. Cursos Militares
        const cursos = (user as any).cursosMilitares as CursoMilitar[];
        if (cursos) {
            // Max 4 de especialización (2 pts c/u)
            const especializacion = cursos.filter(c => c.tipo === 'ESPECIALIZACION');
            const puntosEsp = especializacion.slice(0, 4).reduce((sum, c) => sum + Number(c.puntos), 0);

            // Max 4 informativos (0.5 pts c/u)
            const informativos = cursos.filter(c => c.tipo === 'INFORMATIVO');
            const puntosInf = informativos.slice(0, 4).reduce((sum, c) => sum + Number(c.puntos), 0);

            points += puntosEsp + puntosInf;
        }

        return Math.min(20, points);
    }

    private static calculateReports(user: User): number {
        if (!user.notaMediaInformes) return 0;
        return Math.min(25, Number(user.notaMediaInformes) * 2.5);
    }

    private static calculatePhysicalTests(user: User): number {
        // Tablas de puntuación (Apéndice 7)
        // Valores: [0, 1, 2, 3, 4, 5]

        // 1. Flexo-extensiones (Push-ups)
        const getPushUpPoints = (val: number, sex: string) => {
            if (sex === 'H') {
                if (val >= 56) return 5;
                if (val >= 44) return 4;
                if (val >= 34) return 3;
                if (val >= 24) return 2;
                if (val >= 11) return 1;
                return 0;
            } else { // M
                if (val >= 38) return 5;
                if (val >= 30) return 4;
                if (val >= 22) return 3;
                if (val >= 14) return 2;
                if (val >= 6) return 1;
                return 0;
            }
        };

        // 2. Abdominales (Sit-ups)
        const getSitUpPoints = (val: number) => {
            if (val >= 75) return 5;
            if (val >= 59) return 4;
            if (val >= 44) return 3;
            if (val >= 29) return 2;
            if (val >= 17) return 1;
            return 0;
        };

        // 3. Carrera 2000m (Time in seconds)
        const getRunPoints = (seconds: number, sex: string) => {
            if (sex === 'H') {
                if (seconds <= 410) return 5; // 6'50"
                if (seconds <= 490) return 4; // 8'10"
                if (seconds <= 570) return 3; // 9'30"
                if (seconds <= 650) return 2; // 10'50"
                if (seconds <= 730) return 1; // 12'10"
                return 0;
            } else {
                if (seconds <= 474) return 5; // 7'54"
                if (seconds <= 554) return 4; // 9'14"
                if (seconds <= 634) return 3; // 10'34"
                if (seconds <= 714) return 2; // 11'54"
                if (seconds <= 834) return 1; // 13'54"
                return 0;
            }
        };

        // 4. CAV (Agility) - Seconds
        const getAgilityPoints = (seconds: number, sex: string) => {
            if (sex === 'H') {
                if (seconds <= 12.7) return 5;
                if (seconds <= 13.7) return 4;
                if (seconds <= 14.8) return 3;
                if (seconds <= 15.2) return 2;
                if (seconds <= 16.2) return 1;
                return 0;
            } else {
                if (seconds <= 14.0) return 5;
                if (seconds <= 14.8) return 4;
                if (seconds <= 15.8) return 3;
                if (seconds <= 16.8) return 2;
                if (seconds <= 17.8) return 1;
                return 0;
            }
        };

        const sexo = user.sexo || 'H'; // Default to Male if not set
        let points = 0;

        if (user.flexionesBrazos !== null) points += getPushUpPoints(user.flexionesBrazos, sexo);
        if (user.flexionesTronco !== null) points += getSitUpPoints(user.flexionesTronco);
        if (user.tiempoCarrera !== null) points += getRunPoints(user.tiempoCarrera, sexo);
        if (user.circuitoAgilidad !== null) points += getAgilityPoints(Number(user.circuitoAgilidad), sexo);

        return Math.min(15, points);
    }

    private static calculateOpposition(user: User): number {
        // P = A - E/3
        if (user.pruebaAcertadas === null || user.pruebaErroneas === null) return 0;

        const A = user.pruebaAcertadas;
        const E = user.pruebaErroneas;
        const score = A - (E / 3);

        return Math.max(0, Math.min(100, score));
    }
}
