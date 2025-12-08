// en frontend/src/pages/agente/AgenteCrearPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Select, InputNumber, message, Row, Col, Card, Divider, List, DatePicker, Checkbox, Modal, Descriptions, Tabs } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UserOutlined, CheckOutlined, SafetyCertificateOutlined, RocketOutlined, CrownOutlined, UsergroupAddOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined, FileProtectOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// --- 1. DATOS COMPLETOS (Iguales al Catálogo del Cliente) ---
const PLANES: any = {
    'vida_temporal': {
        nombre: "Plan Básico",
        precio: 350,
        suma: 50000,
        color: '#52c41a',
        icono: <SafetyCertificateOutlined />,
        features: ["Cobertura por fallecimiento", "Gastos médicos básicos", "Asistencia telefónica 24/7"],
        descripcion: "La opción ideal para quienes buscan una protección esencial a bajo costo.",
        requisitos: ["Edad 18-65 años", "Declaración simple de salud"],
        exclusiones: ["Enfermedades preexistentes", "Deportes extremos"]
    },
    'accidentes': {
        nombre: "Plan Estándar",
        precio: 700,
        suma: 80000,
        color: '#1890ff',
        icono: <RocketOutlined />,
        features: ["Muerte natural y accidental", "Gastos médicos ampliados", "Sepelio incluido", "Cobertura internacional"],
        descripcion: "Nuestro plan más equilibrado con cobertura robusta.",
        requisitos: ["Edad 18-60 años", "Examen médico básico"],
        exclusiones: ["Actos delictivos", "Sustancias controladas"]
    },
    'vida_entera': {
        nombre: "Plan Premium",
        precio: 1200,
        suma: 150000,
        color: '#722ed1',
        icono: <CrownOutlined />,
        features: ["Cobertura total todo riesgo", "Mejor red de clínicas", "Devolución de prima al 5to año"],
        descripcion: "La protección definitiva con coberturas millonarias y ahorro.",
        requisitos: ["Edad 21+ años", "Revisión médica completa", "Ingresos demostrables"],
        exclusiones: ["Conflictos bélicos", "Fraude"]
    }
};

const AgenteCrearPolizaPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState<any[]>([]);
    const [planSeleccionado, setPlanSeleccionado] = useState<any>(null);
    const [pagoInmediato, setPagoInmediato] = useState(false);
    
    // Estado para el Modal de Info
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = getToken();
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get('http://127.0.0.1:8000/api/clientes/', { headers });
                setClientes(response.data);
            } catch (error) { message.error('Error al cargar lista de clientes'); }
        };
        fetchClientes();
    }, []);

    const handlePlanChange = (value: string) => {
        const plan = PLANES[value];
        if (plan) {
            setPlanSeleccionado(plan);
            form.setFieldsValue({ suma_asegurada: plan.suma, prima_anual: plan.precio });
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const headers = { Authorization: `Bearer ${token}` };

            const datosPoliza = {
                ...values,
                fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
                fecha_vencimiento: values.fecha_vencimiento.format('YYYY-MM-DD'),
                pago_inmediato: pagoInmediato, 
                metodo_pago: values.metodo_pago,
                referencia_pago: values.referencia_pago
            };

            await axios.post('http://127.0.0.1:8000/api/polizas/', datosPoliza, { headers });
            
            message.success(pagoInmediato ? '¡Póliza emitida y activada!' : 'Póliza creada (Pendiente de Pago).');
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
                <Col xs={24} lg={16}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Form form={form} layout="vertical" onFinish={onFinish} size="large"
                            initialValues={{ fecha_inicio: dayjs(), fecha_vencimiento: dayjs().add(1, 'year') }}
                        >
                            <Form.Item name="cliente" label="Cliente Titular" rules={[{ required: true, message: 'Seleccione un cliente' }]}>
                                <Select showSearch placeholder="Buscar por nombre o CI" optionFilterProp="children"
                                    filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                >
                                    {clientes.map(c => (
                                        <Option key={c.id} value={c.id} label={`${c.usuario_info.first_name} ${c.usuario_info.last_name} - ${c.identificacion}`}>
                                            {c.usuario_info.first_name} {c.usuario_info.last_name} <span style={{ color: '#999', fontSize: '12px' }}>(CI: {c.identificacion})</span>
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
                                        <InputNumber style={{ width: '100%' }} prefix="Bs." 
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Form.Item name="prima_anual" label="Prima Anual (Costo)" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} prefix="Bs." 
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

                            {/* --- SECCIÓN BENEFICIARIOS --- */}
                            <Card size="small" title={<><UsergroupAddOutlined /> Beneficiarios</>} style={{ marginTop: 24, background: '#fafafa' }}>
                                <Form.List name="beneficiarios" rules={[{ validator: async (_, names) => { if (!names || names.length < 1) return Promise.reject(new Error('Debe agregar al menos un beneficiario')); } }]}>
                                    {(fields, { add, remove }, { errors }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                        <div key={key} style={{ display: 'flex', gap: '8px', marginBottom: 8, alignItems: 'start' }}>
                                            <Form.Item {...restField} name={[name, 'nombre_completo']} rules={[{ required: true, message: 'Requerido' }]} style={{ flex: 2, marginBottom: 0 }}>
                                                <Input placeholder="Nombre Completo" />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'parentesco']} rules={[{ required: true, message: 'Requerido' }]} style={{ flex: 1, marginBottom: 0 }}>
                                                <Input placeholder="Parentesco" />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'porcentaje']} rules={[{ required: true, message: '%' }]} style={{ width: '80px', marginBottom: 0 }}>
                                                <InputNumber placeholder="%" min={1} max={100} controls={false} />
                                            </Form.Item>
                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                        </div>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Añadir Beneficiario</Button>
                                            <Form.ErrorList errors={errors} />
                                        </Form.Item>
                                    </>
                                    )}
                                </Form.List>
                            </Card>

                            <Divider />
                            
                            <Form.Item name="pago_inmediato" valuePropName="checked">
                                <Checkbox onChange={(e) => setPagoInmediato(e.target.checked)}>
                                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>Registrar Pago Inmediato (Activar Póliza Ahora)</span>
                                </Checkbox>
                            </Form.Item>

                            {pagoInmediato && (
                                <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f', marginBottom: '24px' }}>
                                    <Text strong style={{ display: 'block', marginBottom: '16px', color: '#3f8600' }}>Detalles del Cobro</Text>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="metodo_pago" label="Método de Pago" initialValue="efectivo" rules={[{ required: true, message: 'Requerido' }]}>
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
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>Emitir Póliza</Button>
                            </div>
                        </Form>
                    </Card>
                </Col>

                {/* Columna Derecha (Resumen Mejorado) */}
                <Col xs={24} lg={8}>
                    {planSeleccionado ? (
                        <Card title="Resumen del Producto" bordered={false} style={{ position: 'sticky', top: 20, borderTop: `4px solid ${planSeleccionado.color}` }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '40px', color: planSeleccionado.color, marginBottom: 10 }}>{planSeleccionado.icono}</div>
                                <Title level={4} style={{ margin: 0 }}>{planSeleccionado.nombre}</Title>
                                <Title level={2} style={{ margin: '8px 0', color: planSeleccionado.color }}>Bs. {planSeleccionado.suma.toLocaleString()}</Title>
                            </div>
                            <List size="small" dataSource={planSeleccionado.features} renderItem={(item: any) => (<List.Item style={{ padding: '8px 0', border: 'none' }}><CheckOutlined style={{ color: '#52c41a', marginRight: 10 }} /> <Text>{item}</Text></List.Item>)} />
                            <Divider style={{ margin: '16px 0' }} />
                            
                            {/* --- BOTÓN DE MÁS INFORMACIÓN (NUEVO) --- */}
                            <Button block icon={<InfoCircleOutlined />} onClick={() => setIsInfoModalOpen(true)}>
                                Ver Detalles del Plan
                            </Button>
                            {/* -------------------------------------- */}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                                <Text strong>Costo Anual:</Text>
                                <Text strong style={{ fontSize: '16px' }}>Bs. {planSeleccionado.precio.toLocaleString()}</Text>
                            </div>
                        </Card>
                    ) : (
                        <Card bordered={false} style={{ textAlign: 'center', color: '#999', background: '#f5f5f5', border: '1px dashed #d9d9d9' }}>
                            <div style={{ padding: '40px 0' }}><UserOutlined style={{ fontSize: '32px', marginBottom: 16 }} /><p>Selecciona un plan para ver detalles.</p></div>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* --- MODAL DE INFORMACIÓN DETALLADA (NUEVO) --- */}
            <Modal
                title={null}
                open={isInfoModalOpen}
                onCancel={() => setIsInfoModalOpen(false)}
                footer={[<Button key="close" onClick={() => setIsInfoModalOpen(false)}>Cerrar</Button>]}
            >
                {planSeleccionado && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: `4px solid ${planSeleccionado.color}`, paddingBottom: 15 }}>
                            <div style={{ fontSize: '40px', color: planSeleccionado.color }}>{planSeleccionado.icono}</div>
                            <Title level={3} style={{ margin: '5px 0' }}>{planSeleccionado.nombre}</Title>
                            <Text type="secondary">{planSeleccionado.descripcion}</Text>
                        </div>

                        <Tabs defaultActiveKey="1" items={[
                            {
                                key: '1',
                                label: 'Requisitos',
                                children: (
                                    <List
                                        size="small"
                                        dataSource={planSeleccionado.requisitos}
                                        renderItem={(item: any) => <List.Item><FileProtectOutlined style={{ marginRight: 8, color: '#1890ff' }} /> {item}</List.Item>}
                                    />
                                )
                            },
                            {
                                key: '2',
                                label: 'Exclusiones',
                                children: (
                                    <List
                                        size="small"
                                        dataSource={planSeleccionado.exclusiones}
                                        renderItem={(item: any) => <List.Item><CloseCircleOutlined style={{ marginRight: 8, color: '#cf1322' }} /> {item}</List.Item>}
                                    />
                                )
                            }
                        ]} />
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default AgenteCrearPolizaPage;