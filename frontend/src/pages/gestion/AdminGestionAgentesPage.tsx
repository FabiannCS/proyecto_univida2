// en frontend/src/pages/gestion/AdminGestionAgentesPage.tsx - VERSIÓN CON PESTAÑAS
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, message, Space, Popconfirm, Tabs, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

interface Agente {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  rol: string;
}

const AdminGestionAgentesPage: React.FC = () => {
  const navigate = useNavigate();
  const [agentesActivos, setAgentesActivos] = useState<Agente[]>([]);
  const [agentesInactivos, setAgentesInactivos] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('activos');

  const getToken = () => localStorage.getItem('accessToken');

  // Función para cargar todos los agentes
  const fetchAgentes = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://127.0.0.1:8000/api/agentes/', { headers });
      
      // Separar agentes activos e inactivos
      const activos = response.data.filter((agente: Agente) => agente.is_active !== false);
      const inactivos = response.data.filter((agente: Agente) => agente.is_active === false);
      
      setAgentesActivos(activos);
      setAgentesInactivos(inactivos);
    } catch (error: any) {
      console.error('Error al cargar agentes:', error);
      if (error.response && error.response.status === 401) {
        message.error('Tu sesión ha expirado.');
      } else {
        message.error('Error al cargar la lista de agentes.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentes();
  }, []);

  // Función para desactivar agente
  const handleDesactivarAgente = async (agenteId: number, agenteNombre: string) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`http://127.0.0.1:8000/api/agentes/${agenteId}/eliminar/`, { headers });
      message.success(`Agente ${agenteNombre} desactivado correctamente.`);
      fetchAgentes(); // Recargar la lista
    } catch (error: any) {
      console.error('Error al desactivar agente:', error);
      message.error('Error al desactivar el agente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para reactivar agente
  const handleReactivarAgente = async (agenteId: number, agenteNombre: string) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Llamar a una API para reactivar (necesitarás crearla en el backend)
      await axios.patch(`http://127.0.0.1:8000/api/agentes/${agenteId}/reactivar/`, {}, { headers });
      message.success(`Agente ${agenteNombre} reactivado correctamente.`);
      fetchAgentes(); // Recargar la lista
    } catch (error: any) {
      console.error('Error al reactivar agente:', error);
      message.error('Error al reactivar el agente.');
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla de agentes ACTIVOS
  const columnasActivos = [
    { 
      title: 'Username', 
      dataIndex: 'username', 
      key: 'username' 
    },
    { 
      title: 'Nombre', 
      dataIndex: 'first_name', 
      key: 'first_name' 
    },
    { 
      title: 'Apellido', 
      dataIndex: 'last_name', 
      key: 'last_name' 
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email' 
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_: any, record: Agente) => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Activo
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Agente) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/admin-agentes/${record.id}/editar`)} 
            style={{ marginRight: 8 }}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de desactivar este agente?"
            description={`El agente ${record.first_name} ${record.last_name} será desactivado pero conservará su historial.`}
            onConfirm={() => handleDesactivarAgente(record.id, `${record.first_name} ${record.last_name}`)}
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

  // Columnas para la tabla de agentes INACTIVOS
  const columnasInactivos = [
    { 
      title: 'Username', 
      dataIndex: 'username', 
      key: 'username' 
    },
    { 
      title: 'Nombre', 
      dataIndex: 'first_name', 
      key: 'first_name' 
    },
    { 
      title: 'Apellido', 
      dataIndex: 'last_name', 
      key: 'last_name' 
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email' 
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_: any, record: Agente) => (
        <Tag color="red" icon={<StopOutlined />}>
          Inactivo
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Agente) => (
        <Space size="middle">
          <Popconfirm
            title="¿Estás seguro de reactivar este agente?"
            description={`El agente ${record.first_name} ${record.last_name} será reactivado y podrá acceder al sistema nuevamente.`}
            onConfirm={() => handleReactivarAgente(record.id, `${record.first_name} ${record.last_name}`)}
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
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>
          Gestión de Agentes
        </Title>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin-agentes/crear')}
          style={{ marginBottom: 16, fontFamily: 'Michroma, sans-serif'}}
        >
          Crear Nuevo Agente
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
                  Agentes Activos ({agentesActivos.length})
                </span>
              ),
              children: (
                <Table
                  columns={columnasActivos}
                  dataSource={agentesActivos}
                  loading={loading}
                  rowKey="id"
                  bordered
                />
              ),
            },
            {
              key: 'inactivos',
              label: (
                <span>
                  <StopOutlined />
                  Agentes Inactivos ({agentesInactivos.length})
                </span>
              ),
              children: (
                <Table
                  columns={columnasInactivos}
                  dataSource={agentesInactivos}
                  loading={loading}
                  rowKey="id"
                  bordered
                />
              ),
            },
          ]}
        />
      </Content>
    </Layout>
  );
};

export default AdminGestionAgentesPage;