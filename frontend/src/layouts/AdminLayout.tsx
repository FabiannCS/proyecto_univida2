// en frontend/src/layouts/AdminLayout.tsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SolutionOutlined,
  FileTextOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout: React.FC = () => {
const [collapsed, setCollapsed] = useState(false);
const navigate = useNavigate();

const handleLogout = () => {
    // 1. Borra el token del almacenamiento
    localStorage.removeItem('accessToken');
    // 2. Redirige al login
    navigate('/');
};
const menuItems = [
    {
        key: '1',
        icon: React.createElement(DashboardOutlined), // Crea el ícono
        label: <Link to="/admin-dashboard" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Reportes</Link>, // El contenido es el Link
    },
    {
        key: '2',
        icon: React.createElement(SolutionOutlined),
        label: <Link to="/admin-agentes" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Gestionar Agentes</Link>,
    },
    {
        key: '3',
        icon: React.createElement(UserOutlined),
        label: <Link to="/admin-clientes" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Gestionar Clientes</Link>,
    },
    {
        key: '4',
        icon: React.createElement(FileTextOutlined),
        label: <Link to="/admin-polizas" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Gestionar Pólizas</Link>,
    },
    {
        key: '5',
        icon: React.createElement(ExclamationCircleOutlined),
        label: <Link to="/admin-siniestros" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Gestionar Siniestros</Link>,
    },
];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 1. BARRA LATERAL (SIDER) */}
      <Sider trigger={null} collapsible collapsed={collapsed} width={240} style={{background: '#212121'}}>
        <Title level={4} style={{ fontWeight: 'bold', 
                                    margin: '16px 0',  
                                    color: 'white', 
                                    textAlign: 'center', 
                                    lineHeight: '32px', 
                                    fontFamily: "'Michroma', sans-serif",
                                    fontSize: '1.1rem'
                                    }}>
          {collapsed ? 'SU' : 'SegurosUnivida'}
        </Title>
        
        {/* Menú de Navegación */}
        <Menu 
            theme="dark" 
            mode="inline" 
            defaultSelectedKeys={['1']}
            items={menuItems} // <-- USA LA PROP 'items' AQUÍ
            className='custom-menu'
        />
        <style>
        {`
            .custom-menu.ant-menu-dark {
                background: #212121;
            }
        `}
        </style>
      </Sider>
      
      {/* 2. ÁREA PRINCIPAL (Layout) */}
      <Layout>
        {/* Barra Superior */}
        <Header style={{ padding: '0 16px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Michroma', sans-serif"}}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
            <span style={{ marginRight: '16px' }}>fabian_admin</span>
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger // <-- Botón rojo
              
            >
              Cerrar Sesión
            </Button>
          </div>
        </Header>
        
        {/* 3. ÁREA DE CONTENIDO PRINCIPAL */}
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
          {/* ¡AQUÍ ESTÁ LA MAGIA! */}
          {/* Outlet es el marcador de posición donde React Router
              renderizará la página actual (ej: AdminDashboardPage) */}
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;