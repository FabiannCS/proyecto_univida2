// en frontend/src/pages/agente/AgenteCrearPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Select, InputNumber, message, Row, Col, Card, Divider } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

// Reutilizamos la constante de planes (puedes moverla a un archivo compartido luego)
const PLANES_DISPONIBLES: any = {
    'vida_temporal': { nombre: "Plan Básico", montoDefault: 50000 },
    'accidentes': { nombre: "Plan Estándar", montoDefault: 100000 },
    'vida_entera': { nombre: "Plan Premium", montoDefault: 250000 }
};

const AgenteCrearPolizaPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState<any[]>([]); // Lista de mis clientes
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('accessToken');

    // 1. Cargar mis clientes para el selector
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = getToken();
                const headers = { Authorization: `Bearer ${token}` };
                // Tu backend debería filtrar esto, o usamos el filtro visual
                const response = await axios.get('http://127.0.0.1:8000/api/clientes/', { headers });
                setClientes(response.data);
            } catch (error) {
                message.error('Error al cargar lista de clientes');
            }
        };
        fetchClientes();
    }, []);

    // 2. Manejar cambio de plan
    const handleTipoSeguroChange = (value: string) => {
        const plan = PLANES_DISPONIBLES[value];
        if (plan) form.setFieldsValue({ suma_asegurada: plan.montoDefault });
    };

    // 3. Enviar Formulario
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const headers = { Authorization: `Bearer ${token}` };

            const datosPoliza = {
                ...values,
                estado: 'activa', // El agente la crea directamente ACTIVA
                // El backend debe asignar el 'agente' automáticamente al usuario logueado
            };

            await axios.post('http://127.0.0.1:8000/api/polizas/', datosPoliza, { headers });
            
            message.success('Póliza creada y activada correctamente.');
            navigate('/agente-polizas');

        } catch (error) {
            console.error(error);
            message.error('Error al crear la póliza.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" style={{ marginRight: 16 }} />
                <Title level={2} style={{ margin: 0, fontFamily: 'Michroma, sans-serif' }}>Emitir Nueva Póliza</Title>
            </div>

            <Card bordered={false} style={{ maxWidth: '800px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                    
                    <Form.Item 
                        name="cliente" 
                        label="Seleccionar Cliente" 
                        rules={[{ required: true, message: 'Selecciona un cliente' }]}
                    >
                        <Select 
                            showSearch 
                            placeholder="Busca por nombre o CI"
                            optionFilterProp="children"
                        >
                            {clientes.map(c => (
                                <Option key={c.id} value={c.id}>
                                    {c.usuario_info.first_name} {c.usuario_info.last_name} - (CI: {c.identificacion})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Divider />

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="tipo_seguro" label="Plan / Producto" rules={[{ required: true }]}>
                                <Select placeholder="Selecciona el plan" onChange={handleTipoSeguroChange}>
                                    <Option value="vida_temporal">Plan Básico</Option>
                                    <Option value="accidentes">Plan Estándar</Option>
                                    <Option value="vida_entera">Plan Premium</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item name="suma_asegurada" label="Suma Asegurada" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} prefix="Bs." min={1000}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: string | number | undefined) => {
                                        // Devolver número limpio para evitar problemas de tipos en InputNumber
                                        if (value === undefined || value === null || value === '') return 0;
                                        const cleaned = String(value).replace(/\$\s?|,/g, '');
                                        const asNumber = Number(cleaned);
                                        return Number.isNaN(asNumber) ? 0 : asNumber;
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item name="prima_anual" label="Prima Anual (Costo)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} prefix="Bs." min={0} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                             <Form.Item name="fecha_inicio" label="Fecha Inicio" rules={[{ required: true }]}>
                                <Input type="date" /> 
                             </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item name="fecha_vencimiento" label="Fecha Vencimiento" rules={[{ required: true }]}>
                                <Input type="date" />
                             </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ textAlign: 'right', marginTop: 20 }}>
                        <center>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                            Emitir Póliza
                        </Button>
                        </center>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default AgenteCrearPolizaPage;