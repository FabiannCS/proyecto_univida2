// en frontend/src/pages/polizas/AdminDetallePolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Spin, message, Button, Descriptions, Table, Tag } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { ArrowLeftOutlined } from '@ant-design/icons';
const { Content } = Layout;
const { Title, Text } = Typography;

// --- Definición de Interfaces (basadas en tu serializers.txt) ---

// Interfaz para un Beneficiario
interface Beneficiario {
  id: number;
  nombre_completo: string;
  parentesco: string;
  porcentaje: string; // Tu serializer lo define como DecimalField, string es seguro
}

// Interfaz para la Póliza (con datos anidados)
interface PolizaDetalle {
  id: number;
  numero_poliza: string;
  estado: string;
  suma_asegurada: string;
  prima_anual: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  creado_en: string;
  cliente_info: {
    id: number;
    identificacion: string;
    usuario_info: {
      first_name: string;
      last_name: string;
      email: string;
      telefono: string;
    }
  };
  beneficiarios: Beneficiario[]; // Un array de beneficiarios
  // Tu compañero debe añadir 'agente_info' al PolizaSerializer en el backend
  // agente_info: { ... }; 
}

const AdminDetallePolizaPage: React.FC = () => {
  const [poliza, setPoliza] = useState<PolizaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>(); // Obtiene el ID de la póliza desde la URL
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  // --- Carga los datos de la Póliza (GET) ---
  useEffect(() => {
    const fetchPolizaDetalle = async () => {
      if (!id) {
        message.error('No se especificó un ID de póliza.');
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
        // Llama al endpoint de detalle de póliza
        const response = await axios.get(`https://proyecto-univida2.onrender.com/api/polizas/${id}/`, { headers });
        setPoliza(response.data);
        
      } catch (error: any) {
        console.error('Error al cargar la póliza:', error);
        message.error('Error al cargar los detalles de la póliza.');
      } finally {
        setLoading(false);
      }
    };

    fetchPolizaDetalle();
  }, [id]); // Se vuelve a ejecutar si el ID cambia

  // --- Columnas para la Tabla de Beneficiarios ---
  const beneficiarioColumns = [
    {
      title: 'Nombre Completo',
      dataIndex: 'nombre_completo',
      key: 'nombre_completo',
    },
    {
      title: 'Parentesco',
      dataIndex: 'parentesco',
      key: 'parentesco',
    },
    {
      title: 'Porcentaje',
      dataIndex: 'porcentaje',
      key: 'porcentaje',
      render: (porc: string) => `${porc}%` // Muestra el %
    },
  ];

  // Muestra un spinner mientras carga
  if (loading) {
    return (
      <Layout style={{ padding: '50px', display: 'grid', placeItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  // Muestra un mensaje si la póliza no se cargó
  if (!poliza) {
    return (
      <Layout style={{ padding: '24px' }}>
        <Content>
          <Title level={2}>Póliza no encontrada</Title>
          <Text>No se pudieron cargar los detalles de la póliza solicitada.</Text>
        </Content>
      </Layout>
    );
  }

  // --- Renderizado Visual de la Página ---
  return (
    <Layout>
      <Content style={{ padding: '20px', margin: '10px', minHeight: '80vh'}}>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin-polizas')}
          style={{ marginBottom: '10px', fontFamily: 'Michroma, sans-serif'}}
        >
          Volver a Pólizas
        </Button>
        <center>
        <Title level={2} style={{ marginBottom: '24px', fontFamily: 'Michroma, sans-serif' }}>
          Detalle de Póliza: {poliza.numero_poliza}
        </Title>
        </center>
        {/* Componente <Descriptions> para mostrar datos clave-valor */}
        <Descriptions bordered layout="vertical" column={3}>
          
          <Descriptions.Item label="Nº de Póliza">{poliza.numero_poliza}</Descriptions.Item>
          
          <Descriptions.Item label="Estado">
            <Tag color={poliza.estado === 'activa' ? 'green' : 'volcano'}>
              {poliza.estado.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Cliente">
            {`${poliza.cliente_info.usuario_info.first_name} ${poliza.cliente_info.usuario_info.last_name}`}
          </Descriptions.Item>

          <Descriptions.Item label="Suma Asegurada">
            ${parseFloat(poliza.suma_asegurada).toLocaleString('es-ES')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Prima Anual">
            ${parseFloat(poliza.prima_anual).toLocaleString('es-ES')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Vigencia">
            {poliza.fecha_inicio} al {poliza.fecha_vencimiento}
          </Descriptions.Item>

          <Descriptions.Item label="Email Cliente">
            {poliza.cliente_info.usuario_info.email}
          </Descriptions.Item>
          
          <Descriptions.Item label="Teléfono Cliente">
            {poliza.cliente_info.usuario_info.telefono}
          </Descriptions.Item>
          
          <Descriptions.Item label="Identificación Cliente">
            {poliza.cliente_info.identificacion}
          </Descriptions.Item>

        </Descriptions>

        <Title level={3} style={{ marginTop: '32px', marginBottom: '16px' }}>
          Beneficiarios Asignados
        </Title>

        {/* Tabla para los Beneficiarios */}
        <Table
          columns={beneficiarioColumns}
          dataSource={poliza.beneficiarios} // Usa el array anidado
          rowKey="id"
          bordered
          pagination={false} // Desactiva paginación si la lista es corta
        />
        
      </Content>
    </Layout>
  );
};

export default AdminDetallePolizaPage;