import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface BaremoData {
    // Military Data
    ejercito?: 'TIERRA' | 'ARMADA' | 'AIRE_Y_ESPACIO' | null;
    empleo?: 'CABO_PRIMERO' | 'CABO' | null;
    agrupacionEspecialidad?: 'OPERATIVAS' | 'TECNICAS' | null;
    especialidadFundamental?: string | null;
    fechaIngreso?: string | null;
    fechaAntiguedad?: string | null;
    tiempoServiciosUnidadesPreferentes?: number;
    tiempoServiciosOtrasUnidades?: number;
    tiempoOperacionesExtranjero?: number;

    // Reports
    notaMediaInformes?: number | null;

    // Physical Tests
    flexionesTronco?: number | null;
    flexionesBrazos?: number | null;
    tiempoCarrera?: number | null;
    circuitoAgilidad?: number | null;
    reconocimientoMedico?: 'APTO' | 'NO_APTO' | null;
    sexo?: 'H' | 'M' | null;

    // Opposition
    pruebaAcertadas?: number | null;
    pruebaErroneas?: number | null;

    // Arrays
    recompensas?: any[];
    titulacion?: any;
    idiomas?: any[];
    cursosMilitares?: any[];

    // Scores
    puntosMeritosProfesionales?: number;
    puntosMeritosAcademicos?: number;
    puntosInformesCalificacion?: number;
    puntosPruebasFisicas?: number;
    puntosConcurso?: number;
    puntosOposicion?: number;
    puntosTotal?: number;

    perfilPublico?: boolean;
}

export const baremoService = {
    getBaremo: async (): Promise<BaremoData> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/baremo`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateBaremo: async (data: BaremoData): Promise<BaremoData> => {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/baremo`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
