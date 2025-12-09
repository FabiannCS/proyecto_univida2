// en frontend/src/pages/AdminDashboardPage.tsx - VERSIÓN LIMPIA
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  message, 
  Spin,
  Progress,
  Tag,
  List,
  Avatar
} from 'antd';
import { 
  TeamOutlined, 
  UserOutlined,
  FileTextOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

interface Agente {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Poliza {
  id: number;
  numero_poliza: string;
  estado: string;
  suma_asegurada: string;
  prima_anual: string;
  cliente_info: {
    usuario_info: {
      first_name: string;
      last_name: string;
    };
  };
}

interface Siniestro {
  id: number;
  numero_siniestro: string;
  estado: string;
  monto_reclamado: string;
  tipo_siniestro: string;
  poliza_info: {
    numero_poliza: string;
  };
}

interface Cliente {
  id: number;
  usuario_info: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminDashboardPage: React.FC = () => {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        // Hacer peticiones con manejo de errores individual
        const requests = [
          axios.get('https://proyecto-univida2.onrender.com/api/agentes/', { headers }),
          axios.get('https://proyecto-univida2.onrender.com/api/polizas/', { headers }),
          axios.get('https://proyecto-univida2.onrender.com/api/siniestros/', { headers }),
          axios.get('https://proyecto-univida2.onrender.com/api/clientes/', { headers })
        ];

        const responses = await Promise.allSettled(requests);

        // Procesar respuestas individualmente
        responses.forEach((response, index) => {
          if (response.status === 'fulfilled') {
            switch (index) {
              case 0: setAgentes(response.value.data); break;
              case 1: setPolizas(response.value.data); break;
              case 2: setSiniestros(response.value.data); break;
              case 3: setClientes(response.value.data); break;
            }
          } else {
            console.warn(`Error cargando datos del índice ${index}:`, response.reason);
          }
        });

      } catch (error: any) {
        console.error('Error general al cargar datos:', error);
        message.error('Error al cargar algunos datos del panel.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calcular estadísticas
  const dashboardStats = useMemo(() => {
    const polizasActivas = polizas.filter(p => p.estado === 'activa').length;
    const polizasCotizacion = polizas.filter(p => p.estado === 'cotizacion').length;
    const siniestrosPendientes = siniestros.filter(s => 
      s.estado === 'reportado' || s.estado === 'en_revision'
    ).length;
    const siniestrosAprobados = siniestros.filter(s => s.estado === 'aprobado').length;
    
    const totalPrimas = polizas.reduce((sum, poliza) => 
      sum + parseFloat(poliza.prima_anual || '0'), 0
    );
    
    const totalReclamado = siniestros.reduce((sum, siniestro) => 
      sum + parseFloat(siniestro.monto_reclamado || '0'), 0
    );

    // Distribución de pólizas por estado
    const distribucionPolizas = polizas.reduce((acc, poliza) => {
      const estado = poliza.estado || 'desconocido';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalAgentes: agentes.length,
      totalClientes: clientes.length,
      totalPolizas: polizas.length,
      totalSiniestros: siniestros.length,
      polizasActivas,
      polizasCotizacion,
      siniestrosPendientes,
      siniestrosAprobados,
      totalPrimas,
      totalReclamado,
      distribucionPolizas
    };
  }, [agentes, clientes, polizas, siniestros]);

  // Obtener últimos registros para mostrar
  const ultimosRegistros = useMemo(() => ({
    ultimasPolizas: polizas.slice(-5).reverse(),
    ultimosSiniestros: siniestros.slice(-5).reverse(),
    agentesRecientes: agentes.slice(-5).reverse()
  }), [polizas, siniestros, agentes]);

  if (loading) {
    return (
      <Layout style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Cargando datos del dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={1} style={{ 
            fontFamily: 'Michroma, sans-serif', 
            fontSize: '2.5rem',
            color: '#1890ff',
            marginBottom: '8px'
          }}>
            Seguros Univida
          </Title>
          <Text style={{ fontSize: '1.2rem', color: '#666' }}>
            Panel de Control Administrativo
          </Text>
        </div>

        {/* Estadísticas Principales */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Clientes"
                value={dashboardStats.totalClientes}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Agentes"
                value={dashboardStats.totalAgentes}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pólizas Activas"
                value={dashboardStats.polizasActivas}
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Siniestros Pendientes"
                value={dashboardStats.siniestrosPendientes}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Segunda Fila de Estadísticas */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Pólizas"
                value={dashboardStats.totalPolizas}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Primas Anuales"
                value={dashboardStats.totalPrimas}
                prefix={<DollarOutlined />}
                precision={2}
                suffix="$"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Siniestros Aprobados"
                value={dashboardStats.siniestrosAprobados}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Monto Reclamado"
                value={dashboardStats.totalReclamado}
                prefix={<BarChartOutlined />}
                precision={2}
                suffix="$"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Distribución de Pólizas */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card 
              title="Distribución de Pólizas por Estado" 
              extra={<Tag color="blue">{dashboardStats.totalPolizas} total</Tag>}
            >
              {Object.entries(dashboardStats.distribucionPolizas).map(([estado, cantidad]) => {
                const porcentaje = dashboardStats.totalPolizas > 0 
                  ? (cantidad / dashboardStats.totalPolizas) * 100 
                  : 0;
                
                return (
                  <div key={estado} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text strong style={{ textTransform: 'capitalize' }}>
                        {estado}
                      </Text>
                      <Text>
                        {cantidad} ({porcentaje.toFixed(1)}%)
                      </Text>
                    </div>
                    <Progress 
                      percent={porcentaje} 
                      size="small"
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </div>
                );
              })}
            </Card>
          </Col>

          {/* Últimas Pólizas */}
          <Col xs={24} lg={12}>
            <Card 
              title="Últimas Pólizas" 
              extra={<a onClick={() => navigate('/admin-polizas')}>Ver todas</a>}
            >
              <List
                itemLayout="horizontal"
                dataSource={ultimosRegistros.ultimasPolizas}
                renderItem={poliza => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={
                        <a onClick={() => navigate(`/admin-polizas/${poliza.id}`)}>
                          {poliza.numero_poliza}
                        </a>
                      }
                      description={
                        <div>
                          <div>{poliza.cliente_info?.usuario_info?.first_name} {poliza.cliente_info?.usuario_info?.last_name}</div>
                          <Tag color={poliza.estado === 'activa' ? 'green' : 'orange'}>
                            {poliza.estado}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay pólizas recientes' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Últimos Siniestros y Agentes */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title="Siniestros Recientes" 
              extra={<a onClick={() => navigate('/admin-siniestros')}>Ver todos</a>}
            >
              <List
                itemLayout="horizontal"
                dataSource={ultimosRegistros.ultimosSiniestros}
                renderItem={siniestro => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<ExclamationCircleOutlined />} />}
                      title={
                        <a onClick={() => navigate(`/admin-siniestros/${siniestro.id}`)}>
                          {siniestro.numero_siniestro}
                        </a>
                      }
                      description={
                        <div>
                          <div>Póliza: {siniestro.poliza_info?.numero_poliza}</div>
                          <div>
                            <Tag color={
                              siniestro.estado === 'reportado' ? 'red' : 
                              siniestro.estado === 'en_revision' ? 'orange' : 'green'
                            }>
                              {siniestro.estado}
                            </Tag>
                            <Tag>{siniestro.tipo_siniestro}</Tag>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay siniestros recientes' }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title="Agentes Recientes" 
              extra={<a onClick={() => navigate('/admin-agentes')}>Ver todos</a>}
            >
              <List
                itemLayout="horizontal"
                dataSource={ultimosRegistros.agentesRecientes}
                renderItem={agente => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TeamOutlined />} />}
                      title={agente.username}
                      description={
                        <div>
                          <div>{agente.first_name} {agente.last_name}</div>
                          <div>{agente.email}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No hay agentes recientes' }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AdminDashboardPage;