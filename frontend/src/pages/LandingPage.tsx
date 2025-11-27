// en frontend/src/pages/LandingPage.tsx
import React from 'react';
import { Layout, Typography, Button, Row, Col, Card, Space, Steps, Divider, List, Collapse, Avatar, Carousel, Statistic } from 'antd';
import { LoginOutlined, SafetyCertificateOutlined, HeartOutlined, DollarOutlined, CheckCircleOutlined, SolutionOutlined, FileProtectOutlined, SmileOutlined, UserOutlined, QuestionCircleOutlined, TrophyOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Datos para Testimonios
  const testimonios = [
    { nombre: "María González", comentario: "El proceso fue increíblemente rápido. En menos de 24 horas ya tenía mi póliza activa.", cargo: "Madre de familia" },
    { nombre: "Carlos Ruiz", comentario: "La atención al cliente es de primera. Me ayudaron a elegir el plan perfecto para mi presupuesto.", cargo: "Empresario" },
    { nombre: "Ana Campos", comentario: "Tuve un siniestro y la respuesta fue inmediata. Realmente cumplen lo que prometen.", cargo: "Arquitecta" },
  ];

  // Datos para FAQ
  const faqs = [
    { pregunta: "¿Qué cubren los seguros de vida?", respuesta: "Nuestros seguros cubren fallecimiento por cualquier causa, y opcionalmente invalidez total y enfermedades graves." },
    { pregunta: "¿Puedo cancelar mi póliza en cualquier momento?", respuesta: "Sí, no tenemos plazos forzosos. Puedes cancelar cuando lo desees sin penalizaciones ocultas." },
    { pregunta: "¿Cómo reporto un siniestro?", respuesta: "Desde tu portal de cliente, con un solo clic en el botón 'Reportar Siniestro'. Es 100% digital." },
  ];

  return (
    <Layout className="layout" style={{ minHeight: '100vh', background: '#fff', overflowX: 'hidden' }}>
      
      {/* --- NAVBAR --- */}
      <Header style={{ background: 'rgba(0, 21, 41, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 50px', position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
        <div className="logo animate-fade-in">
          <Title level={4} style={{ color: 'white', margin: 0, fontFamily: "'Michroma', sans-serif" }}>SegurosUnivida</Title>
        </div>
        <Space className="animate-fade-in">
            <Button type="default" ghost onClick={() => navigate('/registro')}>Registrarse</Button>
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>Iniciar Sesión</Button>
        </Space>
      </Header>

      <Content>
        {/* --- 1. HERO SECTION (Con Animación) --- */}
        <div style={{
          background: `linear-gradient(rgba(0, 21, 41, 0.85), rgba(0, 21, 41, 0.85)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1950&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', // Efecto Parallax
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: 'white',
          padding: '0 20px'
        }}>
          <div className="animate-slide-up">
            <Title style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '20px', fontWeight: 'bold', textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
              Tu Tranquilidad,<br/> Nuestro Compromiso
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.3rem', maxWidth: '800px', marginBottom: '40px' }}>
              Protege el futuro de tu familia con las pólizas de vida más flexibles y seguras del mercado. Cotiza en línea en minutos.
            </Paragraph>
            <Button type="primary" size="large" shape="round" style={{ height: '54px', padding: '0 50px', fontSize: '20px', fontWeight: 'bold' }} onClick={() => navigate('/registro')} className="hover-scale">
              ¡Obtener mi Póliza Ahora!
            </Button>
          </div>
        </div>

        {/* --- 2. ESTADÍSTICAS (Nueva Sección) --- */}
        <div style={{ background: '#fff', padding: '60px 20px', borderBottom: '1px solid #f0f0f0' }}>
            <Row gutter={[32, 32]} justify="center">
                <Col xs={12} md={6} style={{ textAlign: 'center' }}>
                    <Statistic title="Clientes Satisfechos" value={15000} prefix={<SmileOutlined />} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
                </Col>
                <Col xs={12} md={6} style={{ textAlign: 'center' }}>
                    <Statistic title="Pólizas Activas" value={98} suffix="%" valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
                </Col>
                <Col xs={12} md={6} style={{ textAlign: 'center' }}>
                    <Statistic title="Años de Experiencia" value={25} prefix={<TrophyOutlined />} valueStyle={{ color: '#faad14', fontWeight: 'bold' }} />
                </Col>
                <Col xs={12} md={6} style={{ textAlign: 'center' }}>
                    <Statistic title="Agentes Expertos" value={200} prefix={<TeamOutlined />} valueStyle={{ color: '#eb2f96', fontWeight: 'bold' }} />
                </Col>
            </Row>
        </div>

        {/* --- 3. CÓMO FUNCIONA --- */}
        <div style={{ padding: '100px 50px', background: '#f9f9f9' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '60px' }}>¿Cómo asegurar tu futuro?</Title>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <Steps
                    current={-1}
                    items={[
                        { title: 'Regístrate', description: 'Crea tu cuenta en segundos.', icon: <SolutionOutlined style={{ fontSize: '24px' }} /> },
                        { title: 'Elige tu Plan', description: 'Selecciona la cobertura ideal.', icon: <FileProtectOutlined style={{ fontSize: '24px' }} /> },
                        { title: 'Estás Asegurado', description: 'Paga en línea y recibe tu póliza.', icon: <SmileOutlined style={{ fontSize: '24px' }} /> },
                    ]}
                />
            </div>
        </div>

        {/* --- 4. PLANES (Cards con Efecto Hover) --- */}
        <div style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '60px' }}>Nuestros Planes Destacados</Title>
          <Row gutter={[32, 32]}>
            {[
                { title: "Básico", price: "$20/mes", color: '#1890ff', icon: <SafetyCertificateOutlined />, features: ["Cobertura por fallecimiento", "Asistencia funeraria"] },
                { title: "Familiar", price: "$45/mes", color: '#eb2f96', icon: <HeartOutlined />, features: ["Cobertura ampliada", "Invalidez total", "Renta hospitalaria"] },
                { title: "Premium", price: "$80/mes", color: '#52c41a', icon: <DollarOutlined />, features: ["Cobertura total", "Enfermedades graves", "Devolución de primas"] }
            ].map((plan, index) => (
                <Col xs={24} md={8} key={index}>
                    <Card 
                        hoverable 
                        className="pricing-card"
                        style={{ textAlign: 'center', height: '100%', borderRadius: '16px', borderTop: `6px solid ${plan.color}` }}
                    >
                        <div style={{ fontSize: '54px', marginBottom: '20px', color: plan.color }}>{plan.icon}</div>
                        <Title level={3}>{plan.title}</Title>
                        <Title level={2} style={{ margin: '10px 0', color: plan.color }}>{plan.price}</Title>
                        <Divider />
                        <List
                            dataSource={plan.features}
                            renderItem={(item) => <List.Item style={{ border: 'none', padding: '8px 0' }}><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} /> {item}</List.Item>}
                        />
                        <Button type="primary" block size="large" style={{ marginTop: '30px', background: plan.color, borderColor: plan.color }} onClick={() => navigate('/registro')}>
                            Elegir {plan.title}
                        </Button>
                    </Card>
                </Col>
            ))}
          </Row>
        </div>

        {/* --- 5. TESTIMONIOS (Nueva Sección - Carrusel Simple) --- */}
        <div style={{ padding: '80px 20px', background: '#001529', color: 'white' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <Title level={2} style={{ color: 'white', marginBottom: '50px' }}>Lo que dicen nuestros clientes</Title>
                <Carousel autoplay dots={{ className: 'custom-dots' }}>
                    {testimonios.map((testimonio, i) => (
                        <div key={i}>
                            <div style={{ padding: '20px' }}>
                                <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#f56a00', marginBottom: '20px' }} />
                                <Title level={4} style={{ color: 'white', fontStyle: 'italic' }}>"{testimonio.comentario}"</Title>
                                <Text style={{ color: '#1890ff', fontSize: '16px' }}>{testimonio.nombre}</Text>
                                <br/>
                                <Text type="secondary" style={{ color: 'rgba(255,255,255,0.5)' }}>{testimonio.cargo}</Text>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>
        </div>

        {/* --- 6. PREGUNTAS FRECUENTES (Nueva Sección) --- */}
        <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '50px' }}>Preguntas Frecuentes</Title>
            <Collapse accordion ghost expandIconPosition="end" size="large">
                {faqs.map((faq, i) => (
                    <Panel header={<span style={{ fontSize: '16px', fontWeight: 500 }}>{faq.pregunta}</span>} key={i} extra={<QuestionCircleOutlined style={{ color: '#1890ff' }} />}>
                        <p style={{ color: '#666' }}>{faq.respuesta}</p>
                    </Panel>
                ))}
            </Collapse>
        </div>

        {/* --- 7. CTA FINAL --- */}
        <div style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #1890ff 0%, #001529 100%)', textAlign: 'center', color: 'white' }}>
            <Title level={2} style={{ color: 'white', marginBottom: '20px' }}>¿Listo para proteger tu futuro?</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '40px' }}>Únete a las miles de familias que confían en Seguros Univida.</Paragraph>
            <Button size="large" style={{ height: '50px', padding: '0 40px', color: '#1890ff', fontWeight: 'bold' }} onClick={() => navigate('/registro')}>
                Empezar Ahora
            </Button>
        </div>

      </Content>

      {/* --- FOOTER --- */}
      <Footer style={{ textAlign: 'center', background: '#000b17', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>
        <Row justify="center" gutter={32} style={{ marginBottom: '20px' }}>
            <Col><Text style={{ color: 'inherit', cursor: 'pointer' }}>Términos y Condiciones</Text></Col>
            <Col><Text style={{ color: 'inherit', cursor: 'pointer' }}>Política de Privacidad</Text></Col>
            <Col><Text style={{ color: 'inherit', cursor: 'pointer' }}>Contacto</Text></Col>
        </Row>
        Seguros Univida ©2025 - Todos los derechos reservados.
      </Footer>

      {/* --- ESTILOS CSS (Animaciones) --- */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
            animation: fadeIn 1.5s ease-out;
        }
        .animate-slide-up {
            animation: slideUp 1s ease-out;
        }
        .pricing-card {
            transition: all 0.3s ease;
        }
        .pricing-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .hover-scale {
            transition: transform 0.2s;
        }
        .hover-scale:hover {
            transform: scale(1.05);
        }
        /* Puntos del carrusel blancos */
        .custom-dots li button {
            background: white !important;
        }
        .custom-dots li.slick-active button {
            background: #1890ff !important;
        }
      `}</style>
    </Layout>
  );
};

export default LandingPage;