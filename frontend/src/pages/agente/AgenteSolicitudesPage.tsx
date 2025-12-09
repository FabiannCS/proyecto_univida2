// en frontend/src/pages/agente/AgenteSolicitudesPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, Card, Tag, message, Space, Modal, Descriptions, List, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

interface Solicitud {
  id: number;
  numero_poliza: string;
  suma_asegurada: string;
  prima_anual: string;
  cobertura: string;
  cliente_info: {
    usuario_info: {
      first_name: string;
      last_name: string;
      email: string;
      telefono: string;
    },
    identificacion: string;
  };
  beneficiarios: any[]; // Lista de beneficiarios
  estado: string;
}

const AgenteSolicitudesPage: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de Detalles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);

  const getToken = () => localStorage.getItem('accessToken');

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get('https://proyecto-univida2.onrender.com/api/polizas/', { headers });
      
      // Filtramos solo las que están en cotización (y opcionalmente canceladas si quieres verlas)
      const filtradas = response.data.filter((p: any) => 
          p.estado === 'cotizacion'
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

  // --- ABRIR DETALLES ---
  const handleVerDetalle = (record: Solicitud) => {
      setSelectedSolicitud(record);
      setIsModalOpen(true);
  };

  // --- ACEPTAR SOLICITUD ---
  const handleAceptar = async (polizaId: number) => {
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          await axios.patch(`https://proyecto-univida2.onrender.com/api/polizas/${polizaId}/`, {
              estado: 'pendiente_pago', // Pasa a pendiente de pago (y genera factura en backend)
          }, { headers });

          message.success('¡Solicitud aceptada! Se ha generado la factura.');
          setIsModalOpen(false); // Cierra el modal si estaba abierto
          fetchSolicitudes(); // Recargar la lista

      } catch (error) {
          message.error('Error al aceptar la solicitud');
      }
  };

  // --- RECHAZAR SOLICITUD ---
  const handleRechazar = async (polizaId: number) => {
      if(!window.confirm("¿Seguro que deseas rechazar esta solicitud?")) return;
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          await axios.patch(`https://proyecto-univida2.onrender.com/api/polizas/${polizaId}/`, {
              estado: 'rechazada', 
          }, { headers });

          message.info('Solicitud rechazada.');
          setIsModalOpen(false);
          fetchSolicitudes();

      } catch (error) {
          message.error('Error al rechazar');
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
      render: () => <Tag color="orange">NUEVA SOLICITUD</Tag>
    },
    {
      title: 'Acciones', key: 'acc',
      render: (_: any, record: Solicitud) => (
        <Space>
            <Button 
                type="primary" 
                size="small"
                icon={<CheckCircleOutlined />} 
                onClick={() => handleAceptar(record.id)}
            >
                Aceptar
            </Button>
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleVerDetalle(record)}>Ver</Button>
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

      {/* --- MODAL DE DETALLES --- */}
      <Modal
        title={`Detalle de Solicitud #${selectedSolicitud?.numero_poliza}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={[
            <Button key="rechazar" danger onClick={() => selectedSolicitud && handleRechazar(selectedSolicitud.id)}>
                Rechazar
            </Button>,
            <Button key="cancelar" onClick={() => setIsModalOpen(false)}>
                Cerrar
            </Button>,
            <Button key="aceptar" type="primary" onClick={() => selectedSolicitud && handleAceptar(selectedSolicitud.id)}>
                Aceptar Solicitud
            </Button>
        ]}
      >
        {selectedSolicitud && (
            <>
                <Descriptions title="Datos del Cliente" bordered size="small" column={2}>
                    <Descriptions.Item label="Nombre">
                        {selectedSolicitud.cliente_info.usuario_info.first_name} {selectedSolicitud.cliente_info.usuario_info.last_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="CI/DNI">
                        {selectedSolicitud.cliente_info.identificacion}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {selectedSolicitud.cliente_info.usuario_info.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Teléfono">
                        {selectedSolicitud.cliente_info.usuario_info.telefono}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions title="Detalles del Seguro" bordered size="small" column={1}>
                    <Descriptions.Item label="Plan / Cobertura">
                        {selectedSolicitud.cobertura}
                    </Descriptions.Item>
                    <Descriptions.Item label="Suma Asegurada">
                        ${parseFloat(selectedSolicitud.suma_asegurada).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Prima Anual Estimada">
                        ${parseFloat(selectedSolicitud.prima_anual).toLocaleString()}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Beneficiarios Declarados</Divider>
                <List
                    size="small"
                    dataSource={selectedSolicitud.beneficiarios}
                    renderItem={(item: any) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<UserOutlined />}
                                title={item.nombre_completo}
                                description={`Parentesco: ${item.parentesco} - Porcentaje: ${item.porcentaje}%`}
                            />
                        </List.Item>
                    )}
                />
            </>
        )}
      </Modal>

    </div>
  );
};

export default AgenteSolicitudesPage;