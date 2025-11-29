// en frontend/src/pages/cliente/ClienteMiPerfilPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Descriptions, Avatar, Button, Row, Col, Modal, Form, Input, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ClienteMiPerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [form] = Form.useForm();

  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. Cargar Datos Reales del Perfil ---
  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) {
             navigate('/login');
             return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const decodedToken: any = jwtDecode(token);
        const miUsername = decodedToken.username;

        // 1. Obtenemos la lista de clientes para encontrarnos
        const response = await axios.get('http://127.0.0.1:8000/api/clientes/', { headers });
        
        // 2. Buscamos nuestros datos
        const miCliente = response.data.find((c: any) => 
            c.usuario_info?.username === miUsername
        );

        if (miCliente) {
            setUserData({
                username: miCliente.usuario_info.username,
                rol: 'CLIENTE',
                nombre: miCliente.usuario_info.first_name,
                apellido: miCliente.usuario_info.last_name,
                email: miCliente.usuario_info.email,
                telefono: miCliente.usuario_info.telefono || 'No registrado',
                fechaRegistro: '2025' // Este dato podrías añadirlo al serializer si lo quieres exacto
            });
        } else {
            // Si no se encuentra (raro), usamos datos básicos del token
            setUserData({
                username: miUsername,
                rol: 'CLIENTE',
                nombre: 'Usuario',
                apellido: '',
                email: 'No disponible',
                telefono: ''
            });
        }

      } catch (e) {
          console.error(e);
          message.error('Error al cargar perfil');
      } finally {
          setLoading(false);
      }
    };
    fetchPerfil();
  }, [navigate]);

  // --- 2. Lógica para Cambiar Contraseña ---
  const handleChangePassword = async (values: any) => {
    setChangePassLoading(true);
    try {
        // Simulación (Aquí conectarías tu API de cambio de contraseña real)
        await new Promise(resolve => setTimeout(resolve, 1000));
        message.success('Contraseña actualizada correctamente');
        setIsModalOpen(false);
        form.resetFields();
    } catch (error) {
        message.error('Error al cambiar la contraseña.');
    } finally {
        setChangePassLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div>
      {/* Encabezado con botón Volver */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 24 }}>
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/mi-poliza')} 
            shape="circle" 
        />
        <Title level={2} style={{ margin: 0, fontFamily: 'Michroma, sans-serif'}}>Mi Perfil</Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
            <Card style={{ textAlign: 'center' }}>
                <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
                <Title level={3} style={{ margin: 0 }}>{userData?.username}</Title>
                <Text type="secondary">Cliente Asegurado</Text>
            </Card>
        </Col>

        <Col xs={24} md={16}>
            <Card title="Información Personal" style={{ marginBottom: 24, fontFamily: 'Michroma, sans-serif' }}>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Nombre Completo">
                        {userData?.nombre} {userData?.apellido}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><MailOutlined /> Email</>}>
                        {userData?.email}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined /> Teléfono</>}>
                        {userData?.telefono}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Seguridad de la Cuenta" style={{fontFamily: 'Michroma, sans-serif'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <Text strong><SafetyCertificateOutlined /> Contraseña</Text>
                        <br />
                        <Text type="secondary">Se recomienda cambiar tu contraseña periódicamente.</Text>
                    </div>
                    <Button type='primary' onClick={() => setIsModalOpen(true)} style={{fontFamily: 'Michroma, sans-serif'}}>
                        Cambiar Contraseña
                    </Button>
                </div>
            </Card>
        </Col>
      </Row>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        title="Cambiar Contraseña"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        style={{fontFamily: 'Michroma, sans-serif'}}
      >
        <Form layout="vertical" onFinish={handleChangePassword} form={form}>
            <Form.Item name="old_password" label="Contraseña Actual" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="new_password" label="Nueva Contraseña" rules={[{ required: true, min: 6 }]}>
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="confirm_password" label="Confirmar" dependencies={['new_password']} rules={[
                { required: true },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('new_password') === value) return Promise.resolve();
                        return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                }),
            ]}>
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
                <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8, fontFamily: 'Michroma, sans-serif'}}>
                    Cancelar
                </Button>
                <Button type="primary" htmlType="submit" loading={changePassLoading} style={{fontFamily: 'Michroma, sans-serif'}}>
                    Actualizar
                </Button>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClienteMiPerfilPage;