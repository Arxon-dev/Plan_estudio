import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studyPlanService } from '../services/studyPlanService';
import { EquitableDistribution } from '../components/EquitableDistribution';
import ThemePartsStats from '../components/ThemePartsStats';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);

  React.useEffect(() => {
    loadActivePlan();
  }, []);

  const loadActivePlan = async () => {
    try {
      const plan = await studyPlanService.getActivePlan();
      setActivePlan(plan);
    } catch (error) {
      // No hay plan activo, es normal
      setActivePlan(null);
    }
  };

  const handleDeletePlan = async () => {
    if (!activePlan) return;
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu plan de estudio actual? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeletingPlan(true);
    try {
      await studyPlanService.deleteActivePlan();
      toast.success('Plan eliminado exitosamente');
      setActivePlan(null);
      // Redirigir a crear nuevo plan después de 2 segundos
      setTimeout(() => {
        navigate('/study-plans');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar el plan:', error);
      toast.error('Error al eliminar el plan');
    } finally {
      setIsDeletingPlan(false);
    }
  };

  const handleRebalance = async () => {
    if (!activePlan) {
      toast.error('No hay un plan activo para rebalancear');
      return;
    }
    
    setIsRebalancing(true);
    try {
      const response = await fetch(`http://localhost:3000/api/sessions/rebalance/${activePlan.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al rebalancear');
      }

      const data = await response.json();
      toast.success(data.message);
    } catch (error) {
      toast.error('Error al rebalancear el calendario');
    } finally {
      setIsRebalancing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRelaunchOnboarding = () => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    const id = JSON.parse(raw).id;
    localStorage.setItem(`onboarding:v1:${id}`, 'pending');
    toast.success('Tutorial preparado');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-secondary text-sm"
          >
            Volver a Inicio
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del Usuario */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información Personal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <p className="text-lg text-gray-900">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-lg text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario desde</label>
              <p className="text-lg text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Gestión del Plan de Estudio */}
        {activePlan && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión del Plan de Estudio</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Plan Activo</h3>
                <p className="text-blue-800">
                  {activePlan.name} - Examen: {new Date(activePlan.examDate).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/guide')}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  📖 Guía de uso
                </button>

                <button
                  onClick={handleRebalance}
                  disabled={isRebalancing}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isRebalancing ? 'Rebalanceando...' : '🔄 Rebalancear Calendario'}
                </button>

                <button
                  onClick={handleDeletePlan}
                  disabled={isDeletingPlan}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isDeletingPlan ? 'Eliminando...' : '🗑️ Eliminar Plan Actual'}
                </button>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Guía de uso:</strong> Accede a la documentación completa sobre cómo funciona el sistema, el calendario inteligente y consejos para maximizar tu preparación.</p>
                <p><strong>Rebalancear Calendario:</strong> Optimiza la rotación de tus sesiones para mantener múltiples temas activos y mejorar la retención a largo plazo.</p>
                <p><strong>Eliminar Plan:</strong> Borra permanentemente tu plan actual y crea uno nuevo. Esta acción no se puede deshacer.</p>
              </div>
            </div>
          </div>
        )}

        {/* Distribución Equitativa por Complejidad */}
        {activePlan && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Análisis de Distribución Equitativa</h2>
            <EquitableDistribution planId={activePlan.id} />
          </div>
        )}

        {/* Estadísticas por Partes de Temas */}
        {activePlan && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Estadísticas por Partes de Temas</h2>
            <ThemePartsStats planId={activePlan.id} />
          </div>
        )}

        {!activePlan && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Plan de Estudio</h2>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No tienes un plan de estudio activo.</p>
              <button
                onClick={() => navigate('/study-plans')}
                className="btn-primary"
              >
                Crear Nuevo Plan
              </button>
            </div>
          </div>
        )}

        {/* Configuración de Cuenta */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración de Cuenta</h2>
          <div className="space-y-4">
            <button
              id="tour-relaunch"
              onClick={handleRelaunchOnboarding}
              className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              Ver tutorial de bienvenida
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información de la Aplicación</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Versión:</strong> 1.0.0</p>
            <p><strong>Función:</strong> Sistema de planificación de estudios con rotación inteligente de temas y repetición espaciada</p>
            <p><strong>Características:</strong> Calendario inteligente, simulacros, seguimiento de progreso</p>
          </div>
        </div>
      </main>
    </div>
  );
};