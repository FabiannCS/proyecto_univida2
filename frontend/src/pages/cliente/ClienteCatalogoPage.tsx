// en frontend/src/pages/cliente/ClienteCatalogoPage.tsx
import React from 'react';
import { Typography, Row, Col, Card, Button, List, Tag, Divider } from 'antd';
import { CheckCircleOutlined, SafetyCertificateOutlined, RocketOutlined, CrownOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ClienteCatalogoPage: React.FC = () => {
  const navigate = useNavigate();

  // Datos del catálogo (según tu requerimiento)
  const planes = [
    {
      nombre: "Plan Básico",
      icono: <SafetyCertificateOutlined style={{ fontSize: '40px', color: '#52c41a' }} />,
      color: '#52c41a',
      precio: "350 Bs.",
      tasa: "2.5", // Por mil
      sumaAsegurada: "50,000 Bs.",
      limiteMedico: "5,000 Bs.",
      features: [
        "Cobertura por fallecimiento",
        "Gastos médicos básicos",
        "Asistencia telefónica 24/7"
      ]
    },
    {
      nombre: "Plan Estándar",
      icono: <RocketOutlined style={{ fontSize: '40px', color: '#1890ff' }} />,
      color: '#1890ff',
      precio: "700 Bs.",
      tasa: "3.0",
      sumaAsegurada: "80,000 Bs.",
      limiteMedico: "15,000 Bs.",
      features: [
        "Cobertura por fallecimiento",
        "Gastos médicos ampliados",
        "Sepelio incluido",
        "Soporte 24/7",
        "Cobertura internacional"
      ],
      popular: true
    },
    {
      nombre: "Plan Premium",
      icono: <CrownOutlined style={{ fontSize: '40px', color: '#722ed1', fontFamily: 'Michroma, sans-serif'}} />,
      color: '#722ed1',
      precio: "1,200 Bs.",
      tasa: "4.5",
      sumaAsegurada: "150,000 Bs.",
      limiteMedico: "40,000 Bs.",
      features: [
        "Cobertura por fallecimiento",
        "Mejor red de clínicas",
        "Indemnización doble por accidente",
        "Soporte 24/7 personalizado",
        "Devolución de prima al 5to año"
      ]
    }
  ];

const handleSolicitar = (plan: any) => {
      // Navegamos y pasamos el 'plan' como ESTADO (state)
      const serializablePlan = {
        id: plan.id,
        nombre: plan.nombre,
        precio: plan.precio,
        sumaAsegurada: plan.sumaAsegurada,
        features: plan.features,
        color: plan.color
      };
      navigate('/solicitar-poliza', { state: { planSeleccionado: serializablePlan } });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/mi-poliza')} shape="circle" />
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <Title level={2} style={{ fontFamily: "'Michroma', sans-serif" }}>Catálogo de Pólizas</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>Elige la protección ideal para ti y tu familia</Text>
      </div>

      <Row gutter={[32, 32]} align="bottom">
        {planes.map((plan, index) => (
          <Col xs={24} md={8} key={index}>
            <Card 
                hoverable 
                style={{ 
                    height: '100%', 
                    borderRadius: '16px', 
                    borderTop: `6px solid ${plan.color}`,
                    position: 'relative',
                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                    zIndex: plan.popular ? 10 : 1,
                    boxShadow: plan.popular ? '0 10px 30px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.05)'
                }}
                styles={{ body: { padding: '32px 24px' } }}
            >
                {plan.popular && (
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                        <Tag color="red">MÁS VENDIDO</Tag>
                    </div>
                )}
                
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {plan.icono}
                    <Title level={3} style={{ margin: '16px 0' }}>{plan.nombre}</Title>
                    <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary">Prima Anual</Text>
                        <Title level={2} style={{ margin: 0, color: plan.color }}>{plan.precio}</Title>
                    </div>
                </div>

                <Divider />

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text strong>Suma Asegurada:</Text>
                        <Text>{plan.sumaAsegurada}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text strong>Límite Médico (GMA):</Text>
                        <Text>{plan.limiteMedico}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">Tasa Aplicada:</Text>
                        <Text type="secondary">{plan.tasa} por mil</Text>
                    </div>
                </div>

                <List
                    size="small"
                    dataSource={plan.features}
                    renderItem={item => (
                        <List.Item style={{ border: 'none', padding: '6px 0' }}>
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} /> {item}
                        </List.Item>
                    )}
                />

                <Button 
                    type="primary" 
                    block 
                    size="large" 
                    style={{ marginTop: '24px', backgroundColor: plan.color, borderColor: plan.color }}
                    onClick={() => handleSolicitar(plan)} // <-- Pasa el objeto 'plan' aquí
                >
                    Solicitar {plan.nombre}
                </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ClienteCatalogoPage;