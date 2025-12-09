// EN frontend/src/pages/gestion/AdminGestionClientesPage.tsx - VERSIÓN FINAL
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, message, Tabs, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

interface Cliente {
  id: number;
  usuario_info: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    telefono: string;
    is_active: boolean;
  };
  fecha_nacimiento: string;
  direccion: string;
  identificacion: string;
  estado_salud: string;
}

const AdminGestionClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientesActivos, setClientesActivos] = useState<Cliente[]>([]);
  const [clientesInactivos, setClientesInactivos] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('activos');

  const getToken = () => localStorage.getItem('accessToken');

  // Función para cargar todos los clientes
  const fetchClientes = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('https://proyecto-univida2.onrender.com/api/clientes/', { headers });
      
      // Separar clientes activos e inactivos
      const activos = response.data.filter((cliente: Cliente) => cliente.usuario_info.is_active !== false);
      const inactivos = response.data.filter((cliente: Cliente) => cliente.usuario_info.is_active === false);
      
      setClientesActivos(activos);
      setClientesInactivos(inactivos);

    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
      if (error.response && error.response.status === 401) {
        message.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      } else {
        message.error('Error al cargar la lista de clientes.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para desactivar cliente
  const handleDesactivarCliente = async (clienteId: number, clienteNombre: string) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`https://proyecto-univida2.onrender.com/api/clientes/${clienteId}/eliminar/`, { headers });
      
      message.success(`Cliente ${clienteNombre} desactivado correctamente.`);
      fetchClientes(); // Recargar la lista
    } catch (error: any) {
      console.error('Error al desactivar cliente:', error);
      message.error('Error al desactivar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para reactivar cliente
  const handleReactivarCliente = async (clienteId: number, clienteNombre: string) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`https://proyecto-univida2.onrender.com/api/clientes/${clienteId}/reactivar/`, {}, { headers });
      
      message.success(`Cliente ${clienteNombre} reactivado correctamente.`);
      fetchClientes(); // Recargar la lista
    } catch (error: any) {
      console.error('Error al reactivar cliente:', error);
      message.error('Error al reactivar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarCliente = (cliente: Cliente) => {
    navigate(`/admin-clientes/editar/${cliente.id}`);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Columnas para la tabla de clientes ACTIVOS
  const columnasActivos = [
    {
      title: 'Identificación',
      dataIndex: 'identificacion',
      key: 'identificacion',
    },
    {
      title: 'Nombre',
      key: 'nombre',
      render: (_: any, record: Cliente) => (
        `${record.usuario_info.first_name} ${record.usuario_info.last_name}`
      ),
    },
    {
      title: 'Email',
      key: 'email',
      render: (_: any, record: Cliente) => record.usuario_info.email,
    },
    {
      title: 'Teléfono',
      key: 'telefono',
      render: (_: any, record: Cliente) => record.usuario_info.telefono || 'N/A',
    },
    {
      title: 'Estado Salud',
      dataIndex: 'estado_salud',
      key: 'estado_salud',
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_: any, record: Cliente) => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Activo
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Cliente) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditarCliente(record)} 
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de desactivar este cliente?"
            description={`El cliente ${record.usuario_info.first_name} ${record.usuario_info.last_name} será desactivado pero conservará su historial.`}
            onConfirm={() => handleDesactivarCliente(record.id, `${record.usuario_info.first_name} ${record.usuario_info.last_name}`)}
            okText="Sí, desactivar"
            cancelText="Cancelar"
            okType="danger"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger
            >
              Desactivar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Columnas para la tabla de clientes INACTIVOS
  const columnasInactivos = [
    {
      title: 'Identificación',
      dataIndex: 'identificacion',
      key: 'identificacion',
    },
    {
      title: 'Nombre',
      key: 'nombre',
      render: (_: any, record: Cliente) => (
        `${record.usuario_info.first_name} ${record.usuario_info.last_name}`
      ),
    },
    {
      title: 'Email',
      key: 'email',
      render: (_: any, record: Cliente) => record.usuario_info.email,
    },
    {
      title: 'Teléfono',
      key: 'telefono',
      render: (_: any, record: Cliente) => record.usuario_info.telefono || 'N/A',
    },
    {
      title: 'Estado Salud',
      dataIndex: 'estado_salud',
      key: 'estado_salud',
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_: any, record: Cliente) => (
        <Tag color="red" icon={<StopOutlined />}>
          Inactivo
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Cliente) => (
        <Space size="middle">
          <Popconfirm
            title="¿Estás seguro de reactivar este cliente?"
            description={`El cliente ${record.usuario_info.first_name} ${record.usuario_info.last_name} será reactivado y podrá acceder al sistema nuevamente.`}
            onConfirm={() => handleReactivarCliente(record.id, `${record.usuario_info.first_name} ${record.usuario_info.last_name}`)}
            okText="Sí, reactivar"
            cancelText="Cancelar"
            okType="primary"
          >
            <Button 
              icon={<CheckCircleOutlined />} 
              type="primary"
            >
              Reactivar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Content style={{padding: '24px'}}>
        <Title level={2} style={{fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>
          Gestión de Clientes
        </Title>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin-clientes/crear')}
          style={{ marginBottom: 16, fontFamily: 'Michroma, sans-serif' }}
        >
          Crear Nuevo Cliente
        </Button>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'activos',
              label: (
                <span>
                  <CheckCircleOutlined />
                  Clientes Activos ({clientesActivos.length})
                </span>
              ),
              children: (
                <Table
                  columns={columnasActivos}
                  dataSource={clientesActivos}
                  loading={loading}
                  rowKey="id"
                />
              ),
            },
            {
              key: 'inactivos',
              label: (
                <span>
                  <StopOutlined />
                  Clientes Inactivos ({clientesInactivos.length})
                </span>
              ),
              children: (
                <Table
                  columns={columnasInactivos}
                  dataSource={clientesInactivos}
                  loading={loading}
                  rowKey="id"
                />
              ),
            },
          ]}
        />
      </Content>
    </Layout>
  );
};

export default AdminGestionClientesPage;