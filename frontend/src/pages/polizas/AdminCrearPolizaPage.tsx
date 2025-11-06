// en frontend/src/pages/polizas/AdminCrearPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, Input, Button, message, Row, Col, Select, DatePicker, InputNumber } from 'antd';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;
const { Option } = Select;

// Interfaces para los datos que cargaremos
interface Cliente {
  id: number;
  usuario: { // Suponiendo la estructura de tu ClienteSerializer
    first_name: string;
    last_name: string;
  };
}

interface Agente {
  id: number;
  usuario: { // Suponiendo la estructura de tu AgenteSerializer
    first_name: string;
    last_name: string;
  };
}

const AdminCrearPolizaPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('accessToken');

  // --- 1. CARGA LOS DATOS PARA LOS DESPLEGABLES ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) {
          message.error('No estás autenticado.');
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        // Peticiones en paralelo para Clientes y Agentes
        const [clientesRes, agentesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/clientes/', { headers }),
          axios.get('http://127.0.0.1:8000/api/agentes/', { headers })
        ]);

        setClientes(clientesRes.data);
        setAgentes(agentesRes.data);

      } catch (error) {
        console.error('Error al cargar datos:', error);
        message.error('Error al cargar la lista de clientes o agentes.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // El [] asegura que solo se ejecute una vez

  // --- 2. FUNCIÓN DE ENVÍO DEL FORMULARIO ---
  const handleFormSubmit = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Formatea las fechas al formato que Django espera (YYYY-MM-DD)
      const formattedValues = {
        ...values,
        fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
        fecha_vencimiento: values.fecha_vencimiento.format('YYYY-MM-DD'),
      };

      // Tu compañero debe tener este endpoint (basado en tu serializers.txt)
      // Usamos 'POST /api/polizas/' que usa 'CrearPolizaSerializer'
      await axios.post('http://127.0.0.1:8000/api/polizas/', formattedValues, { headers });
      
      message.success('Póliza creada exitosamente.');
      navigate('/admin-polizas'); // Redirige de vuelta a la lista

    } catch (error: any) {
      console.error('Error al crear póliza:', error);
      message.error('Error al crear la póliza.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Content style={{padding: '15px'}}>
          <Button
                type="default" // O "ghost" para que sea más sutil
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)} // <-- ¡LA MAGIA! -1 significa "ir atrás"
                style={{ marginBottom: '10px', fontFamily: 'Michroma, sans-serif'}}
                >
                Volver
          </Button>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px', fontFamily: 'Michroma, sans-serif'}}>
          Crear Nueva Póliza
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Item
                name="cliente"
                label="Cliente"
                rules={[{ required: true, message: 'Seleccione un cliente' }]}
              >
                <Select
                  showSearch
                  placeholder="Seleccione un cliente"
                  loading={loading}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {clientes.map(cliente => (
                    <Option key={cliente.id} value={cliente.id} label={`${cliente.usuario.first_name} ${cliente.usuario.last_name}`}>
                      {cliente.usuario.first_name} {cliente.usuario.last_name} (ID: {cliente.id})
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col span={12}>
              <Item
                name="agente"
                label="Agente Asignado"
                rules={[{ required: true, message: 'Seleccione un agente' }]}
              >
                <Select
                  showSearch
                  placeholder="Seleccione un agente"
                  loading={loading}
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {agentes.map(agente => (
                    <Option key={agente.id} value={agente.id} label={`${agente.usuario.first_name} ${agente.usuario.last_name}`}>
                      {agente.usuario.first_name} {agente.usuario.last_name} (ID: {agente.id})
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Item
                name="suma_asegurada"
                label="Suma Asegurada ($)"
                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={1000} />
              </Item>
            </Col>
            <Col span={12}>
              <Item
                name="prima_anual"
                label="Prima Anual ($)"
                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={100} />
              </Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Item
                name="fecha_inicio"
                label="Fecha de Inicio"
                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Item>
            </Col>
            <Col span={12}>
              <Item
                name="fecha_vencimiento"
                label="Fecha de Vencimiento"
                rules={[{ required: true, message: 'Este campo es obligatorio' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Item>
            </Col>
          </Row>

          <Item>
            <center>
                <Button type="primary" 
                htmlType="submit" 
                loading={loading} 
                style={{ marginTop: '8px', fontFamily: 'Michroma, sans-serif', padding: '17px 45px'}}>
                Guardar Póliza
                </Button>
            </center>
          </Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AdminCrearPolizaPage;