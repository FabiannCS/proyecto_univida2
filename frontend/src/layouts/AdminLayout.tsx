// en frontend/src/layouts/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Breadcrumb } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SolutionOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  MoreOutlined,
  SearchOutlined,
  BellOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import type { MenuProps } from 'antd';
import { Space, Input, Badge, Tooltip } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState<string>('Usuario');
  const [userRole, setUserRole] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useSessionTimeout();

  useEffect(() => {
    const userInfo = authService.getUserInfo();
    if (userInfo) {
      setUserName(authService.getFullName());
      setUserRole(userInfo.rol);
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
      onClick: () => navigate('/admin-perfil'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => {},
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

  const menuItems = [
    {
      key: '1',
      icon: React.createElement(DashboardOutlined),
      label: <Link to="/admin-dashboard" style={{fontFamily: 'Michroma, sans-serif', fontSize: '0.8rem'}}>Reportes</Link>,
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

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/admin-agentes')) return ['2'];
    if (path.startsWith('/admin-clientes')) return ['3'];
    if (path.startsWith('/admin-polizas')) return ['4'];
    if (path.startsWith('/admin-siniestros')) return ['5'];
    return ['1'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={260}
        style={{
          background: '#212121',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* --- CONTENIDO DEL SIDER (Dentro de las etiquetas, NO como prop) --- */}
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
                {collapsed ? 'SU' : 'SegurosUnivida'}
                </Title>
            </div>

            {/* 2. MENÚ */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <Menu 
                theme="dark" 
                mode="inline" 
                selectedKeys={getSelectedKey()}
                items={menuItems}
                style={{ background: '#212121', borderRight: 0 }}
                />
            </div>

            {/* 3. PERFIL DE USUARIO (Abajo) */}
            <div style={{ 
                padding: '16px', 
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: '#1a1a1a',
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
                            style={{ 
                                background: userRole === 'ADMIN' ? '#f56a00' : '#7265e6',
                                flexShrink: 0 
                            }} 
                        />
                        
                        {!collapsed && (
                            <div style={{ marginLeft: '12px', overflow: 'hidden', flex: 1 }}>
                                <Text style={{ color: 'white', display: 'block', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {userName}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', display: 'block' }}>
                                    {userRole.toLowerCase()}
                                </Text>
                            </div>
                        )}
                        
                        {!collapsed && <MoreOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
                    </div>
                </Dropdown>
            </div>
        </div>
        {/* --- FIN DEL CONTENIDO DEL SIDER --- */}
      </Sider>
      
      {/* Layout Principal */}
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
          
          {/* IZQUIERDA: Toggle y Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 46, height: 46, marginRight: 16 }}
            />
            <Breadcrumb>
              <Breadcrumb.Item href="/admin-dashboard">
                <HomeOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item>Inicio</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* CENTRO: Buscador 
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '500px', padding: '0 24px' }}>
            <Input
              placeholder="Buscar..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              bordered={false}
              style={{ 
                backgroundColor: '#f5f5f5', 
                borderRadius: '6px',
                padding: '6px 12px',
                width: '100%',
                maxWidth: '400px'
              }}
            />
          </div>*/}

          {/* DERECHA: Notificaciones y Ayuda */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space size="large">
              <Tooltip title="Ayuda">
                <Button type="text" icon={<QuestionCircleOutlined style={{ fontSize: '18px', color: '#666' }} />} />
              </Tooltip>
              <Tooltip title="Notificaciones">
                <Badge count={5} size="small" offset={[0, 5]}> 
                  <Button type="text" icon={<BellOutlined style={{ fontSize: '18px', color: '#666' }} />} />
                </Badge>
              </Tooltip>
            </Space>
          </div>

        </Header>
        
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          minHeight: 280, 
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Outlet /> 
        </Content>
      </Layout>

      {/* Estilos globales para componentes internos de Antd */}
      <style>
        {`
          .user-profile-trigger:hover {
            background: rgba(255,255,255,0.1);
          }
          /* Esto asegura que el contenedor interno del Sider ocupe toda la altura */
          .ant-layout-sider-children {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
        `}
      </style>
    </Layout>
  );
};

export default AdminLayout;