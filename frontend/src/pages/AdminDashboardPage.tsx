import React from 'react';
import { Typography, Layout } from 'antd'; // <-- Usa antd

const { Content } = Layout;
const { Title } = Typography;

function AdminDashboardPage() {
    return (
        <Layout style={{ padding: '24px' }}>
            <Content>
                <Title level={2}>Dashboard del Administrador</Title>
                {/* Aquí pondrás el contenido del dashboard */}
            </Content>
        </Layout>
    );
}
export default AdminDashboardPage;