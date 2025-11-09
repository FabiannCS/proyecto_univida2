// en frontend/src/pages/gestion/AdminCrearClientePage.tsx - VERSIÓN CORREGIDA
import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col, DatePicker } from 'antd';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { authService } from '../../services/authService';

const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;
const { TextArea } = Input;

const AdminCrearClientePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleFormSubmit = async (values: any) => {
        console.log('📝 Datos del formulario:', values);
        setLoading(true);
        
        try {
            const token = authService.getToken();
            if (!token) {
                message.error('No estás autenticado.');
                setLoading(false);
                return;
            }
            
            const headers = { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Preparar datos para el backend
            const clienteData = {
                username: values.username,
                password: values.password,
                first_name: values.first_name || '',
                last_name: values.last_name || '',
                email: values.email || '',
                telefono: values.telefono || '',
                fecha_nacimiento: values.fecha_nacimiento ? values.fecha_nacimiento.format('YYYY-MM-DD') : '',
                direccion: values.direccion || '',
                identificacion: values.identificacion || '',
                estado_salud: values.estado_salud || 'Bueno'
            };

            console.log('🚀 Enviando datos al backend:', clienteData);

            const response = await axios.post(
                'http://127.0.0.1:8000/api/clientes/crear/', 
                clienteData, 
                { headers }
            );

            console.log('✅ Respuesta del backend:', response.data);
            
            message.success('Cliente creado exitosamente.');
            form.resetFields();
            
            // Redirigir después de 1 segundo para que el usuario vea el mensaje
            setTimeout(() => {
                navigate('/admin-clientes');
            }, 1000);

        } catch (error: any) {
            console.error('❌ Error al crear cliente:', error);
            
            if (error.response) {
                console.error('❌ Respuesta de error:', error.response.data);
                console.error('❌ Status:', error.response.status);
                
                if (error.response.status === 400) {
                    // Error de validación del backend
                    const errors = error.response.data;
                    let errorMessage = 'Errores de validación: ';
                    
                    if (typeof errors === 'object') {
                        Object.keys(errors).forEach(key => {
                            errorMessage += `${key}: ${errors[key]}. `;
                        });
                    } else {
                        errorMessage = errors;
                    }
                    
                    message.error(errorMessage);
                } else if (error.response.status === 401) {
                    message.error('No tienes permisos para crear clientes.');
                } else if (error.response.status === 500) {
                    message.error('Error interno del servidor.');
                } else {
                    message.error(`Error: ${JSON.stringify(error.response.data)}`);
                }
            } else if (error.request) {
                console.error('❌ No se recibió respuesta:', error.request);
                message.error('No se pudo conectar con el servidor. Verifica tu conexión.');
            } else {
                message.error('Error inesperado al crear el cliente.');
            }
        } finally {
            setLoading(false);
        }
    };

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
                                rules={[
                                    { required: true, message: 'Este campo es obligatorio' },
                                    { min: 3, message: 'Mínimo 3 caracteres' }
                                ]}
                            >
                                <Input placeholder="ej: juan.perez" />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item
                                name="password"
                                label="Contraseña"
                                rules={[
                                    { required: true, message: 'Este campo es obligatorio' },
                                    { min: 6, message: 'Mínimo 6 caracteres' }
                                ]}
                            >
                                <Input.Password placeholder="Mínimo 6 caracteres" />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Item 
                                name="first_name" 
                                label="Nombre"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input placeholder="Ej: Juan" />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item 
                                name="last_name" 
                                label="Apellido"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input placeholder="Ej: Pérez" />
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
                                <Input placeholder="ej: juan@email.com" />
                            </Item>
                        </Col>
                        <Col span={12}>
                            <Item 
                                name="telefono" 
                                label="Teléfono"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                            >
                                <Input placeholder="Ej: +1234567890" />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Item
                                name="identificacion"
                                label="Identificación"
                                rules={[
                                    { required: true, message: 'Este campo es obligatorio' },
                                    { pattern: /^[0-9]+$/, message: 'Solo números permitidos' }
                                ]}
                            >
                                <Input placeholder="Ej: 123456789" />
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
                                    disabledDate={(current) => {
                                        return current && current > dayjs().endOf('day');
                                    }}
                                />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Item
                                name="direccion"
                                label="Dirección"
                                rules={[
                                    { required: true, message: 'Este campo es obligatorio' },
                                    { min: 10, message: 'Mínimo 10 caracteres' }
                                ]}
                            >
                                <TextArea 
                                    rows={3} 
                                    placeholder="Ej: Calle Principal #123, Ciudad, Estado" 
                                />
                            </Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Item 
                                name="estado_salud" 
                                label="Estado de Salud"
                                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                                initialValue="Bueno"
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
                                style={{ 
                                    marginTop: '8px', 
                                    fontFamily: 'Michroma, sans-serif', 
                                    padding: '17px 45px',
                                    fontSize: '16px',
                                    height: 'auto'
                                }}
                            >
                                {loading ? 'Creando Cliente...' : 'Guardar Cliente'}
                            </Button>
                        </center>
                    </Item>
                </Form>
            </Content>
        </Layout>
    );
};

export default AdminCrearClientePage;