// en frontend/src/pages/gestion/AdminCrearAgentePage.tsx
import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Para redirigir


const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;

const AdminCrearAgentePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate(); // Hook para redirigir

    const getToken = () => localStorage.getItem('accessToken');

    // Esta función se llama al enviar el formulario
    const handleFormSubmit = async (values: any) => {
        setLoading(true);
        try {
            const token = getToken();
            if (!token) {
                message.error('No estás autenticado.');
                setLoading(false);
                return;
            }
            
            const headers = { Authorization: `Bearer ${token}` };

            // Hacemos la petición POST a la API de creación
            await axios.post('http://127.0.0.1:8000/api/agentes/crear/', values, { headers });
            
            message.success('Agente creado exitosamente.');
            form.resetFields(); // Limpia el formulario
            
            // ¡Redirige de vuelta a la lista de agentes!
            navigate('/admin-agentes'); 

        } catch (error: any) {
            console.error('Error al crear agente:', error);
            if (error.response && error.response.data) {
                message.error(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                message.error('Error al crear el agente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Content style={{padding: '15px'}}>
                {/* --- AÑADE ESTE BOTÓN AQUÍ --- */}
            <Button
                type="default" // O "ghost" para que sea más sutil
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)} // <-- ¡LA MAGIA! -1 significa "ir atrás"
                style={{ marginBottom: '10px', fontFamily: 'Michroma, sans-serif'}}
            >
                Volver
            </Button>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Michroma, sans-serif'}}>
                        Crear Nuevo Agente
                </Title>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    style={{ maxWidth: '800px', margin: '0 auto' }} // <-- Aumenté el ancho máximo
                >
                    {/* --- INICIO DE LA CUADRÍCULA --- */}
                    <Row gutter={16}> {/* gutter={16} añade 16px de espacio entre columnas */}
                        
                        {/* Columna Izquierda */}
                        <Col span={12}>
                            <Item
                                name="username"
                                label="Nombre de Usuario"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                        
                        {/* Columna Derecha */}
                        <Col span={12}>
                            <Item
                                name="password"
                                label="Contraseña"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input.Password />
                            </Item>
                        </Col>

                    </Row>
                    
                    <Row gutter={16}>
                        {/* Columna Izquierda */}
                        <Col span={12}>
                            <Item name="first_name" label="Nombre">
                                <Input />
                            </Item>
                        </Col>
                        
                        {/* Columna Derecha */}
                        <Col span={12}>
                            <Item name="last_name" label="Apellido">
                                <Input />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        {/* Columna Izquierda */}
                        <Col span={12}>
                            <Item name="email" label="Email" rules={[{ type: 'email', message: 'No es un email válido' }]}>
                                <Input />
                            </Item>
                        </Col>
                        
                        {/* Columna Derecha */}
                        <Col span={12}>
                            <Item
                                name="codigo_agente"
                                label="Código de Agente"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        {/* Columna Izquierda */}
                        <Col span={12}>
                             <Item
                                name="fecha_contratacion"
                                label="Fecha de Contratación (YYYY-MM-DD)"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input placeholder="YYYY-MM-DD" />
                            </Item>
                        </Col>
                        
                        {/* Columna Derecha (vacía por ahora, o puedes poner otro campo) */}
                        <Col span={12}>
                            <Item
                                name="identificacion"
                                label="Nº de Carnet (CI)"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >   
                                <Input />
                            </Item>
                        </Col>
                    </Row>

                    {/* --- FIN DE LA CUADRÍCULA --- */}

                    {/* El botón de envío se queda fuera de la cuadrícula */}
                    <Item>
                        <center>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginTop: '8px', fontFamily: 'Michroma, sans-serif', padding: '17px 45px'}}>
                            Guardar Agente
                        </Button>
                        </center>
                    </Item>
                </Form>
            </Content>
        </Layout>
    );
};

export default AdminCrearAgentePage;