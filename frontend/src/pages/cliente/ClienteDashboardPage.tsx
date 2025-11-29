// en frontend/src/pages/cliente/ClienteDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Descriptions, Tag, Table, Spin, Alert, Modal, Collapse, Row, Col, Statistic, Button, Avatar, Divider, Empty, Space } from 'antd';
import { 
    FileProtectOutlined, DollarCircleOutlined, CalendarOutlined, UserOutlined, 
    PhoneOutlined, MailOutlined, FileAddOutlined, EyeOutlined, 
    InfoCircleOutlined, ArrowRightOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;

// ... (Tus interfaces se mantienen igual) ...
interface Beneficiario {
  id: number;
  nombre_completo: string;
  parentesco: string;
  porcentaje: string;
}

interface MiPoliza {
  id: number;
  numero_poliza: string;
  estado: string;
  suma_asegurada: string;
  prima_anual: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  beneficiarios: Beneficiario[];
  agente_info?: {
    first_name: string;
    last_name: string;
  };
}

const ClienteDashboardPage: React.FC = () => {
  const [poliza, setPoliza] = useState<MiPoliza | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchMiPoliza = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) { setLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };

        const decodedToken: any = jwtDecode(token);
        const miUsername = decodedToken.username; 
        
        const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        
        const miPolizaEncontrada = response.data.find((p: any) => 
            p.cliente_info?.usuario_info?.username === miUsername
        );

        if (miPolizaEncontrada) {
            setPoliza(miPolizaEncontrada); 
        } else {
            setPoliza(null);
        }
      } catch (err) { 
          console.error(err); 
          setPoliza(null);
      } finally { 
          setLoading(false); 
      }
    };
    fetchMiPoliza();
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Cargando tu información..." />
    </div>
  );

  // --- MENÚ RÁPIDO (Estilizado) ---
  const MenuRapido = () => (
    <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={8}>
            <Card 
                hoverable 
                style={{ textAlign: 'center', borderRadius: '12px', border: '1px solid #e8e8e8' }} 
                onClick={() => navigate('/solicitar-poliza')}
            >
                <FileAddOutlined style={{ fontSize: '42px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={4} style={{ margin: 0 }}>Solicitar Póliza</Title>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>Cotiza un nuevo seguro a tu medida</Text>
            </Card>
        </Col>
        <Col xs={24} sm={8}>
            <Card 
                hoverable 
                style={{ textAlign: 'center', borderRadius: '12px', border: '1px solid #e8e8e8' }} 
                onClick={() => document.getElementById('detalle-poliza')?.scrollIntoView({ behavior: 'smooth' })}
            >
                <EyeOutlined style={{ fontSize: '42px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={4} style={{ margin: 0 }}>Ver Mi Póliza</Title>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>Revisa coberturas y beneficios</Text>
            </Card>
        </Col>
        <Col xs={24} sm={8}>
            <Card 
                hoverable 
                style={{ textAlign: 'center', borderRadius: '12px', border: '1px solid #e8e8e8', cursor: 'pointer' }}
                onClick={() => setIsHelpOpen(true)}
            >
                
                <InfoCircleOutlined style={{ fontSize: '42px', color: '#faad14', marginBottom: '16px' }} />
                
                <Title level={4} style={{ margin: 0 }}>Centro de Ayuda</Title>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>Preguntas frecuentes y soporte</Text>
            </Card>
        </Col>
    </Row>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Bienvenido a tu Portal</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>Gestiona tus seguros de forma rápida y segura</Text>
      </div>
      
      <MenuRapido />

      <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Estado de tu Cobertura</Divider>

      <div id="detalle-poliza">
        {poliza ? (
            <Row gutter={[24, 24]}>
                {/* COLUMNA IZQUIERDA: Detalles */}
                <Col xs={24} lg={16}>
                    
                    {/* Estadísticas en Tarjetas */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Card size="small" bordered={false} style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                                <Statistic 
                                    title="Estado Actual" 
                                    value={poliza.estado.toUpperCase()} 
                                    valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} 
                                    prefix={<FileProtectOutlined />} 
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" bordered={false} style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                                <Statistic 
                                    title="Suma Asegurada" 
                                    value={parseFloat(poliza.suma_asegurada)} 
                                    prefix={<DollarCircleOutlined />} 
                                    precision={2} 
                                    valueStyle={{ color: '#096dd9' }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" bordered={false} style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
                                <Statistic 
                                    title="Vencimiento" 
                                    value={poliza.fecha_vencimiento} 
                                    prefix={<CalendarOutlined />} 
                                    valueStyle={{ color: '#d46b08', fontSize: '1rem' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Detalles de Póliza */}
                    <Card title={`Póliza #${poliza.numero_poliza}`} extra={<Tag color="blue">VIDA</Tag>} style={{ marginBottom: 24, borderRadius: '8px' }}>
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="Prima Anual">${parseFloat(poliza.prima_anual).toLocaleString()}</Descriptions.Item>
                            <Descriptions.Item label="Fecha de Inicio">{poliza.fecha_inicio}</Descriptions.Item>
                            <Descriptions.Item label="Fecha de Fin">{poliza.fecha_vencimiento}</Descriptions.Item>
                            <Descriptions.Item label="Tipo">Vida Individual</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Beneficiarios */}
                    <Card title="Mis Beneficiarios" style={{ borderRadius: '8px' }}>
                        <Table 
                            dataSource={poliza.beneficiarios} 
                            columns={[
                                { title: 'Nombre', dataIndex: 'nombre_completo', key: 'nombre' },
                                { title: 'Parentesco', dataIndex: 'parentesco', key: 'parentesco' },
                                { title: '%', dataIndex: 'porcentaje', key: 'porcentaje', render: (p: string) => <Tag color="cyan">{p}%</Tag> },
                            ]} 
                            rowKey="id" 
                            pagination={false} 
                            size="middle"
                            bordered
                        />
                    </Card>
                </Col>

                {/* COLUMNA DERECHA: Agente */}
                <Col xs={24} lg={8}>
                    <Card title="Mi Agente" style={{ borderRadius: '8px', textAlign: 'center' }} hoverable>
                        <div style={{ marginBottom: 20 }}>
                            <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginBottom: 16 }} />
                            <Title level={4} style={{ margin: 0 }}>
                                {poliza.agente_info ? `${poliza.agente_info.first_name} ${poliza.agente_info.last_name}` : 'Agente General'}
                            </Title>
                            <Text type="secondary">Tu asesor personal</Text>
                        </div>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button block icon={<PhoneOutlined />} size="large">Llamar Ahora</Button>
                            <Button block icon={<MailOutlined />} size="large">Enviar Mensaje</Button>
                        </Space>
                    </Card>
                    
                    {/* Banner de Promo (Opcional) */}
                    <Card style={{ marginTop: 24, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none', color: 'white' }}>
                        <Title level={5} style={{ color: 'white' }}>¿Necesitas más cobertura?</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Consulta nuestras opciones para ampliar tu seguro.</Text>
                        <Button ghost style={{ marginTop: 16 }} icon={<ArrowRightOutlined />}>Ver Opciones</Button>
                    </Card>
                </Col>
            </Row>
        ) : (
            // --- SI NO TIENE PÓLIZA ---
            <Card style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px', background: '#fafafa' }}>
                <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{ height: 160 }}
                    description={
                        <span style={{ fontSize: '16px', color: '#555' }}>
                            Aún no tienes una póliza activa. <br/>
                            ¡Es el momento perfecto para asegurar tu tranquilidad!
                        </span>
                    }
                >
                    <Button type="primary" size="large" shape="round" icon={<FileAddOutlined />} onClick={() => navigate('/solicitar-poliza')} style={{ marginTop: 16, height: '48px', padding: '0 32px', fontSize: '16px' }}>
                        Solicitar Nueva Póliza Ahora
                    </Button>
                </Empty>
            </Card>
        )}
        {/* --- MODAL DE AYUDA --- */}
      <Modal
        title="Centro de Ayuda"
        open={isHelpOpen}
        onCancel={() => setIsHelpOpen(false)}
        footer={[
            <Button key="close" onClick={() => setIsHelpOpen(false)} style={{fontFamily: 'Michroma, sans-serif'}}>Cerrar</Button>
        ]}
      >
        <p>¿Tienes dudas? Aquí te ayudamos.</p>
        
        <h4 style={{ marginTop: '15px' }}>📞 Contacto Directo</h4>
        <p>Línea gratuita: <strong>800-10-20-30</strong></p>
        <p>Whatsapp: <strong>+591 700-00000</strong></p>

        <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Preguntas Frecuentes</h4>
        <Collapse accordion items={[
            {
                key: '1',
                label: '¿Cómo reportar un siniestro?',
                children: <p>Ve a la sección principal y pulsa el botón rojo "Reportar Siniestro". Llena el formulario con los detalles del incidente.</p>,
            },
            {
                key: '2',
                label: '¿Dónde veo mis pagos?',
                children: <p>En tu pantalla principal, baja hasta la sección "Historial de Pagos" para ver tus transacciones recientes.</p>,
            },
            {
                key: '3',
                label: '¿Cómo cambio mis beneficiarios?',
                children: <p>Por seguridad, debes contactar a tu agente asignado para realizar este cambio.</p>,
            },
        ]} />
      </Modal>
      </div>
    </div>
  );
};

export default ClienteDashboardPage;