// en frontend/src/LoginPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
// Importa componentes de Ant Design
import { Form, Input, Button, Typography, Layout, Alert, Flex, Avatar } from 'antd'; // Importamos Avatar y Flex
import { UserOutlined, LockOutlined } from '@ant-design/icons';
// Importa las herramientas para decodificar el token y navegar
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { authService } from './services/authService';

const { Content } = Layout;
const { Title, Link } = Typography;

// Define el tipo para los valores del formulario
type LoginFormValues = {
    username: string;
    password?: string;
};

function LoginPage() {
    const navigate = useNavigate(); // Hook para redirigir
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Estado para mostrar "Cargando..."

    // La función que se ejecuta cuando el formulario de Ant Design se envía con éxito
    const onFinish = (values: LoginFormValues) => {
        setError('');
        setLoading(true);

        axios.post('http://127.0.0.1:8000/api/token/', {
            username: values.username,
            password: values.password
        })
        .then(response => {
            setLoading(false);
            const accessToken = response.data.access;
            const refreshToken = response.data.refresh;
            authService.setTokens(accessToken, refreshToken);

            try {
                // Decodifica el token para leer el rol
                const decodedToken: { rol: string, username: string } = jwtDecode(accessToken);
                const userRole = decodedToken.rol;
                console.log('Rol del usuario:', userRole);

                // Redirige según el rol
                switch (userRole) {
                    case 'ADMIN':
                        navigate('/admin-dashboard');
                        break;
                    case 'AGENTE':
                        navigate('/agente-dashboard');
                        break;
                    case 'CLIENTE':
                        navigate('/mi-poliza');
                        break;
                    default:
                        console.error('Rol desconocido:', userRole);
                        navigate('/'); // Vuelve al login si el rol no es válido
                }
            } catch (error) {
                console.error('Error al decodificar el token:', error);
                setError('Hubo un problema al procesar el inicio de sesión.');
                localStorage.removeItem('accessToken');
            }
        })
        .catch(error => {
            setLoading(false);
            console.error('¡Error en el login!', error);
            setError('Usuario o contraseña incorrectos.');
        });
    };

    return (
        // Contenedor principal (fondo degradado)
        <Layout style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(to bottom, #333333, #000000)' }}>
            <Content>
                <Typography.Title level={2} style={{ textAlign: 'center', color: 'white', marginBottom: '24px', fontFamily: 'Michroma, sans-serif' }}>
                    Bienvenido!
                </Typography.Title>
                
                {/* --- Formulario de Login Centrado --- */}
                <div style={{
                    padding: '40px',
                    borderRadius: '8px',
                    background: '#fff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '420px', // Ancho del formulario
                    margin: '0 auto',
                    minHeight: '400px', // Altura que te gustó
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>

                    {/* --- ÍCONO AÑADIDO --- */}
                    <Flex justify="center">
                        <Avatar 
                            size={64} 
                            icon={<LockOutlined />} // Ícono de candado
                            style={{ backgroundColor: '#1677ff', marginBottom: '16px' }}
                        />
                    </Flex>
                    {/* --- FIN DE ÍCONO --- */}

                    <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '28px', fontFamily: 'Michroma, sans-serif' }}>
                        Seguros Univida
                    </Typography.Title>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: '24px' }}
                        />
                    )}

                    {/* Formulario de Ant Design */}
                    <Form
                        name="login"
                        onFinish={onFinish}
                        autoComplete="off"
                        initialValues={{ remember: true }}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: '¡Por favor ingresa tu usuario!' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Usuario"
                                size="large"
                            />
                        </Form.Item>
                        
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '¡Por favor ingresa tu contraseña!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Contraseña"
                                size="large"
                            />
                        </Form.Item>
                        <Flex justify='center' style={{ marginTop: '-12px', marginBottom: '12px'}}>
                            <Link href="/forgot-password" style={{ fontSize: '14px'}}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </Flex>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%', fontFamily: 'Michroma, sans-serif', padding: '10px 0' }}
                                size="large"
                                loading={loading}
                            >
                                Iniciar Sesión
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                
            </Content>
        </Layout>
    );
}

export default LoginPage;