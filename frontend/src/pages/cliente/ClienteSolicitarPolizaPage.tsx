// en frontend/src/pages/cliente/ClienteSolicitarPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Button, Select, InputNumber, message, Row, Col, Divider, Alert, List, Space } from 'antd';
import { SafetyCertificateOutlined, SendOutlined, ArrowLeftOutlined, CheckCircleOutlined, RocketOutlined, CrownOutlined, PlusOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const PLANES_DISPONIBLES: any = {
    'vida_temporal': {
        nombre: "Plan Básico",
        precio: "350 Bs.",
        color: '#52c41a',
        icono: <SafetyCertificateOutlined />,
        features: [
        "Cobertura por fallecimiento",
        "Gastos médicos básicos",
        "Asistencia telefónica 24/7"
        ],
        montoDefault: 50000,
        sumaTexto: "50.000 Bs.",
        limiteTexto: "5.000 Bs.",
        tasaTexto: "2,5 por mil"
    },
    'accidentes': {
        nombre: "Plan Estándar",
        precio: "700 Bs.",
        color: '#1890ff',
        icono: <RocketOutlined />,
        features: [
        "Cobertura por fallecimiento",
        "Gastos médicos ampliados",
        "Sepelio incluido",
        "Soporte 24/7",
        "Cobertura internacional"  
        ],
        montoDefault: 80000,
        sumaTexto: "80.000 Bs.",
        limiteTexto: "15.000 Bs.",
        tasaTexto: "3.0 por mil"
    },
    'vida_entera': {
        nombre: "Plan Premium",
        precio: "1.000 Bs.", // Texto exacto del catálogo
        color: '#722ed1',
        icono: <CrownOutlined />,
        features: [
        "Cobertura por fallecimiento",
        "Mejor red de clínicas",
        "Indemnización doble por accidente",
        "Soporte 24/7 personalizado",
        "Devolución de prima al 5to año"
        ],
        montoDefault: 150000,
        sumaTexto: "150.000 Bs..",
        limiteTexto: "40.000 Bs.",
        tasaTexto: "4,5 por mil"
    }
};
const ClienteSolicitarPolizaPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [planActual, setPlanActual] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const planPreseleccionado = location.state?.planSeleccionado;
  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    if (planPreseleccionado) {
        let codigoBackend = 'vida_temporal';
        if (planPreseleccionado.nombre.includes("Estándar")) codigoBackend = 'accidentes';
        if (planPreseleccionado.nombre.includes("Premium")) codigoBackend = 'vida_entera';
        setPlanActual(PLANES_DISPONIBLES[codigoBackend]);

        let montoLimpio = 50000;
        if (planPreseleccionado.sumaAsegurada) {
             montoLimpio = parseInt(planPreseleccionado.sumaAsegurada.replace(/[^0-9]/g, ''), 10);
             if (planPreseleccionado.nombre.includes("Premium")) montoLimpio = 150000; 
        }
        form.setFieldsValue({
            tipo_seguro: codigoBackend,
            suma_asegurada: montoLimpio,
            observaciones: `Solicitud iniciada desde catálogo: ${planPreseleccionado.nombre}`
        });
    } else {
        setPlanActual(PLANES_DISPONIBLES['vida_temporal']);
        form.setFieldsValue({ tipo_seguro: 'vida_temporal', suma_asegurada: 50000 });
    }
  }, [planPreseleccionado, form]);

  const handleTipoSeguroChange = (value: string) => {
      const nuevoPlan = PLANES_DISPONIBLES[value];
      if (nuevoPlan) {
          setPlanActual(nuevoPlan);
          form.setFieldsValue({ suma_asegurada: nuevoPlan.montoDefault });
      }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const datosSolicitud = { ...values, estado: 'cotizacion' };

      await axios.post('http://127.0.0.1:8000/api/polizas/solicitar/', datosSolicitud, { headers });

      message.success('¡Solicitud enviada con éxito!');
      navigate('/mi-poliza');

    } catch (error) {
      console.error('Error al solicitar:', error);
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
            <Text type="secondary">Personaliza tu plan y añade tus beneficiarios</Text>
        </div>
      </div>

      <Row gutter={32}>
        {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
        <Col xs={24} lg={15}> 
            <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                
                {/* 1. DATOS DE LA PÓLIZA */}
                <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                    <Title level={4}><SafetyCertificateOutlined /> Configuración de Póliza</Title>
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
                            <Form.Item name="suma_asegurada" label="Monto a Asegurar" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                    parser={(value: string | undefined) => {
                                      if (!value) return 0;
                                      return parseFloat(value.replace(/\$\s?|(,*)/g, ''));
                                      }}
                                    min={1000} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="observaciones" label="Comentarios Adicionales">
                        <Input.TextArea rows={2} placeholder="Observaciones médicas o especiales..." />
                    </Form.Item>
                </Card>

                {/* 2. BENEFICIARIOS (NUEVOS CAMPOS) */}
                <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Title level={4}><UsergroupAddOutlined /> Beneficiarios</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                        Agrega a las personas que recibirán el beneficio. La suma de porcentajes debe ser 100%.
                    </Text>
                    <Divider style={{ margin: '12px 0' }} />

                    <Form.List 
                        name="beneficiarios"
                        // --- VALIDACIÓN: OBLIGATORIO AL MENOS UNO ---
                        rules={[
                            {
                                validator: async (_, names) => {
                                    if (!names || names.length < 1) {
                                        return Promise.reject(new Error('Debes agregar al menos un beneficiario'));
                                    }
                                },
                            },
                        ]}
                    >
                        {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                            <Card 
                                key={key} 
                                size="small" 
                                style={{ marginBottom: 16, background: '#fafafa', border: '1px dashed #d9d9d9' }}
                                extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>Quitar</Button>}
                                title={`Beneficiario ${name + 1}`}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'nombre_completo']} label="Nombre" rules={[{ required: true, message: 'Falta nombre' }]}>
                                            <Input placeholder="Nombres" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'paterno']} label="Ap. Paterno">
                                            <Input placeholder="Apellido Paterno" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'materno']} label="Ap. Materno">
                                            <Input placeholder="Apellido Materno" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item {...restField} name={[name, 'ci']} label="CI / DNI">
                                            <Input placeholder="Documento Identidad" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item {...restField} name={[name, 'parentesco']} label="Parentesco" rules={[{ required: true, message: 'Falta parentesco' }]}>
                                            <Select placeholder="Selecciona">
                                                <Option value="hijo">Hijo/a</Option>
                                                <Option value="conyuge">Cónyuge</Option>
                                                <Option value="padre">Padre/Madre</Option>
                                                <Option value="otro">Otro</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item {...restField} name={[name, 'telefono']} label="Teléfono">
                                            <Input placeholder="Contacto" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item {...restField} name={[name, 'porcentaje']} label="Porcentaje %" rules={[{ required: true, message: 'Requerido' }]}>
                                            <InputNumber min={1} max={100} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Añadir Beneficiario
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                        )}
                    </Form.List>
                </Card>

                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} size="large">
                        Enviar Solicitud
                    </Button>
                </div>
            </Form>
        </Col>

        {/* --- COLUMNA DERECHA: RESUMEN (Igual que antes) --- */}
        {planActual && (
            <Col xs={24} lg={9}>
                <Card 
                    title="Resumen del Plan" 
                    style={{ borderTop: `6px solid ${planActual.color}`, background: '#fafafa', position: 'sticky', top: 20 }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '40px', color: planActual.color }}>{planActual.icono}</div>
                        <Title level={3} style={{ color: planActual.color, margin: '8px 0' }}>{planActual.nombre}</Title>
                        <Title level={2} style={{ marginTop: 5 }}>{planActual.precio}</Title>
                    </div>
                    <Divider />
                    <List size="small" dataSource={planActual.features} renderItem={(item: any) => (<List.Item><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> {item}</List.Item>)} />
                </Card>
            </Col>
        )}
      </Row>
    </div>
  );
};

export default ClienteSolicitarPolizaPage;