// en frontend/src/pages/gestion/AdminCrearClientePage.tsx
import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col, DatePicker } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;
const { TextArea } = Input;

const AdminCrearClientePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('accessToken');

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


            // NOTA: Necesitarás crear esta API en el backend /// HECHO
            await axios.post('http://127.0.0.1:8000/api/clientes/crear/', values, { headers });
            
            message.success('Cliente creado exitosamente.');
            form.resetFields();
            navigate('/admin-clientes');

        } catch (error: any) {
            console.error('Error al crear cliente:', error);
            if (error.response && error.response.data) {
                message.error(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                message.error('Error al crear el cliente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Content>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '24px', fontFamily: 'Michroma, sans-serif', paddingTop: '20px'}}>
                    Crear Nuevo Cliente
                </Title>

                <Form
                    form={form}
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
                                name="password"
                                label="Contraseña"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input.Password />
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
                                name="email" 
                                label="Email" 
                                rules={[{ type: 'email', message: 'No es un email válido' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item name="telefono" label="Teléfono">
                                <Input />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Item
                                name="identificacion"
                                label="Identificación"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name="fecha_nacimiento"
                                label="Fecha de Nacimiento"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <DatePicker 
                                    format="YYYY-MM-DD"
                                    style={{ width: '100%' }}
                                    placeholder="Seleccionar fecha"
                                />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Item
                                name="direccion"
                                label="Dirección"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <TextArea rows={3} />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Item name="estado_salud" label="Estado de Salud">
                                <Input placeholder="Ej: Bueno, Regular, Excelente" />
                            </Item>
                        </Col>
                    </Row>

                    <Item>
                        <center>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading} 
                                style={{ marginTop: '8px', fontFamily: 'Michroma, sans-serif', padding: '17px 45px'}}
                            >
                                Guardar Cliente
                            </Button>
                        </center>
                    </Item>
                </Form>
            </Content>
        </Layout>
    );
};

export default AdminCrearClientePage;