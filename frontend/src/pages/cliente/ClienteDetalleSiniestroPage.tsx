// en frontend/src/pages/cliente/ClienteDetalleSiniestroPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Descriptions, Tag, Button, Spin, message, Row, Col, Timeline, Divider, Alert } from 'antd';
import { 
    ArrowLeftOutlined, FileExclamationOutlined, CalendarOutlined, 
    CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DollarOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ClienteDetalleSiniestroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [siniestro, setSiniestro] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const token = getToken();
        if (!token) { navigate('/login'); return; }
        const headers = { Authorization: `Bearer ${token}` };

        // Llamamos a la API de detalle
        const response = await axios.get(`http://127.0.0.1:8000/api/siniestros/${id}/`, { headers });
        setSiniestro(response.data);

      } catch (error) {
        console.error(error);
        message.error('No se pudo cargar el detalle del siniestro');
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id, navigate]);

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  if (!siniestro) return <div style={{ textAlign: 'center', padding: 50 }}>Siniestro no encontrado</div>;

  // Lógica para la línea de tiempo (Progreso)
  let estadoTimeline = 1; // 1: Reportado
  if (siniestro.estado === 'en_revision') estadoTimeline = 2;
  if (siniestro.estado === 'aprobado' || siniestro.estado === 'rechazado') estadoTimeline = 3;
  if (siniestro.estado === 'pagado') estadoTimeline = 4;

  const getColorEstado = (estado: string) => {
      if (estado === 'pagado') return 'gold';
      if (estado === 'aprobado') return 'green';
      if (estado === 'rechazado') return 'red';
      return 'blue';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 16 }} />
            <div>
                <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Detalle del Reclamo</Title>
                <Text type="secondary">Seguimiento del caso #{siniestro.numero_siniestro}</Text>
            </div>
        </div>

        <Row gutter={[24, 24]}>
            {/* COLUMNA IZQUIERDA: ESTADO Y PROGRESO */}
            <Col xs={24} lg={16}>
                <Card style={{ marginBottom: 24 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <Title level={4}>Estado Actual</Title>
                        <Tag color={getColorEstado(siniestro.estado)} style={{ fontSize: '18px', padding: '5px 15px' }}>
                            {siniestro.estado.toUpperCase().replace('_', ' ')}
                        </Tag>
                    </div>

                    <Timeline mode="alternate">
                        <Timeline.Item color="green" dot={<FileExclamationOutlined />}>Reporte Enviado</Timeline.Item>
                        <Timeline.Item color={estadoTimeline >= 2 ? "green" : "gray"} dot={<ClockCircleOutlined />}>
                            En Revisión
                        </Timeline.Item>
                        <Timeline.Item color={estadoTimeline >= 3 ? (siniestro.estado === 'rechazado' ? "red" : "green") : "gray"} dot={siniestro.estado === 'rechazado' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}>
                            Resolución {siniestro.estado === 'rechazado' ? '(Rechazado)' : '(Aprobado)'}
                        </Timeline.Item>
                        <Timeline.Item color={estadoTimeline >= 4 ? "gold" : "gray"} dot={<DollarOutlined />}>
                            Pago Realizado
                        </Timeline.Item>
                    </Timeline>

                    {/* Mostrar Resolución si existe */}
                    {(siniestro.estado === 'aprobado' || siniestro.estado === 'rechazado' || siniestro.estado === 'pagado') && (
                        <Alert
                            message="Resolución de la Aseguradora"
                            description={siniestro.resolucion || "Sin comentarios adicionales."}
                            type={siniestro.estado === 'rechazado' ? 'error' : 'success'}
                            showIcon
                            style={{ marginTop: 24 }}
                        />
                    )}
                </Card>

                <Card title="Detalles del Incidente">
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tipo">{siniestro.tipo_siniestro.toUpperCase()}</Descriptions.Item>
                        <Descriptions.Item label="Fecha del Suceso">{siniestro.fecha_siniestro}</Descriptions.Item>
                        <Descriptions.Item label="Monto Solicitado">${parseFloat(siniestro.monto_reclamado).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Monto Aprobado">
                            {siniestro.monto_aprobado ? 
                                <Text type="success" strong>${parseFloat(siniestro.monto_aprobado).toLocaleString()}</Text> 
                                : <Text type="secondary">Pendiente</Text>
                            }
                        </Descriptions.Item>
                        <Descriptions.Item label="Descripción">
                            {siniestro.descripcion}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>

            {/* COLUMNA DERECHA: PÓLIZA AFECTADA */}
            <Col xs={24} lg={8}>
                <Card title="Póliza Afectada">
                    <div style={{ textAlign: 'center' }}>
                        <Title level={3} style={{ margin: '10px 0', color: '#1890ff' }}>#{siniestro.poliza_info.numero_poliza}</Title>
                        <Text type="secondary">Suma Asegurada Total</Text>
                        <Title level={4} style={{ margin: '5px 0' }}>${parseFloat(siniestro.poliza_info.suma_asegurada).toLocaleString()}</Title>
                    </div>
                    <Divider />
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Estado Póliza">
                            <Tag>{siniestro.poliza_info.estado.toUpperCase()}</Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>
        </Row>
    </div>
  );
};

export default ClienteDetalleSiniestroPage;