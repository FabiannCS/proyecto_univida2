// en frontend/src/pages/siniestros/ReportarSiniestroPage.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { 
  Layout, Typography, Form, Input, Button, message, Row, Col, 
  DatePicker, Select, InputNumber, Card, Steps, Descriptions, Alert 
} from 'antd';
import { 
  ArrowLeftOutlined, FileTextOutlined, ExclamationCircleOutlined,
  InsuranceOutlined, DollarOutlined, CalendarOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { authService } from '../../services/authService';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface Poliza {
  id: number;
  numero_poliza: string;
  cliente_info: {
    usuario_info: {
      first_name: string;
      last_name: string;
    };
  };
  suma_asegurada: string;
  estado: string;
}

const ReportarSiniestroPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { polizaId } = useParams();

  // Estados para almacenar los valores del formulario
  const [formData, setFormData] = useState({
    poliza: undefined as number | undefined,
    tipo_siniestro: undefined as string | undefined,
    fecha_siniestro: dayjs(),
    descripcion: undefined as string | undefined,
    monto_reclamado: undefined as number | undefined,
    documentos_adjuntos: [] as string[],
    numero_siniestro: ''
  });

  useEffect(() => {
    fetchPolizasActivas();
  }, []);

  const fetchPolizasActivas = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        message.error('No estás autenticado.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
      
      const polizasActivas = response.data.filter((poliza: Poliza) => 
        poliza.estado === 'activa'
      );
      
      setPolizas(polizasActivas);

      if (polizaId) {
        const polizaIdNum = parseInt(polizaId);
        setFormData(prev => ({ ...prev, poliza: polizaIdNum }));
        form.setFieldValue('poliza', polizaIdNum);
      }
    } catch (error: any) {
      console.error('Error al cargar pólizas:', error);
      message.error('Error al cargar las pólizas activas.');
    }
  };

  const generarNumeroSiniestro = () => {
    const fecha = new Date();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SIN-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${random}`;
  };

  const handleFormSubmit = async () => {
    console.log('Datos del formulario a enviar:', formData); // DEBUG
    
    // Validar campos obligatorios
    if (!formData.poliza || !formData.tipo_siniestro || !formData.descripcion || !formData.monto_reclamado) {
      message.error('Faltan campos obligatorios. Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        message.error('No estás autenticado.');
        setLoading(false);
        return;
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    // CORRECCIÓN: Convertir documentos_adjuntos de array a string
    const documentosString = Array.isArray(formData.documentos_adjuntos) 
      ? formData.documentos_adjuntos.join(', ')
      : formData.documentos_adjuntos || '';

    // Preparar datos para enviar
    const siniestroData = {
      poliza: formData.poliza,
      numero_siniestro: formData.numero_siniestro || generarNumeroSiniestro(),
      tipo_siniestro: formData.tipo_siniestro,
      fecha_siniestro: formData.fecha_siniestro.format('YYYY-MM-DD'),
      descripcion: formData.descripcion,
      monto_reclamado: formData.monto_reclamado,
      documentos_adjuntos: documentosString, // ← ENVIAR COMO STRING, NO ARRAY
      estado: 'reportado'
    };
      console.log('Enviando datos de siniestro:', siniestroData);

      const response = await axios.post('http://127.0.0.1:8000/api/siniestros/', siniestroData, { headers });
      
      message.success('Siniestro reportado exitosamente. Será revisado por nuestro equipo.');
      console.log('Respuesta del servidor:', response.data);
      
      setTimeout(() => {
        navigate('/admin-siniestros');
      }, 2000);

    } catch (error: any) {
      console.error('Error al reportar siniestro:', error);
      console.error('Detalles del error:', error.response?.data);
      
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.poliza) message.error(`Póliza: ${errors.poliza[0]}`);
        if (errors.tipo_siniestro) message.error(`Tipo siniestro: ${errors.tipo_siniestro[0]}`);
        if (errors.descripcion) message.error(`Descripción: ${errors.descripcion[0]}`);
        if (errors.monto_reclamado) message.error(`Monto: ${errors.monto_reclamado[0]}`);
        
        if (!errors.poliza && !errors.tipo_siniestro && !errors.descripcion && !errors.monto_reclamado) {
          message.error(`Error del servidor: ${JSON.stringify(errors)}`);
        }
      } else {
        message.error('Error de conexión. Verifica tu internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateStep1 = async () => {
    try {
      const values = await form.validateFields(['poliza', 'tipo_siniestro', 'fecha_siniestro']);
      // Actualizar estado con los valores validados
      setFormData(prev => ({
        ...prev,
        poliza: values.poliza,
        tipo_siniestro: values.tipo_siniestro,
        fecha_siniestro: values.fecha_siniestro
      }));
      console.log('Paso 1 validado y guardado:', values);
      nextStep();
    } catch (error) {
      console.log('Errores paso 1:', error);
      message.error('Por favor completa los campos requeridos');
    }
  };

  const validateStep2 = async () => {
    try {
      const values = await form.validateFields(['descripcion', 'monto_reclamado', 'numero_siniestro', 'documentos_adjuntos']);
      // Actualizar estado con los valores validados
      setFormData(prev => ({
        ...prev,
        descripcion: values.descripcion,
        monto_reclamado: values.monto_reclamado,
        numero_siniestro: values.numero_siniestro,
        documentos_adjuntos: values.documentos_adjuntos || []
      }));
      console.log('Paso 2 validado y guardado:', values);
      nextStep();
    } catch (error) {
      console.log('Errores paso 2:', error);
      message.error('Por favor completa los campos requeridos');
    }
  };

  // Actualizar formData cuando los campos cambien
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const polizaSeleccionada = polizas.find(p => p.id === formData.poliza);
  const sumaAsegurada = polizaSeleccionada ? parseFloat(polizaSeleccionada.suma_asegurada) : 0;

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin-siniestros')}
          style={{ marginBottom: '20px', fontFamily: 'Michroma, sans-serif' }}
        >
          Volver a Siniestros
        </Button>

        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px', fontFamily: 'Michroma, sans-serif' }}>
          <FileTextOutlined /> Reportar Siniestro
        </Title>

        <Card>
          <Steps current={currentStep} style={{ marginBottom: '30px' }}>
            <Step title="Información Básica" description="Póliza y tipo de siniestro" />
            <Step title="Detalles" description="Descripción y monto" />
            <Step title="Confirmación" description="Revisar y enviar" />
          </Steps>

          {/* FORMULARIO PRINCIPAL - FUERA DEL FLUJO CONDICIONAL */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
              fecha_siniestro: dayjs(),
              numero_siniestro: generarNumeroSiniestro(),
              documentos_adjuntos: []
            }}
          >
            {/* PASO 1: Información Básica */}
            {currentStep === 0 && (
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <Alert
                    message="Información importante"
                    description="Solo puedes reportar siniestros para pólizas activas. Asegúrate de tener toda la documentación necesaria."
                    type="info"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    style={{ marginBottom: '20px' }}
                  />
                </Col>

                <Col span={24}>
                  <Item
                    name="poliza"
                    label="Póliza Afectada"
                    rules={[{ required: true, message: 'Selecciona la póliza afectada' }]}
                  >
                    <Select
                      placeholder="Seleccionar póliza activa"
                      showSearch
                      optionFilterProp="children"
                      suffixIcon={<InsuranceOutlined />}
                      disabled={!!polizaId}
                      onChange={(value) => handleFieldChange('poliza', value)}
                    >
                      {polizas.map(poliza => (
                        <Option key={poliza.id} value={poliza.id}>
                          {poliza.numero_poliza} - {poliza.cliente_info.usuario_info.first_name} {poliza.cliente_info.usuario_info.last_name} 
                          (Suma asegurada: ${parseFloat(poliza.suma_asegurada).toLocaleString()})
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>

                <Col span={12}>
                  <Item
                    name="tipo_siniestro"
                    label="Tipo de Siniestro"
                    rules={[{ required: true, message: 'Selecciona el tipo de siniestro' }]}
                  >
                    <Select 
                      placeholder="Seleccionar tipo"
                      onChange={(value) => handleFieldChange('tipo_siniestro', value)}
                    >
                      <Option value="muerte">Muerte Accidental</Option>
                      <Option value="invalidez_total">Invalidez Total Permanente</Option>
                      <Option value="invalidez_parcial">Invalidez Parcial Permanente</Option>
                      <Option value="gastos_medicos">Gastos Médicos por Accidente</Option>
                      <Option value="hospitalizacion">Hospitalización</Option>
                      <Option value="incapacidad_temporal">Incapacidad Temporal</Option>
                      <Option value="otros">Otros</Option>
                    </Select>
                  </Item>
                </Col>

                <Col span={12}>
                  <Item
                    name="fecha_siniestro"
                    label="Fecha del Siniestro"
                    rules={[{ required: true, message: 'Selecciona la fecha del siniestro' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      suffixIcon={<CalendarOutlined />}
                      disabledDate={current => current && current > dayjs().endOf('day')}
                      onChange={(value) => handleFieldChange('fecha_siniestro', value)}
                    />
                  </Item>
                </Col>

                <Col span={24} style={{ textAlign: 'right', marginTop: '20px' }}>
                  <Button type="primary" onClick={validateStep1}>
                    Siguiente
                  </Button>
                </Col>
              </Row>
            )}

            {/* PASO 2: Detalles del Siniestro */}
            {currentStep === 1 && (
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <Item
                    name="descripcion"
                    label="Descripción Detallada del Siniestro"
                    rules={[{ 
                      required: true, 
                      message: 'Describe detalladamente lo ocurrido',
                      min: 50,
                    }]}
                    help="Mínimo 50 caracteres. Incluye lugar, circunstancias, personas involucradas, etc."
                  >
                    <TextArea 
                      rows={6} 
                      placeholder="Describe detalladamente cómo ocurrió el siniestro, lugar, circunstancias, personas involucradas, daños o lesiones, testigos, etc..."
                      showCount
                      maxLength={2000}
                      onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                    />
                  </Item>
                </Col>

                <Col span={12}>
                  <Item
                    name="monto_reclamado"
                    label="Monto Reclamado (USD)"
                    rules={[
                      { required: true, message: 'Ingresa el monto reclamado' },
                      { 
                        validator: (_, value) => {
                          if (value && value > sumaAsegurada) {
                            return Promise.reject(new Error(`El monto no puede exceder la suma asegurada ($${sumaAsegurada.toLocaleString()})`));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Ej: 5000"
                      min={1}
                      max={sumaAsegurada}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                      prefix={<DollarOutlined />}
                      onChange={(value) => handleFieldChange('monto_reclamado', value)}
                    />
                  </Item>
                  {sumaAsegurada > 0 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Suma asegurada disponible: ${sumaAsegurada.toLocaleString()}
                    </Text>
                  )}
                </Col>

                <Col span={12}>
                  <Item
                    name="numero_siniestro"
                    label="Número de Siniestro"
                  >
                    <Input 
                      placeholder="Número automático" 
                      readOnly 
                      prefix={<FileTextOutlined />}
                      onChange={(e) => handleFieldChange('numero_siniestro', e.target.value)}
                    />
                  </Item>
                </Col>

                <Col span={24}>
                  // En el campo documentos_adjuntos, cambiar el placeholder:
                  <Item
                    name="documentos_adjuntos"
                    label="Documentos Adjuntos (URLs o descripción)"
                    tooltip="Ingresa URLs de documentos o describe los documentos disponibles (ej: acta policial, reporte médico, fotos)"
                  >
                    <Select
                      mode="tags"
                      placeholder="Ej: https://drive.google.com/acta-policial.pdf o 'Documentos físicos en oficina'"
                      style={{ width: '100%' }}
                      tokenSeparators={[',']}
                      onChange={(value) => handleFieldChange('documentos_adjuntos', value)}
                    />
                  </Item>
                </Col>

                <Col span={24} style={{ textAlign: 'right', marginTop: '20px' }}>
                  <Button style={{ marginRight: 8 }} onClick={prevStep}>
                    Anterior
                  </Button>
                  <Button type="primary" onClick={validateStep2}>
                    Siguiente
                  </Button>
                </Col>
              </Row>
            )}

            {/* PASO 3: Confirmación */}
            {currentStep === 2 && (
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <Title level={4}>Resumen del Siniestro</Title>
                  
                  <Descriptions bordered column={1} style={{ marginBottom: '20px' }}>
                    <Descriptions.Item label="Póliza">
                      {polizaSeleccionada?.numero_poliza || 'No seleccionada'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cliente">
                      {polizaSeleccionada ? `${polizaSeleccionada.cliente_info.usuario_info.first_name} ${polizaSeleccionada.cliente_info.usuario_info.last_name}` : 'No seleccionado'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tipo de Siniestro">
                      {formData.tipo_siniestro || 'No seleccionado'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha del Siniestro">
                      {formData.fecha_siniestro?.format('YYYY-MM-DD') || 'No seleccionada'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Monto Reclamado">
                      ${formData.monto_reclamado?.toLocaleString() || '0'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Descripción">
                      {formData.descripcion || 'No ingresada'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Documentos Adjuntos">
                      {formData.documentos_adjuntos?.join(', ') || 'Ninguno'}
                    </Descriptions.Item>
                  </Descriptions>

                  <Alert
                    message="Proceso de revisión"
                    description="Después de enviar este reporte, nuestro equipo se contactará para solicitar la documentación necesaria y proceder con la investigación. El proceso de revisión puede tomar de 5 a 10 días hábiles."
                    type="info"
                    showIcon
                    style={{ marginBottom: '20px' }}
                  />
                </Col>

                <Col span={24} style={{ textAlign: 'center', marginTop: '30px' }}>
                  <Button style={{ marginRight: 8 }} onClick={prevStep}>
                    Anterior
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    size="large"
                    style={{ fontFamily: 'Michroma, sans-serif' }}
                    icon={<FileTextOutlined />}
                  >
                    {loading ? 'Reportando Siniestro...' : 'Reportar Siniestro'}
                  </Button>
                </Col>
              </Row>
            )}
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default ReportarSiniestroPage;