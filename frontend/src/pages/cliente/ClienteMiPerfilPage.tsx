// en frontend/src/pages/cliente/ClienteMiPerfilPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Descriptions, Avatar, Button, Row, Col, Modal, Form, Input, message, Spin, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, ArrowLeftOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ClienteMiPerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // Estados para Modales
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Nuevo Modal
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formPass] = Form.useForm();
  const [formEdit] = Form.useForm();

  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. Cargar Datos (Usando la nueva API) ---
  const fetchPerfil = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) { navigate('/login'); return; }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      // Llamamos al nuevo endpoint específico del perfil
      const response = await axios.get('http://127.0.0.1:8000/api/cliente/me/', { headers });
      
      setUserData(response.data);
      
      // Pre-llenamos el formulario de edición
      formEdit.setFieldsValue({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          telefono: response.data.telefono,
          direccion: response.data.direccion,
          // Convertir fecha string a objeto dayjs para el DatePicker
          fecha_nacimiento: response.data.fecha_nacimiento ? dayjs(response.data.fecha_nacimiento) : null
      });

    } catch (e) {
        console.error(e);
        message.error('Error al cargar perfil');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  // --- 2. Guardar Datos Editados (PATCH) ---
  const handleUpdateProfile = async (values: any) => {
    setActionLoading(true);
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        // Formatear fecha para enviar
        const dataToSend = {
            ...values,
            fecha_nacimiento: values.fecha_nacimiento ? values.fecha_nacimiento.format('YYYY-MM-DD') : null
        };

        await axios.patch('http://127.0.0.1:8000/api/cliente/me/', dataToSend, { headers });
        
        message.success('Datos actualizados correctamente');
        setIsEditModalOpen(false);
        fetchPerfil(); // Recargar datos visuales

    } catch (error) {
        message.error('Error al actualizar el perfil.');
    } finally {
        setActionLoading(false);
    }
  };

  // --- 3. Cambiar Contraseña (Simulado por ahora) ---
  const handleChangePassword = async (values: any) => {
    setActionLoading(true);
    try {
        // Intentar llamar al endpoint de cambio de contraseña si existe
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            await axios.post('http://127.0.0.1:8000/api/cliente/change-password/', {
                current_password: values.current_password,
                new_password: values.new_password
            }, { headers });
            message.success('Contraseña actualizada');
        } catch (err: any) {
            // Si el endpoint no existe (404) o no está implementado, simulamos el cambio en el frontend
            if (err?.response?.status === 404) {
                message.info('Endpoint de cambio de contraseña no encontrado en backend — simulando cambio (solo front-end).');
                message.success('Contraseña actualizada (simulada)');
            } else if (err?.response?.data) {
                const detail = err.response.data.detail || JSON.stringify(err.response.data);
                message.error(`Error al cambiar contraseña: ${detail}`);
                setActionLoading(false);
                return;
            } else {
                message.error('Error al cambiar contraseña');
                setActionLoading(false);
                return;
            }
        }

        setIsPassModalOpen(false);
        formPass.resetFields();
    } catch (error) {
        message.error('Error al cambiar contraseña');
    } finally {
        setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/mi-poliza')} shape="circle" />
        <Title level={2} style={{ margin: 0 }}>Mi Perfil</Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Tarjeta Izquierda */}
        <Col xs={24} md={8}>
            <Card style={{ textAlign: 'center' }}>
                <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
                <Title level={3} style={{ margin: 0 }}>{userData?.first_name}</Title>
                <Text type="secondary">Cliente Asegurado</Text>
            </Card>
        </Col>

        {/* Tarjeta Derecha */}
        <Col xs={24} md={16}>
            <Card 
                title="Información Personal" 
                extra={<Button type="link" icon={<EditOutlined />} onClick={() => setIsEditModalOpen(true)}>Editar</Button>}
                style={{ marginBottom: 24, fontFamily: 'Michroma, sans-serif' }}
            >
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Nombre Completo">{userData?.first_name} {userData?.last_name}</Descriptions.Item>
                    <Descriptions.Item label={<><MailOutlined /> Email</>}>{userData?.email}</Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined /> Teléfono</>}>{userData?.telefono || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<><HomeOutlined /> Dirección</>}>{userData?.direccion || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Fecha de Nacimiento">{userData?.fecha_nacimiento || 'N/A'}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Seguridad">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Text strong><SafetyCertificateOutlined /> Contraseña</Text><br />
                        <Text type="secondary">Se recomienda cambiarla periódicamente.</Text>
                    </div>
                    <Button style={{fontFamily: 'Michroma, sans-serif'}} type='primary' onClick={() => setIsPassModalOpen(true)}>Cambiar Contraseña</Button>
                </div>
            </Card>
        </Col>
      </Row>

      {/* --- MODAL: EDITAR DATOS --- */}
      <Modal
        title="Editar Mis Datos"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleUpdateProfile} form={formEdit}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="first_name" label="Nombre" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="last_name" label="Apellido" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email' }]}>
                <Input />
            </Form.Item>
            <Form.Item name="telefono" label="Teléfono">
                <Input />
            </Form.Item>
            <Form.Item name="direccion" label="Dirección">
                <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="fecha_nacimiento" label="Fecha de Nacimiento">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                <Button onClick={() => setIsEditModalOpen(false)} style={{ marginRight: 8 }}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={actionLoading}>Guardar Cambios</Button>
            </Form.Item>
        </Form>
      </Modal>

      {/* --- MODAL: CAMBIAR CONTRASEÑA --- */}
      <Modal title="Cambiar Contraseña" open={isPassModalOpen} onCancel={() => setIsPassModalOpen(false)} footer={null}>
        <Form layout="vertical" onFinish={handleChangePassword} form={formPass}>
            <Form.Item
                name="current_password"
                label="Contraseña Actual"
                rules={[{ required: true, message: 'Ingresa tu contraseña actual' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="new_password"
                label="Nueva Contraseña"
                rules={[{ required: true, message: 'Ingresa la nueva contraseña' }, { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }]}
                hasFeedback
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                name="confirm_password"
                label="Confirmar Nueva Contraseña"
                dependencies={["new_password"]}
                hasFeedback
                rules={[
                    { required: true, message: 'Confirma la nueva contraseña' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('new_password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Las contraseñas no coinciden'));
                        }
                    })
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', fontFamily: 'Michroma, sans-serif' }}>
                <Button onClick={() => { setIsPassModalOpen(false); formPass.resetFields(); }} style={{ marginRight: 8 }}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={actionLoading}>Actualizar</Button>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClienteMiPerfilPage;