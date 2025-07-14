import React, { useState, useEffect } from 'react';
import optimizedApi from '../api/optimizedAxios';
import { obtenerUsuarioAutenticado } from '../api/utils';
import { 
    Users, 
    Building2, 
    Package, 
    FileText, 
    CheckCircle, 
    Clock, 
    XCircle,
    TrendingUp,
    Calendar,
    MapPin
} from 'lucide-react';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const [stats, setStats] = useState({
        solicitudes: {
            total: 0,
            pendientes: 0,
            aprobadas: 0,
            rechazadas: 0,
            porEstado: []
        },
        empleados: {
            total: 0,
            pendientes: 0,
            aprobados: 0,
            entregados: 0,
            rechazados: 0
        },
        empresas: {
            total: 0,
            empleadosPorEmpresa: []
        },
        elementos: {
            totalSolicitados: 0,
            masSolicitados: []
        },
        entregas: {
            totalEntregas: 0,
            entregasPorMes: []
        },
        recientes: []
    });
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            console.log('📊 Cargando estadísticas del dashboard...');
            
            const [statsResponse, usuarioData] = await Promise.all([
                optimizedApi.getCached('/dashboard/stats', {}, 2 * 60 * 1000), // 2 minutos de caché
                obtenerUsuarioAutenticado()
            ]);

            if (statsResponse.data.status === 'success' && statsResponse.data.data) {
                console.log('📊 Datos del dashboard recibidos:', statsResponse.data.data);
                setStats(statsResponse.data.data);
                setUsuario(usuarioData);
            } else {
                console.error('❌ Respuesta inesperada:', statsResponse.data);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar estadísticas',
                    text: 'Formato de respuesta inválido'
                });
            }
        } catch (error) {
            console.error('❌ Error al obtener estadísticas:', error.response || error);
            if (error.response?.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sesión expirada',
                    text: 'Por favor inicie sesión nuevamente'
                });
                window.location.href = '/login';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar estadísticas',
                    text: error.response?.data?.message || error.message
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color, bgColor = 'bg-white' }) => (
        <div className={`${bgColor} rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        {title}
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="h-8 w-8 text-white" />
                </div>
            </div>
        </div>
    );

    const StatusBadge = ({ status }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'En revisión':
                    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
                case 'Aprobado':
                case 'Aprobado Parcial':
                    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
                case 'Rechazado':
                    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                default:
                    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            }
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                {status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Dashboard de Dotaciones
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Bienvenido, {usuario?.nombre || 'Usuario'}
                    </p>
                </div>

                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Solicitudes"
                        value={stats.solicitudes.total}
                        subtitle={`${stats.solicitudes.pendientes} pendientes`}
                        icon={FileText}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Total Empleados"
                        value={stats.empleados.total}
                        subtitle={`${stats.empleados.entregados} entregados`}
                        icon={Users}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Total Empresas"
                        value={stats.empresas.total}
                        subtitle="Empresas activas"
                        icon={Building2}
                        color="bg-purple-500"
                    />
                    <StatCard
                        title="Elementos Solicitados"
                        value={stats.elementos.totalSolicitados}
                        subtitle="Total de elementos"
                        icon={Package}
                        color="bg-orange-500"
                    />
                </div>

                {/* Gráficos y Estadísticas Detalladas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Estado de Solicitudes */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Estado de Solicitudes
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                                    <span className="text-gray-700 dark:text-gray-300">Pendientes</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {stats.solicitudes.pendientes}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    <span className="text-gray-700 dark:text-gray-300">Aprobadas</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {stats.solicitudes.aprobadas}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                    <span className="text-gray-700 dark:text-gray-300">Rechazadas</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {stats.solicitudes.rechazadas}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Estado de Empleados */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Estado de Empleados
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                                    <span className="text-gray-700 dark:text-gray-300">Pendientes</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {stats.empleados.pendientes}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    <span className="text-gray-700 dark:text-gray-300">Aprobados</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {stats.empleados.aprobados}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Package className="h-5 w-5 text-blue-500 mr-2" />
                                    <span className="text-gray-700 dark:text-gray-300">Entregados</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {stats.empleados.entregados}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                    <span className="text-gray-700 dark:text-gray-300">Rechazados</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {stats.empleados.rechazados}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Elementos Más Solicitados */}
                {stats.elementos.masSolicitados.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Elementos Más Solicitados
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.elementos.masSolicitados.slice(0, 8).map((elemento, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {elemento.nombre}
                                        </span>
                                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {elemento.cantidad}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Solicitudes Recientes */}
                {stats.recientes.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Solicitudes Recientes
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Empresa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Sede
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {stats.recientes.map((solicitud) => (
                                        <tr key={solicitud.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {solicitud.codigoSolicitud}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {solicitud.NombreEmpresa}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {solicitud.NombreSede}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={solicitud.estadoSolicitud} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {formatDate(solicitud.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Entregas por Mes */}
                {stats.entregas.entregasPorMes.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Entregas por Mes (Últimos 6 meses)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {stats.entregas.entregasPorMes.map((entrega, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                        {new Date(entrega.mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {entrega.cantidad}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
