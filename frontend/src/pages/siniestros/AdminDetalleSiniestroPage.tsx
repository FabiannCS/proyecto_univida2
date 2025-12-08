// en frontend/src/pages/siniestros/AdminDetalleSiniestroPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Spin, message, Descriptions, Table, Tag, Button, Space, Modal, InputNumber, Form, Alert, Col, Row } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

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
    beneficiarios: Beneficiario[];
  };
}

const AdminDetalleSiniestroPage: React.FC = () => {
  const [siniestro, setSiniestro] = useState<SiniestroDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Estados para el Modal de Aprobación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [montoAprobacion, setMontoAprobacion] = useState<number | null>(null);
  const [resolucionTexto, setResolucionTexto] = useState(''); // Opcional: comentarios del admin

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  // --- Carga los datos del Siniestro (GET) ---
  const fetchSiniestroDetalle = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`http://127.0.0.1:8000/api/siniestros/${id}/`, { headers });
      setSiniestro(response.data);
      
      // Inicializar el monto de aprobación con el monto reclamado por defecto
      if (response.data.monto_reclamado) {
          setMontoAprobacion(parseFloat(response.data.monto_reclamado));
      }
      
    } catch (error: any) {
      console.error('Error al cargar el siniestro:', error);
      message.error('Error al cargar los detalles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiniestroDetalle();
  }, [id]);

  // --- FUNCIÓN PARA APROBAR (Con Monto) ---
  const handleAprobar = async () => {
      if (!montoAprobacion || montoAprobacion <= 0) {
          message.error("Debes definir un monto de indemnización válido.");
          return;
      }

      setActionLoading(true);
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };

          await axios.patch(`http://127.0.0.1:8000/api/siniestros/${id}/`, {
              estado: 'aprobado',
              monto_aprobado: montoAprobacion,
              resolucion: resolucionTexto || 'Siniestro aprobado por administración.'
          }, { headers });

          message.success('Siniestro aprobado y monto asignado correctamente.');
          setIsModalOpen(false);
          fetchSiniestroDetalle();

      } catch (error) {
          console.error(error);
          message.error('Error al aprobar el siniestro.');
      } finally {
          setActionLoading(false);
      }
  };

  // --- FUNCIÓN PARA RECHAZAR ---
  const handleRechazar = async () => {
    if (!window.confirm("¿Estás seguro de RECHAZAR este siniestro? Esta acción es irreversible.")) {
        return;
    }
    setActionLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(`http://127.0.0.1:8000/api/siniestros/${id}/`, {
        estado: 'rechazado',
        resolucion: 'Siniestro rechazado por incumplimiento de condiciones.'
      }, { headers });

      message.info('Siniestro rechazado.');
      fetchSiniestroDetalle();
    } catch (error: any) {
      message.error('Error al rechazar el siniestro.');
    } finally {
      setActionLoading(false);
    }
  };

  // Columnas para Beneficiarios
  const beneficiarioColumns = [
    { title: 'Nombre Completo', dataIndex: 'nombre_completo', key: 'nombre_completo' },
    { title: 'Parentesco', dataIndex: 'parentesco', key: 'parentesco' },
    { title: 'Porcentaje', dataIndex: 'porcentaje', key: 'porcentaje', render: (p: string) => `${p}%` },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  if (!siniestro) return (
      <Layout style={{ padding: '20px' }}>
          <Content><Title level={3}>Siniestro no encontrado</Title><Button onClick={() => navigate(-1)}>Volver</Button></Content>
      </Layout>
  );

  return (
    <Layout>
      <Content style={{padding: '24px'}}>
        
        {/* --- Encabezado y Acciones --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" />
                <div>
                    <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>
                        Siniestro #{siniestro.numero_siniestro}
                    </Title>
                    <Tag color={siniestro.estado === 'aprobado' ? 'green' : siniestro.estado === 'rechazado' ? 'red' : 'blue'}>
                        {siniestro.estado.toUpperCase()}
                    </Tag>
                </div>
            </div>

            <Space>
                <Button 
                danger 
                loading={actionLoading}
                onClick={handleRechazar}
                disabled={siniestro.estado !== 'reportado' && siniestro.estado !== 'en_revision'}
                >
                Rechazar
                </Button>
                <Button 
                type="primary" 
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => setIsModalOpen(true)} // Abre el modal
                disabled={siniestro.estado !== 'reportado' && siniestro.estado !== 'en_revision'}
                icon={<CheckCircleOutlined />}
                >
                Aprobar / Indemnizar
                </Button>
            </Space>
        </div>

        {/* --- Detalles del Siniestro --- */}
        <Descriptions bordered layout="vertical" column={4} style={{ background: '#fff', marginBottom: 24 }}>
          <Descriptions.Item label="Tipo">{siniestro.tipo_siniestro}</Descriptions.Item>
          <Descriptions.Item label="Fecha del Siniestro">{siniestro.fecha_siniestro}</Descriptions.Item>
          <Descriptions.Item label="Fecha de Reporte">{new Date(siniestro.fecha_reporte).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Monto Reclamado">
            <span style={{ fontWeight: 'bold' }}>${parseFloat(siniestro.monto_reclamado).toLocaleString('es-ES')}</span>
          </Descriptions.Item>
          
          <Descriptions.Item label="Descripción" span={4}>
            {siniestro.descripcion}
          </Descriptions.Item>

          {/* Mostrar resolución si existe */}
          {(siniestro.estado === 'aprobado' || siniestro.estado === 'rechazado') && (
              <Descriptions.Item label="Resolución Admin" span={4} style={{ background: siniestro.estado === 'aprobado' ? '#f6ffed' : '#fff1f0' }}>
                  <strong>Monto Aprobado: </strong> {siniestro.monto_aprobado ? `$${parseFloat(siniestro.monto_aprobado).toLocaleString()}` : 'N/A'}
                  <br/>
                  <strong>Notas: </strong> {siniestro.resolucion}
              </Descriptions.Item>
          )}
        </Descriptions>

        <Row gutter={24}>
            <Col span={16}>
                <Title level={4}>Información de Póliza</Title>
                <Descriptions bordered column={2} style={{ background: '#fff', marginBottom: 24 }}>
                    <Descriptions.Item label="Nº Póliza">{siniestro.poliza_info.numero_poliza}</Descriptions.Item>
                    <Descriptions.Item label="Suma Asegurada">${parseFloat(siniestro.poliza_info.suma_asegurada).toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="Cliente">{siniestro.poliza_info.cliente_info.usuario_info.first_name} {siniestro.poliza_info.cliente_info.usuario_info.last_name}</Descriptions.Item>
                    <Descriptions.Item label="CI">{siniestro.poliza_info.cliente_info.identificacion}</Descriptions.Item>
                </Descriptions>
            </Col>
            <Col span={8}>
                <Title level={4}>Beneficiarios</Title>
                <Table
                    columns={beneficiarioColumns}
                    dataSource={siniestro.poliza_info.beneficiarios}
                    rowKey="id"
                    bordered
                    pagination={false}
                    size="small"
                    style={{ background: '#fff' }}
                />
            </Col>
        </Row>

        {/* --- MODAL DE APROBACIÓN --- */}
        <Modal
            title="Aprobar Siniestro e Indemnización"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onOk={handleAprobar}
            confirmLoading={actionLoading}
            okText="Confirmar Aprobación"
            cancelText="Cancelar"
        >
            <p>Por favor confirma el monto final a indemnizar al cliente.</p>
            <Form layout="vertical">
                <Form.Item label="Monto Reclamado por Cliente">
                    <InputNumber 
                        disabled 
                        value={parseFloat(siniestro.monto_reclamado)} 
                        prefix="$" 
                        style={{ width: '100%', color: 'black' }} 
                    />
                </Form.Item>
                
                <Form.Item label="Monto Aprobado (Indemnización)" required tooltip="Este es el monto que se desembolsará">
                    <InputNumber 
                        style={{ width: '100%' }} 
                        prefix="$" 
                        value={montoAprobacion}
                        onChange={(val) => setMontoAprobacion(val)}
                        min={0}
                        max={parseFloat(siniestro.poliza_info.suma_asegurada)} // No puede ser mayor a la suma asegurada
                    />
                </Form.Item>

                <Alert message="Al aprobar, se registrará la deuda para pago inmediato." type="warning" showIcon />
            </Form>
        </Modal>

      </Content>
    </Layout>
  );
};

export default AdminDetalleSiniestroPage;