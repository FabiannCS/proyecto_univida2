import React from 'react';
import { Layout, Button, Typography, Dropdown, Avatar, Space, Tooltip, message,} from 'antd';
import { LogoutOutlined, UserOutlined, DownOutlined, WarningOutlined, DownloadOutlined} from '@ant-design/icons';
import { Outlet, useNavigate} from 'react-router-dom';
import { authService } from '../services/authService';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const { Header, Content } = Layout;
const { Title } = Typography;

const ClienteLayout: React.FC = () => {
  const navigate = useNavigate();
  const userName = authService.getFullName() || 'Cliente';
  const [actionLoading, setActionLoading] = React.useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/cliente-perfil'), // <-- Redirige a la nueva ruta
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
      onClick: handleLogout,
    },
  ];
 const handleDownloadPDF = async () => {
    console.log("1. Botón PDF presionado"); // <-- Debug
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };
        
        // ... (código de decodificar token) ...
        const decodedToken: any = jwtDecode(token);
        const miUsername = decodedToken.username;

        console.log("2. Buscando pólizas..."); // <-- Debug
        const resPolizas = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        
        const miPoliza = resPolizas.data.find((p: any) => 
            p.cliente_info?.usuario_info?.username === miUsername &&
            p.estado !== 'cancelada'
        );

        if (!miPoliza) {
            window.alert("No tienes pólizas registradas.");
            return;
        }

        console.log("3. Póliza encontrada, estado:", miPoliza.estado); // <-- Debug clave

        // --- VALIDACIÓN ---
        if (miPoliza.estado !== 'activa') {
            window.alert("AVISO: Tu póliza aún está en revisión ('" + miPoliza.estado + "'). Solo se pueden descargar pólizas ACTIVAS.");
            return; 
        }
        // ------------------

        console.log("4. Iniciando descarga..."); // <-- Debug
        message.loading({ content: 'Generando documento oficial...', key: 'pdfDownload' });

        // Esta llamada fallará si no hicimos el backend
        const response = await axios.get(`http://127.0.0.1:8000/api/polizas/${miPoliza.id}/pdf/`, {
            headers,
            responseType: 'blob',
        });
        
        // ... (código de descarga del blob) ...

        message.success({ content: 'Póliza descargada', key: 'pdfDownload' });

    } catch (error) {
        console.error("Error en PDF:", error);
        window.alert("ERROR: No se pudo descargar el PDF. (Probablemente falta el backend)");
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Barra Superior */}
        <Header style={{ 
            background: '#001529', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            // --- PROPIEDADES PARA HACERLO FIJO ---
            position: 'sticky',
            top: 0,
            zIndex: 1000, // Un zIndex alto para que flote sobre todo
            width: '100%',
            // -------------------------------------
        }}>
        {/* 1. Logo / Título */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Title level={4} style={{ color: 'white', margin: 0, fontFamily: "'Michroma', sans-serif" }}>
                SegurosUnivida
            </Title>
        </div>

        {/* 2. SECCIÓN DERECHA: Acciones y Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* --- NUEVOS BOTONES DE ACCIÓN RÁPIDA --- */}
            <Space size="small">
                <Tooltip title="Descargar copia de tu póliza (Solo Activas)">
                    <Button 
                        icon={<DownloadOutlined />} 
                        ghost 
                        className="action-btn"
                        onClick={handleDownloadPDF} // <-- CONECTADO
                    >
                        <span className="btn-text">Mi Póliza PDF</span>
                    </Button>
                </Tooltip>
                
                <Button 
                    type="primary" 
                    danger 
                    icon={<WarningOutlined />}
                    onClick={() => navigate('/reportar-siniestro')}
                    className="action-btn"
                >
                    <span className="btn-text">Reportar Siniestro</span>
                </Button>
            </Space>
            {/* --------------------------------------- */}

            {/* Separador visual (opcional) */}
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

            {/* 3. Perfil del Usuario */}
            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
            <div style={{ cursor: 'pointer', color: 'white' }}>
                <Space>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <span className="user-name-responsive" style={{ fontWeight: 500 }}>{userName}</span>
                <DownOutlined />
                </Space>
            </div>
            </Dropdown>
        </div>
      </Header>

      {/* Contenido */}
      <Content style={{ padding: '24px 50px', marginTop: 16 }}>
        <div style={{ 
            background: '#fff', 
            padding: 24, 
            minHeight: '80vh', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Outlet />
        </div>
      </Content>

      {/* Estilos Responsivos */}
      <style>{`
        @media (max-width: 768px) {
          .user-name-responsive {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .user-name-responsive {
            display: inline;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ClienteLayout;