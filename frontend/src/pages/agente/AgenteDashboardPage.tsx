// en frontend/src/pages/agente/AgenteDashboardPage.tsx
import React from 'react';
import { Typography, Row, Col, Card, Statistic } from 'antd';
import { UsergroupAddOutlined, FileDoneOutlined, DollarCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AgenteDashboardPage: React.FC = () => {
  // Datos simulados (Tu compañero conectará esto a la API después)
  const stats = {
    totalClientes: 12,
    polizasVendidas: 8,
    comisionesMes: 450.00,
    metaMensual: 80
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Mi Resumen</Title>
        <Text type="secondary" style={{fontFamily: "'Michroma', sans-serif"}}>Bienvenido a tu panel de gestión comercial.</Text>
      </div>

      {/* Tarjetas de Estadísticas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Mis Clientes" 
              value={stats.totalClientes} 
              prefix={<UsergroupAddOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Pólizas Vendidas" 
              value={stats.polizasVendidas} 
              prefix={<FileDoneOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Comisiones (Mes)" 
              value={stats.comisionesMes} 
              precision={2}
              prefix="$"
              suffix={<DollarCircleOutlined style={{ color: '#faad14' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #001529 0%, #00474f 100%)' }}>
            <Statistic 
              title={<span style={{ color: 'rgba(255,255,255,0.7)' }}>Meta Mensual</span>}
              value={stats.metaMensual} 
              suffix="%"
              valueStyle={{ color: '#fff' }}
              prefix={<TrophyOutlined style={{ color: '#fff' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* Aquí podrías agregar una tabla de "Últimas Ventas" después */}
    </div>
  );
};

export default AgenteDashboardPage;