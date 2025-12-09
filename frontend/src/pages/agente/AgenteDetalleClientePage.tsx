// en frontend/src/pages/agente/AgenteDetalleClientePage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Table, Tag, Button, Spin, message, Row, Col } from 'antd';
import { ArrowLeftOutlined, UserOutlined, FileProtectOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

// --- INTERFAZ CORREGIDA ---
interface ClienteDetalle {
  id: number;
  identificacion: string;
  direccion: string;
  estado_salud: string;
  // CORREGIDO: Usamos 'usuario_info' que es el estándar de tu API
  usuario_info: {  
    first_name: string;
    last_name: string;
    email: string;
    telefono: string;
  };
}

const AgenteDetalleClientePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
  const [polizas, setPolizas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Cargar Datos del Cliente
        const resCliente = await axios.get(`https://proyecto-univida2.onrender.com/api/clientes/${id}/`, { headers });
        setCliente(resCliente.data);

        // 2. Cargar Pólizas de este Cliente
        const resPolizas = await axios.get('https://proyecto-univida2.onrender.com/api/polizas/', { headers });
        // Filtro robusto: revisa ID de cliente directo o anidado
        const misPolizas = resPolizas.data.filter((p: any) => 
            p.cliente === parseInt(id!) || p.cliente_info?.id === parseInt(id!)
        );
        setPolizas(misPolizas);

      } catch (error) {
        console.error(error);
        message.error('Error al cargar los detalles');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!cliente) return <div style={{ textAlign: 'center', padding: 50 }}>Cliente no encontrado</div>;

  return (
    <Layout style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" style={{ marginRight: 16 }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>
                {/* CORREGIDO: usuario_info */}
                {cliente.usuario_info.first_name} {cliente.usuario_info.last_name}
            </Title>
            <Tag color="blue">Cliente</Tag>
          </div>
        </div>

        <Row gutter={[24, 24]}>
            {/* Columna Izquierda: Datos Personales */}
            <Col xs={24} lg={8}>
                <Card title={<><UserOutlined /> Información Personal</>} style={{ height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>IDENTIFICACIÓN (CI/DNI)</Text>
                            <div style={{ fontSize: '16px' }}><IdcardOutlined /> {cliente.identificacion}</div>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>EMAIL</Text>
                            {/* CORREGIDO: usuario_info */}
                            <div style={{ fontSize: '16px' }}><MailOutlined /> {cliente.usuario_info.email}</div>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>TELÉFONO</Text>
                            {/* CORREGIDO: usuario_info */}
                            <div style={{ fontSize: '16px' }}><PhoneOutlined /> {cliente.usuario_info.telefono || 'N/A'}</div>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>DIRECCIÓN</Text>
                            <div style={{ fontSize: '16px' }}><HomeOutlined /> {cliente.direccion || 'N/A'}</div>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>ESTADO DE SALUD</Text>
                            <div>{cliente.estado_salud || 'N/A'}</div>
                        </div>
                    </div>
                </Card>
            </Col>

            {/* Columna Derecha: Pólizas */}
            <Col xs={24} lg={16}>
                <Card title={<><FileProtectOutlined /> Pólizas Contratadas</>}>
                    <Table 
                        dataSource={polizas}
                        rowKey="id"
                        pagination={false}
                        locale={{ emptyText: 'Este cliente no tiene pólizas registradas' }}
                        columns={[
                            { title: 'Nº Póliza', dataIndex: 'numero_poliza' },
                            { title: 'Suma Asegurada', dataIndex: 'suma_asegurada', render: (v:any) => `$${parseFloat(v).toLocaleString()}` },
                            { 
                                title: 'Estado', 
                                dataIndex: 'estado', 
                                render: (e:string) => {
                                    let color = 'default';
                                    if(e==='activa') color='green';
                                    if(e==='pendiente_pago') color='orange';
                                    return <Tag color={color}>{e.toUpperCase()}</Tag>;
                                } 
                            },
                            {
                                title: 'Acción',
                                render: (_:any, r:any) => (
                                    <Button size="small" onClick={() => navigate(`/agente-polizas/${r.id}`)}>Ver Póliza</Button>
                                )
                            }
                        ]}
                    />
                </Card>
            </Col>
        </Row>

      </Content>
    </Layout>
  );
};

export default AgenteDetalleClientePage;