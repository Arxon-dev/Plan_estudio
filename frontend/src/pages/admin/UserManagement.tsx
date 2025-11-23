import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/AdminSidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    ShieldCheckIcon,
    CurrencyEuroIcon,
    NoSymbolIcon,
    ArrowLeftIcon,
    ClockIcon,
    QuestionMarkCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from '../../components/common/Tooltip';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
    isPremium: boolean;
    isBanned: boolean;
    adminNotes: string | null;
    createdAt: string;
    subscriptionStatus: string | null;
    subscriptionEndDate: string | null;
    banReason: string | null;
}

interface AuditLog {
    id: number;
    action: string;
    details: string;
    createdAt: string;
    editor: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export const UserManagement: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [role, setRole] = useState('user');
    const [isPremium, setIsPremium] = useState(false);
    const [isBanned, setIsBanned] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [banReason, setBanReason] = useState('');

    // Modal states
    const [showBanModal, setShowBanModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const parseLogDetails = (details: string) => {
        try {
            const parsed = JSON.parse(details);
            return (
                <ul className="list-disc list-inside space-y-1">
                    {Object.entries(parsed).map(([key, value]) => {
                        let label = key;
                        let displayValue = String(value);

                        switch (key) {
                            case 'isAdmin':
                                label = 'Rol';
                                displayValue = value ? 'Administrador' : 'Alumno';
                                break;
                            case 'isPremium':
                                label = 'Premium';
                                displayValue = value ? 'Activado' : 'Desactivado';
                                break;
                            case 'isBanned':
                                label = 'Estado Cuenta';
                                displayValue = value ? 'Baneado' : 'Activo';
                                break;
                            case 'adminNotes':
                                label = 'Notas Admin';
                                break;
                            case 'banReason':
                                label = 'Razón Baneo';
                                break;
                        }

                        return (
                            <li key={key}>
                                <span className="font-semibold">{label}:</span> {displayValue}
                            </li>
                        );
                    })}
                </ul>
            );
        } catch (e) {
            return details;
        }
    };

    useEffect(() => {
        if (id) {
            fetchUserAndLogs();
        }
    }, [id]);

    const fetchUserAndLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [userRes, logsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/admin/users/${id}/logs`, { headers })
            ]);

            const userData = userRes.data;
            setUser(userData);
            setRole(userData.isAdmin ? 'admin' : 'user');
            setIsPremium(userData.isPremium);
            setIsBanned(userData.isBanned);
            setAdminNotes(userData.adminNotes || '');
            setBanReason(userData.banReason || '');
            setLogs(logsRes.data);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos del usuario');
            navigate('/admin/usuarios/listado');
        } finally {
            setLoading(false);
        }
    };

    const handleBanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        if (newValue) {
            setShowBanModal(true);
        } else {
            setIsBanned(false);
            setBanReason(''); // Limpiar razón al desbanear
        }
    };

    const confirmBan = () => {
        setIsBanned(true);
        setShowBanModal(false);
    };

    const handlePremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        if (newValue) {
            setShowPremiumModal(true);
        } else {
            setIsPremium(false);
        }
    };

    const confirmPremium = () => {
        setIsPremium(true);
        setShowPremiumModal(false);
    };

    const handleSave = async () => {
        if (!user) return;

        // Validación básica
        if (isBanned && !banReason.trim()) {
            toast.error('Debes especificar una razón para el baneo');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/users/${user.id}`,
                {
                    role,
                    isPremium,
                    isBanned,
                    adminNotes,
                    banReason: isBanned ? banReason : null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Usuario actualizado correctamente');
            fetchUserAndLogs();
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };



    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/usuarios/listado')}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuario</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-500">Editando a {user.firstName} {user.lastName}</p>
                                {user.isBanned && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        Baneado
                                    </span>
                                )}
                                {user.isPremium && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Premium
                                    </span>
                                )}
                                {!user.isBanned && !user.isPremium && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        Activo
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: User Info & Edit Form */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Basic Info Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-blue-500" />
                                    Información Personal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                                        <p className="mt-1 text-gray-900 font-medium">{user.firstName} {user.lastName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Email</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">{user.email}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Fecha de Registro</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">ID de Usuario</label>
                                        <p className="mt-1 text-gray-900 font-mono text-sm">#{user.id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Settings Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <ShieldCheckIcon className="h-5 w-5 text-purple-500" />
                                    Permisos y Estado
                                </h2>

                                <div className="space-y-6">
                                    {/* Role Selection */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Rol del Usuario</label>
                                            <Tooltip content="Admin: panel completo | Alumno: solo contenido">
                                                <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                            </Tooltip>
                                        </div>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        >
                                            <option value="user">Alumno</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>

                                    {/* Premium Toggle */}
                                    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${isPremium ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    <CurrencyEuroIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-medium text-gray-900">Estado Premium</h3>
                                                        <Tooltip content="Activo: todo el contenido | Inactivo: limitado">
                                                            <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                                        </Tooltip>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Acceso a características de pago</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isPremium}
                                                    onChange={handlePremiumChange}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        {isPremium && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label className="block text-xs font-medium text-gray-500">Vencimiento Premium</label>
                                                    <Tooltip content="Fecha de expiración (si aplica)">
                                                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                                    </Tooltip>
                                                </div>
                                                <p className="text-sm text-gray-900">
                                                    {user.subscriptionEndDate
                                                        ? new Date(user.subscriptionEndDate).toLocaleDateString()
                                                        : 'Sin fecha de vencimiento (Acceso manual)'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ban Toggle */}
                                    <div className="flex flex-col gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${isBanned ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
                                                    <NoSymbolIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-medium text-gray-900">Estado Cuenta</h3>
                                                        <Tooltip content="Activo: acceso normal | Baneado: sin acceso">
                                                            <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                                        </Tooltip>
                                                    </div>
                                                    <p className="text-xs text-gray-500">El usuario no podrá iniciar sesión</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={isBanned}
                                                    onChange={handleBanChange}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>

                                        {isBanned && (
                                            <div className="pt-2 border-t border-red-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">Razón del baneo</label>
                                                    <Tooltip content="Por qué fue baneado (si aplica)">
                                                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                                    </Tooltip>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                    placeholder="Motivo de la suspensión..."
                                                    value={banReason}
                                                    onChange={(e) => setBanReason(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Notes */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Notas de Administrador</label>
                                            <Tooltip content="Comentarios internos (no visible para usuario)">
                                                <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                            </Tooltip>
                                        </div>
                                        <textarea
                                            rows={4}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Notas internas sobre este usuario..."
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                        />
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Audit Log */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <ClockIcon className="h-5 w-5 text-gray-500" />
                                    Historial de Cambios
                                </h2>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px]">
                                    {logs.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No hay registros de cambios.</p>
                                    ) : (
                                        logs.map((log) => (
                                            <div key={log.id} className="relative pb-4 border-l-2 border-gray-200 pl-4 last:border-0">
                                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-200 border-2 border-white"></div>
                                                <div className="text-xs text-gray-500 mb-1">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {log.editor ? `${log.editor.firstName} ${log.editor.lastName}` : 'Sistema'}
                                                </p>
                                                <div className="mt-1 bg-gray-50 p-2 rounded text-xs">
                                                    {parseLogDetails(log.details)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </main >
            </div >

            {/* Ban Confirmation Modal */}
            {
                showBanModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center gap-3 mb-4 text-red-600">
                                <ExclamationTriangleIcon className="h-8 w-8" />
                                <h3 className="text-lg font-bold">¿Suspender usuario?</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que deseas banear a <strong>{user.firstName} {user.lastName}</strong>?
                                El usuario perderá el acceso inmediato a la plataforma.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowBanModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmBan}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Confirmar Suspensión
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Premium Confirmation Modal */}
            {
                showPremiumModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center gap-3 mb-4 text-blue-600">
                                <CurrencyEuroIcon className="h-8 w-8" />
                                <h3 className="text-lg font-bold">¿Activar Premium Manualmente?</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Esto otorgará acceso completo a la plataforma. Si el usuario ya tiene una suscripción activa,
                                <strong> esta acción podría interferir con la facturación automática</strong>.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowPremiumModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmPremium}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Activar Premium
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
