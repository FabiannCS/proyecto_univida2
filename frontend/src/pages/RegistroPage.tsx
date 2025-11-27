// en frontend/src/pages/RegistroPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, Layout, Alert, Row, Col, Avatar, Flex, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

const RegistroPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onFinish = async (values: any) => {
        setLoading(true);
        setError('');
        
        try {
            const formattedDate = values.fecha_nacimiento 
                ? values.fecha_nacimiento.format('YYYY-MM-DD') 
                : null;
            // Llamamos a la API pública que acabamos de crear
            await axios.post('http://127.0.0.1:8000/api/registro/', {
                username: values.username,
                password: values.password,
                email: values.email,
                first_name: values.first_name,
                last_name: values.last_name,
                identificacion: values.identificacion,
                telefono: values.telefono,
                // --- NUEVOS CAMPOS ---
                direccion: values.direccion,
                fecha_nacimiento: formattedDate,
            });

            // Si tiene éxito:
            alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
            navigate('/login'); // Lo mandamos al login

        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data) {
                 // Muestra el error que devuelva Django (ej. "Usuario ya existe")
                setError(JSON.stringify(err.response.data));
            } else {
                setError('Error al registrarse. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(to bottom, #333333, #000000)' }}>
            <Content style={{ padding: '30px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                
                <div style={{
                    padding: '35px',
                    borderRadius: '20px',
                    background: '#fff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '480px', // Un poco más ancho que el login
                }}>
                    <Flex justify="center">
                        <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#52c41a', marginBottom: '10px' }} />
                    </Flex>

                    <Title level={2} style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Michroma, sans-serif'}}>
                        Crear Cuenta
                    </Title>
                    {/*<p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontFamily: 'Michroma, sans-serif' }}>
                        Únete a Seguros Univida y gestiona tu póliza hoy.
                    </p>*/}

                    {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: '24px' }} />}

                    <Form name="registro" onFinish={onFinish} layout="vertical" autoComplete="off">
                        
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="first_name" rules={[{ required: true, message: 'Ingresa tu nombre' }]}>
                                    <Input placeholder="Nombre" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="last_name" rules={[{ required: true, message: 'Ingresa tu apellido' }]}>
                                    <Input placeholder="Apellido" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="username" rules={[{ required: true, message: 'Elige un usuario' }]}>
                            <Input prefix={<UserOutlined />} placeholder="Nombre de Usuario" />
                        </Form.Item>

                        <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email válido requerido' }]}>
                            <Input prefix={<MailOutlined />} placeholder="Correo Electrónico" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="identificacion" rules={[{ required: true, message: 'Requerido' }]}>
                                    <Input prefix={<IdcardOutlined />} placeholder="CI / DNI" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="telefono">
                                    <Input prefix={<PhoneOutlined />} placeholder="Teléfono" />
                                </Form.Item>
                            </Col>
                        </Row>
                        {/* --- NUEVOS CAMPOS AÑADIDOS --- */}
                        <Form.Item 
                            name="direccion" 
                            rules={[{ required: true, message: 'Ingresa tu dirección' }]}
                        >
                            <Input placeholder="Dirección de Domicilio" />
                        </Form.Item>

                        <Form.Item 
                            name="fecha_nacimiento" 
                            rules={[{ required: true, message: 'Ingresa tu fecha de nacimiento' }]}
                        >
                            <DatePicker 
                                style={{ width: '100%' }} 
                                placeholder="Fecha de Nacimiento" 
                                format="YYYY-MM-DD"
                            />
                        </Form.Item>
                        {/* ------------------------------ */}
                        <Form.Item name="password" rules={[{ required: true, message: 'Ingresa una contraseña' }]}>
                            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
                        </Form.Item>

                        <Form.Item>
                            <center>
                            <Button type="primary" htmlType="submit" style={{ width: '80%', height: '40px', fontFamily: 'Michroma, sans-serif' }} loading={loading}>
                                Registrarse
                            </Button>
                            </center>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión aquí</Link>
                        </div>
                    </Form>
                </div>
            </Content>
        </Layout>
    );
};

export default RegistroPage;