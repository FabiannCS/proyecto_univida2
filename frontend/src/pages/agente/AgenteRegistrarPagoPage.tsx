// en frontend/src/pages/agente/AgenteRegistrarPagoPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Button, Select, Table, Tag, message, Modal, InputNumber, Tabs } from 'antd';
import { SearchOutlined, CheckCircleOutlined, DollarOutlined, FileTextOutlined, HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const AgenteRegistrarPagoPage: React.FC = () => {
  const [polizas, setPolizas] = useState<any[]>([]);
  const [todasFacturas, setTodasFacturas] = useState<any[]>([]); // Guardamos todas para filtrar
  const [loadingData, setLoadingData] = useState(true);
  
  // Buscador
  const [filtroPoliza, setFiltroPoliza] = useState<string | null>(null);

  // Modal de Pago
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. Cargar Datos Iniciales (Pólizas y Facturas) ---
  const cargarDatos = async () => {
    setLoadingData(true);
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        // Cargamos pólizas para el buscador
        const resPolizas = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        setPolizas(resPolizas.data);

        // Cargamos TODAS las facturas del sistema (o del agente si el backend filtra)
        // Nota: Asegúrate de que tu backend /api/facturas/ devuelva la lista completa si no pasas filtros
        const resFacturas = await axios.get('http://127.0.0.1:8000/api/facturas/', { headers });
        setTodasFacturas(resFacturas.data);

    } catch (error) {
        console.error(error);
        message.error("Error cargando información de caja");
    } finally {
        setLoadingData(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- 2. Filtrado de Facturas ---
  const getFacturasFiltradas = (estado: 'pendiente' | 'pagada') => {
      return todasFacturas.filter(f => {
          // Filtro por Estado (Pendiente incluye 'vencida' para que se puedan cobrar)
          const cumpleEstado = estado === 'pendiente' 
            ? (f.estado === 'pendiente' || f.estado === 'vencida')
            : (f.estado === 'pagada');

          // Filtro por Póliza (Buscador)
          const cumplePoliza = filtroPoliza ? f.poliza === filtroPoliza : true;

          return cumpleEstado && cumplePoliza;
      });
  };

  // --- 3. Abrir Modal ---
  const handlePagarClick = (factura: any) => {
      setSelectedFactura(factura);
      form.setFieldsValue({ 
          monto_pagado: factura.monto, 
          metodo_pago: 'efectivo' 
      });
      setIsModalOpen(true);
  };

  // --- 4. Enviar Pago ---
  const onFinishPago = async (values: any) => {
      setLoading(true);
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          
          await axios.post('http://127.0.0.1:8000/api/pagos/', {
              factura: selectedFactura.id,
              ...values
          }, { headers });
          
          message.success("Pago registrado exitosamente");
          setIsModalOpen(false);
          cargarDatos(); // Recargar todo para actualizar las listas

      } catch (error) {
          message.error("Error al registrar el pago");
      } finally {
          setLoading(false);
      }
  };

  // Columnas de la tabla
    const columns = [
      { 
          title: 'Nº Factura', 
          dataIndex: 'numero_factura', 
          key: 'numero' 
      },
      { 
          title: 'Póliza', 
          key: 'poliza',
          // Accedemos a 'poliza_info' que viene del serializer
          render: (_: any, r: any) => (
              <Tag color="blue">
                  {r.poliza_info?.numero_poliza || 'N/A'}
              </Tag>
          )
      },
      { 
          title: 'Cliente', 
          key: 'cliente', 
          render: (_: any, r: any) => {
              // Accedemos a los datos anidados del cliente
              const usuario = r.poliza_info?.cliente_info?.usuario_info;
              if (usuario) {
                  return (
                      <span style={{ fontWeight: 'bold' }}>
                          {usuario.first_name} {usuario.last_name}
                      </span>
                  );
              }
              return <span style={{ color: '#999' }}>Desconocido</span>;
          }
      },
      { 
          title: 'Vencimiento', 
          dataIndex: 'fecha_vencimiento', 
          key: 'vence' 
      },
      { 
          title: 'Monto', 
          dataIndex: 'monto', 
          key: 'monto', 
          render: (m:string) => `$${m}` 
      },
      { 
          title: 'Estado', 
          dataIndex: 'estado', 
          key: 'estado',
          render: (estado: string) => (
              <Tag color={estado === 'pagada' ? 'green' : estado === 'vencida' ? 'red' : 'orange'}>
                  {estado ? estado.toUpperCase() : 'DESCONOCIDO'}
              </Tag>
          )
      },
      {
          title: 'Acción',
          key: 'accion',
          render: (_: any, record: any) => (
              record.estado !== 'pagada' ? (
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<DollarOutlined />}
                    onClick={() => handlePagarClick(record)}
                  >
                      Cobrar
                  </Button>
              ) : (
                  <span style={{ color: 'green' }}><CheckCircleOutlined /> Cobrado</span>
              )
          )
      }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ fontFamily: "'Michroma', sans-serif", marginBottom: 24 }}>Caja y Facturación</Title>
        
        {/* --- BUSCADOR SUPERIOR --- */}
        <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <SearchOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                <span style={{ fontWeight: 'bold' }}>Filtrar por Póliza:</span>
                <Select 
                    showSearch
                    allowClear
                    style={{ width: 400 }}
                    placeholder="Escribe el número de póliza o nombre..."
                    optionFilterProp="children"
                    onChange={(val) => setFiltroPoliza(val)}
                    filterOption={(input, option) => 
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {polizas.map(p => (
                        <Option key={p.id} value={p.id} label={`${p.numero_poliza} - ${p.cliente_info?.usuario_info?.first_name} ${p.cliente_info?.usuario_info?.last_name}`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>#{p.numero_poliza}</span>
                                <span style={{ color: '#888' }}>{p.cliente_info?.usuario_info?.first_name} {p.cliente_info?.usuario_info?.last_name}</span>
                            </div>
                        </Option>
                    ))}
                </Select>
                {filtroPoliza && (
                    <Button type="link" onClick={() => setFiltroPoliza(null)}>Limpiar Filtro</Button>
                )}
            </div>
        </Card>

        {/* --- PESTAÑAS DE ESTADO --- */}
        <Card bordered={false}>
            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: (<span><FileTextOutlined /> Pendientes de Pago</span>),
                    children: <Table 
                        dataSource={getFacturasFiltradas('pendiente')} 
                        columns={columns} 
                        rowKey="id" 
                        loading={loadingData}
                        locale={{ emptyText: 'No hay facturas pendientes' }}
                    />
                },
                {
                    key: '2',
                    label: (<span><HistoryOutlined /> Historial Pagado</span>),
                    children: <Table 
                        dataSource={getFacturasFiltradas('pagada')} 
                        columns={columns} 
                        rowKey="id" 
                        loading={loadingData} 
                    />
                }
            ]} />
        </Card>

        {/* --- MODAL DE COBRO --- */}
        <Modal
            title={`Registrar Cobro - Factura #${selectedFactura?.numero_factura}`}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
        >
            <div style={{ background: '#f6ffed', padding: '10px', marginBottom: '20px', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                <Text strong style={{ color: '#3f8600' }}>Monto a Cobrar: ${selectedFactura?.monto}</Text>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinishPago}>
                <Form.Item name="monto_pagado" label="Monto Recibido" rules={[{ required: true }]}>
                    <InputNumber prefix="$" style={{ width: '100%' }} />
                </Form.Item>
                
                <Form.Item name="metodo_pago" label="Método de Pago" rules={[{ required: true }]}>
                    <Select>
                        <Option value="efectivo">Efectivo</Option>
                        <Option value="transferencia">Transferencia Bancaria</Option>
                        <Option value="tarjeta">Tarjeta de Crédito/Débito</Option>
                        <Option value="cheque">Cheque</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="referencia_pago" label="Nº Referencia / Comprobante">
                    <Input placeholder="Ej. 12345678" />
                </Form.Item>

                <Form.Item name="descripcion" label="Notas Adicionales">
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Button type="primary" htmlType="submit" block loading={loading} icon={<CheckCircleOutlined />} size="large">
                    Confirmar Pago
                </Button>
            </Form>
        </Modal>
    </div>
  );
};

export default AgenteRegistrarPagoPage;