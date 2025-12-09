// en frontend/src/pages/gestion/AdminEditarClientePage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col, DatePicker, Spin } from 'antd';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;
const { TextArea } = Input;

interface Cliente {
  id: number;
  usuario_info: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    telefono: string;
  };
  fecha_nacimiento: string;
  direccion: string;
  identificacion: string;
  estado_salud: string;
}

const AdminEditarClientePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [cargandoCliente, setCargandoCliente] = useState(true);
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const getToken = () => localStorage.getItem('accessToken');

    // Cargar datos del cliente al montar el componente
    useEffect(() => {
        const cargarCliente = async () => {
            try {
                const token = getToken();
                if (!token) {
                    message.error('No estás autenticado.');
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`https://proyecto-univida2.onrender.com/api/clientes/${id}/`, { headers });
                setCliente(response.data);
                
                // Llenar el formulario con los datos del cliente
                form.setFieldsValue({
                    first_name: response.data.usuario_info.first_name,
                    last_name: response.data.usuario_info.last_name,
                    email: response.data.usuario_info.email,
                    telefono: response.data.usuario_info.telefono,
                    identificacion: response.data.identificacion,
                    fecha_nacimiento: dayjs(response.data.fecha_nacimiento),
                    direccion: response.data.direccion,
                    estado_salud: response.data.estado_salud
                });

            } catch (error: any) {
                console.error('Error al cargar cliente:', error);
                message.error('Error al cargar los datos del cliente.');
            } finally {
                setCargandoCliente(false);
            }
        };

        if (id) {
            cargarCliente();
        }
    }, [id, form]);

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

            // Preparar datos para la API
            const datosActualizacion = {
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                telefono: values.telefono,
                fecha_nacimiento: values.fecha_nacimiento.format('YYYY-MM-DD'),
                direccion: values.direccion,
                identificacion: values.identificacion,
                estado_salud: values.estado_salud
            };

            await axios.patch(`https://proyecto-univida2.onrender.com/api/clientes/${id}/editar/`, datosActualizacion, { headers });
            
            message.success('Cliente actualizado exitosamente.');
            navigate('/admin-clientes');

        } catch (error: any) {
            console.error('Error al actualizar cliente:', error);
            if (error.response && error.response.data) {
                message.error(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                message.error('Error al actualizar el cliente.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (cargandoCliente) {
        return (
            <Layout>
                <Content style={{ padding: '50px', textAlign: 'center' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Cargando datos del cliente...</div>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout>
            <Content style={{padding: '15px'}}>
                <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin-clientes')}
                    style={{ marginBottom: '10px', fontFamily: 'Michroma, sans-serif'}}
                >
                    Volver a Clientes
                </Button>
                
                <Title level={2} style={{ textAlign: 'center', marginBottom: '24px', fontFamily: 'Michroma, sans-serif'}}>
                    Editar Cliente: {cliente?.usuario_info.first_name} {cliente?.usuario_info.last_name}
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
                                name="first_name" 
                                label="Nombre"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item 
                                name="last_name" 
                                label="Apellido"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Item 
                                name="email" 
                                label="Email" 
                                rules={[
                                    { required: true, message: 'Este campo es obligatorio' },
                                    { type: 'email', message: 'No es un email válido' }
                                ]}
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
                            <Item 
                                name="estado_salud" 
                                label="Estado de Salud"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
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
                                Actualizar Cliente
                            </Button>
                        </center>
                    </Item>
                </Form>
            </Content>
        </Layout>
    );
};

export default AdminEditarClientePage;