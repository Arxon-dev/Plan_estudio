import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Header } from '../../components/Header';
import { SPECIALTIES } from '../../constants/militaryData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RankingUser {
    position: number;
    id: number;
    name: string;
    puntosConcurso: number;
    puntosOposicion: number;
    puntosTotal: number;
    ejercito: string;
    especialidad: string;
    empleo: string;
}

const RankingPage: React.FC = () => {
    const [ranking, setRanking] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        cuerpo: '',
        especialidad: ''
    });

    useEffect(() => {
        fetchRanking();
    }, [filters]);

    const fetchRanking = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.cuerpo) params.append('cuerpo', filters.cuerpo);
            if (filters.especialidad) params.append('especialidad', filters.especialidad);

            const response = await axios.get(`${API_URL}/ranking?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRanking(response.data);
        } catch (error) {
            console.error('Error fetching ranking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const getAvailableSpecialties = () => {
        const allSpecialties = new Set<string>();

        if (filters.cuerpo) {
            // @ts-ignore
            const armyData = SPECIALTIES[filters.cuerpo];
            if (armyData) {
                if (armyData.OPERATIVAS) armyData.OPERATIVAS.forEach((s: string) => allSpecialties.add(s));
                if (armyData.TECNICAS) armyData.TECNICAS.forEach((s: string) => allSpecialties.add(s));
            }
        } else {
            // Get all specialties from all armies
            Object.values(SPECIALTIES).forEach(army => {
                if (army.OPERATIVAS) army.OPERATIVAS.forEach(s => allSpecialties.add(s));
                if (army.TECNICAS) army.TECNICAS.forEach(s => allSpecialties.add(s));
            });
        }

        return Array.from(allSpecialties).sort();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Ranking Oposición" showBack backPath="/dashboard" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo / Ejército</label>
                        <select
                            value={filters.cuerpo}
                            onChange={(e) => handleFilterChange('cuerpo', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="">Todos</option>
                            <option value="TIERRA">Ejército de Tierra</option>
                            <option value="ARMADA">Armada</option>
                            <option value="AIRE_Y_ESPACIO">Ejército del Aire y del Espacio</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                        <select
                            value={filters.especialidad}
                            onChange={(e) => handleFilterChange('especialidad', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="">Todas</option>
                            {getAvailableSpecialties().map((spec) => (
                                <option key={spec} value={spec}>
                                    {spec}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Ranking Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando ranking...</div>
                    ) : ranking.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No hay usuarios en el ranking con estos filtros.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pos
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cuerpo / Esp.
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Concurso
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Oposición
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ranking.map((user) => (
                                        <tr key={user.id} className={user.position <= 3 ? 'bg-yellow-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${user.position === 1 ? 'bg-yellow-400 text-white' :
                                                    user.position === 2 ? 'bg-gray-300 text-gray-700' :
                                                        user.position === 3 ? 'bg-amber-600 text-white' :
                                                            'text-gray-500'
                                                    }`}>
                                                    {user.position}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.empleo}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.ejercito}</div>
                                                <div className="text-xs text-gray-500">{user.especialidad}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.puntosConcurso}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.puntosOposicion}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                                                {user.puntosTotal}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RankingPage;
