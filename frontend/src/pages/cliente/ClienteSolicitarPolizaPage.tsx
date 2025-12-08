// en frontend/src/pages/cliente/ClienteSolicitarPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Button, Select, InputNumber, message, Row, Col, Divider, List, Alert, Radio } from 'antd';
import { SafetyCertificateOutlined, SendOutlined, ArrowLeftOutlined, CheckCircleOutlined, RocketOutlined, CrownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

// --- 1. CATÁLOGO MAESTRO DE PLANES ---
const PLANES_DISPONIBLES: any = {
    'vida_temporal': {
        nombre: "Plan Básico",
        precioAnual: 350,
        moneda: "Bs.",
        color: '#52c41a',
        icono: <SafetyCertificateOutlined />,
        suma: 50000,
        limiteMedico: 5000,
        tasa: 2.5,
        features: ["Cobertura por muerte natural", "Gastos médicos básicos", "Asistencia 24/7"]
    },
    'accidentes': {
        nombre: "Plan Estándar",
        precioAnual: 700,
        moneda: "Bs.",
        color: '#1890ff',
        icono: <RocketOutlined />,
        suma: 80000,
        limiteMedico: 15000,
        tasa: 3.0,
        features: ["Muerte natural y accidental", "Sepelio incluido", "Cobertura internacional"]
    },
    'vida_entera': {
        nombre: "Plan Premium",
        precioAnual: 1200, // Asumimos dólares según tu imagen, o convertimos
        moneda: "Bs.",
        color: '#722ed1',
        icono: <CrownOutlined />,
        suma: 150000,
        limiteMedico: 40000,
        tasa: 4.5,
        features: ["Cobertura total todo riesgo", "Gastos médicos ampliados" ,"Mejor red de clínicas", "Soporte 24/7 personalizado", "Cobertura internacional","Devolución de prima al 5to año"]
    }
};

const ClienteSolicitarPolizaPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [planActual, setPlanActual] = useState<any>(null);
  const [frecuenciaPago, setFrecuenciaPago] = useState('anual'); // 'anual' o 'mensual'
  
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const planPreseleccionado = location.state?.planSeleccionado;
  const getToken = () => localStorage.getItem('accessToken');

  // --- CARGA INICIAL ---
  useEffect(() => {
    let codigoBackend = 'vida_temporal'; // Default

    if (planPreseleccionado) {
        if (planPreseleccionado.nombre.includes("Estándar")) codigoBackend = 'accidentes';
        if (planPreseleccionado.nombre.includes("Premium")) codigoBackend = 'vida_entera';
    }
    
    // Configuramos el plan actual basado en la selección
    const plan = PLANES_DISPONIBLES[codigoBackend];
    setPlanActual(plan);

    // Rellenamos el formulario
    form.setFieldsValue({
        tipo_seguro: codigoBackend,
        suma_asegurada: plan.suma,
        frecuencia_pago: 'anual', // Default
        observaciones: planPreseleccionado ? `Solicitud desde catálogo: ${plan.nombre}` : ''
    });
  }, [planPreseleccionado, form]);

  // --- CAMBIO DE PLAN EN EL FORMULARIO ---
  const handleTipoSeguroChange = (value: string) => {
      const nuevoPlan = PLANES_DISPONIBLES[value];
      if (nuevoPlan) {
          setPlanActual(nuevoPlan);
          form.setFieldsValue({ suma_asegurada: nuevoPlan.suma });
      }
  };

  // --- CAMBIO DE FRECUENCIA (ANUAL/MENSUAL) ---
  const handleFrecuenciaChange = (e: any) => {
      setFrecuenciaPago(e.target.value);
  };

  // --- CÁLCULO DEL PRECIO A MOSTRAR ---
  const getPrecioMostrar = () => {
      if (!planActual) return 0;
      if (frecuenciaPago === 'anual') {
          return `${planActual.moneda} ${planActual.precioAnual.toLocaleString()}`;
      } else {
          // Cálculo simple: Precio Anual / 12
          const mensual = (planActual.precioAnual / 12).toFixed(2);
          return `${planActual.moneda} ${mensual}`;
      }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Calculamos la prima anual real para enviarla al backend
      // (El backend se encarga de dividir si es mensual, o podemos mandar el dato de frecuencia)
      const datosSolicitud = {
        ...values,
        prima_anual: planActual.precioAnual, // Enviamos el precio base
        estado: 'cotizacion',
        // Podrías añadir 'frecuencia_pago' al body si tu backend lo soporta en 'observaciones' o un campo nuevo
        observaciones: `${values.observaciones || ''} - Frecuencia: ${frecuenciaPago.toUpperCase()}`
      };

      await axios.post('http://127.0.0.1:8000/api/polizas/solicitar/', datosSolicitud, { headers });

      message.success('¡Solicitud enviada con éxito!');
      navigate('/mi-poliza');

    } catch (error) {
      console.error('Error:', error);
      message.error('Hubo un problema al enviar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 16 }} />
        <div>
            <Title level={2} style={{ margin: 0 }}>Solicitar Nuevo Seguro</Title>
            <Text type="secondary">Personaliza tu protección a tu medida</Text>
        </div>
      </div>

      <Row gutter={32}>
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
        <Col xs={24} lg={15}> 
            <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Title level={4}><SafetyCertificateOutlined /> Configuración de la Póliza</Title>
                    <Divider style={{ margin: '12px 0 24px 0' }} />

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="tipo_seguro" label="Tipo de Seguro" rules={[{ required: true }]}>
                                <Select onChange={handleTipoSeguroChange}>
                                    <Option value="vida_temporal">Plan Básico</Option>
                                    <Option value="accidentes">Plan Estándar</Option>
                                    <Option value="vida_entera">Plan Premium</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="suma_asegurada" label="Suma Asegurada (Cobertura)" rules={[{ required: true }]}>
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: string | undefined) => {
                                      if (!value) return 0;
                                      return parseFloat(value.replace(/\$\s?|(,*)/g, ''));
                                      }}
                                    min={1000}
                                    // addonBefore={planActual?.moneda}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    {/* --- NUEVO: SELECTOR DE FRECUENCIA --- */}
                    <Form.Item name="frecuencia_pago" label="Frecuencia de Pago">
                        <Radio.Group onChange={handleFrecuenciaChange} buttonStyle="solid">
                            <Radio.Button value="anual">Anual (1 Pago)</Radio.Button>
                            <Radio.Button value="mensual">Mensual (12 Pagos)</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    {/* ------------------------------------ */}

                    <Form.Item name="observaciones" label="Comentarios Adicionales">
                        <Input.TextArea rows={4} placeholder="Escribe aquí si tienes dudas específicas..." />
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} size="large">
                            Enviar Solicitud
                        </Button>
                    </div>
                </Form>
            </Card>
        </Col>

        {/* --- COLUMNA DERECHA: RESUMEN DETALLADO --- */}
        {planActual && (
            <Col xs={24} lg={9}>
                <Card 
                    hoverable
                    style={{ 
                        textAlign: 'center', 
                        borderRadius: '16px', 
                        borderTop: `6px solid ${planActual.color}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        position: 'sticky', top: 20
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '10px', color: planActual.color }}>
                        {planActual.icono}
                    </div>

                    <Title level={3} style={{ margin: '0 0 10px 0' }}>{planActual.nombre}</Title>
                    
                    {/* PRECIO DINÁMICO */}
                    <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <Text type="secondary">Tu Prima {frecuenciaPago === 'anual' ? 'Anual' : 'Mensual'}</Text>
                        <Title level={2} style={{ margin: '0', color: planActual.color }}>
                            {getPrecioMostrar()}
                        </Title>
                    </div>
                    
                    <Divider>Detalles de Cobertura</Divider>

                    {/* --- DETALLES TÉCNICOS (LO QUE PEDISTE) --- */}
                    <div style={{ marginBottom: '24px', textAlign: 'left', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dashed #eee', paddingBottom: '4px' }}>
                            <Text type="secondary">Suma Asegurada:</Text>
                            <Text strong>{planActual.moneda} {planActual.suma.toLocaleString()}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dashed #eee', paddingBottom: '4px' }}>
                            <Text type="secondary">Límite Médico (GMA):</Text>
                            <Text strong>{planActual.moneda} {planActual.limiteMedico.toLocaleString()}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eee', paddingBottom: '4px' }}>
                            <Text type="secondary">Tasa Aplicada:</Text>
                            <Text strong>{planActual.tasa} por mil</Text>
                        </div>
                    </div>
                    {/* ------------------------------------------ */}

                    <List
                        size="small"
                        dataSource={planActual.features}
                        renderItem={(item: any) => (
                            <List.Item style={{ border: 'none', padding: '6px 0', textAlign: 'left' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} /> {item}
                            </List.Item>
                        )}
                    />
                    
                    <Alert message="Cobertura sujeta a aprobación." type="info" showIcon style={{ marginTop: 20 }} />
                </Card>
            </Col>
        )}
      </Row>
    </div>
  );
};

export default ClienteSolicitarPolizaPage;