// en frontend/src/pages/polizas/AdminCrearPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Layout, Typography, Form, Input, Button, message, Row, Col, 
  DatePicker, Select, InputNumber, Card, Divider, Statistic 
} from 'antd';
import { 
  ArrowLeftOutlined, UserOutlined, TeamOutlined, 
  DollarOutlined, CalculatorOutlined, FileTextOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { authService } from '../../services/authService';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

interface Cliente {
  id: number;
  usuario_info: {
    first_name: string;
    last_name: string;
    email: string;
  };
  identificacion: string;
}

interface Agente {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  codigo_agente?: string;
}

const AdminCrearPolizaPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Estados para cálculo de prima
  const [sumaAsegurada, setSumaAsegurada] = useState<number>(0);
  const [primaAnual, setPrimaAnual] = useState<number>(0);
  const [primaMensual, setPrimaMensual] = useState<number>(0);

  // Tasa de prima (ejemplo: 2% de la suma asegurada)
  const TASA_PRIMA = 0.02; // 2% anual

  useEffect(() => {
    fetchClientesYAgentes();
  }, []);

  const fetchClientesYAgentes = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        message.error('No estás autenticado.');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [clientesRes, agentesRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/clientes/', { headers }),
        axios.get('http://127.0.1:8000/api/agentes/', { headers })
      ]);

      setClientes(clientesRes.data);
      setAgentes(agentesRes.data);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar clientes o agentes.');
    }
  };

  // CORRIGE la función calcularPrimas en AdminCrearPolizaPage.tsx
const calcularPrimas = (value: number | null | string) => {
  // Convertir a número y manejar valores nulos/vacíos
  const valorNumerico = value ? Number(value) : 0;
  
  setSumaAsegurada(valorNumerico);
  
  const primaAnualCalculada = valorNumerico * TASA_PRIMA;
  const primaMensualCalculada = primaAnualCalculada / 12;
  
  setPrimaAnual(primaAnualCalculada);
  setPrimaMensual(primaMensualCalculada);

  // Actualizar valores en el formulario
  form.setFieldsValue({
    prima_anual: primaAnualCalculada > 0 ? primaAnualCalculada.toFixed(2) : '',
    prima_mensual: primaMensualCalculada > 0 ? primaMensualCalculada.toFixed(2) : ''
  });
};

  const generarNumeroPoliza = () => {
    const fecha = new Date();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `POL-ACC-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${random}`;
  };

  const handleFormSubmit = async (values: any) => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Preparar datos para el backend
      const polizaData = {
        cliente: values.cliente_id,
        agente: values.agente_id,
        numero_poliza: values.numero_poliza || generarNumeroPoliza(),
        suma_asegurada: values.suma_asegurada,
        prima_anual: values.prima_anual,
        prima_mensual: values.prima_mensual,
        fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
        fecha_vencimiento: values.fecha_vencimiento.format('YYYY-MM-DD'),
        cobertura: values.cobertura || 'Seguro de Accidentes Personales - Cobertura básica por muerte e invalidez permanente total o parcial resultante de accidente.',
        exclusiones: values.exclusiones || 'Suicidio, lesiones autoinfligidas, participación en actos ilícitos, guerra, actividades deportivas profesionales de alto riesgo.',
        estado: 'activa'
      };

      console.log('Enviando datos de póliza:', polizaData);

      await axios.post('http://127.0.0.1:8000/api/polizas/', polizaData, { headers });
      
      message.success('Póliza creada exitosamente.');
      form.resetFields();
      
      setTimeout(() => {
        navigate('/admin-polizas');
      }, 1500);

    } catch (error: any) {
      console.error('Error al crear póliza:', error);
      if (error.response?.data) {
        message.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error('Error al crear la póliza.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '15px' }}>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin-polizas')}
          style={{ marginBottom: '10px', fontFamily: 'Michroma, sans-serif' }}
        >
          Volver a Pólizas
        </Button>

        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px', fontFamily: 'Michroma, sans-serif' }}>
          <FileTextOutlined /> Crear Nueva Póliza
        </Title>

        <Row gutter={[24, 24]}>
          {/* Formulario */}
          <Col xs={24} lg={16}>
            <Card title="Información de la Póliza" style={{ marginBottom: '24px' }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={{
                  cobertura: 'Seguro de Accidentes Personales - Cobertura básica por muerte e invalidez permanente total o parcial resultante de accidente.',
                  exclusiones: 'Suicidio, lesiones autoinfligidas, participación en actos ilícitos, guerra, actividades deportivas profesionales de alto riesgo.'
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Item
                      name="cliente_id"
                      label="Cliente"
                      rules={[{ required: true, message: 'Selecciona un cliente' }]}
                    >
                      <Select
                        placeholder="Seleccionar cliente"
                        showSearch
                        optionFilterProp="children"
                        suffixIcon={<UserOutlined />}
                      >
                        {clientes.map(cliente => (
                          <Option key={cliente.id} value={cliente.id}>
                            {cliente.usuario_info.first_name} {cliente.usuario_info.last_name} - {cliente.identificacion}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                  <Col span={12}>
                    <Item
                      name="agente_id"
                      label="Agente"
                      rules={[{ required: true, message: 'Selecciona un agente' }]}
                    >
                      <Select
                        placeholder="Seleccionar agente"
                        showSearch
                        optionFilterProp="children"
                        suffixIcon={<TeamOutlined />}
                      >
                        {agentes.map(agente => (
                          <Option key={agente.id} value={agente.id}>
                            {agente.first_name} {agente.last_name} ({agente.codigo_agente || agente.username})
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Item
                      name="numero_poliza"
                      label="Número de Póliza"
                      tooltip="Dejar vacío para generar automáticamente"
                    >
                      <Input placeholder="Ej: POL-ACC-2024-001" />
                    </Item>
                  </Col>
                  <Col span={12}>
                    <Item
                      name="suma_asegurada"
                      label="Suma Asegurada"
                      rules={[{ required: true, message: 'Ingresa la suma asegurada' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Ej: 50000"
                        min={1000}
                        max={1000000}
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                        onChange={(value) => calcularPrimas(value)}
                        step={1000} // Añadir step para mejor UX
                      />
                    </Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Item
                      name="fecha_inicio"
                      label="Fecha de Inicio"
                      rules={[{ required: true, message: 'Selecciona fecha de inicio' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabledDate={current => current && current < dayjs().startOf('day')}
                      />
                    </Item>
                  </Col>
                  <Col span={12}>
                    <Item
                      name="fecha_vencimiento"
                      label="Fecha de Vencimiento"
                      rules={[{ required: true, message: 'Selecciona fecha de vencimiento' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabledDate={current => {
                          const fechaInicio = form.getFieldValue('fecha_inicio');
                          return current && (!fechaInicio || current < fechaInicio);
                        }}
                      />
                    </Item>
                  </Col>
                </Row>

                <Divider>Primas Calculadas</Divider>

                <Row gutter={16}>
                  <Col span={8}>
                    <Item
                      name="prima_anual"
                      label="Prima Anual"
                    >
                      <Input 
                        prefix={<DollarOutlined />}
                        readOnly 
                        style={{ background: '#f5f5f5' }}
                      />
                    </Item>
                  </Col>
                  <Col span={8}>
                    <Item
                      name="prima_mensual"
                      label="Prima Mensual"
                    >
                      <Input 
                        prefix={<DollarOutlined />}
                        readOnly 
                        style={{ background: '#f5f5f5' }}
                      />
                    </Item>
                  </Col>
                  <Col span={8}>
                    <Item label="Tasa Aplicada">
                      <Input 
                        value={`${(TASA_PRIMA * 100).toFixed(1)}%`}
                        readOnly 
                        style={{ background: '#f5f5f5' }}
                      />
                    </Item>
                  </Col>
                </Row>

                <Item
                  name="cobertura"
                  label="Cobertura"
                >
                  <TextArea rows={3} placeholder="Descripción de lo que cubre el seguro..." />
                </Item>

                <Item
                  name="exclusiones"
                  label="Exclusiones"
                >
                  <TextArea rows={3} placeholder="Descripción de lo que NO cubre el seguro..." />
                </Item>

                <Item style={{ textAlign: 'center', marginTop: '24px' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    size="large"
                    style={{ 
                      fontFamily: 'Michroma, sans-serif', 
                      padding: '15px 40px',
                      fontSize: '16px',
                      height: 'auto'
                    }}
                    icon={<FileTextOutlined />}
                  >
                    {loading ? 'Creando Póliza...' : 'Crear Póliza'}
                  </Button>
                </Item>
              </Form>
            </Card>
          </Col>

          {/* Panel de Resumen */}
          <Col xs={24} lg={8}>
            <Card title="Resumen de Cálculos" style={{ position: 'sticky', top: '24px' }}>
              <Statistic
                title="Suma Asegurada"
                value={sumaAsegurada}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
                formatter={value => `$ ${Number(value).toLocaleString()}`}
              />
              
              <Divider />

              <Statistic
                title="Prima Anual"
                value={primaAnual}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
                formatter={value => `$ ${Number(value).toFixed(2)}`}
              />

              <Statistic
                title="Prima Mensual"
                value={primaMensual}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={value => `$ ${Number(value).toFixed(2)}`}
              />

              <Divider />

              <div style={{ textAlign: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '6px' }}>
                <CalculatorOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                <div>
                  <Text strong>Tasa: {(TASA_PRIMA * 100).toFixed(1)}% anual</Text>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  (Prima Anual = Suma Asegurada × Tasa)
                </Text>
              </div>

              <Divider />

              <div style={{ background: '#e6f7ff', padding: '12px', borderRadius: '6px' }}>
                <Text type="secondary">
                  <strong>Nota:</strong> Las primas se calculan automáticamente basado en la suma asegurada.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AdminCrearPolizaPage;