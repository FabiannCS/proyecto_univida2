// en frontend/src/pages/gestion/AdminEditarAgentePage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col, Spin } from 'antd';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom'; // <-- Importa useParams

const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;

// Esta interfaz es para los datos que vienen del formulario
interface AgenteFormValues {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    identificacion: string;
    // No pedimos la contraseña, la edición de contraseña es mejor en un formulario separado
}

const AdminEditarAgentePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true); // Nuevo estado para cargar datos
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // <-- 1. OBTIENE EL ID DE LA URL

    const getToken = () => localStorage.getItem('accessToken');

    // --- 2. CARGA LOS DATOS DEL AGENTE (GET) ---
    useEffect(() => {
        const fetchAgenteData = async () => {
            setPageLoading(true);
            try {
                const token = getToken();
                if (!token || !id) {
                    message.error('Error: No se encontró el agente o no estás autenticado.');
                    navigate('/admin-agentes'); // Devuelve a la lista
                    return;
                }
                
                const headers = { Authorization: `Bearer ${token}` };

                // Llama a la API de "detalle" que creamos en Django
                const response = await axios.get(`http://127.0.0.1:8000/api/agentes/${id}/`, { headers });
                
                // Rellena el formulario de Ant Design con los datos recibidos
                form.setFieldsValue({
                    username: response.data.username,
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    email: response.data.email,
                    identificacion: response.data.identificacion,
                    // (Los campos del perfil Agente, como codigo_agente, también irían aquí)
                });

            } catch (error) {
                console.error('Error al cargar datos del agente:', error);
                message.error('No se pudieron cargar los datos del agente.');
            } finally {
                setPageLoading(false); // Deja de cargar la página
            }
        };

        fetchAgenteData();
    }, [id, form, navigate]); // Se ejecuta si el 'id', 'form' o 'navigate' cambian

    // --- 3. ACTUALIZA LOS DATOS (PUT/PATCH) ---
    const handleFormSubmit = async (values: AgenteFormValues) => {
        setLoading(true); // Activa el spinner del botón
        try {
            const token = getToken();
            if (!token) {
                message.error('No estás autenticado.');
                setLoading(false);
                return;
            }
            
            const headers = { Authorization: `Bearer ${token}` };

            // Hacemos la petición PUT (o PATCH) a la API de edición
            await axios.patch(`http://127.0.0.1:8000/api/agentes/${id}/editar/`, values, { headers });
            
            message.success('Agente actualizado exitosamente.');
            
            // Redirige de vuelta a la lista de agentes
            navigate('/admin-agentes'); 

        } catch (error: any) {
            console.error('Error al actualizar agente:', error);
            if (error.response && error.response.data) {
                message.error(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                message.error('Error al actualizar el agente.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Muestra un spinner grande mientras carga los datos del agente
    if (pageLoading) {
        return (
            <Layout style={{ padding: '50px', display: 'grid', placeItems: 'center' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    return (
        <Layout>
            <Content style={{padding: '15px'}}>
                <Button
                    type="default" // O "ghost" para que sea más sutil
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)} // <-- ¡LA MAGIA! -1 significa "ir atrás"
                    style={{ marginBottom: '16px', fontFamily: 'Michroma, sans-serif'}}
                    >
                    Volver
                </Button>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '24px', fontFamily: 'Michroma, sans-serif'}}>
                    Editar Agente
                </Title>
                <Form
                    form={form} // Conecta el formulario a los datos cargados
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Item
                                name="username"
                                label="Nombre de Usuario"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name="email"
                                label="Email"
                                rules={[{ type: 'email', message: 'No es un email válido' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Item name="first_name" label="Nombre">
                                <Input />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item name="last_name" label="Apellido">
                                <Input />
                            </Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Item
                                name="identificacion"
                                label="Nº de Carnet (CI)"
                            >
                                <Input />
                            </Item>
                        </Col>
                         {/* Puedes añadir aquí los otros campos del perfil Agente (comisión, etc.) */}
                    </Row>
                    <Item>
                        <center>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginTop: '8px', fontFamily: 'Michroma, sans-serif', padding: '17px 45px'}}>
                            Guardar Cambios
                        </Button>
                        </center>
                    </Item>
                </Form>
            </Content>
        </Layout>
    );
};

export default AdminEditarAgentePage;