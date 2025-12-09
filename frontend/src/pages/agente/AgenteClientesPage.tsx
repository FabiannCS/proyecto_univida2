// en frontend/src/pages/agente/AgenteClientesPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, Card, Tag, Space, message, Tabs, Popconfirm, Tooltip, Modal, Form, Input, Row, Col } from 'antd';
import { EditOutlined, StopOutlined, CheckCircleOutlined, EyeOutlined, MailOutlined, PhoneOutlined, UserOutlined, IdcardOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

// Interfaz (Asegúrate que coincida con tu backend)
interface Cliente {
  id: number;
  identificacion: string;
  direccion?: string;
  usuario_info: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    telefono: string;
    is_active: boolean;
  };
}

const AgenteClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();

  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. Cargar Clientes ---
  const fetchMisClientes = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('https://proyecto-univida2.onrender.com/api/clientes/', { headers });
      setClientes(response.data);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMisClientes(); }, []);

  // --- 2. Abrir Modal de Edición ---
  const openEditModal = (cliente: Cliente) => {
      setEditingClient(cliente);
      form.setFieldsValue({
          first_name: cliente.usuario_info.first_name,
          last_name: cliente.usuario_info.last_name,
          email: cliente.usuario_info.email,
          telefono: cliente.usuario_info.telefono,
          identificacion: cliente.identificacion,
          direccion: cliente.direccion
      });
      setIsModalOpen(true);
  };

  // --- 3. Guardar Cambios (PATCH) - CORREGIDO ---
  const handleUpdateCliente = async (values: any) => {
      setActionLoading(true);
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          if (!editingClient) return;

          // Estructura correcta para el serializer anidado
          // Nota: Tu backend debe estar preparado para recibir 'usuario' como objeto en el PATCH de Cliente
          // Si tu backend usa 'ClienteSerializer' estándar, esto podría fallar si no tiene update anidado.
          // Lo ideal es usar un serializer específico o que tu backend soporte writable nested serializers.
          
          const dataToSend = {
              identificacion: values.identificacion,
              direccion: values.direccion,
              // Intentamos enviar datos de usuario anidados
              usuario: {
                  first_name: values.first_name,
                  last_name: values.last_name,
                  email: values.email,
                  telefono: values.telefono
              }
          };

          await axios.patch(`https://proyecto-univida2.onrender.com/api/clientes/${editingClient.id}/`, dataToSend, { headers });

          message.success('Cliente actualizado correctamente');
          setIsModalOpen(false);
          fetchMisClientes(); 

      } catch (error) {
          console.error(error);
          message.error('Error al actualizar. Verifica que el email no esté duplicado.');
      } finally {
          setActionLoading(false);
      }
  };

  // --- 4. Cambiar Estado ---
  const toggleEstadoCliente = async (cliente: Cliente, activar: boolean) => {
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          await axios.patch(`https://proyecto-univida2.onrender.com/api/clientes/${cliente.id}/toggle-estado/`, {
              is_active: activar 
          }, { headers });
          
          message.success(`Cliente ${activar ? 'activado' : 'desactivado'} correctamente.`);
          fetchMisClientes(); 

      } catch (error) {
          message.error('Error al cambiar estado del cliente');
      }
  };

  const columns = [
    {
      title: 'Cliente', key: 'cliente',
      render: (_: any, r: Cliente) => (
        <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 'bold' }}>{r.usuario_info.first_name} {r.usuario_info.last_name}</span>
            <span style={{ fontSize: '12px', color: '#888' }}>CI: {r.identificacion}</span>
        </Space>
      ),
    },
    {
      title: 'Contacto', key: 'contacto',
      render: (_: any, r: Cliente) => (
        <Space direction="vertical" size={2}>
            <span style={{ fontSize: '12px' }}><MailOutlined /> {r.usuario_info.email}</span>
            <span style={{ fontSize: '12px' }}><PhoneOutlined /> {r.usuario_info.telefono}</span>
        </Space>
      ),
    },
    {
      title: 'Estado', key: 'estado',
      render: (_: any, r: Cliente) => (
          r.usuario_info.is_active ? <Tag color="green">ACTIVO</Tag> : <Tag color="red">INACTIVO</Tag>
      )
    },
    {
      title: 'Acciones', key: 'acciones',
      render: (_: any, record: Cliente) => (
        <Space>
            {/* BOTÓN VER DETALLES - AHORA FUNCIONA */}
            <Tooltip title="Ver Detalles Completos">
                <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/agente-clientes/${record.id}`)} >
                  Detalles
                </Button>
            </Tooltip>
            
            {/* BOTÓN EDITAR */}
            <Tooltip title="Editar Datos">
                <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => openEditModal(record)} >
                  Editar
                </Button>
            </Tooltip>
            
            {/* BOTÓN ESTADO */}
            {record.usuario_info.is_active ? (
                <Popconfirm title="¿Desactivar cliente?" onConfirm={() => toggleEstadoCliente(record, false)}>
                    <Button size="small" danger icon={<StopOutlined />}>Baja</Button>
                </Popconfirm>
            ) : (
                <Popconfirm title="¿Reactivar cliente?" onConfirm={() => toggleEstadoCliente(record, true)}>
                    <Button size="small" type="dashed" icon={<CheckCircleOutlined />}>Activar</Button>
                </Popconfirm>
            )}
        </Space>
      ),
    },
  ];

  const clientesActivos = clientes.filter(c => c.usuario_info.is_active !== false);
  const clientesInactivos = clientes.filter(c => c.usuario_info.is_active === false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Mi Cartera de Clientes</Title>
        <Button style={{fontFamily: 'Michroma, sans-serif'}} type="primary" icon={<PlusOutlined />} onClick={() => navigate('/agente-clientes/crear')}>Registrar Nuevo Cliente</Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Tabs defaultActiveKey="1" items={[
            { key: '1', label: `Activos (${clientesActivos.length})`, children: <Table dataSource={clientesActivos} columns={columns} rowKey="id" loading={loading} /> },
            { key: '2', label: `Inactivos / Baja (${clientesInactivos.length})`, children: <Table dataSource={clientesInactivos} columns={columns} rowKey="id" loading={loading} /> }
        ]} />
      </Card>

      <Modal title="Editar Cliente" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleUpdateCliente}>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="first_name" label="Nombre" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="last_name" label="Apellido" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}><Input /></Form.Item>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="identificacion" label="CI/DNI"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="telefono" label="Teléfono"><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="direccion" label="Dirección"><Input.TextArea rows={2} /></Form.Item>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={actionLoading}>Guardar</Button>
            </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AgenteClientesPage;