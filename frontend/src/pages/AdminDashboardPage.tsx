// en frontend/src/pages/AdminDashboardPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Typography, Row, Col, Card, Statistic, message, Spin } from 'antd';
import { TeamOutlined, FileTextOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Pie } from '@ant-design/charts';
// (Opcional) Importa un gráfico si instalaste los charts
// import { Pie } from '@ant-design/charts';

const { Content } = Layout;
const { Title } = Typography;

// --- Interfaces Simplificadas (Solo lo que necesitamos para los KPIs) ---
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
  // Estados para guardar los datos de las APIs
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  // --- Carga de Datos (useEffect) ---
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

        // Hacemos 3 peticiones a la API en paralelo
        const [agentesRes, polizasRes, siniestrosRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/agentes/', { headers }),
          axios.get('http://127.0.0.1:8000/api/polizas/', { headers }),
          axios.get('http://127.0.0.1:8000/api/siniestros/', { headers })
        ]);

        setAgentes(agentesRes.data);
        setPolizas(polizasRes.data);
        setSiniestros(siniestrosRes.data);

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        message.error('Error al cargar los datos del panel.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // El [] asegura que solo se ejecute una vez

  // --- Cálculo de Estadísticas (useMemo) ---
  // Usamos useMemo para que estos cálculos solo se rehagan si los datos cambian
  const { stats, pieData } = useMemo(() => { // <-- Modifica esta línea
    
    // --- Tus cálculos de KPI (ya existen) ---
    const polizasActivas = polizas.filter(p => p.estado === 'activa').length;
    const siniestrosPendientes = siniestros.filter(s => s.estado === 'reportado' || s.estado === 'en_revision').length;
    const totalAgentes = agentes.length;
    const totalPagado = siniestros
      .filter(s => s.estado === 'pagado' && s.monto_aprobado)
      .reduce((sum, s) => sum + parseFloat(s.monto_aprobado!), 0);

    const kpiStats = { polizasActivas, siniestrosPendientes, totalAgentes, totalPagado };

    // --- NUEVO: Prepara los datos para el Gráfico de Pastel ---
    const polizasPorEstado: { [key: string]: number } = {};
    for (const poliza of polizas) {
      const estado = poliza.estado || 'Desconocido';
      if (polizasPorEstado[estado]) {
        polizasPorEstado[estado]++;
      } else {
        polizasPorEstado[estado] = 1;
      }
    }
    
    const pieChartData = Object.keys(polizasPorEstado).map(estado => ({
      type: estado.toUpperCase(), // Ej. 'ACTIVA'
      value: polizasPorEstado[estado], // Ej. 5
    }));
    return { stats: kpiStats, pieData: pieChartData };
  }, [polizas, siniestros, agentes]); 

  // Muestra un spinner mientras carga todo
  if (loading) {
    return (
      <Layout style={{ padding: '50px', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  // ... (en el return) ...
  return (
    <Layout>
      <Content style={{padding: '15px'}}>
        <Title level={2} style={{marginBottom: '24px',textAlign: 'center', fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>
            Reportes del Administrador
        </Title>
        
        {/* Fila de Tarjetas de Estadísticas (Asegúrate de que 'value' use 'stats.') */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total de Agentes"
                value={stats.totalAgentes} // <-- Usa stats.
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pólizas Activas"
                value={stats.polizasActivas} // <-- Usa stats.
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Siniestros Pendientes"
                value={stats.siniestrosPendientes} // <-- Usa stats.
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#cf1322' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Pagado (Siniestros)"
                value={stats.totalPagado} // <-- Usa stats.
                prefix={<CheckCircleOutlined />}
                suffix="$"
                precision={2} 
              />
            </Card>
          </Col>
        </Row>

        {/* --- AÑADE ESTA SECCIÓN PARA LOS GRÁFICOS --- */}
        <Row gutter={16} style={{ marginTop: '24px' }}>
          <Col xs={24} md={12}>
            <Card title="Pólizas por Estado">
              {/* Si no hay datos, muestra un mensaje, si no, el gráfico */}
              {pieData.length === 0 ? (
                <Typography.Text>No hay datos de pólizas para mostrar.</Typography.Text>
              ) : (
                <Pie
                  data={pieData}
                  angleField='value' // El campo con el número
                  colorField='type'  // El campo con el nombre (ej. 'ACTIVA')
                  radius={0.8}
                  label={{
                    type: 'inner',
                    content: '{percentage}', // Muestra el porcentaje
                  }}
                  interactions={[{ type: 'element-active' }]}
                />
              )}
            </Card>
          </Col>
          {/* (Puedes añadir otro gráfico aquí en un <Col span={12}>) */}
        </Row>
        {/* --- FIN DE LA SECCIÓN DE GRÁFICOS --- */}

      </Content>
    </Layout>
  );
};

export default AdminDashboardPage;