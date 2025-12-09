// en frontend/src/pages/agente/AgenteDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, Spin, Table, Tag, Divider, Avatar, List, Button} from 'antd';
import { 
    UsergroupAddOutlined, FileDoneOutlined, DollarOutlined, 
    InboxOutlined, RiseOutlined, AlertOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AgenteDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get('https://proyecto-univida2.onrender.com/api/agente/dashboard-stats/', { headers });
        setStats(response.data);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Panel de Control</Title>
        <Text type="secondary">Resumen de rendimiento y alertas.</Text>
      </div>

      {/* --- SECCIÓN 1: KPIs FINANCIEROS Y OPERATIVOS --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        
        {/* Comisiones (El dato que más le importa al agente) */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #00474f 0%, #001529 100%)' }}>
            <Statistic 
              title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>Comisiones Estimadas (Mes)</span>}
              value={stats.comisiones_mes} 
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} // Verde dinero
              suffix={<RiseOutlined />}
            />
          </Card>
        </Col>

        {/* Ventas Totales */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Ventas Totales (Mes)" 
              value={stats.ventas_mes} 
              precision={2}
              prefix="Bs."
              valueStyle={{ color: '#0050b3' }}
            />
          </Card>
        </Col>

        {/* Clientes Activos */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable onClick={() => navigate('/agente-clientes')}>
            <Statistic 
              title="Cartera de Clientes" 
              value={stats.total_clientes} 
              prefix={<UsergroupAddOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>

        {/* Solicitudes Pendientes (Alerta) */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            hoverable 
            onClick={() => navigate('/agente-solicitudes')}
            style={{ border: stats.solicitudes_pendientes > 0 ? '1px solid #faad14' : 'none' }}
          >
            <Statistic 
              title="Solicitudes Nuevas" 
              value={stats.solicitudes_pendientes} 
              valueStyle={{ color: stats.solicitudes_pendientes > 0 ? '#faad14' : 'inherit' }}
              prefix={<InboxOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
          {/* --- SECCIÓN 2: OPORTUNIDADES (Pólizas por Vencer) --- */}
          <Col xs={24} lg={12}>
              <Card 
                title={<span><AlertOutlined style={{ color: '#faad14' }} /> Próximos Vencimientos (30 días)</span>}
                bordered={false}
                style={{ height: '100%' }}
              >
                  {stats.por_vencer && stats.por_vencer.length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={stats.por_vencer}
                        renderItem={(item: any) => (
                            <List.Item actions={[<Button size="small" type="link">Contactar</Button>]}>
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: '#faad14' }}>V</Avatar>}
                                    title={<a onClick={() => navigate(`/agente-polizas/${item.id}`)}>{item.cliente}</a>}
                                    description={`Póliza #${item.numero} - Vence: ${item.vence}`}
                                />
                            </List.Item>
                        )}
                      />
                  ) : (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                          <CheckCircleOutlined style={{ fontSize: '24px', marginBottom: 10, color: '#52c41a' }} />
                          <p>No hay pólizas por vencer pronto.</p>
                      </div>
                  )}
              </Card>
          </Col>

          {/* --- SECCIÓN 3: ACTIVIDAD RECIENTE (Últimas Ventas) --- */}
          <Col xs={24} lg={12}>
              <Card 
                title={<span><FileDoneOutlined style={{ color: '#1890ff' }} /> Últimas Ventas Realizadas</span>}
                bordered={false}
                style={{ height: '100%' }}
              >
                  <Table 
                    dataSource={stats.ultimas_ventas}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                        { title: 'Plan', dataIndex: 'plan', key: 'plan' },
                        { title: 'Prima', dataIndex: 'monto', render: (v: any) => `Bs. ${v}` },
                        { title: 'Fecha', dataIndex: 'fecha' },
                        { title: '', render: (r:any) => <Button size="small" onClick={() => navigate(`/agente-polizas/${r.id}`)}>Ver</Button> }
                    ]}
                  />
              </Card>
          </Col>
      </Row>
    </div>
  );
};

export default AgenteDashboardPage;