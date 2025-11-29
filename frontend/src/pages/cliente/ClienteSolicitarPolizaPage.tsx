// en frontend/src/pages/cliente/ClienteSolicitarPolizaPage.tsx
import React, { useState } from 'react';
import { Typography, Card, Form, Input, Button, Select, InputNumber, Steps, message, Row, Col, Divider } from 'antd';
import { SafetyCertificateOutlined, DollarOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ClienteSolicitarPolizaPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const getToken = () => localStorage.getItem('accessToken');

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Preparamos los datos para la API
      // Nota: El backend debe asignar este cliente automáticamente basándose en el token
      const datosSolicitud = {
        ...values,
        estado: 'cotizacion', // Se crea como una cotización pendiente
        // Fecha inicio/fin se pueden calcular en el backend o pedir aquí
      };

      // Llamada a la API (Tu compañero debe tener listo POST /api/polizas/ o similar)
      // Si usas el mismo endpoint de admin, asegúrate que permita crear sin especificar 'cliente' explícito (usando request.user)
      await axios.post('http://127.0.0.1:8000/api/polizas/solicitar/', datosSolicitud, { headers });

      message.success('¡Solicitud enviada con éxito! Un agente revisará tu caso.');
      navigate('/mi-poliza'); // Volver al dashboard

    } catch (error) {
      console.error('Error al solicitar:', error);
      message.error('Hubo un problema al enviar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', paddingTop: 12 }}>

      <div style={{ display: 'flex', gap: '16px', marginBottom: 24 }}>
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            shape="circle" 
        />
      </div>

      <Title level={2} style={{ textAlign: 'center', marginBottom: '10px', fontFamily: 'Michroma, sans-serif' }}>Solicitar Nuevo Seguro</Title>
      <Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
        Completa los datos para recibir una cotización personalizada de nuestros agentes.
      </Paragraph>
    
      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
        >
            <Row gutter={24}>
                <Col span={24}>
                    <Title level={4}><SafetyCertificateOutlined /> Tipo de Cobertura</Title>
                    <Divider style={{ margin: '12px 0 24px 0' }} />
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item 
                        name="tipo_seguro" 
                        label="¿Qué tipo de seguro buscas?"
                        rules={[{ required: true, message: 'Por favor selecciona una opción' }]}
                    >
                        <Select placeholder="Selecciona una opción">
                            <Option value="vida_entera">Vida Entera (Vitalicio)</Option>
                            <Option value="vida_temporal">Vida Temporal (Plazo Fijo)</Option>
                            <Option value="accidentes">Accidentes Personales</Option>
                            <Option value="ahorro">Seguro de Ahorro / Retiro</Option>
                        </Select>
                    </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                    <Form.Item 
                        name="suma_asegurada" 
                        label="Monto a Asegurar (Suma Asegurada)"
                        rules={[{ required: true, message: 'Ingresa el monto deseado' }]}
                    >
                        <InputNumber 
                            style={{ width: '100%' }} 
                            prefix="$" 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={((value: string | undefined) => parseFloat((value || '').replace(/\$\s?|(,*)/g, ''))) as any}
                            placeholder="Ej: 50000"
                            min={1000}
                        />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item 
                        name="observaciones" 
                        label="Observaciones o Necesidades Especiales"
                    >
                        <Input.TextArea rows={4} placeholder="Cuéntanos si tienes alguna condición médica o requerimiento específico..." />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <Button onClick={() => navigate('/mi-poliza')} style={{ marginRight: '10px' }}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading}>
                            Enviar Solicitud
                        </Button>
                    </div>
                </Col>
            </Row>
        </Form>
      </Card>
    </div>
  );
};

export default ClienteSolicitarPolizaPage;