// en frontend/src/pages/siniestros/AdminDetalleSiniestroPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Spin, message, Descriptions, Table, Tag, Button, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

// --- Definición de Interfaces (basadas en tu serializers.txt) ---
// (Estas interfaces podrían estar en un archivo centralizado "types.ts" más adelante)

interface Beneficiario {
  id: number;
  nombre_completo: string;
  parentesco: string;
  porcentaje: string;
}

interface SiniestroDetalle {
  id: number;
  numero_siniestro: string;
  tipo_siniestro: string;
  estado: string;
  monto_reclamado: string;
  monto_aprobado: string | null;
  fecha_siniestro: string;
  fecha_reporte: string;
  descripcion: string;
  resolucion: string | null;
  poliza_info: {
    id: number;
    numero_poliza: string;
    estado: string;
    suma_asegurada: string;
    cliente_info: {
      id: number;
      identificacion: string;
      usuario_info: {
        first_name: string;
        last_name: string;
        email: string;
      }
    };
    beneficiarios: Beneficiario[]; // Array de beneficiarios
  };
}

const AdminDetalleSiniestroPage: React.FC = () => {
  const [siniestro, setSiniestro] = useState<SiniestroDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Estado para botones de acción
  const { id } = useParams<{ id: string }>(); // Obtiene el ID del siniestro desde la URL
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  // --- Carga los datos del Siniestro (GET) ---
  const fetchSiniestroDetalle = async () => {
    if (!id) {
      message.error('No se especificó un ID de siniestro.');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      // Llama al endpoint de detalle de siniestro (de tu urls.py)
      const response = await axios.get(`http://127.0.0.1:8000/api/siniestros/${id}/`, { headers });
      setSiniestro(response.data);
      
    } catch (error: any) {
      console.error('Error al cargar el siniestro:', error);
      message.error('Error al cargar los detalles del siniestro.');
    } finally {
      setLoading(false);
    }
  };

  // Carga los datos al montar la página
  useEffect(() => {
    fetchSiniestroDetalle();
  }, [id]);

  // --- FUNCIÓN PARA APROBAR / RECHAZAR (PATCH) ---
  const handleUpdateEstado = async (nuevoEstado: 'aprobado' | 'rechazado') => {
    setActionLoading(true);
    try {
      const token = getToken();
      if (!token || !siniestro) {
        message.error('Error de autenticación o siniestro no cargado.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Tu compañero de backend debe asegurarse de que la vista 'detalle_siniestro'
      // también acepte peticiones PATCH para actualizar el estado.
      // (Esto es un estándar común en Django REST Framework)
      const dataToUpdate = {
        estado: nuevoEstado
        // Opcional: El backend podría requerir un 'monto_aprobado' si el estado es 'aprobado'
      };

      await axios.patch(`http://127.0.0.1:8000/api/siniestros/${id}/`, dataToUpdate, { headers });

      message.success(`Siniestro ${nuevoEstado} exitosamente.`);
      // Vuelve a cargar los datos para mostrar el estado actualizado
      fetchSiniestroDetalle(); 

    } catch (error: any) {
      console.error(`Error al ${nuevoEstado} el siniestro:`, error);
      message.error(`Error al ${nuevoEstado} el siniestro.`);
    } finally {
      setActionLoading(false);
    }
  };


  // --- Columnas para la Tabla de Beneficiarios ---
  const beneficiarioColumns = [
    { title: 'Nombre Completo', dataIndex: 'nombre_completo', key: 'nombre_completo' },
    { title: 'Parentesco', dataIndex: 'parentesco', key: 'parentesco' },
    { title: 'Porcentaje', dataIndex: 'porcentaje', key: 'porcentaje', render: (p: string) => `${p}%` },
  ];

  // Muestra un spinner mientras carga
  if (loading) {
    return (
      <Layout style={{ padding: '50px', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  if (!siniestro) {
    return (
      <Layout style={{ padding: '5px' }}>
        <Content style={{padding: '15px'}}>
                <Button
                    type="default" // O "ghost" para que sea más sutil
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)} // <-- ¡LA MAGIA! -1 significa "ir atrás"
                    style={{ marginBottom: '10px', fontFamily: 'Michroma, sans-serif'}}
                    >
                    Volver
                </Button>
            <Title level={2} style={{marginBottom: '24px',textAlign: 'center', fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>Siniestro no encontrado</Title></Content>
      </Layout>
    );
  }

  // --- Renderizado Visual ---
  return (
    <Layout>
      <Content>
        {/* --- Botones de Acción --- */}
        <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Revisión Siniestro: {siniestro.numero_siniestro}
          </Title>
          <Space>
            <Button 
              type="primary" 
              danger 
              loading={actionLoading}
              onClick={() => handleUpdateEstado('rechazado')}
              disabled={siniestro.estado === 'rechazado' || siniestro.estado === 'pagado'}
            >
              Rechazar
            </Button>
            <Button 
              type="primary" 
              style={{ background: '#52c41a', borderColor: '#52c41a' }} // Color verde
              loading={actionLoading}
              onClick={() => handleUpdateEstado('aprobado')}
              disabled={siniestro.estado === 'aprobado' || siniestro.estado === 'pagado'}
            >
              Aprobar
            </Button>
          </Space>
        </Space>

        {/* --- Detalles del Siniestro --- */}
        <Descriptions bordered layout="vertical" column={4}>
          <Descriptions.Item label="Estado Actual" span={1}>
            <Tag color="blue">{siniestro.estado.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tipo">{siniestro.tipo_siniestro}</Descriptions.Item>
          <Descriptions.Item label="Fecha de Reporte">{new Date(siniestro.fecha_reporte).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Fecha del Siniestro">{siniestro.fecha_siniestro}</Descriptions.Item>
          <Descriptions.Item label="Monto Reclamado" span={2}>
            ${parseFloat(siniestro.monto_reclamado).toLocaleString('es-ES')}
          </Descriptions.Item>
          <Descriptions.Item label="Monto Aprobado" span={2}>
            {siniestro.monto_aprobado ? `$${parseFloat(siniestro.monto_aprobado).toLocaleString('es-ES')}` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción del Siniestro" span={4}>
            {siniestro.descripcion}
          </Descriptions.Item>
          <Descriptions.Item label="Resolución (Admin)" span={4}>
            {siniestro.resolucion || 'Aún sin resolución.'}
          </Descriptions.Item>
        </Descriptions>

        <Title level={3} style={{ marginTop: '32px', marginBottom: '16px' }}>
          Información de la Póliza Afectada
        </Title>
        
        {/* --- Detalles de la Póliza --- */}
        <Descriptions bordered layout="vertical" column={3}>
          <Descriptions.Item label="Nº Póliza">{siniestro.poliza_info.numero_poliza}</Descriptions.Item>
          <Descriptions.Item label="Cliente">
            {`${siniestro.poliza_info.cliente_info.usuario_info.first_name} ${siniestro.poliza_info.cliente_info.usuario_info.last_name}`}
          </Descriptions.Item>
          <Descriptions.Item label="Suma Asegurada">
             ${parseFloat(siniestro.poliza_info.suma_asegurada).toLocaleString('es-ES')}
          </Descriptions.Item>
        </Descriptions>

        <Title level={3} style={{ marginTop: '32px', marginBottom: '16px' }}>
          Beneficiarios de la Póliza
        </Title>

        {/* --- Tabla de Beneficiarios --- */}
        <Table
          columns={beneficiarioColumns}
          dataSource={siniestro.poliza_info.beneficiarios}
          rowKey="id"
          bordered
          pagination={false}
        />
        
      </Content>
    </Layout>
  );
};

export default AdminDetalleSiniestroPage;