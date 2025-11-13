// en frontend/src/pages/cliente/ClienteDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Descriptions, Card, Tag, Table, Spin, Alert, Row, Col, Statistic, Button, Avatar, Divider } from 'antd';
import { FileProtectOutlined, DollarCircleOutlined, CalendarOutlined, UserOutlined, PhoneOutlined, MailOutlined, DownloadOutlined, WarningOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// --- Interfaces ---
interface Beneficiario {
  id: number;
  nombre_completo: string;
  parentesco: string;
  porcentaje: string;
}

// Añadimos info del agente a la interfaz
interface MiPoliza {
  id: number;
  numero_poliza: string;
  estado: string;
  suma_asegurada: string;
  prima_anual: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  beneficiarios: Beneficiario[];
  // (Asegúrate de que tu backend envíe esto, o se mostrará vacío)
  agente_info?: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    telefono?: string;
  };
}

// Datos simulados para pagos (hasta que tengas el backend de pagos)
const pagosSimulados = [
    { id: 1, fecha: '2025-01-15', monto: '1400.00', estado: 'Pagado', referencia: 'TRF-12345' },
    { id: 2, fecha: '2024-01-15', monto: '1400.00', estado: 'Pagado', referencia: 'TRF-98765' },
];

const ClienteDashboardPage: React.FC = () => {
  const [poliza, setPoliza] = useState<MiPoliza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMiPoliza = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) {
            setError('No autenticado');
            setLoading(false);
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        
        if (response.data && response.data.length > 0) {
            setPoliza(response.data[0]); 
        } else {
            setPoliza(null);
        }

      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información de la póliza.');
      } finally {
        setLoading(false);
      }
    };

    fetchMiPoliza();
  }, []);

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '50vh' }}><Spin size="large" /></div>;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;
  if (!poliza) return <div style={{ textAlign: 'center', padding: '50px' }}><Title level={3}>No tienes pólizas activas</Title></div>;

  const beneficiarioColumns = [
    { title: 'Nombre', dataIndex: 'nombre_completo', key: 'nombre' },
    { title: 'Parentesco', dataIndex: 'parentesco', key: 'parentesco' },
    { title: 'Porcentaje', dataIndex: 'porcentaje', key: 'porcentaje', render: (p: string) => `${p}%` },
  ];

  const pagosColumns = [
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
    { title: 'Monto', dataIndex: 'monto', key: 'monto', render: (m: string) => `$${m}` },
    { title: 'Referencia', dataIndex: 'referencia', key: 'referencia' },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', render: (e: string) => <Tag color="green">{e}</Tag> },
  ];

  return (
    <div>
      {/* --- ENCABEZADO CON BOTÓN VOLVER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        
        {/* Agrupamos el botón y el título a la izquierda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)} // Vuelve atrás en el historial
                shape="circle" // Opcional: Lo hace redondito, o quítalo para que sea cuadrado
            />
            <Title level={2} style={{ margin: 0 }}>Mi Portal</Title>
        </div>

        {/* Etiqueta de la póliza (a la derecha) */}
        {poliza && (
            <Tag color="blue" style={{ fontSize: '14px', padding: '5px 10px' }}>
                Póliza #{poliza.numero_poliza}
            </Tag>
        )}
      </div>

      <Row gutter={[24, 24]}>
        
        {/* --- COLUMNA IZQUIERDA (Información Principal) --- */}
        <Col xs={24} lg={16}>
            
            {/* 1. Estadísticas Rápidas */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                <Card size="small">
                    <Statistic title="Suma Asegurada" value={poliza.suma_asegurada} prefix={<DollarCircleOutlined />} precision={2} />
                </Card>
                </Col>
                <Col span={8}>
                <Card size="small">
                    <Statistic 
                        title="Estado" 
                        value={poliza.estado.toUpperCase()} 
                        valueStyle={{ color: poliza.estado === 'activa' ? '#3f8600' : '#cf1322', fontSize: '16px' }} 
                    />
                </Card>
                </Col>
                <Col span={8}>
                <Card size="small">
                    <Statistic title="Vence el" value={poliza.fecha_vencimiento} prefix={<CalendarOutlined />} valueStyle={{ fontSize: '16px' }} />
                </Card>
                </Col>
            </Row>

            {/* 2. Detalles de la Póliza */}
            <Card title="Detalles de Cobertura" style={{ marginBottom: 24 }}>
                <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Número de Póliza">{poliza.numero_poliza}</Descriptions.Item>
                <Descriptions.Item label="Prima Anual">${poliza.prima_anual}</Descriptions.Item>
                <Descriptions.Item label="Vigencia">{poliza.fecha_inicio} al {poliza.fecha_vencimiento}</Descriptions.Item>
                </Descriptions>
            </Card>

            {/* 3. Historial de Pagos (Nuevo) */}
            <Card title="Historial de Pagos" style={{ marginBottom: 24 }}>
                <Table dataSource={pagosSimulados} columns={pagosColumns} rowKey="id" pagination={false} size="small" />
            </Card>

            {/* 4. Beneficiarios */}
            <Card title="Mis Beneficiarios">
                <Table dataSource={poliza.beneficiarios} columns={beneficiarioColumns} rowKey="id" pagination={false} size="small" />
            </Card>
        </Col>

        {/* --- COLUMNA DERECHA (Agente y Acciones) --- */}
        <Col xs={24} lg={8}>
            
            {/* 5. Tarjeta "Mi Agente" (Nuevo) */}
            <Card title="Mi Agente Asignado" style={{ marginBottom: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginBottom: 8 }} />
                    {poliza.agente_info ? (
                        <>
                            <Title level={4} style={{ margin: 0 }}>{poliza.agente_info.first_name} {poliza.agente_info.last_name}</Title>
                            <Text type="secondary">Agente de Seguros</Text>
                        </>
                    ) : (
                        <>
                            <Title level={4} style={{ margin: 0 }}>Agente General</Title>
                            <Text type="secondary">Soporte Univida</Text>
                        </>
                    )}
                </div>
                <Divider />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button block icon={<PhoneOutlined />}>Enviar Mensaje</Button>
                    <Button block icon={<MailOutlined />}>Enviar Correo</Button>
                </div>
            </Card>

        </Col>
      </Row>
    </div>
  );
};

export default ClienteDashboardPage;