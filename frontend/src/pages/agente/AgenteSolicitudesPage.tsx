import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, Card, Tag, message, Space, Tabs, Popconfirm } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

interface Solicitud {
  id: number;
  numero_poliza: string;
  suma_asegurada: string;
  cliente_info: {
    usuario_info: {
      first_name: string;
      last_name: string;
    }
  };
  estado: string;
}

const AgenteSolicitudesPage: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
      
      // FILTRO 1: Aquí solo mostramos lo que es "Entrada" (Cotizaciones y Canceladas por cliente)
      // NO mostramos activas ni rechazadas aquí.
      const filtradas = response.data.filter((p: any) => 
          p.estado === 'cotizacion' || p.estado === 'cancelada'
      );
      setSolicitudes(filtradas);

    } catch (error) {
      console.error(error);
      message.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  // --- CAMBIAR ESTADO (Aceptar o Rechazar) ---
  const cambiarEstado = async (polizaId: number, nuevoEstado: string) => {
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          await axios.patch(`http://127.0.0.1:8000/api/polizas/${polizaId}/`, {
              estado: nuevoEstado, 
              // El backend asignará el agente automáticamente al guardar
          }, { headers });

          message.success(`Solicitud ${nuevoEstado === 'pendiente_pago' ? 'aceptada' : 'rechazada'} correctamente.`);
          fetchSolicitudes(); // Recargar la lista (la póliza desaparecerá de esta vista)

      } catch (error) {
          message.error('Error al procesar la solicitud');
      }
  };

  const columns = [
    { title: 'Nº Solicitud', dataIndex: 'numero_poliza', key: 'num' },
    { 
      title: 'Cliente', key: 'cli', 
      render: (_:any, r:Solicitud) => `${r.cliente_info.usuario_info.first_name} ${r.cliente_info.usuario_info.last_name}` 
    },
    { title: 'Monto', dataIndex: 'suma_asegurada', key: 'monto', render: (m:string) => `$${parseFloat(m).toLocaleString()}` },
    { 
      title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: (e: string) => <Tag color={e === 'cotizacion' ? 'orange' : 'red'}>{e.toUpperCase()}</Tag>
    },
    {
      title: 'Acciones', key: 'acc',
      render: (_: any, record: Solicitud) => (
        record.estado === 'cotizacion' ? (
            <Space>
                <Button 
                    type="primary" 
                    size="small"
                    icon={<CheckCircleOutlined />} 
                    onClick={() => cambiarEstado(record.id, 'pendiente_pago')} // Aceptar -> Pendiente Pago
                >
                    Aceptar
                </Button>
                
                <Popconfirm 
                    title="¿Rechazar esta solicitud?" 
                    onConfirm={() => cambiarEstado(record.id, 'rechazada')} // Rechazar -> Rechazada
                    okText="Sí, Rechazar" cancelText="Cancelar"
                >
                    <Button size="small" danger icon={<CloseCircleOutlined />}>Rechazar</Button>
                </Popconfirm>
            </Space>
        ) : (
            <span>Cancelada por Cliente</span>
        )
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ fontFamily: "'Michroma', sans-serif" }}>Bandeja de Solicitudes</Title>
      <Card bordered={false}>
        <Table dataSource={solicitudes} columns={columns} rowKey="id" loading={loading} />
      </Card>
    </div>
  );
};

export default AgenteSolicitudesPage;