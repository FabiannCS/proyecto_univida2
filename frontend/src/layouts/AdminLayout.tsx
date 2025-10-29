// en frontend/src/layouts/AdminLayout.tsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SolutionOutlined,
  LogoutOutlined,
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 1. BARRA LATERAL (SIDER) */}
      <Sider trigger={null} collapsible collapsed={collapsed} style={{background: '#212121'}}>
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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} style={{background: '#212121', borderRight: 0}}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/admin-dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<SolutionOutlined />}>
            <Link to="/admin-agentes">Gestionar Agentes</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            <Link to="/admin-clientes">Ver Clientes</Link>
          </Menu.Item>
        </Menu>
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