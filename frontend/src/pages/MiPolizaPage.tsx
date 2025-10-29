import React from 'react';
import { Typography, Layout } from 'antd'; // <-- Usa antd

const { Content } = Layout;
const { Title } = Typography;

function MiPolizaPage() {
    return (
        <Layout style={{ padding: '24px' }}>
            <Content>
                <Title level={2}>Mi Póliza</Title>
                {/* Aquí mostrarás la información de la póliza */}
            </Content>
        </Layout>
    );
}
export default MiPolizaPage;