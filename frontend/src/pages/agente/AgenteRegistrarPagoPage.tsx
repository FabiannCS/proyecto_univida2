// en frontend/src/pages/agente/AgenteRegistrarPagoPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Button, Select, Table, Tag, message, Modal, InputNumber, Divider } from 'antd';
import { CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const AgenteRegistrarPagoPage: React.FC = () => {
  const [polizas, setPolizas] = useState<any[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [selectedPoliza, setSelectedPoliza] = useState<string | null>(null);
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const getToken = () => localStorage.getItem('accessToken');

  // 1. Cargar Pólizas para el Buscador
  useEffect(() => {
    const fetchPolizas = async () => {
      try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        setPolizas(response.data);
      } catch (error) { console.error(error); }
    };
    fetchPolizas();
  }, []);

  // 2. Buscar Facturas cuando seleccionas Póliza
  const handlePolizaChange = async (polizaId: string) => {
    setSelectedPoliza(polizaId);
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        // Filtramos facturas por poliza_id
        const res = await axios.get(`http://127.0.0.1:8000/api/facturas/?poliza_id=${polizaId}`, { headers });
        setFacturas(res.data);
    } catch (error) { message.error("Error cargando facturas"); }
  };

  // 3. Abrir Modal de Pago
  const abrirModalPago = (factura: any) => {
      setSelectedFactura(factura);
      form.setFieldsValue({ 
          monto_pagado: factura.monto, // Sugerir el total
          metodo_pago: 'efectivo' 
      });
      setIsModalOpen(true);
  };

  // 4. Enviar Pago
  const onFinishPago = async (values: any) => {
      setLoading(true);
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          await axios.post('http://127.0.0.1:8000/api/pagos/', {
              factura: selectedFactura.id,
              ...values
          }, { headers });
          
          message.success("Pago registrado. Factura actualizada.");
          setIsModalOpen(false);
          // Recargar la lista de facturas para ver el cambio de estado
          if(selectedPoliza) handlePolizaChange(selectedPoliza);

      } catch (error) {
          message.error("Error al registrar el pago");
      } finally {
          setLoading(false);
      }
  };

  const columns = [
      { title: 'Nº Factura', dataIndex: 'numero_factura', key: 'num' },
      { title: 'Vencimiento', dataIndex: 'fecha_vencimiento', key: 'vence' },
      { title: 'Monto', dataIndex: 'monto', key: 'monto', render: (m:string)=>`$${m}` },
      { title: 'Estado', dataIndex: 'estado', key: 'estado', render: (e: string) => <Tag color={e==='pagada'?'green':'orange'}>{e.toUpperCase()}</Tag> },
      {
          title: 'Acción', key: 'action',
          render: (_: any, record: any) => (
              <Button 
                type="primary" size="small" 
                disabled={record.estado === 'pagada'}
                onClick={() => abrirModalPago(record)}
              >
                  Pagar
              </Button>
          )
      }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Title level={2} style={{ fontFamily: "'Michroma', sans-serif" }}>Caja / Registrar Pagos</Title>
        
        <Card style={{ marginBottom: 24 }}>
            <span style={{ marginRight: 10, fontWeight: 'bold' }}>Buscar Póliza:</span>
            <Select 
                showSearch style={{ width: 300 }} placeholder="Seleccione una póliza..."
                optionFilterProp="children" onChange={handlePolizaChange}
                filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            >
                {polizas.map(p => (
                    <Option key={p.id} value={p.id} label={`${p.numero_poliza} - ${p.cliente_info?.usuario_info?.first_name}`}>
                        #{p.numero_poliza} - {p.cliente_info?.usuario_info?.first_name} {p.cliente_info?.usuario_info?.last_name}
                    </Option>
                ))}
            </Select>
        </Card>

        {selectedPoliza && (
            <Card title="Facturas Pendientes">
                <Table dataSource={facturas} columns={columns} rowKey="id" locale={{ emptyText: 'No hay facturas para esta póliza' }}/>
            </Card>
        )}

        <Modal title="Registrar Pago" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
            <Form form={form} layout="vertical" onFinish={onFinishPago}>
                <Form.Item name="monto_pagado" label="Monto Recibido" rules={[{ required: true }]}>
                    <InputNumber prefix="$" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="metodo_pago" label="Método" rules={[{ required: true }]}>
                    <Select>
                        <Option value="efectivo">Efectivo</Option>
                        <Option value="transferencia">Transferencia</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="referencia_pago" label="Referencia (Opcional)"><Input /></Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} icon={<CheckCircleOutlined />}>Confirmar Pago</Button>
            </Form>
        </Modal>
    </div>
  );
};
export default AgenteRegistrarPagoPage;