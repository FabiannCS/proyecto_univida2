// en frontend/src/pages/polizas/AdminListarPolizasPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, message, Space, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Title } = Typography;

// Interfaz para los datos de la Póliza (basada en tu serializers.txt)
interface Poliza {
  id: number;
  numero_poliza: string;
  cliente_info: { // Esta estructura viene de tu PolizaSerializer
    usuario_info: {
      first_name: string;
      last_name: string;
    }
  };
  estado: string;
  suma_asegurada: string;
}

const AdminListarPolizasPage: React.FC = () => {
  const navigate = useNavigate();
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('accessToken');

  // --- Carga las Pólizas (GET) ---
  const fetchPolizas = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      // ¡Asegúrate de que tu compañero tenga este endpoint '/api/polizas/' listo!
      const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
      setPolizas(response.data);
      
    } catch (error: any) {
      console.error('Error al cargar pólizas:', error);
      message.error('Error al cargar la lista de pólizas.');
    } finally {
      setLoading(false);
    }
  };

  // Carga las pólizas una vez al montar la página
  useEffect(() => {
    fetchPolizas();
  }, []); // El [] evita el bucle infinito

  // --- Columnas para la Tabla de Pólizas ---
  const columns = [
    {
      title: 'Nº de Póliza',
      dataIndex: 'numero_poliza',
      key: 'numero_poliza',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_info',
      key: 'cliente',
      // Renderizamos el nombre completo desde la info anidada
      render: (cliente_info: Poliza['cliente_info']) => 
        `${cliente_info.usuario_info.first_name} ${cliente_info.usuario_info.last_name}`
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        let color = 'geekblue';
        if (estado === 'activa') color = 'green';
        if (estado === 'vencida') color = 'volcano';
        if (estado === 'inactiva') color = 'grey';
        return <Tag color={color}>{estado.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Suma Asegurada',
      dataIndex: 'suma_asegurada',
      key: 'suma_asegurada',
      render: (monto: string) => `$${parseFloat(monto).toLocaleString('es-ES')}`
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Poliza) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/admin-polizas/${record.id}`)}>
            Ver Detalles
          </Button>
          {/* Aquí irán los botones de Editar/Eliminar Póliza */}
        </Space>
      ),
    },
  ];

  // --- Renderizado Visual ---
  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>Gestión de Pólizas</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin-polizas/crear')} // Botón para ir al formulario de creación
          style={{ marginBottom: 16,  fontFamily: 'Michroma, sans-serif'}}
        >
          Crear Nueva Póliza
        </Button>
        
        <Table
          columns={columns}
          dataSource={polizas}
          loading={loading}
          rowKey="id"
          bordered
        />
      </Content>
    </Layout>
  );
};

export default AdminListarPolizasPage;