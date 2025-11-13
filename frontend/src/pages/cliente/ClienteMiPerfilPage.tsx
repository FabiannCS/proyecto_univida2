// en frontend/src/pages/cliente/ClienteMiPerfilPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Descriptions, Avatar, Button, Row, Col, Modal, Form, Input, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, ArrowLeftOutlined} from '@ant-design/icons';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;

const ClienteMiPerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [form] = Form.useForm();
  
  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. Cargar Datos del Perfil ---
  useEffect(() => {
    // Simulamos la carga de datos desde el token o una API futura /api/me/
    const token = getToken();
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            // Aquí idealmente harías: await axios.get('http://.../api/me/', ...)
            // Por ahora usamos los datos del token + datos simulados
            setUserData({
                username: decoded.username,
                rol: decoded.rol,
                // Estos datos deberían venir del backend en el futuro:
                nombre: 'José Eduardo', 
                apellido: 'Vidaurre',
                email: 'jose.vidaurre@email.com',
                telefono: '+591 7000-1234',
                fechaRegistro: '2024-01-15'
            });
        } catch (e) {
            console.error(e);
        }
    }
    setLoading(false);
  }, []);

  // --- 2. Lógica para Cambiar Contraseña ---
  const handleChangePassword = async (values: any) => {
    setChangePassLoading(true);
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        // Llamada a tu backend (Tu compañero debe crear este endpoint)
        // await axios.post('http://127.0.0.1:8000/api/change-password/', values, { headers });
        
        // Simulación de éxito
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        message.success('Contraseña actualizada correctamente');
        setIsModalOpen(false);
        form.resetFields();

    } catch (error) {
        message.error('Error al cambiar la contraseña. Intenta de nuevo.');
    } finally {
        setChangePassLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div>
      {/* --- 4. ENCABEZADO CON BOTÓN VOLVER (NUEVO) --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 24 }}>
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/mi-poliza')} // Vuelve explícitamente a 'Mi Póliza'
            shape="circle" 
        />
        <Title level={2} style={{ margin: 0, fontFamily: 'Michroma, sans-serif' }}>Mi Perfil</Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* --- COLUMNA IZQUIERDA: Tarjeta de Presentación --- */}
        <Col xs={24} md={8}>
            <Card style={{ textAlign: 'center' }}>
                <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
                <Title level={3} style={{ margin: 0 }}>{userData?.username}</Title>
                <Typography.Text type="secondary">Cliente Asegurado</Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>Miembro desde {userData?.fechaRegistro}</Typography.Text>
            </Card>
        </Col>

        {/* --- COLUMNA DERECHA: Datos y Seguridad --- */}
        <Col xs={24} md={16}>
            {/* Datos Personales */}
            <Card title="Información Personal" style={{ marginBottom: 24 }}>
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

            {/* Seguridad */}
            <Card title="Seguridad de la Cuenta">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Typography.Text strong><SafetyCertificateOutlined /> Contraseña</Typography.Text>
                        <br />
                        <Typography.Text type="secondary">Se recomienda cambiar tu contraseña periódicamente.</Typography.Text>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
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
                <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>
                    Cancelar
                </Button>
                <Button type="primary" htmlType="submit" loading={changePassLoading}>
                    Actualizar Contraseña
                </Button>
            </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default ClienteMiPerfilPage;