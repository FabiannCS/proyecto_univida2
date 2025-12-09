// en frontend/src/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, Layout, Alert, Flex, Avatar, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link

const { Content } = Layout;
const { Title } = Typography;

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Estado para mensaje de éxito

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        setError('');
        setSuccess('');

        // ¡AQUÍ LLAMAREMOS A LA NUEVA API DEL BACKEND!
        // Tu compañero debe crear este endpoint: POST /api/password-reset/
        try {
            // (Esta línea está comentada hasta que el backend esté listo)
            // await axios.post('https://proyecto-univida2.onrender.com/api/password-reset/', { email: values.email });
            
            // --- INICIO: Simulación (Borra esto cuando el backend esté listo) ---
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simula espera
            console.log("Enviando reseteo para:", values.email);
            // --- FIN: Simulación ---

            setSuccess('Si existe una cuenta con ese correo, recibirás un enlace para resetear tu contraseña.');
            setLoading(false);

        } catch (err: any) {
            setLoading(false);
            console.error('Error al enviar reseteo:', err);
            setError('Error al procesar la solicitud. Intenta de nuevo.');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(to bottom, #333333, #000000)' }}>
            <Content>
                <div style={{
                    padding: '40px',
                    borderRadius: '8px',
                    background: '#fff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '420px',
                    margin: '0 auto',
                }}>

                    <Flex justify="center">
                        <Avatar 
                            size={64} 
                            icon={<MailOutlined />}
                            style={{ backgroundColor: '#1677ff', marginBottom: '16px' }}
                        />
                    </Flex>

                    <Title level={2} style={{ textAlign: 'center', marginBottom: '16px' }}>
                        Resetear Contraseña
                    </Title>
                    <Typography.Paragraph style={{ textAlign: 'center', marginBottom: '24px' }}>
                        Ingresa tu correo electrónico y te enviaremos un enlace para resetear tu contraseña.
                    </Typography.Paragraph>

                    {/* Muestra mensaje de éxito o error */}
                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />}
                    {success && <Alert message={success} type="success" showIcon style={{ marginBottom: '24px' }} />}

                    <Form
                        name="forgot_password"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: '¡Por favor ingresa tu correo!' },
                                { type: 'email', message: '¡No es un correo válido!' }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Correo Electrónico"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%' }}
                                size="large"
                                loading={loading}
                            >
                                Enviar Enlace
                            </Button>
                        </Form.Item>

                        <Flex justify="center">
                            <Link to="/">&larr; Volver a Iniciar Sesión</Link>
                        </Flex>
                    </Form>
                </div>
            </Content>
        </Layout>
    );
}

export default ForgotPasswordPage;