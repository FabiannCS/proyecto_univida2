// en frontend/src/pages/agente/AgenteReportarSiniestroPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Button, Select, DatePicker, message, Row, Col, Divider, Alert } from 'antd';
import { WarningOutlined, ArrowLeftOutlined, SearchOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AgenteReportarSiniestroPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [polizas, setPolizas] = useState<any[]>([]);

  const getToken = () => localStorage.getItem('accessToken');

  // 1. Cargar Pólizas Activas para el Buscador
  useEffect(() => {
    const fetchPolizas = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        
        // Obtenemos las pólizas para que el agente seleccione cuál tiene el siniestro
        const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        
        // Filtramos solo las ACTIVAS (no tiene sentido reportar siniestro en una cancelada o cotización)
        const activas = response.data.filter((p: any) => p.estado === 'activa');
        setPolizas(activas);

      } catch (error) {
        message.error('Error al cargar pólizas');
      }
    };
    fetchPolizas();
  }, []);

  // 2. Enviar Reporte
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
        estado: 'reportado',
        // Opcional: Podrías agregar un campo interno 'reportado_por': 'agente' si tu backend lo soportara
      };

      await axios.post('http://127.0.0.1:8000/api/siniestros/', datosSiniestro, { headers });
      
      message.success('Siniestro registrado exitosamente.');
      navigate('/agente-siniestros');

    } catch (error) {
      console.error(error);
      message.error('Error al registrar el siniestro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" style={{ marginRight: 16 }} />
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Registrar Siniestro (Presencial)</Title>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Alert 
            message="Registro Manual" 
            description="Utilice este formulario cuando el cliente reporte el incidente telefónicamente o en persona." 
            type="info" 
            showIcon 
            style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            
            <Title level={5}>1. Identificación de la Póliza</Title>
            <Form.Item 
                name="poliza_id" 
                rules={[{ required: true, message: 'Busque y seleccione la póliza' }]}
            >
                <Select 
                    showSearch
                    placeholder="Buscar por Nº Póliza, Nombre Cliente o CI..."
                    optionFilterProp="children"
                    suffixIcon={<SearchOutlined />}
                    filterOption={(input, option) => 
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {polizas.map(p => (
                        <Option 
                            key={p.id} 
                            value={p.id} 
                            label={`${p.numero_poliza} - ${p.cliente_info.usuario_info.first_name} ${p.cliente_info.usuario_info.last_name}`}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><strong>#{p.numero_poliza}</strong> - {p.cliente_info.usuario_info.first_name} {p.cliente_info.usuario_info.last_name}</span>
                                <span style={{ color: '#888' }}>Suma: ${p.suma_asegurada}</span>
                            </div>
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Divider />

            <Title level={5}>2. Detalles del Incidente</Title>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="tipo_siniestro" label="Tipo de Siniestro" rules={[{ required: true }]}>
                        <Select placeholder="Seleccionar tipo">
                            <Option value="muerte">Fallecimiento</Option>
                            <Option value="invalidez">Invalidez</Option>
                            <Option value="enfermedad">Enfermedad Grave</Option>
                            <Option value="accidentes">Accidente</Option>
                            <Option value="otros">Otro</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name="fecha_siniestro" label="Fecha del Suceso" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item 
                name="monto_reclamado" 
                label="Monto Estimado a Reclamar (Bs.)"
                rules={[{ required: true, message: 'Ingrese un monto aproximado' }]}
            >
                <Input type="number" prefix="Bs." min={0} />
            </Form.Item>

            <Form.Item name="descripcion" label="Relato de los Hechos" rules={[{ required: true }]}>
                <TextArea rows={4} placeholder="Describa brevemente qué sucedió..." />
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 20 }}>
                <Button onClick={() => navigate(-1)} style={{ marginRight: 10 }}>Cancelar</Button>
                <Button type="primary" danger htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                    Registrar Siniestro
                </Button>
            </div>
        </Form>
      </Card>
    </div>
  );
};

export default AgenteReportarSiniestroPage;