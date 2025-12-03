// en frontend/src/pages/cliente/ClienteReportarSiniestroPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Button, Select, DatePicker, message, Row, Col, Upload, Alert } from 'antd';
import { WarningOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface MiPoliza {
  id: number;
  numero_poliza: string;
  estado: string;
}

const ClienteReportarSiniestroPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [polizas, setPolizas] = useState<MiPoliza[]>([]);

  const getToken = () => localStorage.getItem('accessToken');

  // 1. Cargar las pólizas del cliente para que elija cuál reportar
  useEffect(() => {
    const fetchMisPolizas = async () => {
      try {
        const token = getToken();
        if (!token) { navigate('/login'); return; }
        const headers = { Authorization: `Bearer ${token}` };
        const decodedToken: any = jwtDecode(token);
        
        // Idealmente: GET /api/mis-polizas/
        const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        
        // Filtramos las pólizas de este usuario
        const misPolizas = response.data.filter((p: any) => 
            p.cliente_info?.usuario_info?.username === decodedToken.username && 
            p.estado === 'activa' // Solo se pueden reportar siniestros en pólizas activas
        );
        setPolizas(misPolizas);

      } catch (error) {
        console.error('Error al cargar pólizas:', error);
      }
    };
    fetchMisPolizas();
  }, [navigate]);

  // 2. Enviar el Reporte
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const datosSiniestro = {
        poliza: values.poliza_id,
        tipo_siniestro: values.tipo_siniestro,
        fecha_siniestro: values.fecha_siniestro.format('YYYY-MM-DD'),
        descripcion: values.descripcion,
        monto_reclamado: values.monto_reclamado,
        estado: 'reportado', // Estado inicial
        // documentos: ... (aquí iría la lógica de archivos si el backend lo soporta)
      };

      await axios.post('http://127.0.0.1:8000/api/siniestros/', datosSiniestro, { headers });
      
      message.success('Siniestro reportado correctamente. Un agente se contactará contigo.');
      navigate('/mi-poliza');

    } catch (error) {
      console.error('Error al reportar:', error);
      message.error('Hubo un problema al enviar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 16 }} />
        <div>
            <Title level={2} style={{ margin: 0, color: '#cf1322' }}>Reportar Siniestro</Title>
            <Text type="secondary">Formulario oficial de reclamo de seguro</Text>
        </div>
      </div>

      <Alert 
        message="Importante" 
        description="Por favor, proporciona información precisa sobre el incidente. El reporte falso de siniestros puede tener consecuencias legales." 
        type="warning" 
        showIcon 
        style={{ marginBottom: 24 }}
      />

      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item 
                        name="poliza_id" 
                        label="Seleccionar Póliza Afectada" 
                        rules={[{ required: true, message: 'Debes seleccionar una póliza' }]}
                    >
                        <Select placeholder="Selecciona tu póliza">
                            {polizas.map(p => (
                                <Option key={p.id} value={p.id}>
                                    Póliza #{p.numero_poliza} (Activa)
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="tipo_siniestro" label="Tipo de Incidente" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona el tipo">
                            <Option value="muerte">Fallecimiento</Option>
                            <Option value="invalidez">Invalidez Total/Parcial</Option>
                            <Option value="enfermedad">Enfermedad Grave</Option>
                            <Option value="accidentes">Accidente</Option>
                            <Option value="otros">Otro</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="fecha_siniestro" label="Fecha del Incidente" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item 
                name="monto_reclamado" 
                label="Monto Estimado a Reclamar (Bs.)"
                rules={[{ required: true, message: 'Ingresa un monto estimado' }]}
            >
                <Input type="number" prefix="Bs." min={0} />
            </Form.Item>

            <Form.Item name="descripcion" label="Descripción Detallada del Siniestro" rules={[{ required: true }]}>
                <TextArea rows={6} placeholder="Describe qué sucedió, dónde y cuándo..." />
            </Form.Item>

            {/* Sección de Archivos (Visual por ahora) */}
            <Form.Item label="Documentos de Respaldo (Opcional)">
                <Upload>
                    <Button icon={<UploadOutlined />}>Adjuntar Archivos (PDF, JPG)</Button>
                </Upload>
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 20 }}>
                <Button onClick={() => navigate('/mi-poliza')} style={{ marginRight: 10 }}>
                    Cancelar
                </Button>
                <Button type="primary" danger htmlType="submit" icon={<WarningOutlined />} loading={loading}>
                    Enviar Reporte
                </Button>
            </div>
        </Form>
      </Card>
    </div>
  );
};

export default ClienteReportarSiniestroPage;