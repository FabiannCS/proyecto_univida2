// en frontend/src/pages/cliente/ClienteCatalogoPage.tsx
import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, List, Tag, Divider, Modal, Descriptions, Tabs } from 'antd';
import { 
    CheckCircleOutlined, SafetyCertificateOutlined, RocketOutlined, CrownOutlined, 
    InfoCircleOutlined, CloseCircleOutlined, FileProtectOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ClienteCatalogoPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para el Modal de Detalles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planDetalle, setPlanDetalle] = useState<any>(null);

  // Datos del catálogo ENRIQUECIDOS con más información
  const planes = [
    {
      key: 'vida_temporal', // Clave para el backend
      nombre: "Plan Básico",
      icono: <SafetyCertificateOutlined style={{ fontSize: '40px', color: '#52c41a' }} />,
      color: '#52c41a',
      precio: "350 Bs.",
      tasa: "2.5",
      sumaAsegurada: "50,000 Bs.",
      limiteMedico: "10,000 Bs.",
      features: [
        "Cobertura por fallecimiento",
        "Gastos médicos básicos",
        "Asistencia telefónica 24/7"
      ],
      // --- NUEVA INFORMACIÓN DETALLADA ---
      descripcion: "La opción ideal para quienes buscan una protección esencial a bajo costo. Cubre las necesidades inmediatas de tu familia en caso de ausencia.",
      requisitos: [
          "Edad mínima de contratación: 18 años",
          "Edad máxima de contratación: 65 años",
          "Declaración simple de salud"
      ],
      exclusiones: [
          "Enfermedades preexistentes no declaradas",
          "Deportes extremos no cubiertos",
          "Suicidio durante el primer año"
      ]
    },
    {
      key: 'accidentes',
      nombre: "Plan Estándar",
      icono: <RocketOutlined style={{ fontSize: '40px', color: '#1890ff' }} />,
      color: '#1890ff',
      precio: "700 Bs.",
      tasa: "3.0",
      sumaAsegurada: "100,000 Bs.",
      limiteMedico: "30,000 Bs.",
      features: [
        "Muerte natural y accidental",
        "Gastos médicos ampliados",
        "Sepelio incluido",
        "Cobertura internacional"
      ],
      popular: true,
      descripcion: "Nuestro plan más equilibrado. Ofrece una cobertura robusta que incluye accidentes y gastos de sepelio para que tu familia no tenga que preocuparse por nada.",
      requisitos: [
        "Edad mínima: 18 años",
        "Edad máxima: 60 años",
        "Examen médico básico (si aplica)"
      ],
      exclusiones: [
        "Participación en actos delictivos",
        "Accidentes bajo influencia de sustancias"
      ]
    },
    {
      key: 'vida_entera',
      nombre: "Plan Premium",
      icono: <CrownOutlined style={{ fontSize: '40px', color: '#722ed1' }} />,
      color: '#722ed1',
      precio: "1,200 Bs.", // Ojo con este texto, asegúrate que sea el que quieres mostrar
      tasa: "4.5",
      sumaAsegurada: "150,000 mil dólares.",
      limiteMedico: "60,000 Bs.",
      features: [
        "Cobertura total todo riesgo",
        "Mejor red de clínicas",
        "Indemnización doble por accidente",
        "Devolución de prima al 5to año"
      ],
      descripcion: "La protección definitiva. Coberturas millonarias, acceso a las mejores clínicas y un componente de ahorro con devolución de primas.",
      requisitos: [
        "Edad mínima: 21 años",
        "Revisión médica completa",
        "Ingresos demostrables"
      ],
      exclusiones: [
        "Conflictos bélicos",
        "Fraude comprobado"
      ]
    }
  ];

  const handleSolicitar = (plan: any) => {
      // Desestructuramos para separar el 'icono' del resto de los datos.
      // 'planLimpio' tendrá todo MENOS el icono.
      const { icono, ...planLimpio } = plan;
      
      // Enviamos solo los datos de texto/números
      navigate('/solicitar-poliza', { state: { planSeleccionado: planLimpio } });
  };

  const handleVerMas = (plan: any) => {
      setPlanDetalle(plan);
      setIsModalOpen(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                    boxShadow: plan.popular ? '0 10px 30px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                styles={{ body: { padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column' } }}
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
                        <Text type="secondary">Prima Anual desde</Text>
                        <Title level={2} style={{ margin: 0, color: plan.color }}>{plan.precio}</Title>
                    </div>
                </div>

                <Divider />

                <div style={{ marginBottom: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text strong>Suma Asegurada:</Text>
                        <Text>{plan.sumaAsegurada}</Text>
                    </div>
                    <List
                        size="small"
                        dataSource={plan.features}
                        renderItem={(item: any) => (
                            <List.Item style={{ border: 'none', padding: '6px 0' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} /> {item}
                            </List.Item>
                        )}
                    />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button 
                        block 
                        icon={<InfoCircleOutlined />} 
                        onClick={() => handleVerMas(plan)}
                    >
                        Más Información
                    </Button>
                    <Button 
                        type="primary" 
                        block 
                        size="large" 
                        style={{ backgroundColor: plan.color, borderColor: plan.color }}
                        onClick={() => handleSolicitar(plan)}
                    >
                        Solicitar {plan.nombre}
                    </Button>
                </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* --- MODAL DE DETALLES --- */}
      <Modal
        title={null} // Quitamos el título por defecto para personalizarlo
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>Cerrar</Button>,
            <Button key="buy" type="primary" size="large" style={{ backgroundColor: planDetalle?.color }} onClick={() => { setIsModalOpen(false); handleSolicitar(planDetalle); }}>
                ¡Quiero este Plan!
            </Button>
        ]}
        width={700}
      >
        {planDetalle && (
            <div>
                <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: `4px solid ${planDetalle.color}`, paddingBottom: 20 }}>
                    <div style={{ fontSize: '48px', color: planDetalle.color }}>{planDetalle.icono}</div>
                    <Title level={2} style={{ margin: '10px 0' }}>{planDetalle.nombre}</Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>{planDetalle.descripcion}</Text>
                </div>

                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: 'Coberturas',
                        children: (
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Suma Asegurada">{planDetalle.sumaAsegurada}</Descriptions.Item>
                                <Descriptions.Item label="Límite Médico">{planDetalle.limiteMedico}</Descriptions.Item>
                                <Descriptions.Item label="Tasa Aplicada">{planDetalle.tasa} por mil</Descriptions.Item>
                                <Descriptions.Item label="Beneficios">
                                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                                        {planDetalle.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                                    </ul>
                                </Descriptions.Item>
                            </Descriptions>
                        )
                    },
                    {
                        key: '2',
                        label: 'Requisitos',
                        children: (
                            <List
                                size="small"
                                dataSource={planDetalle.requisitos}
                                renderItem={(item: any) => <List.Item><FileProtectOutlined style={{ marginRight: 8, color: '#1890ff' }} /> {item}</List.Item>}
                            />
                        )
                    },
                    {
                        key: '3',
                        label: 'Exclusiones',
                        children: (
                            <List
                                size="small"
                                dataSource={planDetalle.exclusiones}
                                renderItem={(item: any) => <List.Item><CloseCircleOutlined style={{ marginRight: 8, color: '#cf1322' }} /> {item}</List.Item>}
                            />
                        )
                    }
                ]} />
            </div>
        )}
      </Modal>
    </div>
  );
};

export default ClienteCatalogoPage;