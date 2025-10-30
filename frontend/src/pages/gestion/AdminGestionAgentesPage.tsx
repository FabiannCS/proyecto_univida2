// en frontend/src/pages/AdminGestionAgentesPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;
const { Item } = Form;

// Esta interfaz define la "forma" de un agente (basado en tu UsuarioAgenteSerializer)
interface Agente {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  // Añade otros campos que devuelva tu API si los necesitas
}

const AdminGestionAgentesPage: React.FC = () => {
  const navigate = useNavigate();
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(false);

  // --- 1. FUNCIÓN PARA OBTENER EL TOKEN ---
  // Necesitamos el token para autenticar nuestras peticiones a la API
  const getToken = () => localStorage.getItem('accessToken');

  // --- 2. FUNCIÓN PARA CARGAR LOS AGENTES (GET) ---
  const fetchAgentes = async () => {
    setLoading(true);
    try {
  const token = localStorage.getItem('accessToken');
      if (!token) {
        message.error('No estás autenticado. Por favor, inicia sesión de nuevo.');
        setLoading(false);
        // (Opcional: redirigir al login)
        // navigate('/'); 
        return; 
      }
      // Creamos los headers con el token de autorización
      const headers = { Authorization: `Bearer ${token}` };

      // Hacemos la petición GET a la API que creamos
      const response = await axios.get('http://127.0.0.1:8000/api/agentes/', { headers: headers });
      setAgentes(response.data);

    } catch (error: any) {
      console.error('Error al cargar agentes:', error);
      if (error.response && error.response.status === 401) {
        message.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        // (Opcional: redirigir al login)
        // navigate('/');
      } else {
        message.error('Error al cargar la lista de agentes.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. useEffect: SE EJECUTA CUANDO LA PÁGINA CARGA ---
  // Llama a fetchAgentes() una sola vez al cargar el componente
  useEffect(() => {
    fetchAgentes();
  }, []); // El array vacío [] significa "solo ejecutar una vez"

  // --- 4. FUNCIÓN PARA MANEJAR EL FORMULARIO (POST/PUT) ---
  const handleFormSubmit = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Aquí deberías tener lógica para saber si estás editando o creando
      // Por ahora, solo implementamos CREAR
      
      // Hacemos la petición POST a la API de creación
      await axios.post('http://127.0.0.1:8000/api/agentes/crear/', values, { headers });
      
      message.success('Agente creado exitosamente.');
      //setIsModalOpen(false); // Cierra el modal
      //form.resetFields(); // Limpia el formulario
      fetchAgentes(); // Vuelve a cargar la lista de agentes

    } catch (error: any) {
      console.error('Error al crear agente:', error);
      // Muestra errores de validación del backend si existen
      if (error.response && error.response.data) {
        // Antd puede mostrar errores en cada campo, pero esto es más simple
        message.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error('Error al crear el agente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Columnas para la Tabla de Ant Design ---
  // Define qué columnas mostrar y cómo renderizarlas
  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Nombre',
      dataIndex: 'first_name',
      key: 'first_name',
    },
    {
      title: 'Apellido',
      dataIndex: 'last_name',
      key: 'last_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: Agente) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => alert('Editar ID: ' + record.id)} style={{ marginRight: 8 }}>
            Editar
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => alert('Eliminar ID: ' + record.id)}>
            Eliminar
          </Button>
        </span>
      ),
    },
  ];

  // --- 6. RENDERIZADO VISUAL DE LA PÁGINA ---
  return (
    <Layout>
      <Content>
        <Title level={2} style={{fontFamily: 'Michroma, sans-serif', fontSize: '1.7rem'}}>Gestión de Agentes</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin-agentes/crear')}
          style={{ marginBottom: 16,  fontFamily: 'Michroma, sans-serif'}}
        >
          Crear Nuevo Agente
        </Button>
        
        {/* Tabla que muestra los agentes */}
        <Table
          columns={columns}
          dataSource={agentes}
          loading={loading}
          rowKey="id"
        />

        {/* Modal (popup) para crear un agente */}
        <Modal
          title="Crear Nuevo Agente"

          footer={null} // Ocultamos el footer por defecto, el form tendrá sus botones
        >
          <Form
            
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            <Item
              name="username"
              label="Nombre de Usuario"
              rules={[{ required: true, message: 'Este campo es obligatorio' }]}
            >
              <Input />
            </Item>
            <Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: 'Este campo es obligatorio' }]}
            >
              <Input.Password />
            </Item>
            <Item
              name="first_name"
              label="Nombre"
            >
              <Input />
            </Item>
            <Item
              name="last_name"
              label="Apellido"
            >
              <Input />
            </Item>
            <Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'No es un email válido' }]}
            >
              <Input />
            </Item>
            
            {/* Campos Opcionales para el Perfil Agente */}
            <Item
              name="codigo_agente"
              label="Código de Agente"
              rules={[{ required: true, message: 'Este campo es obligatorio' }]}
            >
              <Input />
            </Item>
            <Item
              name="fecha_contratacion"
              label="Fecha de Contratación (YYYY-MM-DD)"
            >
              <Input placeholder="YYYY-MM-DD" />
            </Item>

            <Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Guardar
              </Button>
            </Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminGestionAgentesPage;