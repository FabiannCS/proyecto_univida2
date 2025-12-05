// en frontend/src/pages/agente/AgenteListarPolizasPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Button, Card, message, Input, Tabs, Space, Popconfirm, Tooltip } from 'antd';
import { EyeOutlined, SearchOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AgenteListarPolizasPage: React.FC = () => {
  const navigate = useNavigate();
  const [polizas, setPolizas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const getToken = () => localStorage.getItem('accessToken');

  const fetchMisPolizas = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
      
      // FILTRO PRINCIPAL: 
      // Excluimos 'cotizacion' y 'cancelada' (porque esas están en la Bandeja de Solicitudes)
      // Esto asegura que en "Mis Pólizas" solo veas contratos reales (activos o históricos)
      const misPolizasGestionadas = response.data.filter((p: any) => 
          p.estado !== 'cotizacion' && p.estado !== 'cancelada'
      );
      
      setPolizas(misPolizasGestionadas);

    } catch (error) {
      message.error('Error al cargar pólizas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMisPolizas(); }, []);

  // --- FUNCIÓN PARA INACTIVAR ---
  const handleInactivar = async (id: number) => {
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        await axios.patch(`http://127.0.0.1:8000/api/polizas/${id}/`, {
            estado: 'inactiva'
        }, { headers });

        message.success('Póliza inactivada correctamente');
        fetchMisPolizas(); // Recargar

    } catch (error) {
        message.error('Error al inactivar la póliza');
    }
  };

  // Filtro de búsqueda
  const getFilteredData = (data: any[]) => {
    return data.filter(p => 
        p.numero_poliza.toLowerCase().includes(searchText.toLowerCase()) ||
        p.cliente_info.usuario_info.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.cliente_info.usuario_info.last_name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const columns = [
    { title: 'Nº Póliza', dataIndex: 'numero_poliza', key: 'numero' },
    { title: 'Cliente', key: 'cliente', render: (_:any, r:any) => `${r.cliente_info.usuario_info.first_name} ${r.cliente_info.usuario_info.last_name}` },
    { title: 'Suma', dataIndex: 'suma_asegurada', render: (v:string) => `$${parseFloat(v).toLocaleString()}` },
    { 
        title: 'Estado', dataIndex: 'estado', 
        render: (estado: string) => {
            let color = 'default';
            if (estado === 'activa') color = 'green';
            if (estado === 'pendiente_pago') color = 'gold';
            if (estado === 'rechazada') color = 'red';
            if (estado === 'inactiva') color = 'gray';
            if (estado === 'vencida') color = 'volcano';
            return <Tag color={color}>{estado.toUpperCase().replace('_', ' ')}</Tag>;
        }
    },
    {
        title: 'Acciones', key: 'act',
        render: (_:any, record: any) => (
            <Space>
                <Tooltip title="Ver Detalles Completos">
                    <Button 
                        size="small" 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate(`/agente-polizas/${record.id}`)}
                    >
                      Ver Detalles
                    </Button>
                </Tooltip>
                
                {/* Botón Inactivar solo si está activa o pendiente */}
                {(record.estado === 'activa' || record.estado === 'pendiente_pago') && (
                    <Popconfirm title="¿Inactivar esta póliza?" onConfirm={() => handleInactivar(record.id)}>
                        <Button size="small" danger icon={<StopOutlined />}>Inactivar</Button>
                    </Popconfirm>
                )}
            </Space>
        )
    }
  ];

  // --- CLASIFICACIÓN DE PESTAÑAS (Lógica Corregida) ---
  
  // 1. Gestionadas: Lo que está vivo o en proceso de cobro
  const polizasGestionadas = polizas.filter(p => p.estado === 'activa' || p.estado === 'pendiente_pago');
  
  // 2. Inactivas: Solo VENCIDAS o INACTIVAS manualmente. 
  // (Excluimos 'cancelada' explícitamente aquí, aunque ya lo filtramos en el fetch)
  const polizasInactivas = polizas.filter(p => ['inactiva', 'vencida'].includes(p.estado));
  
  // 3. Rechazadas: Solo las que el agente rechazó explícitamente
  const polizasRechazadas = polizas.filter(p => p.estado === 'rechazada');


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Mis Pólizas</Title>
        <div style={{ display: 'flex', gap: '10px' }}>
            <Input placeholder="Buscar..." prefix={<SearchOutlined />} onChange={e => setSearchText(e.target.value)} style={{ width: 250 }}/>
            <Button style={{fontFamily: 'Michroma, sans-serif'}} type="primary" icon={<PlusOutlined />} onClick={() => navigate('/agente-polizas/crear')}>Emitir Póliza</Button>
        </div>
      </div>

      <Card bordered={false}>
        <Tabs defaultActiveKey="1" items={[
            {
                key: '1',
                label: `Gestionadas (${polizasGestionadas.length})`,
                children: <Table dataSource={getFilteredData(polizasGestionadas)} columns={columns} rowKey="id" loading={loading} />
            },
            {
                key: '2',
                label: `Histórico Inactivas (${polizasInactivas.length})`,
                children: <Table dataSource={getFilteredData(polizasInactivas)} columns={columns} rowKey="id" loading={loading} />
            },
            {
                key: '3',
                label: `Rechazadas (${polizasRechazadas.length})`,
                children: <Table dataSource={getFilteredData(polizasRechazadas)} columns={columns} rowKey="id" loading={loading} />
            }
        ]} />
      </Card>
    </div>
  );
};

export default AgenteListarPolizasPage;