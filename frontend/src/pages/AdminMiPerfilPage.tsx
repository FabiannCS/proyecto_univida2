// en frontend/src/pages/AdminMiPerfilPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Descriptions, Avatar, Button, Row, Col, Modal, Form, Input, message, Spin, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminMiPerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [form] = Form.useForm();

  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. Cargar Datos del Perfil ---
  useEffect(() => {
    const token = getToken();
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            // Simulamos datos extra ya que el token solo tiene username y rol
            setUserData({
                username: decoded.username,
                rol: decoded.rol,
                nombre: 'Fabián', 
                apellido: 'Administrador',
                email: 'admin@univida.com',
                telefono: '+591 7000-0000',
                fechaRegistro: '2024-01-01'
            });
        } catch (e) {
            console.error(e);
            message.error('Error al cargar perfil');
        }
    }
    setLoading(false);
  }, []);

  // --- 2. Lógica para Cambiar Contraseña ---
  const handleChangePassword = async (values: any) => {
    setChangePassLoading(true);
    try {
        // Simulación de llamada a API
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
            onClick={() => navigate('/admin-dashboard')} 
            shape="circle" 
        />
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Mi Perfil</Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* --- COLUMNA IZQUIERDA: Tarjeta de Presentación --- */}
        <Col xs={24} md={8}>
            <Card style={{ textAlign: 'center', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <Avatar size={120} icon={<UserOutlined />} style={{ backgroundColor: '#f56a00' }} />
                </div>
                <Title level={3} style={{ margin: 0 }}>{userData?.username}</Title>
                <Text type="secondary" style={{ textTransform: 'capitalize' }}>{userData?.rol?.toLowerCase()}</Text>
                <Divider />
                <div style={{ textAlign: 'left' }}>
                    <p><MailOutlined /> {userData?.email}</p>
                    <p><PhoneOutlined /> {userData?.telefono}</p>
                </div>
            </Card>
        </Col>

        {/* --- COLUMNA DERECHA: Detalles y Seguridad --- */}
        <Col xs={24} md={16}>
            {/* Datos Personales */}
            <Card title="Información de la Cuenta" style={{ marginBottom: 24, fontFamily: 'Michroma, sans-serif'}}>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Nombre Completo">
                        {userData?.nombre} {userData?.apellido}
                    </Descriptions.Item>
                    <Descriptions.Item label="Rol del Sistema">
                        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{userData?.rol}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de Registro">
                        {userData?.fechaRegistro}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Seguridad */}
            <Card title="Seguridad" style={{fontFamily: 'Michroma, sans-serif'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Text strong><SafetyCertificateOutlined /> Contraseña</Text>
                        <br />
                        <Text type="secondary">Última modificación: hace 3 meses</Text>
                    </div>
                    <Button type="primary" onClick={() => setIsModalOpen(true)} style={{fontFamily: 'Michroma, sans-serif'}}>
                        Cambiar Contraseña
                    </Button>
                </div>
            </Card>
        </Col>
      </Row>

      {/* --- MODAL PARA CAMBIAR CONTRASEÑA --- */}
      <Modal
        title="Cambiar Contraseña"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        style={{fontFamily: 'Michroma, sans-serif'}}
      >
        <Form layout="vertical" onFinish={handleChangePassword} form={form}>
            <Form.Item
                name="old_password"
                label="Contraseña Actual"
                rules={[{ required: true, message: 'Ingresa tu contraseña actual' }]}
            >
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
                name="new_password"
                label="Nueva Contraseña"
                rules={[
                    { required: true, message: 'Ingresa la nueva contraseña' },
                    { min: 6, message: 'Debe tener al menos 6 caracteres' }
                ]}
            >
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
                name="confirm_password"
                label="Confirmar Nueva Contraseña"
                dependencies={['new_password']}
                rules={[
                    { required: true, message: 'Confirma tu contraseña' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('new_password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Las contraseñas no coinciden'));
                        },
                    }),
                ]}
            >
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
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

export default AdminMiPerfilPage;