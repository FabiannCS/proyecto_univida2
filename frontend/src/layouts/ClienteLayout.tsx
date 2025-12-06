// en frontend/src/layouts/ClienteLayout.tsx
import React, { useState } from 'react';
import { Layout, Button, Typography, Dropdown, Avatar, Space, Tooltip, Modal, Divider, Collapse, message } from 'antd';
import { 
    LogoutOutlined, UserOutlined, DownOutlined, WarningOutlined, DownloadOutlined, 
    QuestionCircleOutlined, PhoneOutlined, MailOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Panel } = Collapse;

const ClienteLayout: React.FC = () => {
  const navigate = useNavigate();
  const userName = authService.getFullName() || 'Cliente';
  const [isHelpOpen, setIsHelpOpen] = useState(false); // <-- Estado para el Modal Global

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

// --- FUNCIÓN DE DESCARGA DE PDF ---
  const handleDownloadPDF = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // 1. Identificar al usuario
        const decodedToken: any = jwtDecode(token);
        const miUsername = decodedToken.username;

        // 2. Buscar la póliza del usuario
        // (Hacemos esto aquí porque el Layout no sabe qué póliza se está viendo en el Dashboard)
        const resPolizas = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        const miPoliza = resPolizas.data.find((p: any) => 
            p.cliente_info?.usuario_info?.username === miUsername &&
            p.estado !== 'cancelada'
        );

        if (!miPoliza) {
            message.warning("No se encontró ninguna póliza activa para descargar.");
            return;
        }

        // 3. Validar estado
        if (miPoliza.estado !== 'activa') {
            message.warning(`Tu póliza está en estado: ${miPoliza.estado.toUpperCase()}. Solo se pueden descargar pólizas ACTIVAS.`);
            return; 
        }

        message.loading({ content: 'Generando documento oficial...', key: 'pdfDownload' });

        // 4. Descargar PDF
        const response = await axios.get(`http://127.0.0.1:8000/api/polizas/${miPoliza.id}/pdf/`, {
            headers,
            responseType: 'blob', // Importante para archivos
        });

        // 5. Crear enlace temporal para descargar
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Poliza_${miPoliza.numero_poliza}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);

        message.success({ content: 'Póliza descargada correctamente', key: 'pdfDownload' });

    } catch (error) {
        console.error(error);
        message.error({ content: 'Error al descargar el PDF. Verifica la conexión.', key: 'pdfDownload' });
    }
  };

  const userMenu = [
    // --- ESTO ES LO QUE FALTA O SE BORRÓ ---
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/cliente-perfil'), // <-- Esta es la ruta clave
    },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar Sesión', danger: true, onClick: handleLogout },
    
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#001529', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky', top: 0, zIndex: 1000, width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Title level={4} style={{ color: 'white', margin: 0, fontFamily: "'Michroma', sans-serif", fontSize: '1.1rem' }}>SegurosUnivida</Title>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Space size="small">
                {/* --- NUEVO BOTÓN DE AYUDA --- */}
                <Tooltip title="Centro de Ayuda">
                    <Button 
                        icon={<QuestionCircleOutlined />} 
                        ghost 
                        onClick={() => setIsHelpOpen(true)}
                        className="action-btn"
                    >
                        <span className="btn-text">Ayuda</span>
                    </Button>
                </Tooltip>

                <Tooltip title="Descargar copia de tu póliza">
                    <Button icon={<DownloadOutlined />} ghost className="action-btn" onClick={handleDownloadPDF}>
                        <span className="btn-text">Mi Póliza</span>
                    </Button>
                </Tooltip>
                
                <Button type="primary" danger icon={<WarningOutlined />} onClick={() => navigate('/reportar-siniestro')} className="action-btn">
                    <span className="btn-text">Reportar Siniestro</span>
                </Button>
            </Space>

            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
            <div style={{ cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                <Space size="small">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <span className="user-name-responsive" style={{ fontWeight: 500 }}>{userName}</span>
                <DownOutlined style={{ fontSize: '12px' }} />
                </Space>
            </div>
            </Dropdown>
        </div>
      </Header>

      <Content style={{ padding: '24px', marginTop: 0 }}>
        <div style={{ background: '#fff', padding: 24, minHeight: '80vh', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Outlet />
        </div>
      </Content>

      {/* --- MODAL DE AYUDA GLOBAL --- */}
      <Modal
        title="Centro de Ayuda"
        open={isHelpOpen}
        onCancel={() => setIsHelpOpen(false)}
        footer={[<Button key="close" onClick={() => setIsHelpOpen(false)}>Cerrar</Button>]}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <QuestionCircleOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
            <p>¿Cómo podemos ayudarte hoy?</p>
        </div>
        <Title level={5}>Contacto de Emergencia</Title>
        <p><PhoneOutlined /> Línea Gratuita: <strong>800-10-20-30</strong></p>
        <p><MailOutlined /> Soporte: <strong>soporte@univida.com</strong></p>
        <Divider />
        <Title level={5}>Preguntas Frecuentes</Title>
        <Collapse accordion ghost>
            <Panel header="¿Cómo reporto un siniestro?" key="1">
                <p>Ve al botón rojo "Reportar Siniestro" en la barra superior, llena el formulario y adjunta la documentación requerida.</p>
            </Panel>
            <Panel header="¿Dónde veo mis pagos?" key="2">
                <p>En tu dashboard principal, debajo de la información de tu póliza, encontrarás la sección "Historial de Pagos".</p>
            </Panel>
        </Collapse>
      </Modal>

      <style>{`
        @media (max-width: 768px) {
            .user-name-responsive { display: none; }
            .btn-text { display: none; }
            .action-btn { padding: 4px 8px; }
        }
      `}</style>
    </Layout>
  );
};
export default ClienteLayout;