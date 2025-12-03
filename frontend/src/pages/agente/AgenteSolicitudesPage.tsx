// en frontend/src/pages/agente/AgenteSolicitudesPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, Card, Tag, message, Space } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const { Title } = Typography;

interface Solicitud {
  id: number;
  numero_poliza: string;
  suma_asegurada: string;
  cliente_info: {
    usuario_info: {
      first_name: string;
      last_name: string;
      email: string;
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
      
      // 1. Pedimos TODAS las pólizas
      // (Tu compañero debería crear un endpoint filtrado: /api/polizas/pendientes/)
      const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
      
      // 2. Filtramos en el frontend: Solo estado 'cotizacion'
      const pendientes = response.data.filter((p: any) => p.estado === 'cotizacion');
      setSolicitudes(pendientes);

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

  // --- FUNCIÓN PARA ACEPTAR SOLICITUD ---
  const handleAceptar = async (polizaId: number) => {
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };

          // 1. Necesitamos saber el ID del Agente actual
          // (Esto es un truco temporal, lo ideal es que el backend lo sepa por el token)
          const decoded: any = jwtDecode(token!);
          // Vamos a suponer que el backend es inteligente y si mandamos agente_id lo asigna
          // O mejor: Enviamos solo el cambio de estado y el backend asigna al "request.user.agente"
          
          await axios.patch(`http://127.0.0.1:8000/api/polizas/${polizaId}/`, {
              estado: 'activa', // Cambiamos estado a ACTIVA
              // agente: ID_DEL_AGENTE (Tu backend debe manejar esto)
          }, { headers });

          message.success('¡Solicitud aceptada! Cliente asignado a tu cartera.');
          fetchSolicitudes(); // Recargar la lista

      } catch (error) {
          console.error(error);
          message.error('Error al aceptar la solicitud');
      }
  };

  const columns = [
    {
      title: 'Nº Solicitud',
      dataIndex: 'numero_poliza',
      key: 'numero_poliza',
    },
    {
      title: 'Cliente',
      key: 'cliente',
      render: (_: any, record: Solicitud) => 
        `${record.cliente_info.usuario_info.first_name} ${record.cliente_info.usuario_info.last_name}`
    },
    {
      title: 'Monto Solicitado',
      dataIndex: 'suma_asegurada',
      key: 'suma',
      render: (m: string) => `$${parseFloat(m).toLocaleString()}`
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: () => <Tag color="orange">PENDIENTE</Tag>
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Solicitud) => (
        <Space>
            <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handleAceptar(record.id)}
            >
                Aceptar
            </Button>
            <Button icon={<EyeOutlined />}>Ver</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ fontFamily: "'Michroma', sans-serif" }}>Bandeja de Solicitudes</Title>
      <Card bordered={false}>
        <Table 
            dataSource={solicitudes} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
            locale={{ emptyText: 'No hay nuevas solicitudes pendientes' }}
        />
      </Card>
    </div>
  );
};

export default AgenteSolicitudesPage;