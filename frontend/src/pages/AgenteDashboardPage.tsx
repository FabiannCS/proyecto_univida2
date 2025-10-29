import React from 'react';
import { Typography, Layout } from 'antd'; // <-- Usa antd

const { Content } = Layout;
const { Title } = Typography;

function AgenteDashboardPage() {
    return (
        <Layout style={{ padding: '24px' }}>
            <Content>
                <Title level={2}>Dashboard del Agente</Title>
                {/* Aquí pondrás el contenido del dashboard */}
            </Content>
        </Layout>
    );
}
export default AgenteDashboardPage;