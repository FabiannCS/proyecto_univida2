// en frontend/src/pages/AdminDashboardPage.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Typography, Row, Col, Card, Statistic, message, Spin } from 'antd';
import { TeamOutlined, FileTextOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Pie } from '@ant-design/charts';

const { Content } = Layout;
const { Title } = Typography;

interface Agente {
  id: number;
}

interface Poliza {
  id: number;
  estado: string;
}

interface Siniestro {
  id: number;
  estado: string;
  monto_aprobado: string | null;
}

const AdminDashboardPage: React.FC = () => {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) {
          message.error('No estás autenticado.');
          setLoading(false);
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        const [agentesRes, polizasRes, siniestrosRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/agentes/', { headers }),
          axios.get('http://127.0.0.1:8000/api/polizas/', { headers }),
          axios.get('http://127.0.0.1:8000/api/siniestros/', { headers })
        ]);

        setAgentes(agentesRes.data);
        setPolizas(polizasRes.data);
        setSiniestros(siniestrosRes.data);

      } catch (error: any) {
        console.error('Error al cargar datos del dashboard:', error);
        if (error.response?.status === 401) {
          message.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else {
          message.error('Error al cargar los datos del panel.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const { stats, pieData } = useMemo(() => {
    // Cálculos básicos de estadísticas
    const polizasActivas = polizas.filter(p => p.estado === 'activa').length;
    const siniestrosPendientes = siniestros.filter(s => 
      s.estado === 'reportado' || s.estado === 'en_revision'
    ).length;
    const totalAgentes = agentes.length;
    const totalPagado = siniestros
      .filter(s => s.estado === 'pagado' && s.monto_aprobado)
      .reduce((sum, s) => sum + parseFloat(s.monto_aprobado!), 0);

    const kpiStats = { 
      polizasActivas, 
      siniestrosPendientes, 
      totalAgentes, 
      totalPagado 
    };

    // Preparar datos para el gráfico de pastel - VERSIÓN CORREGIDA
    const polizasPorEstado: { [key: string]: number } = {};
    
    polizas.forEach(poliza => {
      const estado = poliza.estado || 'Desconocido';
      polizasPorEstado[estado] = (polizasPorEstado[estado] || 0) + 1;
    });

    // Calcular porcentajes manualmente
    const totalPolizas = polizas.length;
    const pieChartData = Object.keys(polizasPorEstado).map(estado => {
      const value = polizasPorEstado[estado];
      const percentage = totalPolizas > 0 ? ((value / totalPolizas) * 100).toFixed(1) : '0';
      
      return {
        type: estado.charAt(0).toUpperCase() + estado.slice(1), // Capitalizar primera letra
        value: value,
        percentage: `${percentage}%`
      };
    });

    return { stats: kpiStats, pieData: pieChartData };
  }, [polizas, siniestros, agentes]);

  if (loading) {
    return (
      <Layout style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Cargando datos del dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{ 
          marginBottom: '24px', 
          textAlign: 'center', 
          fontFamily: 'Michroma, sans-serif', 
          fontSize: '1.7rem' 
        }}>
          Reportes del Administrador
        </Title>
        
        {/* Fila de Tarjetas de Estadísticas */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total de Agentes"
                value={stats.totalAgentes}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pólizas Activas"
                value={stats.polizasActivas}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Siniestros Pendientes"
                value={stats.siniestrosPendientes}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Pagado (Siniestros)"
                value={stats.totalPagado}
                prefix={<CheckCircleOutlined />}
                suffix="$"
                precision={2}
              />
            </Card>
          </Col>
        </Row>
        
        {/* Sección de Gráficos */}
        <Row gutter={16} style={{ marginTop: '24px' }}>
          <Col xs={24} md={12}>
            <Card title="Distribución de Pólizas por Estado">
              {pieData.length === 0 ? (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#999' 
                }}>
                  No hay datos de pólizas para mostrar.
                </div>
              ) : (
                <Pie
                  data={pieData}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                  label={{
                    type: 'outer',                    
                    content: '{name} {value}',
                  }}
                 
                  height={300}
                />
              )}
            </Card>
          </Col>
          
          {/* Puedes añadir otro gráfico aquí */}
          <Col xs={24} md={12}>
            <Card title="Resumen General">
              <div style={{ padding: '20px' }}>
                <Statistic
                  title="Total de Pólizas"
                  value={polizas.length}
                  prefix={<FileTextOutlined />}
                  style={{ marginBottom: '16px' }}
                />
                <Statistic
                  title="Total de Siniestros"
                  value={siniestros.length}
                  prefix={<ExclamationCircleOutlined />}
                  style={{ marginBottom: '16px' }}
                />
                <Statistic
                  title="Tasa de Siniestros"
                  value={polizas.length > 0 ? ((siniestros.length / polizas.length) * 100).toFixed(2) : 0}
                  suffix="%"
                  precision={2}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AdminDashboardPage;