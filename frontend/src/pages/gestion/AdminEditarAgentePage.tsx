// en frontend/src/pages/gestion/AdminEditarAgentePage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col, Spin } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;

interface AgenteFormValues {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    identificacion: string;
}

const AdminEditarAgentePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const getToken = () => localStorage.getItem('accessToken');

    // --- CARGAR DATOS (GET) ---
    useEffect(() => {
        const fetchAgenteData = async () => {
            setPageLoading(true);
            try {
                const token = getToken();
                if (!token || !id) {
                    message.error('Error de autenticación.');
                    navigate('/admin-agentes');
                    return;
                }
                
                const headers = { Authorization: `Bearer ${token}` };

                // Llama a la API para obtener los datos actuales
                const response = await axios.get(`https://proyecto-univida2.onrender.com/api/agentes/${id}/`, { headers });
                
                // Rellena el formulario
                form.setFieldsValue({
                    username: response.data.username,
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    email: response.data.email,
                    identificacion: response.data.identificacion,
                });

            } catch (error) {
                console.error('Error al cargar agente:', error);
                message.error('No se pudo cargar el agente. Puede que no exista o tenga el rol incorrecto.');
            } finally {
                setPageLoading(false);
            }
        };

        fetchAgenteData();
    }, [id, form, navigate]);

    // --- GUARDAR CAMBIOS (PATCH) ---
    const handleFormSubmit = async (values: AgenteFormValues) => {
        setLoading(true);
        try {
            const token = getToken();
            const headers = { Authorization: `Bearer ${token}` };

            // CORRECCIÓN: Usamos PATCH en lugar de PUT
            // En tu código veo esto:
            await axios.patch(`https://proyecto-univida2.onrender.com/api/agentes/${id}/editar/`, values, { headers });
            
            message.success('Agente actualizado exitosamente.');
            navigate('/admin-agentes'); 

        } catch (error: any) {
            console.error('Error al actualizar:', error);
            if (error.response && error.response.data) {
                message.error(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                message.error('Error al actualizar el agente.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <Layout style={{ padding: '50px', display: 'grid', placeItems: 'center' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    return (
        <Layout>
            <Content>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
                    Editar Agente
                </Title>
                <Form
                    form={form} // CORRECCIÓN: Conectamos la instancia del formulario
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Item
                                name="username"
                                label="Nombre de Usuario"
                                rules={[{ required: true, message: 'Obligatorio' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name="email"
                                label="Correo electrónico"
                                rules={[{ type: 'email', required: true }]}
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
                            <Item name="identificacion" label="Nº de Carnet (CI)">
                                <Input />
                            </Item>
                        </Col>
                    </Row>

                    <Item>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginTop: '16px' }}>
                            Guardar Cambios
                        </Button>
                    </Item>
                </Form>
            </Content>
        </Layout>
    );
};

export default AdminEditarAgentePage;