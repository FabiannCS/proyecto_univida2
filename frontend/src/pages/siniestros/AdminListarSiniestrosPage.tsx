// en frontend/src/pages/siniestros/AdminListarSiniestrosPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, message, Space, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Title } = Typography;

// Interfaz para los datos del Siniestro (basada en tu serializers.txt)
interface Siniestro {
  id: number;
  numero_siniestro: string;
  tipo_siniestro: string;
  estado: string;
  monto_reclamado: string;
  fecha_reporte: string;
  poliza_info: { // Información anidada de la póliza
    numero_poliza: string;
    cliente_info: {
      usuario_info: {
        first_name: string;
        last_name: string;
      }
    }
  };
}

const AdminListarSiniestrosPage: React.FC = () => {
  const navigate = useNavigate();
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('accessToken');

  // --- Carga los Siniestros (GET) ---
  const fetchSiniestros = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      // Llama al endpoint de siniestros (de tu views.py)
      const response = await axios.get('http://127.0.0.1:8000/api/siniestros/', { headers });
      setSiniestros(response.data);
      
    } catch (error: any) {
      console.error('Error al cargar siniestros:', error);
      message.error('Error al cargar la lista de siniestros.');
    } finally {
      setLoading(false);
    }
  };

  // Carga los siniestros una vez al montar la página
  useEffect(() => {
    fetchSiniestros();
  }, []); // El [] evita el bucle infinito

  // --- Columnas para la Tabla de Siniestros ---
  const columns = [
    {
      title: 'Nº Siniestro',
      dataIndex: 'numero_siniestro',
      key: 'numero_siniestro',
    },
    {
      title: 'Cliente',
      dataIndex: ['poliza_info', 'cliente_info', 'usuario_info'],
      key: 'cliente',
      render: (usuario_info: Siniestro['poliza_info']['cliente_info']['usuario_info']) => 
        `${usuario_info.first_name} ${usuario_info.last_name}`
    },
    {
      title: 'Nº Póliza',
      dataIndex: ['poliza_info', 'numero_poliza'],
      key: 'numero_poliza',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        let color = 'blue'; // reportado
        if (estado === 'en_revision') color = 'processing';
        if (estado === 'aprobado') color = 'success';
        if (estado === 'rechazado') color = 'error';
        if (estado === 'pagado') color = 'gold';
        return <Tag color={color}>{estado.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Monto Reclamado',
      dataIndex: 'monto_reclamado',
      key: 'monto_reclamado',
      render: (monto: string) => `$${parseFloat(monto).toLocaleString('es-ES')}`
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Siniestro) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/admin-siniestros/${record.id}`)}>
            Revisar
          </Button>
        </Space>
      ),
    },
  ];

  // --- Renderizado Visual ---
  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>Gestión de Siniestros</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin-siniestros/reportar')} // Botón para ir a reportar un siniestro
          style={{ marginBottom: 16,  fontFamily: 'Michroma, sans-serif'}}
        >
          Reportar Nuevo Siniestro
        </Button>
        
        <Table
          columns={columns}
          dataSource={siniestros}
          loading={loading}
          rowKey="id"
          bordered
        />
      </Content>
    </Layout>
  );
};

export default AdminListarSiniestrosPage;