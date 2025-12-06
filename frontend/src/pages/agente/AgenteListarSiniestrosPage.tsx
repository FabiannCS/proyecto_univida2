// en frontend/src/pages/agente/AgenteListaSiniestroPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Button, Card, message, Input } from 'antd';
import { SearchOutlined, EyeOutlined, WarningOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AgenteListaSiniestroPage: React.FC = () => {
  const [siniestros, setSiniestros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchSiniestros = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Obtenemos los siniestros
        const response = await axios.get('http://127.0.0.1:8000/api/siniestros/', { headers });
        setSiniestros(response.data);

      } catch (error) {
        message.error('Error al cargar siniestros');
      } finally {
        setLoading(false);
      }
    };
    fetchSiniestros();
  }, []);

  // Filtro de búsqueda
  const filteredData = siniestros.filter(s => 
    s.numero_siniestro.toLowerCase().includes(searchText.toLowerCase()) ||
    s.poliza_info?.cliente_info?.usuario_info?.first_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Nº Siniestro', dataIndex: 'numero_siniestro', key: 'num' },
    { 
        title: 'Cliente / Póliza', 
        key: 'cli', 
        render: (_:any, r:any) => (
            <div>
                <span style={{fontWeight: 'bold'}}>
                    {r.poliza_info?.cliente_info?.usuario_info?.first_name} {r.poliza_info?.cliente_info?.usuario_info?.last_name}
                </span>
                <br/>
                <span style={{fontSize: '12px', color: '#888'}}>Pol: {r.poliza_info?.numero_poliza}</span>
            </div>
        )
    },
    { 
        title: 'Tipo', 
        dataIndex: 'tipo_siniestro', 
        key: 'tipo',
        render: (t: string) => <Tag>{t ? t.toUpperCase() : 'N/A'}</Tag>
    },
    { 
        title: 'Estado', dataIndex: 'estado', key: 'estado',
        render: (e: string) => {
            let color = 'default';
            if (e === 'reportado') color = 'blue';
            if (e === 'aprobado') color = 'green';
            if (e === 'rechazado') color = 'red';
            return <Tag color={color}>{e ? e.toUpperCase().replace('_', ' ') : 'N/A'}</Tag>;
        }
    },
    { title: 'Monto Reclamado', dataIndex: 'monto_reclamado', render: (v:string) => `$${parseFloat(v).toLocaleString()}` },
    {
        title: 'Acciones', key: 'act',
        render: (_:any, r:any) => (
            // Este botón nos llevará a la página de detalle
            <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/agente-siniestros/${r.id}`)}>
                Ver
            </Button>
        )
    }
  ];

  return (
    <div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Siniestros de mi Cartera</Title>
        <Input 
            placeholder="Buscar por cliente o siniestro..." 
            prefix={<SearchOutlined />} 
            onChange={e => setSearchText(e.target.value)} 
            style={{ width: 300 }}
        />
        {/* --- BOTÓN NUEVO --- */}
            <Button 
                style={{fontFamily: 'Michroma, sans-serif'}}
                type="primary" 
                danger 
                icon={<WarningOutlined />} 
                onClick={() => navigate('/agente-siniestros/crear')}
            >
                Reportar Siniestro
            </Button>
            {/* ------------------- */}
      </div>

      <Card hoverable>
        <Table 
            dataSource={filteredData} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
            locale={{ emptyText: 'No hay siniestros reportados' }}
        />
      </Card>
    </div>
  );
};

export default AgenteListaSiniestroPage;