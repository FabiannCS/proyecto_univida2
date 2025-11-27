// en frontend/src/layouts/AgenteLayout.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  MoreOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AgenteLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState<string>('Agente');
  const navigate = useNavigate();
  const location = useLocation();

  useSessionTimeout();

  useEffect(() => {
    const userInfo = authService.getUserInfo();
    if (userInfo) {
      setUserName(authService.getFullName());
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserSwitchOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/agente-perfil'), // Ruta futura
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // --- MENÚ ESPECÍFICO PARA AGENTES ---
  const menuItems = [
    {
      key: '1',
      icon: React.createElement(DashboardOutlined),
      label: <Link to="/agente-dashboard" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Mi Resumen</Link>,
    },
    {
      key: '2',
      icon: React.createElement(UsergroupAddOutlined),
      label: <Link to="/agente-clientes" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Mis Clientes</Link>,
    },
    {
      key: '3',
      icon: React.createElement(FileDoneOutlined),
      label: <Link to="/agente-polizas" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Mis Pólizas</Link>,
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/agente-clientes')) return ['2'];
    if (path.startsWith('/agente-polizas')) return ['3'];
    return ['1'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* SIDER (Barra Lateral) */}
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        style={{
          background: '#001529', // Color azul oscuro distintivo para Agentes
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column', 
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <div style={{ padding: '16px', textAlign: 'center', flexShrink: 0 }}>
                <Title level={4} style={{ color: 'white', margin: 0, fontFamily: "'Michroma', sans-serif", fontSize: collapsed ? '1rem' : '1.1rem' }}>
                    {collapsed ? 'AG' : 'Portal Agente'}
                </Title>
            </div>

            {/* Menú */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <Menu 
                    theme="dark" 
                    mode="inline" 
                    selectedKeys={getSelectedKey()}
                    items={menuItems}
                    style={{ background: '#001529' }}
                />
            </div>

            {/* Perfil */}
            <div style={{ padding: '16px', background: '#002140', flexShrink: 0 }}>
                <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px', borderRadius: '8px' }} className="user-profile-trigger">
                        <Avatar icon={<UserOutlined />} style={{ background: '#52c41a', flexShrink: 0 }} />
                        {!collapsed && (
                            <div style={{ marginLeft: '12px', overflow: 'hidden', flex: 1 }}>
                                <Text style={{ color: 'white', display: 'block', fontWeight: 500 }}>{userName}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Agente</Text>
                            </div>
                        )}
                        {!collapsed && <MoreOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
                    </div>
                </Dropdown>
            </div>
        </div>
      </Sider>
      
      {/* Layout Principal */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        <Header style={{ background: '#fff', padding: 0, height: 64 }} /> {/* Header simple */}
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: '8px' }}>
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default AgenteLayout;