// en frontend/src/pages/cliente/ClienteDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { 
    Typography, Card, Descriptions, Tag, Table, Spin, Alert, Row, Col, 
    Statistic, Button, Avatar, Divider, Empty, Space, Modal, Collapse, Result, message
} from 'antd';
import { 
    FileProtectOutlined, DollarCircleOutlined, CalendarOutlined, UserOutlined, 
    PhoneOutlined, MailOutlined, FileAddOutlined, EyeOutlined, 
    InfoCircleOutlined, ClockCircleOutlined, QuestionCircleOutlined, 
    FileExclamationOutlined, DollarOutlined, CloseCircleOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Beneficiario {
  id: number;
  nombre_completo: string;
  parentesco: string;
  porcentaje: string;
}

interface Pago {
    id: number;
    fecha_pago: string;
    monto_pagado: string;
    metodo_pago: string;
    estado: string;
    factura_info?: {
        poliza_id: number;
    };
}

interface MiPoliza {
  id: number;
  numero_poliza: string;
  estado: string;
  suma_asegurada: string;
  prima_anual: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  cobertura: string;
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
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  const getNombrePlan = (cobertura: string) => {
      if (!cobertura) return 'Plan Personalizado';
      if (cobertura.includes('vida_temporal')) return 'Plan Básico';
      if (cobertura.includes('accidentes')) return 'Plan Estándar';
      if (cobertura.includes('vida_entera')) return 'Plan Premium';
      return cobertura.split('.')[0] || 'Seguro de Vida';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) { setLoading(false); return; }
        const headers = { Authorization: `Bearer ${token}` };
        const decodedToken: any = jwtDecode(token);
        const miUsername = decodedToken.username;

        // 1. Cargar TODAS las Pólizas
        const resPolizas = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        
        // 2. Buscar la póliza MÁS RECIENTE del usuario (incluyendo canceladas/rechazadas)
        // Filtramos por usuario
        const misPolizas = resPolizas.data.filter((p: any) => 
            p.cliente_info?.usuario_info?.username === miUsername
        );

        // Ordenamos por ID descendente para tomar la última solicitud hecha
        misPolizas.sort((a: any, b: any) => b.id - a.id);

        const ultimaPoliza = misPolizas.length > 0 ? misPolizas[0] : null;
        
        if (ultimaPoliza) {
            setPoliza(ultimaPoliza);

            // Cargar datos extra (pagos/facturas) solo si es relevante
            const resPagos = await axios.get('http://127.0.0.1:8000/api/pagos/', { headers });
            const misPagos = resPagos.data.filter((p: any) => 
                p.factura_info?.poliza_id === ultimaPoliza.id
            );
            setPagos(misPagos);
            
            const resFacturas = await axios.get(`http://127.0.0.1:8000/api/facturas/?poliza_id=${ultimaPoliza.id}`, { headers });
            setFacturas(resFacturas.data);
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
    fetchData();
  }, []);

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
        message.error('No se pudo cancelar.');
    } finally {
        setActionLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}><Spin size="large" tip="Cargando tu información..." /></div>;

  // --- MENÚ RÁPIDO ---
  const MenuRapido = () => {
    const pagosPendientes = facturas.filter(f => f.estado === 'pendiente').length;
    return (
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={6}>
              <Card hoverable style={{ textAlign: 'center', borderRadius: '12px' }} onClick={() => navigate('/catalogo')}>
                  <FileAddOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0 }}>Solicitar Póliza</Title>
              </Card>
          </Col>
          <Col xs={24} sm={6}>
              {/* Deshabilitar botón si no hay póliza activa/proceso */}
              <Card hoverable style={{ textAlign: 'center', borderRadius: '12px' }} onClick={() => document.getElementById('detalle-poliza')?.scrollIntoView({ behavior: 'smooth' })}>
                  <EyeOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0 }}>Ver Mi Póliza</Title>
              </Card>
          </Col>
          <Col xs={24} sm={6}>
              <div style={{ position: 'relative', height: '100%' }}>
                  {pagosPendientes > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#ff4d4f', color: 'white', borderRadius: '50%', width: 20, height: 20, textAlign: 'center', lineHeight: '20px', zIndex: 1 }}>{pagosPendientes}</span>}
                  <Card hoverable style={{ textAlign: 'center', borderRadius: '12px', borderColor: pagosPendientes > 0 ? '#ff4d4f' : undefined }} onClick={() => navigate('/pagar-poliza')}>
                      <DollarOutlined style={{ fontSize: '28px', color: '#faad14', marginBottom: '12px' }} />
                      <Title level={5} style={{ margin: 0 }}>Pagar</Title>
                  </Card>
              </div>
          </Col>
          <Col xs={24} sm={6}>
              <Card hoverable style={{ textAlign: 'center', borderRadius: '12px' }} onClick={() => setIsHelpOpen(true)}>
                  <InfoCircleOutlined style={{ fontSize: '32px', color: '#13c2c2', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0 }}>Ayuda</Title>
              </Card>
          </Col>
      </Row>
    );
  };
  const handleSolicitarNueva = () => {
      // Si ya existe una póliza en el estado (que no sea cancelada/rechazada)
      if (poliza) {
          Modal.warning({
              title: 'Solicitud no permitida',
              content: `Ya tienes una póliza en estado "${poliza.estado.toUpperCase().replace('_', ' ')}". Debes cancelar la actual o esperar a que finalice para solicitar una nueva.`,
              okText: 'Entendido'
          });
      } else {
          // Si no tiene póliza, lo dejamos pasar
          navigate('/catalogo');
      }
  };

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Bienvenido a tu Portal</Title>
      </div>
      
      <MenuRapido />
      <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Estado de tu Cobertura</Divider>

      <div id="detalle-poliza">
        
        {/* === LÓGICA DE VISTAS === */}
        
        {!poliza ? (
            // CASO A: SIN PÓLIZAS
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Empty description="No tienes pólizas activas.">
                    <Button type="primary" onClick={() => navigate('/catalogo')}>Solicitar Nueva Póliza</Button>
                </Empty>
            </Card>

        ) : ['cancelada', 'rechazada', 'vencida', 'inactiva'].includes(poliza.estado) ? (
            
            // CASO B: PÓLIZA INACTIVA/RECHAZADA (VISTA RESUMIDA)
            <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '12px', border: '1px solid #d9d9d9' }}>
                <Result
                    status={poliza.estado === 'rechazada' ? 'error' : 'warning'}
                    title={`Tu póliza está ${poliza.estado.toUpperCase()}`}
                    subTitle={
                        <div style={{ marginTop: '10px' }}>
                            <Text strong style={{ fontSize: '16px' }}>{getNombrePlan(poliza.cobertura)}</Text>
                            <br />
                            <Text type="secondary">Nº Póliza: {poliza.numero_poliza}</Text>
                            <br />
                            <Text>Fecha de finalización: {poliza.fecha_vencimiento}</Text>
                        </div>
                    }
                    extra={[
                        <Button type="primary" key="console" onClick={() => navigate('/catalogo')}>
                            Solicitar Nueva Póliza
                        </Button>,
                        <Button key="buy" onClick={() => setIsHelpOpen(true)}>
                            Contactar Soporte
                        </Button>,
                    ]}
                />
            </Card>

        ) : (
            
            // CASO C: PÓLIZA ACTIVA O EN PROCESO (VISTA COMPLETA)
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Card size="small">
                                <Statistic 
                                    title="Estado" 
                                    value={poliza.estado.toUpperCase()} 
                                    valueStyle={{ color: poliza.estado === 'activa' ? '#3f8600' : '#faad14', fontWeight: 'bold' }} 
                                    prefix={poliza.estado === 'activa' ? <FileProtectOutlined /> : <ClockCircleOutlined />} 
                                />
                            </Card>
                        </Col>
                        <Col span={8}><Card size="small"><Statistic title="Suma" value={parseFloat(poliza.suma_asegurada)} prefix="$" precision={2} /></Card></Col>
                        <Col span={8}><Card size="small"><Statistic title="Vence" value={poliza.fecha_vencimiento} prefix={<CalendarOutlined />} /></Card></Col>
                    </Row>
                    
                    <Card title={<div style={{display:'flex',justifyContent:'space-between'}}><span>Póliza #{poliza.numero_poliza}</span><Tag color="geekblue">{getNombrePlan(poliza.cobertura)}</Tag></div>} style={{ marginBottom: 24 }}>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Prima Anual">${parseFloat(poliza.prima_anual).toLocaleString()}</Descriptions.Item>
                            <Descriptions.Item label="Vigencia">{poliza.fecha_inicio} al {poliza.fecha_vencimiento}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title="Historial de Pagos" style={{ marginBottom: 24 }}>
                        <Table dataSource={pagos} rowKey="id" pagination={false} size="small" locale={{ emptyText: 'No hay pagos' }}
                            columns={[{ title: 'Fecha', dataIndex: 'fecha_pago', render: (d:string) => d?.split('T')[0] }, { title: 'Monto', dataIndex: 'monto_pagado', render: (v:string) => `$${v}` }, { title: 'Estado', dataIndex: 'estado', render: () => <Tag color="green">OK</Tag> }]}
                        />
                    </Card>

                    <Card title="Mis Beneficiarios" style={{ marginBottom: 24 }}>
                         <Table dataSource={poliza.beneficiarios} columns={[{ title: 'Nombre', dataIndex: 'nombre_completo' }, { title: 'Parentesco', dataIndex: 'parentesco' }, { title: '%', dataIndex: 'porcentaje', render: (p:string) => <Tag color="cyan">{p}%</Tag> }]} rowKey="id" pagination={false} size="middle" bordered />
                    </Card>

                    {poliza.estado === 'cotizacion' && (
                        <Alert message="Solicitud Pendiente" type="warning" showIcon action={<Button size="small" danger onClick={handleCancelar} loading={actionLoading}>Cancelar Solicitud</Button>} />
                    )}
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Mi Agente Asignado" style={{ borderRadius: '8px', textAlign: 'center' }}>
                        {poliza.agente_info ? (
                            <>
                                <div style={{ marginBottom: 20 }}>
                                    <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginBottom: 16 }} />
                                    <Title level={4} style={{ margin: 0 }}>{poliza.agente_info.first_name} {poliza.agente_info.last_name}</Title>
                                    <Text type="secondary">Agente Certificado</Text>
                                    <div style={{ marginTop: 10 }}><Tag icon={<PhoneOutlined />}>{poliza.agente_info.telefono || 'N/A'}</Tag></div>
                                </div>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button block icon={<PhoneOutlined />}>Llamar</Button>
                                    <Button block icon={<MailOutlined />} href={`mailto:${poliza.agente_info.email}`}>Enviar Correo</Button>
                                </Space>
                            </>
                        ) : (
                            <div style={{ padding: '20px 0', opacity: 0.6 }}>
                                <Avatar size={60} icon={<ClockCircleOutlined />} style={{ backgroundColor: '#d9d9d9', marginBottom: 16 }} />
                                <Title level={5} style={{ margin: 0, color: '#595959' }}>Pendiente de Asignación</Title>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        )}
      </div>

      {/* Modal Ayuda */}
      <Modal title="Centro de Ayuda" open={isHelpOpen} onCancel={() => setIsHelpOpen(false)} footer={[<Button key="close" onClick={() => setIsHelpOpen(false)}>Cerrar</Button>]}>
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
            <Panel header="¿Cómo reporto un siniestro?" key="1"><p>Ve al botón rojo "Reportar Siniestro" en la barra superior.</p></Panel>
            <Panel header="¿Dónde veo mis pagos?" key="2"><p>En tu dashboard principal, sección "Historial de Pagos".</p></Panel>
        </Collapse>
      </Modal>
    </div>
  );
};

export default ClienteDashboardPage;