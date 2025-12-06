// en frontend/src/pages/cliente/ClienteMisSiniestrosPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Button, Card, message, Space } from 'antd';
import { ArrowLeftOutlined, FileSearchOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title } = Typography;

interface Siniestro {
  id: number;
  numero_siniestro: string;
  tipo_siniestro: string;
  fecha_siniestro: string;
  estado: string;
  monto_reclamado: string;
  poliza_info: {
    numero_poliza: string;
    cliente_info: {
        usuario_info: {
            username: string;
        }
    }
  };
}

const ClienteMisSiniestrosPage: React.FC = () => {
  const navigate = useNavigate();
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchMisSiniestros = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) { navigate('/login'); return; }
        const headers = { Authorization: `Bearer ${token}` };
        const decodedToken: any = jwtDecode(token);
        const miUsername = decodedToken.username;

        // 1. Pedimos todos los siniestros
        const response = await axios.get('http://127.0.0.1:8000/api/siniestros/', { headers });
        
        // 2. Filtramos SOLO los de este usuario
        // (Tu backend debería hacer esto idealmente, pero lo hacemos aquí por ahora)
        const misSiniestros = response.data.filter((s: any) => 
            s.poliza_info?.cliente_info?.usuario_info?.username === miUsername
        );
        
        setSiniestros(misSiniestros);

      } catch (error) {
        console.error(error);
        message.error('Error al cargar siniestros');
      } finally {
        setLoading(false);
      }
    };
    fetchMisSiniestros();
  }, [navigate]);

  const columns = [
    {
      title: 'Nº Siniestro',
      dataIndex: 'numero_siniestro',
      key: 'numero',
    },
    {
      title: 'Póliza Afectada',
      dataIndex: ['poliza_info', 'numero_poliza'],
      key: 'poliza',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_siniestro',
      key: 'tipo',
      render: (text: string) => <span style={{ textTransform: 'capitalize' }}>{text}</span>
    },
    {
      title: 'Fecha Incidente',
      dataIndex: 'fecha_siniestro',
      key: 'fecha',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        let color = 'default';
        if (estado === 'reportado') color = 'blue';
        if (estado === 'en_revision') color = 'orange';
        if (estado === 'aprobado') color = 'green';
        if (estado === 'rechazado') color = 'red';
        if (estado === 'pagado') color = 'gold';
        return <Tag color={color}>{estado.toUpperCase().replace('_', ' ')}</Tag>;
      }
    },
    {
      title: 'Monto',
      dataIndex: 'monto_reclamado',
      key: 'monto',
      render: (val: string) => `$${parseFloat(val).toLocaleString()}`
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/mi-poliza')} shape="circle" style={{ marginRight: 16 }} />
            <Title level={2} style={{ margin: 0 }}>Mis Siniestros</Title>
        </div>
        <Button type="primary" danger icon={<WarningOutlined />} onClick={() => navigate('/reportar-siniestro')}>
            Nuevo Reporte
        </Button>
      </div>

      <Card hoverable style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table 
            dataSource={siniestros} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
            locale={{ emptyText: 'No tienes siniestros reportados' }}
        />
      </Card>
    </div>
  );
};

export default ClienteMisSiniestrosPage;