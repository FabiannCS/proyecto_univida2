// en frontend/src/pages/agente/AgenteDetalleSiniestroPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Descriptions, Tag, Button, Spin, message, Row, Col, Divider, Timeline } from 'antd';
import { ArrowLeftOutlined, FileExclamationOutlined, UserOutlined, FileTextOutlined, HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

const AgenteDetalleSiniestroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [siniestro, setSiniestro] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // Llamamos a la API de detalle (la misma que usa el Admin sirve)
        const response = await axios.get(`http://127.0.0.1:8000/api/siniestros/${id}/`, { headers });
        setSiniestro(response.data);

      } catch (error) {
        console.error(error);
        message.error('Error al cargar el siniestro');
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!siniestro) return <div style={{ textAlign: 'center', padding: 50 }}>Siniestro no encontrado</div>;

  // Helper para colores de estado
  const getStatusColor = (status: string) => {
      switch(status) {
          case 'reportado': return 'blue';
          case 'aprobado': return 'green';
          case 'rechazado': return 'red';
          case 'pagado': return 'gold';
          default: return 'default';
      }
  };

  return (
    <Layout style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" style={{ marginRight: 16 }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>Siniestro #{siniestro.numero_siniestro}</Title>
            <Tag color={getStatusColor(siniestro.estado)} style={{ marginTop: 8 }}>
                {siniestro.estado.toUpperCase().replace('_', ' ')}
            </Tag>
          </div>
        </div>

        <Row gutter={[24, 24]}>
            {/* Columna Izquierda: Detalles del Incidente */}
            <Col xs={24} lg={16}>
                <Card title={<><FileExclamationOutlined /> Detalles del Reporte</>} style={{ marginBottom: 24 }}>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Tipo de Siniestro">
                            <Text strong>{siniestro.tipo_siniestro.toUpperCase()}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha del Incidente">
                            {siniestro.fecha_siniestro}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha de Reporte">
                            {new Date(siniestro.fecha_reporte).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Monto Reclamado">
                            ${parseFloat(siniestro.monto_reclamado).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Descripción">
                            {siniestro.descripcion}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Resolución (Solo si ya fue procesado) */}
                {(siniestro.estado === 'aprobado' || siniestro.estado === 'rechazado' || siniestro.estado === 'pagado') && (
                    <Card title={<><HistoryOutlined /> Resolución del Caso</>} style={{ borderLeft: `5px solid ${siniestro.estado === 'rechazado' ? 'red' : 'green'}` }}>
                         <Descriptions column={1}>
                            <Descriptions.Item label="Fecha Resolución">
                                {siniestro.fecha_resolucion || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Monto Aprobado">
                                <Text strong style={{ fontSize: '16px', color: siniestro.estado === 'rechazado' ? 'red' : 'green' }}>
                                    ${parseFloat(siniestro.monto_aprobado || '0').toLocaleString()}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Comentarios Admin">
                                {siniestro.resolucion || 'Sin comentarios adicionales.'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}
            </Col>

            {/* Columna Derecha: Cliente y Póliza */}
            <Col xs={24} lg={8}>
                <Card title={<><UserOutlined /> Cliente Afectado</>} style={{ marginBottom: 24 }}>
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Nombre">
                            {siniestro.poliza_info.cliente_info.usuario_info.first_name} {siniestro.poliza_info.cliente_info.usuario_info.last_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="CI/DNI">
                            {siniestro.poliza_info.cliente_info.identificacion}
                        </Descriptions.Item>
                         <Descriptions.Item label="Contacto">
                            {siniestro.poliza_info.cliente_info.usuario_info.telefono}
                        </Descriptions.Item>
                    </Descriptions>
                    <Divider />
                    <Button block onClick={() => navigate(`/agente-clientes/${siniestro.poliza_info.cliente_info.id}`)}>
                        Ver Perfil Cliente
                    </Button>
                </Card>

                <Card title={<><FileTextOutlined /> Póliza Asociada</>}>
                     <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>#{siniestro.poliza_info.numero_poliza}</Title>
                        <Text type="secondary">Suma Asegurada: ${parseFloat(siniestro.poliza_info.suma_asegurada).toLocaleString()}</Text>
                        <br/><br/>
                        <Button type="primary" ghost block onClick={() => navigate(`/agente-polizas/${siniestro.poliza_info.id}`)}>
                            Ver Póliza
                        </Button>
                     </div>
                </Card>
            </Col>
        </Row>

      </Content>
    </Layout>
  );
};

export default AgenteDetalleSiniestroPage;