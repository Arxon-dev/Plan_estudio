import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';
import {
  UsersIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

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
  const { logout } = useAuth();
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
    return <div className="p-8 text-center">No hay datos disponibles</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard General</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Bienvenido, Admin</span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Usuarios Totales */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +{stats.users.thisWeek} esta semana
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Usuarios Totales</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.users.total}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {stats.users.withPlans} con planes activos
                </p>
              </div>

              {/* Planes Activos */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BookOpenIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Planes de Estudio</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.plans.total}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {stats.plans.active} activos actualmente
                </p>
              </div>

              {/* Sesiones Completadas */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {stats.sessions.completionRate}% tasa
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Sesiones Completadas</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.sessions.completed}</p>
                <p className="text-xs text-gray-400 mt-2">
                  de {stats.sessions.total} totales
                </p>
              </div>

              {/* Tiempo de Estudio (Placeholder) */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Sesiones Pendientes</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.sessions.pending}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Para hoy y futuro
                </p>
              </div>
            </div>

            {/* Recent Activity & Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Users */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Usuarios Más Activos
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {stats.topUsers.map((user, index) => (
                    <div key={user.userId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-50 text-blue-600'
                          }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{user.sessionCount}</p>
                        <p className="text-xs text-gray-500">sesiones</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions (Placeholder for now) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-purple-500" />
                    Resumen de Registro
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {stats.users.registrationsByDay.slice(0, 5).map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((day.count / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{day.count} registros</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
