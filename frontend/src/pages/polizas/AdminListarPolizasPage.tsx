// en frontend/src/pages/polizas/AdminListarPolizasPage.tsx - VERSIÓN ACTUALIZADA
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, message, Space, Tag, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/authService';

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
      const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
      setPolizas(response.data);
      
    } catch (error: any) {
      console.error('Error al cargar pólizas:', error);
      message.error('Error al cargar la lista de pólizas.');
    } finally {
      setLoading(false);
    }
  };

  // --- Función para activar una póliza ---
  const activarPoliza = async (polizaId: number) => {
    try {
      const token = authService.getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.patch(`http://127.0.0.1:8000/api/polizas/${polizaId}/activar/`, {}, { headers });
      message.success('Póliza activada correctamente');
      fetchPolizas(); // Recargar lista
    } catch (error: any) {
      console.error('Error al activar póliza:', error);
      if (error.response?.data?.error) {
        message.error(`Error: ${error.response.data.error}`);
      } else {
        message.error('Error al activar la póliza');
      }
    }
  };

  // --- Función para cancelar una póliza ---
  const cancelarPoliza = async (polizaId: number) => {
    try {
      const token = authService.getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.patch(`http://127.0.0.1:8000/api/polizas/${polizaId}/cancelar/`, {}, { headers });
      message.success('Póliza cancelada correctamente');
      fetchPolizas(); // Recargar lista
    } catch (error: any) {
      console.error('Error al cancelar póliza:', error);
      if (error.response?.data?.error) {
        message.error(`Error: ${error.response.data.error}`);
      } else {
        message.error('Error al cancelar la póliza');
      }
    }
  };

  // --- Función para reportar siniestro desde una póliza ---
  const reportarSiniestro = (polizaId: number) => {
    navigate(`/admin-polizas/${polizaId}/reportar-siniestro`);
  };

  // Carga las pólizas una vez al montar la página
  useEffect(() => {
    fetchPolizas();
  }, []);

  // --- Columnas para la Tabla de Pólizas ---
  const columns = [
    {
      title: 'Nº de Póliza',
      dataIndex: 'numero_poliza',
      key: 'numero_poliza',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_info',
      key: 'cliente',
      render: (cliente_info: Poliza['cliente_info']) => 
        `${cliente_info.usuario_info.first_name} ${cliente_info.usuario_info.last_name}`
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        let color = 'geekblue';
        let text = estado.toUpperCase();
        
        if (estado === 'activa') {
          color = 'green';
          text = 'ACTIVA';
        } else if (estado === 'vencida') {
          color = 'volcano';
          text = 'VENCIDA';
        } else if (estado === 'cotizacion') {
          color = 'orange';
          text = 'COTIZACIÓN';
        } else if (estado === 'cancelada') {
          color = 'red';
          text = 'CANCELADA';
        } else if (estado === 'inactiva') {
          color = 'grey';
          text = 'INACTIVA';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Suma Asegurada',
      dataIndex: 'suma_asegurada',
      key: 'suma_asegurada',
      render: (monto: string) => `$${parseFloat(monto).toLocaleString('es-ES')}`
    },
    {
      title: 'Vencimiento',
      dataIndex: 'fecha_vencimiento',
      key: 'fecha_vencimiento',
      render: (fecha: string) => new Date(fecha).toLocaleDateString('es-ES')
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Poliza) => (
        <Space size="middle">
          {/* Botón Ver Detalles - Siempre visible */}
          <Tooltip title="Ver detalles de la póliza">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/admin-polizas/${record.id}`)}
              size="small"
            >
              Ver
            </Button>
          </Tooltip>

          {/* Botón Reportar Siniestro - Solo para pólizas activas */}
          {record.estado === 'activa' && (
            <Tooltip title="Reportar siniestro para esta póliza">
              <Button 
                type="primary" 
                danger
                icon={<ExclamationCircleOutlined />}
                onClick={() => reportarSiniestro(record.id)}
                size="small"
              >
                Reportar Siniestro
              </Button>
            </Tooltip>
          )}

          {/* Botones específicos por estado */}
          {record.estado === 'cotizacion' && (
            <>
              <Tooltip title="Activar póliza">
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => activarPoliza(record.id)}
                  size="small"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Activar
                </Button>
              </Tooltip>
              
              <Popconfirm
                title="¿Estás seguro de cancelar esta póliza?"
                description="Esta acción no se puede deshacer."
                onConfirm={() => cancelarPoliza(record.id)}
                okText="Sí, cancelar"
                cancelText="No"
                okType="danger"
              >
                <Tooltip title="Cancelar póliza">
                  <Button 
                    danger 
                    icon={<CloseCircleOutlined />}
                    size="small"
                  >
                    Cancelar
                  </Button>
                </Tooltip>
              </Popconfirm>
            </>
          )}

          {record.estado === 'activa' && (
            <Tag color="green" style={{ padding: '4px 8px', fontSize: '12px' }}>
              ⚡ Activa
            </Tag>
          )}

          {record.estado === 'vencida' && (
            <Tooltip title="Renovar póliza vencida">
              <Button 
                type="dashed" 
                size="small"
                onClick={() => message.info('Funcionalidad de renovación en desarrollo')}
              >
                Renovar
              </Button>
            </Tooltip>
          )}

          {record.estado === 'cancelada' && (
            <Tag color="red" style={{ padding: '4px 8px', fontSize: '12px' }}>
              ❌ Cancelada
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  // --- Renderizado Visual ---
  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Title level={2} style={{fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>
          Gestión de Pólizas
        </Title>
        
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin-polizas/crear')}
            style={{ fontFamily: 'Michroma, sans-serif'}}
          >
            Crear Nueva Póliza
          </Button>
          
          <Button
            type="default"
            icon={<ExclamationCircleOutlined />}
            onClick={() => navigate('/admin-siniestros/reportar')}
            style={{ fontFamily: 'Michroma, sans-serif'}}
          >
            Reportar Siniestro General
          </Button>
        </Space>
        
        <Table
          columns={columns}
          dataSource={polizas}
          loading={loading}
          rowKey="id"
          bordered
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} pólizas`,
          }}
        />
      </Content>
    </Layout>
  );
};

export default AdminListarPolizasPage;