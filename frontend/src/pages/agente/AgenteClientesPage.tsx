// en frontend/src/pages/agente/AgenteClientesPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, Card, Tag, Space, message, Tabs, Popconfirm, Tooltip, Modal, Form, Input } from 'antd';
import { EditOutlined, StopOutlined, CheckCircleOutlined, EyeOutlined, MailOutlined, PhoneOutlined, UserOutlined, IdcardOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

interface Cliente {
  id: number;
  identificacion: string;
  direccion?: string; // Añadido
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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
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
      
      // Recuerda: Tu backend debería filtrar esto para mostrar solo los de este agente
      const response = await axios.get('http://127.0.0.1:8000/api/clientes/', { headers });
      setClientes(response.data);
    } catch (error) {
      console.error(error);
      message.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisClientes();
  }, []);

  // --- 2. Abrir Modal de Edición ---
  const openEditModal = (cliente: Cliente) => {
      setEditingClient(cliente);
      // Rellenamos el formulario con los datos actuales
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

  // --- 3. Guardar Cambios (PATCH) ---
  const handleUpdateCliente = async (values: any) => {
      setActionLoading(true);
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          if (!editingClient) return;

          // Estructuramos los datos para el serializer (Usuario anidado)
          const dataToSend = {
              usuario: {
                  first_name: values.first_name,
                  last_name: values.last_name,
                  email: values.email,
                  telefono: values.telefono
              },
              identificacion: values.identificacion,
              direccion: values.direccion
          };

          // Llamada a la API para actualizar (asumiendo que el endpoint es /api/clientes/:id/)
          await axios.patch(`http://127.0.0.1:8000/api/clientes/${editingClient.id}/`, dataToSend, { headers });

          message.success('Cliente actualizado correctamente');
          setIsModalOpen(false);
          fetchMisClientes(); // Recargar la tabla

      } catch (error) {
          console.error(error);
          message.error('Error al actualizar cliente. Verifica los datos.');
      } finally {
          setActionLoading(false);
      }
  };

  // --- 4. Cambiar Estado (Activar/Desactivar) ---
  const toggleEstadoCliente = async (cliente: Cliente, activar: boolean) => {
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          // Aquí asumimos que tu backend acepta un PATCH directo al usuario o cliente para esto
          // Por ahora simulamos el cambio visualmente o hacemos un patch simple
          // await axios.patch(...) 
          
          message.success(`Cliente ${activar ? 'activado' : 'desactivado'} correctamente.`);
          
          // Actualización optimista de la UI
          setClientes(prev => prev.map(c => 
              c.id === cliente.id 
              ? { ...c, usuario_info: { ...c.usuario_info, is_active: activar } } 
              : c
          ));

      } catch (error) {
          message.error('Error al cambiar estado del cliente');
      }
  };

  const columns = [
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_: any, record: Cliente) => (
        <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 'bold' }}>{record.usuario_info.first_name} {record.usuario_info.last_name}</span>
            <span style={{ fontSize: '12px', color: '#888' }}>CI: {record.identificacion}</span>
        </Space>
      ),
    },
    {
      title: 'Contacto',
      key: 'contacto',
      render: (_: any, record: Cliente) => (
        <Space direction="vertical" size={2}>
            <span style={{ fontSize: '12px' }}><MailOutlined /> {record.usuario_info.email}</span>
            <span style={{ fontSize: '12px' }}><PhoneOutlined /> {record.usuario_info.telefono}</span>
        </Space>
      ),
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_: any, record: Cliente) => (
          record.usuario_info.is_active 
          ? <Tag color="green">ACTIVO</Tag> 
          : <Tag color="red">INACTIVO</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Cliente) => (
        <Space>
            <Tooltip title="Ver Detalles">
                <Button size="small" icon={<EyeOutlined />} onClick={() => message.info('Detalle completo en construcción')} />
            </Tooltip>
            
            {/* BOTÓN EDITAR (Ahora abre el Modal) */}
            <Tooltip title="Editar Datos">
                <Button 
                    size="small" 
                    type="primary" 
                    ghost 
                    icon={<EditOutlined />} 
                    onClick={() => openEditModal(record)} // <-- ABRE MODAL
                />
            </Tooltip>
            
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
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif"}}>Mi Cartera de Clientes</Title>
      </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/agente-clientes/crear')}
          style={{ marginBottom: 16, fontFamily: 'Michroma, sans-serif' }}
        >
          Crear Nuevo Cliente
        </Button>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Tabs defaultActiveKey="1" items={[
            { key: '1', label: `Activos (${clientesActivos.length})`, children: <Table dataSource={clientesActivos} columns={columns} rowKey="id" loading={loading} /> },
            { key: '2', label: `Inactivos / Baja (${clientesInactivos.length})`, children: <Table dataSource={clientesInactivos} columns={columns} rowKey="id" loading={loading} /> }
        ]} />
      </Card>

      {/* --- MODAL DE EDICIÓN --- */}
      <Modal
        title="Editar Cliente"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateCliente}
        >
            <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item name="first_name" label="Nombre" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item name="last_name" label="Apellido" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                </Form.Item>
            </Space>

            <Form.Item name="email" label="Correo Electrónico" rules={[{ type: 'email', required: true }]}>
                <Input prefix={<MailOutlined />} />
            </Form.Item>

            <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item name="identificacion" label="CI / DNI">
                    <Input prefix={<IdcardOutlined />} />
                </Form.Item>
                <Form.Item name="telefono" label="Teléfono">
                    <Input prefix={<PhoneOutlined />} />
                </Form.Item>
            </Space>
            
            <Form.Item name="direccion" label="Dirección">
                <Input.TextArea rows={2} />
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Cancelar</Button>
                <Button type="primary" htmlType="submit" loading={actionLoading}>Guardar Cambios</Button>
            </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AgenteClientesPage;