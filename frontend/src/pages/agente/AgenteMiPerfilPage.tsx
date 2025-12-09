// en frontend/src/pages/agente/AgenteMiPerfilPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Descriptions, Avatar, Button, Row, Col, Modal, Form, Input, message, Spin, Tag, Statistic, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, EditOutlined, SafetyCertificateOutlined, ArrowLeftOutlined, IdcardOutlined, PercentageOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const { Title, Text } = Typography;

const AgenteMiPerfilPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();

  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. Cargar Datos Reales del Agente ---
  const fetchPerfil = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) { navigate('/login'); return; }
      
      const headers = { Authorization: `Bearer ${token}` };
      
      // Llamamos a la nueva API específica para agentes
      const response = await axios.get('https://proyecto-univida2.onrender.com/api/agente/me/', { headers });
      
      setAgentData(response.data);
      
      // Pre-llenar formulario de edición
      form.setFieldsValue({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          telefono: response.data.telefono,
          telefono_oficina: response.data.telefono_oficina,
          direccion_oficina: response.data.direccion_oficina,
          especialidad: response.data.especialidad
      });

    } catch (e) {
        console.error(e);
        message.error('Error al cargar perfil del agente');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  // --- 2. Guardar Cambios (PATCH) ---
  const handleUpdateProfile = async (values: any) => {
    setActionLoading(true);
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        await axios.patch('https://proyecto-univida2.onrender.com/api/agente/me/', values, { headers });
        
        message.success('Perfil actualizado correctamente');
        setIsEditModalOpen(false);
        fetchPerfil(); // Recargar datos

    } catch (error) {
        message.error('Error al actualizar el perfil.');
    } finally {
        setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/agente-dashboard')} shape="circle" />
        <Title level={2} style={{ margin: 0 }}>Mi Perfil Profesional</Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* --- COLUMNA IZQUIERDA: Resumen Profesional --- */}
        <Col xs={24} md={8}>
            <Card style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#52c41a', marginBottom: 16 }} />
                <Title level={3} style={{ margin: 0 }}>{agentData?.first_name} {agentData?.last_name}</Title>
                <Tag color="green" style={{ marginTop: 8 }}>AGENTE AUTORIZADO</Tag>
                
                <div style={{ marginTop: 24, textAlign: 'left' }}>
                    <p><IdcardOutlined /> Código: <strong>{agentData?.codigo_agente}</strong></p>
                    <p><MailOutlined /> {agentData?.email}</p>
                    <p><PhoneOutlined /> {agentData?.telefono}</p>
                </div>
            </Card>

            {/* Tarjeta de Desempeño (Datos del modelo Agente) */}
            <Card title="Detalles de Contrato">
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic 
                            title="Comisión" 
                            value={agentData?.comision} 
                            suffix="%" 
                            prefix={<PercentageOutlined />} 
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic 
                            title="Estado" 
                            value={agentData?.estado?.toUpperCase()} 
                            valueStyle={{ fontSize: '1rem', color: agentData?.estado === 'activo' ? 'green' : 'gray' }}
                        />
                    </Col>
                </Row>
            </Card>
        </Col>

        {/* --- COLUMNA DERECHA: Información Detallada --- */}
        <Col xs={24} md={16}>
            <Card 
                title="Información de Contacto y Oficina" 
                extra={<Button type="primary" ghost icon={<EditOutlined />} onClick={() => setIsEditModalOpen(true)}>Editar Datos</Button>}
            >
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Nombre Completo">
                        {agentData?.first_name} {agentData?.last_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Especialidad">
                        {agentData?.especialidad}
                    </Descriptions.Item>
                    <Descriptions.Item label="Teléfono Personal">
                        {agentData?.telefono || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Teléfono Oficina">
                        {agentData?.telefono_oficina || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dirección Oficina">
                        {agentData?.direccion_oficina || 'N/A'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
            
            <Card title="Seguridad" style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text><SafetyCertificateOutlined /> Contraseña</Text>
                    <Button onClick={() => message.info("Usa el botón 'Olvidé mi contraseña' en el login por ahora.")}>
                        Cambiar Contraseña
                    </Button>
                </div>
            </Card>
        </Col>
      </Row>

      {/* --- MODAL: EDITAR DATOS --- */}
      <Modal
        title="Editar Mis Datos Profesionales"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleUpdateProfile} form={form}>
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
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input disabled /> {/* El email suele ser delicado cambiarlo sin verificación */}
            </Form.Item>
            <Form.Item name="telefono" label="Teléfono Personal">
                <Input />
            </Form.Item>
            <Form.Item name="especialidad" label="Especialidad">
                <Input />
            </Form.Item>
            <Divider orientation="left">Datos de Oficina</Divider>
            <Form.Item name="telefono_oficina" label="Teléfono Oficina">
                <Input />
            </Form.Item>
            <Form.Item name="direccion_oficina" label="Dirección Oficina">
                <Input.TextArea rows={2} />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
                <Button onClick={() => setIsEditModalOpen(false)} style={{ marginRight: 8 }}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={actionLoading}>Guardar Cambios</Button>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgenteMiPerfilPage;