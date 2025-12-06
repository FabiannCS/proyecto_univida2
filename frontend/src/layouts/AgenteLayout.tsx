// en frontend/src/layouts/AgenteLayout.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Breadcrumb } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UsergroupAddOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  HomeOutlined,
  MoreOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  InboxOutlined,
  DollarOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import type { MenuProps } from 'antd';
import { Space, Input, Badge, Tooltip } from 'antd';

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
    navigate('/login');
  };

  // --- MENÚ DE PERFIL ---
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

  // --- MENÚ LATERAL (Específico de Agente) ---
  const menuItems = [
    {
      key: '1',
      icon: React.createElement(DashboardOutlined),
      label: <Link to="/agente-dashboard" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Mi Resumen</Link>,
    },
    // --- NUEVA OPCIÓN ---
    {
      key: '4', // Usamos key 4 para no mover las otras
      icon: React.createElement(InboxOutlined), // Recuerda importarlo
      label: <Link to="/agente-solicitudes" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Solicitudes Nuevas</Link>,
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
    {
    key: '5',
    icon: React.createElement(DollarOutlined),
    label: <Link to="/agente-pagos" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Caja / Pagos</Link>,
    },
    {
      key: '6', // O el número que siga
      icon: React.createElement(AlertOutlined),
      label: <Link to="/agente-siniestros" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Siniestros</Link>,
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/agente-solicitudes')) return ['4'];
    if (path.startsWith('/agente-clientes')) return ['2'];
    if (path.startsWith('/agente-polizas')) return ['3'];
    if (path.startsWith('/agente-pagos')) return ['5'];
    if (path.startsWith('/agente-siniestros')) return ['6'];
    return ['1'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* SIDER (Barra Lateral - Color Verde Oscuro para diferenciar) */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={260}
        style={{
          background: '#002329', // Un tono verdoso oscuro para diferenciar del Admin
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* 1. LOGO */}
            <div style={{ padding: '16px', textAlign: 'center', flexShrink: 0 }}>
                <Title level={4} style={{ 
                fontWeight: 'bold', 
                margin: 0,  
                color: 'white', 
                fontFamily: "'Michroma', sans-serif",
                fontSize: collapsed ? '1rem' : '1.1rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
                }}>
                {collapsed ? 'AG' : 'Portal Agente'}
                </Title>
            </div>

            {/* 2. MENÚ */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <Menu 
                theme="dark" 
                mode="inline" 
                selectedKeys={getSelectedKey()}
                items={menuItems}
                style={{ background: '#002329', borderRight: 0 }}
                />
            </div>

            {/* 3. PERFIL (Abajo) */}
            <div style={{ 
                padding: '16px', 
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)',
                flexShrink: 0 
            }}>
                <Dropdown 
                    menu={{ items: userMenuItems }} 
                    placement="topRight" 
                    trigger={['click']}
                >
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background 0.3s',
                    }}
                    className="user-profile-trigger"
                    >
                        <Avatar 
                            icon={<UserOutlined />} 
                            style={{ background: '#52c41a', flexShrink: 0 }} 
                        />
                        
                        {!collapsed && (
                            <div style={{ marginLeft: '12px', overflow: 'hidden', flex: 1 }}>
                                <Text style={{ color: 'white', display: 'block', fontWeight: 500 }}>
                                    {userName}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', display: 'block' }}>
                                    Agente
                                </Text>
                            </div>
                        )}
                        
                        {!collapsed && <MoreOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
                    </div>
                </Dropdown>
            </div>
        </div>
      </Sider>
      
      {/* LAYOUT PRINCIPAL */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#ffffff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontFamily: "'Michroma', sans-serif",
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 99,
          width: '100%'
        }}>
          
          {/* Toggle y Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 46, height: 46, marginRight: 16 }}
            />
            <Breadcrumb>
              <Breadcrumb.Item href="/agente-dashboard">
                <HomeOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item>Mi Portal</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* Buscador */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '500px', padding: '0 24px' }}>
            <Input
              placeholder="Buscar cliente..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              bordered={false}
              style={{ backgroundColor: '#f5f5f5', borderRadius: '6px', padding: '6px 12px', width: '100%' }}
            />
          </div>

          {/* Notificaciones */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space size="large">
              <Tooltip title="Notificaciones">
                <Badge count={2} size="small" offset={[0, 5]}> 
                  <Button type="text" icon={<BellOutlined style={{ fontSize: '18px', color: '#666' }} />} />
                </Badge>
              </Tooltip>
            </Space>
          </div>

        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: '8px' }}>
          <Outlet /> 
        </Content>
      </Layout>

      <style>{`
          .user-profile-trigger:hover { background: rgba(255,255,255,0.1); }
          .ant-layout-sider-children { height: 100%; display: flex; flex-direction: column; }
      `}</style>
    </Layout>
  );
};

export default AgenteLayout;