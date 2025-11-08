// en frontend/src/layouts/AdminLayout.tsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Space, message } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SolutionOutlined,
  FileTextOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  UserSwitchOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState<string>('Usuario');
  const [userRole, setUserRole] = useState<string>('');
  const navigate = useNavigate();

  // Usar el hook de timeout de sesión
  useSessionTimeout();

  // Cargar información del usuario al montar el componente
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

  // Items del dropdown de usuario
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserSwitchOutlined />,
      label: 'Mi Perfil',
      onClick: () => {
        message.info('Funcionalidad de perfil en desarrollo');
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => {
        message.info('Funcionalidad de configuración en desarrollo');
      },
    },
    {
      type: 'divider',
    },
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


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={240} style={{background: '#212121'}}>
        <Title level={4} style={{ 
          fontWeight: 'bold', 
          margin: '16px 0',  
          color: 'white', 
          textAlign: 'center', 
          lineHeight: '32px', 
          fontFamily: "'Michroma', sans-serif",
          fontSize: '1.1rem'
        }}>
          {collapsed ? 'SU' : 'SegurosUnivida'}
        </Title>
        
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={['1']}
          items={menuItems}
          className='custom-menu'
        />
        <style>
          {`
            .custom-menu.ant-menu-dark {
              background: #212121;
            }
            .user-dropdown-trigger {
              padding: 8px 12px;
              border-radius: 6px;
              transition: background-color 0.3s;
              cursor: pointer;
            }
            .user-dropdown-trigger:hover {
              background-color: #f5f5f5;
            }
          `}
        </style>
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: '#ffffff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontFamily: "'Michroma', sans-serif",
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
            arrow
            trigger={['click']}
          >
            <div className="user-dropdown-trigger">
              <Space>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    marginRight: '8px',
                    background: userRole === 'ADMIN' ? '#f56a00' : '#7265e6'
                  }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {userName}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    textTransform: 'capitalize'
                  }}>
                    {userRole.toLowerCase()}
                  </span>
                </div>
              </Space>
            </div>
          </Dropdown>
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
    </Layout>
  );
};

export default AdminLayout;
