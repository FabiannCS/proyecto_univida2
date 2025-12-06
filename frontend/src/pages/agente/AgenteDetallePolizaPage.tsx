// en frontend/src/pages/agente/AgenteDetallePolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Descriptions, Card, Table, Tag, Button, Spin, message, Row, Col, Divider, Popconfirm, Modal, Form, Input, InputNumber, } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, UserOutlined, DollarOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

const AgenteDetallePolizaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poliza, setPoliza] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Cargar Póliza
        const resPoliza = await axios.get(`http://127.0.0.1:8000/api/polizas/${id}/`, { headers });
        setPoliza(resPoliza.data);

        // 2. Cargar Pagos de esta póliza (Filtrando facturas)
        // Nota: Esto asume que tienes un endpoint para ver pagos o facturas de una póliza
        // Si no, el agente lo ve en la sección de "Caja". Aquí mostramos lo básico.
        const resFacturas = await axios.get(`http://127.0.0.1:8000/api/facturas/?poliza_id=${id}`, { headers });
        setPagos(resFacturas.data);

      } catch (error) {
        console.error(error);
        message.error('Error al cargar detalles');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddBeneficiario = async (values: any) => {
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        await axios.post('http://127.0.0.1:8000/api/beneficiarios/agregar/', {
            ...values,
            poliza: id // El ID de la póliza actual
        }, { headers });

        message.success('Beneficiario agregado');
        setIsModalOpen(false);
        form.resetFields();
        // Recargar datos para ver el nuevo beneficiario
        // (Podrías extraer fetchData afuera del useEffect para llamarlo aquí)
        window.location.reload(); 

    } catch (error) {
        message.error('Error al agregar beneficiario');
    }
  };

  // --- NUEVA FUNCIÓN: ELIMINAR BENEFICIARIO ---
  const handleDeleteBeneficiario = async (benId: number) => {
      try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`http://127.0.0.1:8000/api/beneficiarios/${benId}/eliminar/`, { headers });
        message.success('Beneficiario eliminado');
        window.location.reload();
      } catch (error) {
          message.error('Error al eliminar');
      }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!poliza) return <div style={{ textAlign: 'center', padding: 50 }}>Póliza no encontrada</div>;

  return (
    <Layout style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', borderRadius: '15px'}}>
        
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} shape="circle" style={{ marginRight: 16 }} />
          <div>
            <Title level={2} style={{ margin: 0, fontFamily: 'Michroma, sans-serif', marginBottom: '10px'}}>Póliza #{poliza.numero_poliza}</Title>
            <Tag color={poliza.estado === 'activa' ? 'green' : poliza.estado === 'pendiente_pago' ? 'orange' : 'red'}>
                {poliza.estado.toUpperCase().replace('_', ' ')}
            </Tag>
          </div>
        </div>

        <Row gutter={[24, 24]}>
            {/* Columna Izquierda: Detalles */}
            <Col xs={24} lg={16}>
                <Card title={<><FileTextOutlined /> Información de la Póliza</>} style={{ marginBottom: 24 }}>
                    <Descriptions column={2} bordered>
                        <Descriptions.Item label="Suma Asegurada">${parseFloat(poliza.suma_asegurada).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Prima Anual">${parseFloat(poliza.prima_anual).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Fecha Inicio">{poliza.fecha_inicio}</Descriptions.Item>
                        <Descriptions.Item label="Fecha Vencimiento">{poliza.fecha_vencimiento}</Descriptions.Item>
                        <Descriptions.Item label="Cobertura" span={2}>{poliza.cobertura || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* --- CARD BENEFICIARIOS CON BOTÓN --- */}
                <Card 
                    title="Beneficiarios" 
                    extra={
                        <Button style={{fontFamily: 'Michroma, sans-serif'}} type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                            Añadir
                        </Button>
                    }
                >
                    <Table 
                        dataSource={poliza.beneficiarios}
                        rowKey="id"
                        pagination={false}
                        columns={[
                            { title: 'Nombre', dataIndex: 'nombre_completo' },
                            { title: 'Parentesco', dataIndex: 'parentesco' },
                            { title: '%', dataIndex: 'porcentaje', render: (v:any) => `${v}%` },
                            { 
                                title: 'Acción', 
                                render: (_:any, r:any) => (
                                    <Popconfirm title="¿Eliminar?" onConfirm={() => handleDeleteBeneficiario(r.id)}>
                                        <Button danger icon={<DeleteOutlined />} >Eliminar</Button>
                                    </Popconfirm>
                                )
                            }
                        ]}
                    />
                </Card>
            </Col>

            {/* Columna Derecha: Cliente y Pagos */}
            <Col xs={24} lg={8}>
                <Card title={<><UserOutlined /> Cliente</>} style={{ marginBottom: 24 }}>
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Nombre">
                            {poliza.cliente_info.usuario_info.first_name} {poliza.cliente_info.usuario_info.last_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">{poliza.cliente_info.usuario_info.email}</Descriptions.Item>
                        <Descriptions.Item label="Identificación">{poliza.cliente_info.identificacion}</Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title={<><DollarOutlined /> Estado de Pagos (Facturas)</>}>
                     <Table 
                        dataSource={pagos}
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={[
                            { title: 'Nº', dataIndex: 'numero_factura' },
                            { title: 'Monto', dataIndex: 'monto', render: (v:any) => `$${v}` },
                            { title: 'Estado', dataIndex: 'estado', render: (e:string) => <Tag color={e==='pagada'?'green':'orange'}>{e}</Tag> }
                        ]}
                    />
                </Card>
            </Col>
        </Row>
        {/* --- MODAL PARA AÑADIR --- */}
        <Modal title="Añadir Beneficiario" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
            <Form form={form} layout="vertical" onFinish={handleAddBeneficiario}>
                <Form.Item name="nombre_completo" label="Nombre Completo" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="parentesco" label="Parentesco" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="porcentaje" label="Porcentaje %" rules={[{ required: true }]}>
                            <InputNumber min={1} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                {/* Añade campos de CI, Materno, Paterno si los necesitas aquí también */}
                <Button type="primary" htmlType="submit" block>Guardar</Button>
            </Form>
        </Modal>

      </Content>
    </Layout>
  );
};

export default AgenteDetallePolizaPage;