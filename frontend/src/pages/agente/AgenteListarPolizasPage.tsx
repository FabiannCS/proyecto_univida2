// en frontend/src/pages/agente/AgenteListarPolizasPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Button, Card, Space, message, Input} from 'antd';
import { EyeOutlined, SearchOutlined, PlusOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title } = Typography;

interface Poliza {
  id: number;
  numero_poliza: string;
  estado: string;
  suma_asegurada: string;
  cliente_info: {
    usuario_info: {
      first_name: string;
      last_name: string;
    }
  };
  // Suponemos que la póliza trae info del agente asignado
  agente?: number; 
}

const AgenteListarPolizasPage: React.FC = () => {
  const navigate = useNavigate();
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const getToken = () => localStorage.getItem('accessToken');

  const fetchMisPolizas = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      
      // 1. Obtener ID del usuario actual para filtrar (Simulación de Frontend)
      const decoded: any = jwtDecode(token);
      // En un mundo ideal, el backend filtra por nosotros en /api/agente/mis-polizas/
      // Por ahora, pedimos todas y filtraremos visualmente si es necesario
      
      const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
      setPolizas(response.data);

    } catch (error) {
      console.error(error);
      message.error('Error al cargar pólizas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisPolizas();
  }, []);

  // Filtrado simple por número o cliente
  const filteredPolizas = polizas.filter(p => 
    p.numero_poliza.toLowerCase().includes(searchText.toLowerCase()) ||
    p.cliente_info.usuario_info.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
    p.cliente_info.usuario_info.last_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Nº Póliza',
      dataIndex: 'numero_poliza',
      key: 'numero_poliza',
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_: any, record: Poliza) => 
        `${record.cliente_info.usuario_info.first_name} ${record.cliente_info.usuario_info.last_name}`
    },
    {
      title: 'Suma Asegurada',
      dataIndex: 'suma_asegurada',
      key: 'suma',
      render: (val: string) => `$${parseFloat(val).toLocaleString()}`
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        let color = 'default';
        if (estado === 'activa') color = 'green';
        if (estado === 'vencida') color = 'red';
        if (estado === 'cotizacion') color = 'orange';
        return <Tag color={color}>{estado.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Poliza) => (
        <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => message.info("Detalle de póliza para agente en construcción")}
        >
            Ver Detalle
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Mis Pólizas</Title>
      </div>
        <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/agente-polizas/crear')}
                  style={{ marginBottom: 16, fontFamily: 'Michroma, sans-serif' }}
                >
                  Crear Nueva Póliza
        </Button>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table 
            dataSource={filteredPolizas} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
        />
      </Card>
    </div>
  );
};

export default AgenteListarPolizasPage;