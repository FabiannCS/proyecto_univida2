// en frontend/src/pages/gestion/AdminGestionAgentesPage.tsx
import React, { useState, useEffect } from 'react';
// 1. IMPORTACIONES CORREGIDAS
import { Layout, Typography, Table, Button, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

// Interfaz del Agente
interface Agente {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const AdminGestionAgentesPage: React.FC = () => {
  const navigate = useNavigate();
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('accessToken');

  // --- Función para Cargar Agentes (GET) ---
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
      setAgentes(response.data);
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

  // Carga los agentes una vez al montar la página
  useEffect(() => {
    fetchAgentes();
  }, []); // El [] evita el bucle infinito

  // --- Función para Borrar (DELETE) ---
  const handleDelete = async (agenteId: number) => {
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
      message.success('Agente desactivado/eliminado exitosamente.');
      fetchAgentes(); // Recarga la tabla
    } catch (error: any) {
      console.error('Error al eliminar agente:', error);
      message.error('Error al eliminar el agente.');
    } finally {
      setLoading(false);
    }
  };

  // --- Definición de Columnas (Ahora sí funcionará) ---
  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Nombre', dataIndex: 'first_name', key: 'first_name' },
    { title: 'Apellido', dataIndex: 'last_name', key: 'last_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Agente) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => navigate(`/admin-agentes/${record.id}/editar`)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar/desactivar este agente?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- Renderizado Visual ---
  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>Gestión de Agentes</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin-agentes/crear')}
          style={{ marginBottom: 16,  fontFamily: 'Michroma, sans-serif'}}
        >
          Crear Nuevo Agente
        </Button>
        
        <Table
          columns={columns}
          dataSource={agentes}
          loading={loading}
          rowKey="id"
          bordered
        />

        {/* 3. ELIMINAMOS EL <Modal> (YA NO VA AQUÍ) */}
        
      </Content>
    </Layout>
  );
};

export default AdminGestionAgentesPage;