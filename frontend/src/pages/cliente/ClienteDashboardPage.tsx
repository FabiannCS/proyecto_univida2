// en frontend/src/pages/cliente/ClienteDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Descriptions, Tag, Table, Spin, Alert, Row, Col, Statistic, Button, Avatar, Divider, Empty, Space, Modal, Collapse } from 'antd';
import { 
    FileProtectOutlined, DollarCircleOutlined, CalendarOutlined, UserOutlined, 
    PhoneOutlined, MailOutlined, FileAddOutlined, EyeOutlined, 
    InfoCircleOutlined, ClockCircleOutlined, QuestionCircleOutlined, FileExclamationOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;
const { Panel } = Collapse; // Para las preguntas frecuentes

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
    email: string;
    telefono: string;
  };
}

const ClienteDashboardPage: React.FC = () => {
  const [poliza, setPoliza] = useState<MiPoliza | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false); // <-- ESTADO PARA EL MODAL DE AYUDA
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. CARGAR DATOS ---
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
            p.cliente_info?.usuario_info?.username === miUsername &&
            p.estado !== 'cancelada'
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

  // --- 2. FUNCIÓN CANCELAR PÓLIZA ---
  const handleCancelar = async () => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar esta solicitud?")) {
        return;
    }

    setActionLoading(true);
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        await axios.patch(`http://127.0.0.1:8000/api/polizas/${poliza!.id}/`, {
            estado: 'cancelada'
        }, { headers });
        
        window.location.reload(); 
        
    } catch (e) {
        console.error(e);
    } finally {
        setActionLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Cargando tu información..." />
    </div>
  );

  // --- MENÚ RÁPIDO (Con Ayuda funcional) ---
  const MenuRapido = () => (
    <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={6}>
            <Card hoverable style={{ textAlign: 'center', borderRadius: '12px' }} onClick={() => navigate('/catalogo')}>
                <FileAddOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: 0 }}>Solicitar Póliza</Title>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>Cotiza un nuevo seguro a tu medida</Text>
            </Card>
        </Col>
        <Col xs={24} sm={6}>
            <Card hoverable style={{ textAlign: 'center', borderRadius: '12px' }} onClick={() => document.getElementById('detalle-poliza')?.scrollIntoView({ behavior: 'smooth' })}>
                <EyeOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: 0 }}>Ver Mi Póliza</Title>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>Revisa coberturas y beneficios</Text>
            </Card>
        </Col>
        <Col xs={24} sm={6}>
            <Card 
                hoverable 
                style={{ textAlign: 'center', borderRadius: '12px' }}
                onClick={() => setIsHelpOpen(true)} // <-- ¡AQUÍ ABRE EL MODAL!
            >
                <InfoCircleOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
                <Title level={5} style={{ margin: 0 }}>Ayuda</Title>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>Preguntas frecuentes y soporte</Text>
            </Card>
        </Col>
        <Col xs={24} sm={6}>
            <Card 
                hoverable 
                style={{ textAlign: 'center', borderRadius: '12px' }}
                // ¡OJO! Aquí corregimos la navegación:
                onClick={() => navigate('/mis-siniestros')} 
            >
                {/* Ícono de Archivo con Exclamación en color Rojo Suave */}
                <FileExclamationOutlined style={{ fontSize: '32px', color: '#ff4d4f', marginBottom: '12px' }} />
                
                <Title level={5} style={{ margin: 0 }}>Historial de Siniestros</Title>
                <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>Revisa el estado de tus reclamos</Text>
            </Card>
        </Col>
    </Row>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Bienvenido a tu Portal</Title>
      </div>
      
      <MenuRapido />
      <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Estado de tu Cobertura</Divider>

      <div id="detalle-poliza">
        {poliza ? (
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    {/* Estadísticas */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Card size="small">
                                <Statistic 
                                    title="Estado" 
                                    value={poliza.estado.toUpperCase()} 
                                    valueStyle={{ 
                                        color: poliza.estado === 'activa' ? '#3f8600' : '#faad14',
                                        fontWeight: 'bold'
                                    }} 
                                    prefix={poliza.estado === 'activa' ? <FileProtectOutlined /> : <ClockCircleOutlined />} 
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small">
                                <Statistic title="Suma" value={parseFloat(poliza.suma_asegurada)} prefix={<DollarCircleOutlined />} precision={2} />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small">
                                <Statistic title="Vence" value={poliza.fecha_vencimiento} prefix={<CalendarOutlined />} />
                            </Card>
                        </Col>
                    </Row>

                    <Card title={`Póliza #${poliza.numero_poliza}`} style={{ marginBottom: 24 }}>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Prima Anual">${parseFloat(poliza.prima_anual).toLocaleString()}</Descriptions.Item>
                            <Descriptions.Item label="Vigencia">{poliza.fecha_inicio} al {poliza.fecha_vencimiento}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title="Mis Beneficiarios" style={{ marginBottom: 24 }}>
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

                    {poliza.estado === 'cotizacion' && (
                        <div style={{ marginBottom: 24 }}>
                            <Alert 
                                message="Solicitud Pendiente" 
                                description="Tu solicitud está siendo revisada. Puedes cancelarla si deseas cambiar de plan." 
                                type="warning" 
                                showIcon 
                                action={
                                    <Button size="small" danger type="primary" onClick={handleCancelar} loading={actionLoading}>
                                        Cancelar Solicitud
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Mi Agente Asignado" style={{ borderRadius: '8px', textAlign: 'center' }}>
                        {poliza.agente_info ? (
                            <>
                                <div style={{ marginBottom: 20 }}>
                                    <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginBottom: 16 }} />
                                    <Title level={4} style={{ margin: 0 }}>
                                        {poliza.agente_info.first_name} {poliza.agente_info.last_name}
                                    </Title>
                                    <Text type="secondary">Agente Certificado</Text>
                                </div>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button block icon={<PhoneOutlined />}>Llamar</Button>
                                    <Button block icon={<MailOutlined />}>Enviar Correo</Button>
                                </Space>
                            </>
                        ) : (
                            <div style={{ padding: '20px 0', opacity: 0.6 }}>
                                <Avatar size={60} icon={<ClockCircleOutlined />} style={{ backgroundColor: '#d9d9d9', marginBottom: 16 }} />
                                <Title level={5} style={{ margin: 0, color: '#595959' }}>
                                    Pendiente de Asignación
                                </Title>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                    Un agente tomará tu solicitud pronto.
                                </Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        ) : (
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Empty description="No tienes pólizas activas.">
                    <Button type="primary" onClick={() => navigate('/catalogo')}>Solicitar Nueva Póliza</Button>
                </Empty>
            </Card>
        )}
      </div>

      {/* --- MODAL DE AYUDA --- */}
      <Modal
        title="Centro de Ayuda"
        open={isHelpOpen}
        onCancel={() => setIsHelpOpen(false)}
        footer={[<Button key="close" onClick={() => setIsHelpOpen(false)}>Cerrar</Button>]}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <QuestionCircleOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
            <p>¿Cómo podemos ayudarte hoy?</p>
        </div>

        <Title level={5}>Contacto de Emergencia</Title>
        <p><PhoneOutlined /> Línea Gratuita: <strong>800-10-20-30</strong></p>
        <p><MailOutlined /> Soporte: <strong>soporte@univida.com</strong></p>
        
        <Divider />
        
        <Title level={5}>Preguntas Frecuentes</Title>
        <Collapse accordion ghost>
            <Panel header="¿Cómo reporto un siniestro?" key="1">
                <p>Ve al botón rojo "Reportar Siniestro" en la barra superior, llena el formulario y adjunta la documentación requerida.</p>
            </Panel>
            <Panel header="¿Dónde veo mis pagos?" key="2">
                <p>Estamos trabajando en la sección de historial de pagos. Pronto podrás verlos en tu dashboard.</p>
            </Panel>
            <Panel header="¿Puedo cambiar mis beneficiarios?" key="3">
                <p>Sí, pero debes contactar a tu agente asignado para realizar este cambio de forma segura.</p>
            </Panel>
        </Collapse>
      </Modal>

    </div>
  );
};

export default ClienteDashboardPage;