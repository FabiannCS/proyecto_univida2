// en frontend/src/pages/cliente/ClienteDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { 
    Typography, Card, Descriptions, Tag, Table, Spin, Alert, Row, Col, 
    Statistic, Button, Avatar, Divider, Empty, Space, Modal, Collapse, Badge, message 
} from 'antd';
import { 
    FileProtectOutlined, DollarCircleOutlined, CalendarOutlined, UserOutlined, 
    PhoneOutlined, MailOutlined, FileAddOutlined, EyeOutlined, 
    ClockCircleOutlined, FileExclamationOutlined, DollarOutlined, WarningOutlined, 
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Interfaces
interface Beneficiario { id: number; nombre_completo: string; parentesco: string; porcentaje: string; }
interface Pago { id: number; fecha_pago: string; monto_pagado: string; metodo_pago: string; estado: string; factura_info?: { poliza_id: number; }; }
interface Siniestro { id: number; numero_siniestro: string; tipo_siniestro: string; fecha_reporte: string; estado: string; }
interface MiPoliza {
  id: number; numero_poliza: string; estado: string; suma_asegurada: string; prima_anual: string;
  fecha_inicio: string; fecha_vencimiento: string; cobertura: string; beneficiarios: Beneficiario[];
  agente_info?: { first_name: string; last_name: string; email: string; telefono: string; };
}

const ClienteDashboardPage: React.FC = () => {
  const [poliza, setPoliza] = useState<MiPoliza | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]); // <-- NUEVO ESTADO
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  // Helper para nombre del plan
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

        // 1. Cargar Pólizas
        const resPolizas = await axios.get('https://proyecto-univida2.onrender.com/api/polizas/', { headers });
        const miPolizaEncontrada = resPolizas.data.find((p: any) => 
            p.cliente_info?.usuario_info?.username === miUsername &&
            p.estado !== 'cancelada'
        );
        
        // 2. Cargar Siniestros (Independiente de si hay póliza activa o no, queremos ver el historial)
        const resSiniestros = await axios.get('https://proyecto-univida2.onrender.com/api/siniestros/', { headers });
        const misSiniestros = resSiniestros.data.filter((s: any) => 
            s.poliza_info?.cliente_info?.usuario_info?.username === miUsername
        );
        setSiniestros(misSiniestros);

        if (miPolizaEncontrada) {
            setPoliza(miPolizaEncontrada);

            // 3. Cargar Pagos y Facturas
            const resPagos = await axios.get('https://proyecto-univida2.onrender.com/api/pagos/', { headers });
            const misPagos = resPagos.data.filter((p: any) => p.factura_info?.poliza_id === miPolizaEncontrada.id);
            setPagos(misPagos);
            
            const resFacturas = await axios.get(`https://proyecto-univida2.onrender.com/api/facturas/?poliza_id=${miPolizaEncontrada.id}`, { headers });
            setFacturas(resFacturas.data);
        } else {
            setPoliza(null);
        }
      } catch (err) { console.error(err); setPoliza(null); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleCancelar = async () => {
    if (!window.confirm("¿Estás seguro de cancelar?")) return;
    setActionLoading(true);
    try {
        await axios.patch(`https://proyecto-univida2.onrender.com/api/polizas/${poliza!.id}/`, { estado: 'cancelada' }, { headers: { Authorization: `Bearer ${getToken()}` } });
        window.location.reload(); 
    } catch (e) { message.error('No se pudo cancelar.'); } 
    finally { setActionLoading(false); }
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}><Spin size="large" tip="Cargando tu información..." /></div>;

  // --- MENÚ RÁPIDO (Actualizado) ---
  const MenuRapido = () => {
    const pagosPendientes = facturas.filter(f => f.estado === 'pendiente').length;
    const siniestrosActivos = siniestros.filter(s => s.estado === 'reportado' || s.estado === 'en_revision').length;

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          {/* 1. Solicitar */}
          <Col xs={24} sm={6}>
              <Card hoverable style={{ textAlign: 'center', borderRadius: '12px', height: '100%' }} onClick={() => navigate('/catalogo')}>
                  <FileAddOutlined style={{ fontSize: '28px', color: '#1890ff', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0, fontSize: '14px' }}>Solicitar Póliza</Title>
              </Card>
          </Col>

          {/* 2. Ver Póliza */}
          <Col xs={24} sm={6}>
              <Card hoverable style={{ textAlign: 'center', borderRadius: '12px', height: '100%', opacity: poliza ? 1 : 0.5 }} onClick={() => poliza && document.getElementById('detalle-poliza')?.scrollIntoView({ behavior: 'smooth' })}>
                  <EyeOutlined style={{ fontSize: '28px', color: '#52c41a', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0, fontSize: '14px' }}>Ver Mi Póliza</Title>
              </Card>
          </Col>

          {/* 3. Pagar (Con Badge) */}
          <Col xs={24} sm={6}>
              <div style={{ position: 'relative', height: '100%' }}>
                  {pagosPendientes > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#ff4d4f', color: 'white', borderRadius: '50%', width: 20, height: 20, textAlign: 'center', lineHeight: '20px', zIndex: 1 }}>{pagosPendientes}</span>}
                  <Card hoverable style={{ textAlign: 'center', borderRadius: '12px', height: '100%', opacity: poliza ? 1 : 0.5, borderColor: pagosPendientes > 0 ? '#ff4d4f' : undefined }} onClick={() => poliza && navigate('/pagar-poliza')}>
                      <DollarOutlined style={{ fontSize: '28px', color: '#faad14', marginBottom: '12px' }} />
                      <Title level={5} style={{ margin: 0, fontSize: '14px' }}>Pagar</Title>
                  </Card>
              </div>
          </Col>

          {/* 4. MIS SINIESTROS (Reemplaza a Ayuda) */}
          <Col xs={24} sm={6}>
              <div style={{ position: 'relative', height: '100%' }}>
                  {siniestrosActivos > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: '#1890ff', color: 'white', borderRadius: '50%', width: 20, height: 20, textAlign: 'center', lineHeight: '20px', zIndex: 1 }}>{siniestrosActivos}</span>}
                  <Card hoverable style={{ textAlign: 'center', borderRadius: '12px', height: '100%' }} onClick={() => navigate('/mis-siniestros')}>
                      <FileExclamationOutlined style={{ fontSize: '28px', color: '#cf1322', marginBottom: '12px' }} />
                      <Title level={5} style={{ margin: 0, fontSize: '14px' }}>Mis Siniestros</Title>
                  </Card>
              </div>
          </Col>
      </Row>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Bienvenido a tu Portal</Title>
      </div>
      
      <MenuRapido />
      
      {/* --- NUEVA SECCIÓN: RESUMEN DE RECLAMOS (Si existen) --- */}
      {siniestros.length > 0 && (
          <div style={{ marginBottom: 32 }}>
              <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Estado de mis Reclamos</Divider>
              <Row gutter={[16, 16]}>
                  {siniestros.slice(0, 3).map(s => ( // Mostramos solo los 3 últimos
                      <Col xs={24} sm={12} md={8} key={s.id}>
                          <Card size="small" title={`Caso #${s.numero_siniestro}`} extra={<Tag color={s.estado === 'pagado' ? 'gold' : s.estado === 'aprobado' ? 'green' : 'blue'}>{s.estado.toUpperCase()}</Tag>}>
                              <p><strong>Tipo:</strong> {s.tipo_siniestro}</p>
                              <p><strong>Fecha:</strong> {new Date(s.fecha_reporte).toLocaleDateString()}</p>
                              <Button type="link" size="small" onClick={() => navigate('/mis-siniestros')} style={{ paddingLeft: 0 }}>Ver Detalles</Button>
                          </Card>
                      </Col>
                  ))}
              </Row>
          </div>
      )}

      <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>Estado de tu Cobertura</Divider>

      <div id="detalle-poliza">
        {poliza ? (
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    {/* Estadísticas */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={8}><Card size="small"><Statistic title="Estado" value={poliza.estado.toUpperCase()} valueStyle={{ color: poliza.estado === 'activa' ? '#3f8600' : '#faad14', fontWeight: 'bold' }} prefix={poliza.estado === 'activa' ? <FileProtectOutlined /> : <ClockCircleOutlined />} /></Card></Col>
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
        ) : (
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Empty description="No tienes pólizas activas."><Button type="primary" onClick={() => navigate('/catalogo')}>Solicitar Nueva Póliza</Button></Empty>
            </Card>
        )}
      </div>
    </div>
  );
};

export default ClienteDashboardPage;