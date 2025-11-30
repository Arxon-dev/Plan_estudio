import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    UsersIcon,
    AcademicCapIcon,
    GlobeAltIcon,
    Cog6ToothIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    UserCircleIcon,
    ChartBarIcon,
    BookOpenIcon,
    QuestionMarkCircleIcon,
    ArrowUpTrayIcon,
    SparklesIcon,
    DocumentTextIcon,
    CurrencyEuroIcon,
    MegaphoneIcon,
    AdjustmentsHorizontalIcon,
    ClipboardDocumentListIcon,
    ArrowLeftOnRectangleIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface MenuItem {
    title: string;
    icon: React.ElementType;
    path?: string;
    submenu?: { title: string; path: string; icon: React.ElementType }[];
}

export const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Usuarios', 'Contenido Académico', 'Gestión Web', 'Sistema']);

    const menuItems: MenuItem[] = [
        {
            title: 'Dashboard',
            icon: HomeIcon,
            path: '/admin'
        },
        {
            title: 'Usuarios',
            icon: UsersIcon,
            submenu: [
                { title: 'Gestión de Usuarios', path: '/admin/usuarios/listado', icon: UserCircleIcon },
                { title: 'Progreso Alumnos', path: '/admin/usuarios/progreso', icon: ChartBarIcon }
            ]
        },
        {
            title: 'Simulacros',
            icon: AcademicCapIcon,
            path: '/admin/simulacros'
        },
        {
            title: 'Contenido Académico',
            icon: BookOpenIcon,
            submenu: [
                { title: 'Temario', path: '/admin/contenido/temario', icon: BookOpenIcon },
                { title: 'Banco de Preguntas', path: '/admin/contenido/preguntas', icon: QuestionMarkCircleIcon },
                { title: 'Importador Masivo', path: '/admin/contenido/importador', icon: ArrowUpTrayIcon },
                { title: 'Generador IA', path: '/admin/contenido/generador', icon: SparklesIcon }
            ]
        },
        {
            title: 'Gestión Web',
            icon: GlobeAltIcon,
            submenu: [
                { title: 'Guía de Estudio', path: '/admin/web/guia-estudio', icon: DocumentTextIcon },
                { title: 'Marketing y Precios', path: '/admin/web/marketing', icon: CurrencyEuroIcon },
                { title: 'Avisos Globales', path: '/admin/web/avisos', icon: MegaphoneIcon }
            ]
        },
        {
            title: 'Sistema',
            icon: Cog6ToothIcon,
            submenu: [
                { title: 'Configuración', path: '/admin/sistema/configuracion', icon: AdjustmentsHorizontalIcon },
                { title: 'Logs de Actividad', path: '/admin/sistema/logs', icon: ClipboardDocumentListIcon },
                { title: 'Uso de IA', path: '/admin/sistema/ai-usage', icon: CpuChipIcon }
            ]
        }
    ];

    const toggleMenu = (title: string) => {
        setExpandedMenus(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    const isActive = (path?: string) => {
        if (!path) return false;
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col flex-shrink-0 transition-all duration-300">
            <div className="p-4 flex items-center justify-center border-b border-slate-800">
                <span className="text-xl font-bold text-white tracking-wider">OPOMELILLA</span>
                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">ADMIN</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {menuItems.map((item) => (
                        <div key={item.title}>
                            {item.submenu ? (
                                <div>
                                    <button
                                        onClick={() => toggleMenu(item.title)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${expandedMenus.includes(item.title) ? 'text-white' : 'hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                            {item.title}
                                        </div>
                                        {expandedMenus.includes(item.title) ? (
                                            <ChevronDownIcon className="h-4 w-4" />
                                        ) : (
                                            <ChevronRightIcon className="h-4 w-4" />
                                        )}
                                    </button>

                                    {expandedMenus.includes(item.title) && (
                                        <div className="mt-1 space-y-1 pl-10">
                                            {item.submenu.map((subItem) => (
                                                <button
                                                    key={subItem.path}
                                                    onClick={() => navigate(subItem.path)}
                                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(subItem.path)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'hover:bg-slate-800 hover:text-white'
                                                        }`}
                                                >
                                                    <subItem.icon className="mr-3 h-4 w-4 opacity-70" />
                                                    {subItem.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate(item.path!)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                    {item.title}
                                </button>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                >
                    <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
                    Volver a la App
                </button>
            </div>
        </div>
    );
};
