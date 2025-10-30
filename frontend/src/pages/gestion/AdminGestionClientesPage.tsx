// en frontend/src/pages/gestion/AdminGestionClientesPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

// Interfaz basada en tu ClienteSerializer
interface Cliente {
  id: number;
  usuario_info: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    telefono: string;
  };
  fecha_nacimiento: string;
  direccion: string;
  identificacion: string;
  estado_salud: string;
}

const AdminGestionClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  // Función para cargar los clientes
  const fetchClientes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        message.error('No estás autenticado. Por favor, inicia sesión de nuevo.');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://127.0.0.1:8000/api/clientes/', { headers });
      setClientes(response.data);

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

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, []);

  // Columnas para la tabla
  const columns = [
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
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Cliente) => (
        <span>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => alert('Editar Cliente ID: ' + record.id)} 
            style={{ marginRight: 8 }}
          >
            Editar
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => alert('Eliminar Cliente ID: ' + record.id)}
          >
            Eliminar
          </Button>
        </span>
      ),
    },
  ];

  return (
    <Layout>
      <Content>
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
        
        {/* Tabla que muestra los clientes */}
        <Table
          columns={columns}
          dataSource={clientes}
          loading={loading}
          rowKey="id"
        />
      </Content>
    </Layout>
  );
};

export default AdminGestionClientesPage;