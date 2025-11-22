import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface AdminStats {
  users: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    withPlans: number;
    registrationsByDay: Array<{ date: string; count: number }>;
  };
  plans: {
    total: number;
    active: number;
  };
  sessions: {
    total: number;
    completed: number;
    pending: number;
    completionRate: string;
  };
  topUsers: Array<{
    userId: number;
    sessionCount: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.isAdmin) {
        setIsAdmin(true);
        loadStatistics();
      } else {
        toast.error('Acceso denegado. Solo administradores.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error al verificar estado de admin:', error);
      toast.error('Error al verificar permisos');
      navigate('/dashboard');
    }
  };

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center text-gray-600 mt-10">
          No se pudieron cargar las estadísticas
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">¡Hola, {user?.firstName}!</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Volver al Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/import-questions')}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-left">
                <p className="font-semibold">📚 Importar Preguntas GIFT</p>
                <p className="text-xs text-blue-100">Subir archivos .gift</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/generate-questions')}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="text-left">
                <p className="font-semibold">🤖 Generar con IA</p>
                <p className="text-xs text-indigo-100">Crear preguntas nuevas</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/tests')}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-left">
                <p className="font-semibold">📋 Ver Tests</p>
                <p className="text-xs text-green-100">Gestionar preguntas</p>
              </div>
            </button>

            <button
              onClick={loadStatistics}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div className="text-left">
                <p className="font-semibold">🔄 Actualizar</p>
                <p className="text-xs text-purple-100">Refrescar estadísticas</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/manage-questions')}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div className="text-left">
                <p className="font-semibold">🗑️ Gestionar Preguntas</p>
                <p className="text-xs text-red-100">Eliminar preguntas</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Usuarios */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
                <p className="text-3xl font-bold mt-2">{stats.users.total}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p>Hoy: <span className="font-semibold">{stats.users.today}</span></p>
              <p>Esta semana: <span className="font-semibold">{stats.users.thisWeek}</span></p>
            </div>
          </div>

          {/* Usuarios con Planes */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Con Planes Activos</p>
                <p className="text-3xl font-bold mt-2">{stats.users.withPlans}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p>Tasa: <span className="font-semibold">{((stats.users.withPlans / stats.users.total) * 100).toFixed(1)}%</span></p>
              <p>Planes totales: <span className="font-semibold">{stats.plans.total}</span></p>
            </div>
          </div>

          {/* Sesiones Totales */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Sesiones Totales</p>
                <p className="text-3xl font-bold mt-2">{stats.sessions.total}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p>Completadas: <span className="font-semibold">{stats.sessions.completed}</span></p>
              <p>Pendientes: <span className="font-semibold">{stats.sessions.pending}</span></p>
            </div>
          </div>

          {/* Tasa de Completitud */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Tasa Completitud</p>
                <p className="text-3xl font-bold mt-2">{stats.sessions.completionRate}%</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p>Este mes: <span className="font-semibold">{stats.users.thisMonth} usuarios</span></p>
              <p>Planes activos: <span className="font-semibold">{stats.plans.active}</span></p>
            </div>
          </div>
        </div>

        {/* Gráfico de Registros (últimos 30 días) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Registros de Usuarios (Últimos 30 días)</h2>
          <div className="overflow-x-auto">
            <div className="flex items-end space-x-2 h-64">
              {stats.users.registrationsByDay.map((day, index) => {
                const maxCount = Math.max(...stats.users.registrationsByDay.map(d => Number(d.count)));
                const height = maxCount > 0 ? (Number(day.count) / maxCount) * 100 : 0;

                return (
                  <div key={index} className="flex flex-col items-center flex-1 min-w-[30px]">
                    <div className="text-xs text-gray-600 mb-1">{Number(day.count)}</div>
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%`, minHeight: Number(day.count) > 0 ? '8px' : '0px' }}
                      title={`${day.date}: ${day.count} registros`}
                    ></div>
                    <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                      {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top 10 Usuarios Más Activos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top 10 Usuarios Más Activos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sesiones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topUsers.map((user, index) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                        <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">{user.sessionCount} sesiones</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
