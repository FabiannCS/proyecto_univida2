// en frontend/src/pages/agente/AgenteCrearClientePage.tsx
import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col, DatePicker } from 'antd';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined, LockOutlined} from '@ant-design/icons';

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

            // Formatear fecha
            const formattedData = {
                ...values,
                fecha_nacimiento: values.fecha_nacimiento ? values.fecha_nacimiento.format('YYYY-MM-DD') : null
            };

            // Llamamos a la API de crear cliente (La misma que usa el Admin sirve)
            // El backend debería asignar automáticamente este cliente al Agente que lo crea
            // (Si tu backend no hace eso, el cliente quedará "huérfano" o asignado a nadie)
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
    <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)} 
                shape="circle" 
                style={{ marginRight: 16 }} 
            />
            <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif"}}>
                Registrar Nuevo Cliente
            </Title>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}> {/* <-- ESTO CENTRA TODO */}

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
                    size="large" // Hace los inputs más grandes y amigables
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="first_name" label="Nombre" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="last_name" label="Apellido" rules={[{ required: true }]}>
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Usuario de Acceso" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item name="password" label="Contraseña Temporal" rules={[{ required: true }]}>
                                <Input.Password prefix={<LockOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                <Input prefix={<MailOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="telefono" label="Teléfono">
                                <Input prefix={<PhoneOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="identificacion" label="CI / DNI" rules={[{ required: true }]}>
                                <Input prefix={<IdcardOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="fecha_nacimiento" label="Fecha de Nacimiento" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="direccion" label={<><HomeOutlined /> Dirección</>}>
                        <Input.TextArea rows={2} />
                    </Form.Item>

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
    </div>    
    );
};

export default AgenteCrearClientePage;