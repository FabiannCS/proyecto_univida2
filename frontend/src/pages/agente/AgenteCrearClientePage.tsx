// en frontend/src/pages/agente/AgenteCrearClientePage.tsx
import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col, DatePicker } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined, LockOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title } = Typography;

const AgenteCrearClientePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('accessToken');

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const token = getToken();
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Formatear la fecha para Django (YYYY-MM-DD)
            const formattedData = {
                ...values,
                fecha_nacimiento: values.fecha_nacimiento ? values.fecha_nacimiento.format('YYYY-MM-DD') : null
            };

            // 2. Llamada a la API
            // Usamos el mismo endpoint que creamos para el registro público, o el de admin si tienes uno específico.
            // Si usas el de admin (/api/clientes/), asegúrate de que tu serializer maneje la creación de Usuario + Cliente.
            // Para simplificar y reutilizar lógica, usaremos /api/clientes/ (que debería tener esa lógica).
            
            await axios.post('http://127.0.0.1:8000/api/clientes/', formattedData, { headers });
            
            message.success('Cliente registrado exitosamente.');
            navigate('/agente-clientes'); 

        } catch (error: any) {
            console.error('Error:', error);
            if (error.response && error.response.data) {
                message.error(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                message.error('Error al registrar el cliente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Encabezado */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" style={{ marginRight: 16 }} />
                <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>
                    Registrar Nuevo Cliente
                </Title>
            </div>

            {/* Tarjeta del Formulario */}
            <div style={{ 
                background: '#fff', 
                padding: '32px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
            }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="first_name" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
                                <Input prefix={<UserOutlined />} placeholder="Ej. Juan" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="last_name" label="Apellido" rules={[{ required: true, message: 'Requerido' }]}>
                                <Input prefix={<UserOutlined />} placeholder="Ej. Pérez" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Usuario de Acceso" rules={[{ required: true, message: 'Requerido' }]}>
                                <Input placeholder="Para que el cliente inicie sesión" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item name="password" label="Contraseña Temporal" rules={[{ required: true, message: 'Requerido' }]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="Mínimo 6 caracteres" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email inválido' }]}>
                                <Input prefix={<MailOutlined />} placeholder="contacto@cliente.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="telefono" label="Teléfono">
                                <Input prefix={<PhoneOutlined />} placeholder="+591 ..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="identificacion" label="CI / DNI" rules={[{ required: true, message: 'Requerido' }]}>
                                <Input prefix={<IdcardOutlined />} placeholder="Documento de Identidad" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            {/* --- CAMPO NUEVO --- */}
                            <Form.Item name="fecha_nacimiento" label="Fecha de Nacimiento" rules={[{ required: true, message: 'Requerido' }]}>
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Selecciona fecha" />
                            </Form.Item>
                            {/* ------------------- */}
                        </Col>
                    </Row>

                    {/* --- CAMPO NUEVO --- */}
                    <Form.Item name="direccion" label={<><HomeOutlined /> Dirección</>} rules={[{ required: true, message: 'Requerido' }]}>
                        <Input.TextArea rows={2} placeholder="Dirección de domicilio del cliente" />
                    </Form.Item>
                    {/* ------------------- */}

                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                            Registrar Cliente
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default AgenteCrearClientePage;