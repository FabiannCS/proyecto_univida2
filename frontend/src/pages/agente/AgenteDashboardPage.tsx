// en frontend/src/pages/agente/AgenteDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, Spin, message } from 'antd';
import { UsergroupAddOutlined, FileDoneOutlined, DollarCircleOutlined, InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AgenteDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    total_clientes: 0,
    polizas_activas: 0,
    solicitudes_pendientes: 0,
    ventas_mes: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // Llamada a la nueva API
        const response = await axios.get('http://127.0.0.1:8000/api/agente/dashboard-stats/', { headers });
        setStats(response.data);

      } catch (error) {
        console.error(error);
        // message.error('Error al cargar estadísticas'); // Opcional
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
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Mi Resumen</Title>
        <Text type="secondary">Bienvenido a tu panel de gestión comercial.</Text>
      </div>

      {/* Tarjetas de Estadísticas */}
      <Row gutter={[16, 16]}>
        
        {/* Clientes */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable onClick={() => navigate('/agente-clientes')}>
            <Statistic 
              title="Mis Clientes Activos" 
              value={stats.total_clientes} 
              prefix={<UsergroupAddOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>

        {/* Pólizas */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable onClick={() => navigate('/agente-polizas')}>
            <Statistic 
              title="Pólizas Vendidas" 
              value={stats.polizas_activas} 
              prefix={<FileDoneOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>

        {/* Solicitudes (Oportunidades) */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable onClick={() => navigate('/agente-solicitudes')}>
            <Statistic 
              title="Solicitudes Nuevas" 
              value={stats.solicitudes_pendientes} 
              valueStyle={{ color: stats.solicitudes_pendientes > 0 ? '#faad14' : 'inherit' }}
              prefix={<InboxOutlined />} 
            />
          </Card>
        </Col>

        {/* Ventas del Mes */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #001529 0%, #00474f 100%)' }}>
            <Statistic 
              title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>Ventas este Mes</span>}
              value={stats.ventas_mes} 
              precision={2}
              prefix="$"
              valueStyle={{ color: '#fff' }}
              suffix={<DollarCircleOutlined style={{ color: '#fff', opacity: 0.5 }} />} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AgenteDashboardPage;