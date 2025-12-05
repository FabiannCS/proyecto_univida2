// en frontend/src/pages/agente/AgenteCrearPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Select, InputNumber, message, Row, Col, Card, Divider, List, DatePicker, Checkbox } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UserOutlined, CheckOutlined, SafetyCertificateOutlined, RocketOutlined, CrownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'; // Importamos dayjs para las fechas

const { Title, Text } = Typography;
const { Option } = Select;

// --- 1. DATOS ACTUALIZADOS DEL CATÁLOGO ---
const PLANES: any = {
    'vida_temporal': {
        nombre: "Plan Básico",
        precio: 350, // Bs.
        suma: 50000, // Bs.
        icono: <SafetyCertificateOutlined />,
        features: [
            "Cobertura por fallecimiento",
            "Gastos médicos básicos",
            "Asistencia telefónica 24/7"
        ]
    },
    'accidentes': {
        nombre: "Plan Estándar",
        precio: 700,
        suma: 80000,
        icono: <RocketOutlined />,
        features: [
            "Cobertura por fallecimiento",
            "Gastos médicos ampliados",
            "Sepelio incluido",
            "Soporte 24/7",
            "Cobertura internacional"
        ]
    },
    'vida_entera': {
        nombre: "Plan Premium",
        precio: 1200,
        suma: 150000,
        icono: <CrownOutlined />,
        features: [
            "Cobertura por fallecimiento",
            "Mejor red de clínicas",
            "Indemnización doble por accidente",
            "Soporte 24/7 personalizado",
            "Devolución de prima al 5to año"
        ]
    }
};

const AgenteCrearPolizaPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState<any[]>([]);
    const [planSeleccionado, setPlanSeleccionado] = useState<any>(null);
    const [pagoInmediato, setPagoInmediato] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('accessToken');

    // Cargar Clientes
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = getToken();
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get('http://127.0.0.1:8000/api/clientes/', { headers });
                setClientes(response.data);
            } catch (error) {
                message.error('Error al cargar lista de clientes');
            }
        };
        fetchClientes();
    }, []);

    // Lógica de Autocompletado
    const handlePlanChange = (value: string) => {
        const plan = PLANES[value];
        if (plan) {
            setPlanSeleccionado(plan);
            form.setFieldsValue({
                suma_asegurada: plan.suma,
                prima_anual: plan.precio
            });
        }
    };

    // --- 2. Enviar Formulario (Crear en estado 'cotizacion') ---
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const headers = { Authorization: `Bearer ${token}` };

            const datosPoliza = {
                ...values,
                fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
                fecha_vencimiento: values.fecha_vencimiento.format('YYYY-MM-DD'),

                // --- DATOS NUEVOS PARA EL BACKEND ---
                pago_inmediato: pagoInmediato, 
                metodo_pago: values.metodo_pago,
                referencia_pago: values.referencia_pago
                
            };

            await axios.post('http://127.0.0.1:8000/api/polizas/', datosPoliza, { headers });

            if (pagoInmediato) {
                message.success('¡Póliza emitida, cobrada y activada exitosamente!');
            } else {
                message.success('Póliza creada (Pendiente de Pago).');
            }
            navigate('/agente-polizas');

        } catch (error) {
            console.error(error);
            message.error('Error al emitir la póliza.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" style={{ marginRight: 16 }} />
                <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Emitir Nueva Póliza</Title>
            </div>

            <Row gutter={24}>
                {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
                <Col xs={24} lg={16}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Form 
                            form={form} 
                            layout="vertical" 
                            onFinish={onFinish} 
                            size="large"
                            // --- 3. VALORES POR DEFECTO (FECHAS) ---
                            initialValues={{
                                fecha_inicio: dayjs(), // Hoy
                                fecha_vencimiento: dayjs().add(1, 'year') // Hoy + 1 año
                            }}
                        >
                            
                            <Form.Item 
                                name="cliente" 
                                label="Cliente Titular" 
                                rules={[{ required: true, message: 'Selecciona un cliente' }]}
                            >
                                <Select 
                                    showSearch 
                                    placeholder="Buscar por nombre o CI"
                                    optionFilterProp="children"
                                    filterOption={(input, option) => 
                                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {clientes.map(c => (
                                        <Option key={c.id} value={c.id} label={`${c.usuario_info.first_name} ${c.usuario_info.last_name} - ${c.identificacion}`}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{c.usuario_info.first_name} {c.usuario_info.last_name}</span>
                                                <span style={{ color: '#888', fontSize: '12px' }}>CI: {c.identificacion}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Divider />

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="tipo_seguro" label="Producto / Plan" rules={[{ required: true }]}>
                                        <Select placeholder="Selecciona el plan" onChange={handlePlanChange}>
                                            <Option value="vida_temporal">Plan Básico</Option>
                                            <Option value="accidentes">Plan Estándar</Option>
                                            <Option value="vida_entera">Plan Premium</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                     <Form.Item name="suma_asegurada" label="Suma Asegurada" rules={[{ required: true }]}>
                                        <InputNumber 
                                            style={{ width: '100%' }} 
                                            prefix="Bs." 
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Form.Item name="prima_anual" label="Prima Anual (Costo Total)" rules={[{ required: true }]}>
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    prefix="Bs." 
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                     <Form.Item name="fecha_inicio" label="Vigencia Desde" rules={[{ required: true }]}>
                                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                                     </Form.Item>
                                </Col>
                                <Col span={12}>
                                     <Form.Item name="fecha_vencimiento" label="Vigencia Hasta" rules={[{ required: true }]}>
                                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                                     </Form.Item>
                                </Col>
                            </Row>

                            <Divider />
                        
                        <Form.Item name="pago_inmediato" valuePropName="checked">
                            <Checkbox onChange={(e) => setPagoInmediato(e.target.checked)}>
                                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                    Registrar Pago Inmediato (Activar Póliza Ahora)
                                </span>
                            </Checkbox>
                        </Form.Item>

                        {pagoInmediato && (
                            <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f', marginBottom: '24px' }}>
                                <Text strong style={{ display: 'block', marginBottom: '16px', color: '#3f8600' }}>
                                    Detalles del Cobro
                                </Text>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="metodo_pago" label="Método de Pago" initialValue="efectivo" rules={[{ required: true }]}>
                                            <Select>
                                                <Option value="efectivo">Efectivo</Option>
                                                <Option value="tarjeta">Tarjeta</Option>
                                                <Option value="transferencia">Transferencia</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="referencia_pago" label="Referencia / Nro. Recibo">
                                            <Input placeholder="Opcional" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        )}

                            <div style={{ textAlign: 'right', marginTop: 20 }}>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                                    Emitir Póliza
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>

                {/* --- COLUMNA DERECHA: TARJETA DEL PLAN --- */}
                <Col xs={24} lg={8}>
                    {planSeleccionado ? (
                        <Card 
                            title="Resumen del Producto"
                            bordered={false}
                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 20, borderTop: `4px solid ${planSeleccionado.color}` }}
                            headStyle={{ borderBottom: '1px solid #f0f0f0', textAlign: 'center', fontWeight: 'bold' }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '40px', color: planSeleccionado.color, marginBottom: 10 }}>
                                    {planSeleccionado.icono}
                                </div>
                                <Title level={4} style={{ margin: 0 }}>{planSeleccionado.nombre}</Title>
                                <Text type="secondary">Cobertura Principal</Text>
                                <Title level={2} style={{ margin: '8px 0', color: planSeleccionado.color }}>
                                    Bs. {planSeleccionado.suma.toLocaleString()}
                                </Title>
                            </div>

                            <List
                                size="small"
                                dataSource={planSeleccionado.features}
                                renderItem={(item: any) => (
                                    <List.Item style={{ padding: '8px 0', border: 'none' }}>
                                        <CheckOutlined style={{ color: '#52c41a', marginRight: 10 }} />
                                        <Text>{item}</Text>
                                    </List.Item>
                                )}
                            />

                            <Divider style={{ margin: '16px 0' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong>Costo Anual:</Text>
                                <Text strong style={{ fontSize: '16px' }}>Bs. {planSeleccionado.precio.toLocaleString()}</Text>
                            </div>
                        </Card>
                    ) : (
                        <Card bordered={false} style={{ textAlign: 'center', color: '#999', background: '#f5f5f5', border: '1px dashed #d9d9d9' }}>
                            <div style={{ padding: '40px 0' }}>
                                <UserOutlined style={{ fontSize: '32px', marginBottom: 16 }} />
                                <p>Selecciona un plan para ver los detalles.</p>
                            </div>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default AgenteCrearPolizaPage;