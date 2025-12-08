// en frontend/src/pages/polizas/AdminSolicitudesPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, Card, Tag, message, Space, Modal, Select, Avatar } from 'antd';
import { UserAddOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminSolicitudesPage: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [agentes, setAgentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de Asignación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [selectedAgente, setSelectedAgente] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const navigate = useNavigate();
  const getToken = () => localStorage.getItem('accessToken');

  // 1. Cargar Datos
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Cargar Pólizas
      const resPolizas = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
      // Filtrar solo las que están en cotización (sin asignar o pendientes)
      const pendientes = resPolizas.data.filter((p: any) => p.estado === 'cotizacion');
      setSolicitudes(pendientes);

      // Cargar Agentes (para el select)
      const resAgentes = await axios.get('http://127.0.0.1:8000/api/agentes/', { headers });
      // Filtramos solo agentes activos
      const agentesActivos = resAgentes.data.filter((a: any) => a.estado === 'activo');
      setAgentes(agentesActivos);

    } catch (error) {
      message.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Abrir Modal
  const handleOpenAssign = (record: any) => {
      setSelectedSolicitud(record);
      setSelectedAgente(null);
      setIsModalOpen(true);
  };

  // 3. Ejecutar Asignación
  const handleAsignar = async () => {
      if (!selectedAgente || !selectedSolicitud) return;
      
      setAssignLoading(true);
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          await axios.patch(`http://127.0.0.1:8000/api/polizas/${selectedSolicitud.id}/`, {
              estado: 'pendiente_pago', // Al asignar, la aceptamos y generamos factura
              agente: selectedAgente    // Enviamos el ID del agente seleccionado
          }, { headers });

          message.success('Agente asignado y solicitud aceptada correctamente.');
          setIsModalOpen(false);
          fetchData(); // Recargar lista

      } catch (error) {
          message.error('Error al asignar agente.');
          console.error(error);
      } finally {
          setAssignLoading(false);
      }
  };

  const columns = [
    { title: 'Nº Solicitud', dataIndex: 'numero_poliza', key: 'num' },
    { 
        title: 'Cliente', key: 'cli', 
        render: (_:any, r:any) => (
            <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{r.cliente_info.usuario_info.first_name} {r.cliente_info.usuario_info.last_name}</span>
            </Space>
        )
    },
    { title: 'Plan', dataIndex: 'cobertura', key: 'plan', render: (c:string) => c ? c.split('.')[0] : 'N/A' },
    { title: 'Monto', dataIndex: 'suma_asegurada', render: (v:string) => `$${parseFloat(v).toLocaleString()}` },
    { 
        title: 'Estado', dataIndex: 'estado', 
        render: () => <Tag color="orange">POR ASIGNAR</Tag>
    },
    {
        title: 'Acciones', key: 'acc',
        render: (_:any, record: any) => (
            <Space>
                <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/admin-polizas/${record.id}`)}>Ver</Button>
                <Button type="primary" size="small" icon={<UserAddOutlined />} onClick={() => handleOpenAssign(record)}>Asignar Agente</Button>
            </Space>
        )
    }
  ];

  return (
    <div>
      <Title level={2} style={{ fontFamily: "'Michroma', sans-serif" }}>Solicitudes Entrantes</Title>
      
      <Card bordered={false} style={{ marginTop: 20 }}>
        <Table 
            dataSource={solicitudes} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
            locale={{ emptyText: 'No hay solicitudes pendientes' }}
        />
      </Card>

      {/* MODAL DE ASIGNACIÓN */}
      <Modal
        title="Asignar Agente a Solicitud"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAsignar}
        confirmLoading={assignLoading}
        okText="Confirmar Asignación"
      >
        <p>Selecciona el agente que se hará cargo de la póliza <strong>{selectedSolicitud?.numero_poliza}</strong>.</p>
        <p>Esto aceptará la solicitud, vinculará al cliente con el agente y generará la primera factura.</p>
        
        <div style={{ marginTop: 20 }}>
            <Text strong>Seleccionar Agente:</Text>
            <Select 
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Busca un agente..."
                showSearch
                optionFilterProp="children"
                onChange={(value) => setSelectedAgente(value)}
            >
                {agentes.map(agente => (
                    <Option key={agente.id} value={agente.id}>
                        {agente.first_name} {agente.last_name} ({agente.codigo_agente})
                    </Option>
                ))}
            </Select>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSolicitudesPage;