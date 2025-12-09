// en frontend/src/pages/polizas/AdminListarPolizasPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, message, Space, Tag, Popconfirm, Tooltip, Input, Tabs } from 'antd';
import { 
    PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, 
    ExclamationCircleOutlined, SearchOutlined, FileProtectOutlined, 
    StopOutlined, CloseSquareOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Title } = Typography;

interface Poliza {
  id: number;
  numero_poliza: string;
  cliente_info: {
    usuario_info: {
      first_name: string;
      last_name: string;
    }
  };
  estado: string;
  suma_asegurada: string;
  fecha_vencimiento: string;
}

const AdminListarPolizasPage: React.FC = () => {
  const navigate = useNavigate();
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

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
      const response = await axios.get('https://proyecto-univida2.onrender.com/api/polizas/', { headers });
      
      const polizasReales = response.data.filter((p: any) => p.estado !== 'cotizacion');
      setPolizas(polizasReales);
      
    } catch (error: any) {
      console.error('Error al cargar pólizas:', error);
      message.error('Error al cargar la lista.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolizas();
  }, []);

  // --- Acciones ---
  const activarPoliza = async (polizaId: number) => {
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`https://proyecto-univida2.onrender.com/api/polizas/${polizaId}/`, { estado: 'activa' }, { headers });
      message.success('Póliza activada correctamente');
      fetchPolizas();
    } catch (error) { message.error('Error al activar'); }
  };

  const cancelarPoliza = async (polizaId: number) => {
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`https://proyecto-univida2.onrender.com/api/polizas/${polizaId}/`, { estado: 'cancelada' }, { headers });
      message.success('Póliza cancelada correctamente');
      fetchPolizas();
    } catch (error) { message.error('Error al cancelar'); }
  };

  // --- NUEVA FUNCIÓN: DESACTIVAR PÓLIZA ---
  const desactivarPoliza = async (polizaId: number) => {
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`https://proyecto-univida2.onrender.com/api/polizas/${polizaId}/`, { estado: 'inactiva' }, { headers });
      message.success('Póliza desactivada (Inactiva)');
      fetchPolizas();
    } catch (error) { message.error('Error al desactivar'); }
  };
  // ----------------------------------------

  const reportarSiniestro = (polizaId: number) => {
    navigate('/admin-siniestros/reportar'); 
  };

  // Filtro de búsqueda visual
  const getFilteredData = (data: Poliza[]) => {
      return data.filter(p => 
        p.numero_poliza.toLowerCase().includes(searchText.toLowerCase()) ||
        p.cliente_info?.usuario_info?.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.cliente_info?.usuario_info?.last_name.toLowerCase().includes(searchText.toLowerCase())
      );
  };

  // --- Columnas ---
  const columns = [
    { title: 'Nº de Póliza', dataIndex: 'numero_poliza', key: 'numero_poliza' },
    { 
        title: 'Cliente', 
        key: 'cliente',
        render: (_: any, r: Poliza) => r.cliente_info?.usuario_info ? `${r.cliente_info.usuario_info.first_name} ${r.cliente_info.usuario_info.last_name}` : 'Sin Cliente'
    },
    { 
        title: 'Estado', dataIndex: 'estado', key: 'estado',
        render: (e: string) => {
            let color = 'default';
            if (e === 'activa') color = 'green';
            if (e === 'pendiente_pago') color = 'gold';
            if (e === 'cancelada') color = 'red';
            if (e === 'rechazada') color = 'volcano';
            if (e === 'vencida') color = 'orange';
            if (e === 'inactiva') color = 'grey';
            return <Tag color={color}>{e.toUpperCase().replace('_', ' ')}</Tag>;
        }
    },
    { title: 'Suma Asegurada', dataIndex: 'suma_asegurada', render: (v: string) => `$${parseFloat(v).toLocaleString('es-ES')}` },
    { title: 'Vencimiento', dataIndex: 'fecha_vencimiento', render: (v: string) => v || 'N/A' },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Poliza) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button icon={<EyeOutlined />} onClick={() => navigate(`/admin-polizas/${record.id}`)} size="small" />
          </Tooltip>

          {/* Botones para Pólizas Activas */}
          {record.estado === 'activa' && (
             <>
                <Tooltip title="Reportar Siniestro">
                    <Button danger icon={<ExclamationCircleOutlined />} onClick={() => reportarSiniestro(record.id)} size="small" />
                </Tooltip>
                
                {/* --- BOTÓN DESACTIVAR (NUEVO) --- */}
                <Popconfirm title="¿Desactivar esta póliza?" description="Pasará a estado Inactivo." onConfirm={() => desactivarPoliza(record.id)}>
                    <Tooltip title="Desactivar Póliza">
                        <Button icon={<StopOutlined />} size="small" style={{ color: '#faad14', borderColor: '#faad14' }} />
                    </Tooltip>
                </Popconfirm>
                {/* ------------------------------- */}
             </>
          )}

          {/* Botones para Pólizas Pendientes */}
          {record.estado === 'pendiente_pago' && (
            <>
              <Tooltip title="Forzar Activación">
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => activarPoliza(record.id)} size="small" style={{ background: '#52c41a', borderColor: '#52c41a' }} />
              </Tooltip>
              <Popconfirm title="¿Cancelar?" onConfirm={() => cancelarPoliza(record.id)}>
                <Button danger icon={<CloseCircleOutlined />} size="small" />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Listas filtradas para las pestañas
  const polizasActivas = polizas.filter(p => ['activa', 'pendiente_pago'].includes(p.estado));
  const polizasInactivas = polizas.filter(p => ['cancelada', 'vencida', 'inactiva'].includes(p.estado));
  const polizasRechazadas = polizas.filter(p => p.estado === 'rechazada');

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>Gestión de Pólizas</Title>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin-polizas/crear')}
                style={{ fontFamily: 'Michroma, sans-serif'}}
            >
                Crear Nueva Póliza
            </Button>

            <Input 
                prefix={<SearchOutlined />} 
                placeholder="Buscar póliza..." 
                style={{ width: 300 }}
                onChange={e => setSearchText(e.target.value)}
            />
        </div>
        
        <Tabs defaultActiveKey="1" type="card" items={[
            {
                key: '1',
                label: (<span><FileProtectOutlined /> Activas ({polizasActivas.length})</span>),
                children: <Table dataSource={getFilteredData(polizasActivas)} columns={columns} rowKey="id" loading={loading} bordered pagination={{ pageSize: 10 }} />
            },
            {
                key: '2',
                label: (<span><StopOutlined /> Inactivas / Canceladas ({polizasInactivas.length})</span>),
                children: <Table dataSource={getFilteredData(polizasInactivas)} columns={columns} rowKey="id" loading={loading} bordered pagination={{ pageSize: 10 }} />
            },
            {
                key: '3',
                label: (<span><CloseSquareOutlined /> Rechazadas ({polizasRechazadas.length})</span>),
                children: <Table dataSource={getFilteredData(polizasRechazadas)} columns={columns} rowKey="id" loading={loading} bordered pagination={{ pageSize: 10 }} />
            }
        ]} />

      </Content>
    </Layout>
  );
};

export default AdminListarPolizasPage;