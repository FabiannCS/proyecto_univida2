// en frontend/src/pages/cliente/ClientePagarPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, QRCode, Divider, message, Spin, Result, Row, Col, Statistic, Alert } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, DollarOutlined, ScanOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;

const ClientePagarPolizaPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [facturaPendiente, setFacturaPendiente] = useState<any>(null);

  const getToken = () => localStorage.getItem('accessToken');

  // 1. BUSCAR DEUDAS PENDIENTES
  useEffect(() => {
    const fetchDeuda = async () => {
      try {
        const token = getToken();
        if (!token) { navigate('/login'); return; }
        const headers = { Authorization: `Bearer ${token}` };
        const decodedToken: any = jwtDecode(token);
        const miUsername = decodedToken.username;

        // A. Obtener mi póliza
        const resPolizas = await axios.get('http://127.0.0.1:8000/api/polizas/', { headers });
        const miPoliza = resPolizas.data.find((p: any) => 
            p.cliente_info?.usuario_info?.username === miUsername &&
            p.estado !== 'cancelada'
        );

        if (miPoliza) {
            // B. Buscar facturas de esa póliza
            const resFacturas = await axios.get(`http://127.0.0.1:8000/api/facturas/?poliza_id=${miPoliza.id}`, { headers });
            // Tomamos la primera factura que esté pendiente o vencida
            const pendiente = resFacturas.data.find((f: any) => f.estado === 'pendiente' || f.estado === 'vencida');
            setFacturaPendiente(pendiente);
        }
      } catch (error) {
        console.error(error);
        message.error("Error al cargar información de pagos");
      } finally {
        setLoading(false);
      }
    };
    fetchDeuda();
  }, [navigate]);

  // 2. PROCESAR PAGO
  const handlePagar = async () => {
    if (!facturaPendiente) return;
    setProcessing(true);
    try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        await axios.post('http://127.0.0.1:8000/api/pagos/', {
            factura: facturaPendiente.id,
            monto_pagado: facturaPendiente.monto,
            metodo_pago: 'transferencia', // QR cuenta como transferencia digital
            referencia_pago: `QR-CLIENTE-${Date.now()}`,
            descripcion: 'Pago realizado desde el Portal de Cliente'
        }, { headers });

        message.success('¡Pago realizado con éxito!');
        // Recargamos para que desaparezca la deuda
        window.location.reload(); 

    } catch (error) {
        message.error('Error al procesar el pago. Intenta nuevamente.');
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/mi-poliza')} shape="circle" style={{ marginRight: 16 }} />
            <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Realizar Pago</Title>
        </div>

        {facturaPendiente ? (
            <Row gutter={24}>
                {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
                <Col xs={24} md={12}>
                    <Card title="Detalle de la Cuota" style={{ height: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Text type="secondary">Total a Pagar</Text>
                            <Title level={1} style={{ margin: 0, color: '#096dd9' }}>Bs. {facturaPendiente.monto}</Title>
                        </div>
                        <Divider />
                        <p><strong>Concepto:</strong> {facturaPendiente.concepto}</p>
                        <p><strong>Nº Factura:</strong> {facturaPendiente.numero_factura}</p>
                        <p><strong>Vencimiento:</strong> {facturaPendiente.fecha_vencimiento}</p>
                        
                        <Alert 
                            message="Pago Seguro" 
                            description="Tu pago se procesará y validará automáticamente." 
                            type="info" 
                            showIcon 
                            style={{ marginTop: 20 }}
                        />
                    </Card>
                </Col>

                {/* COLUMNA DERECHA: QR Y ACCIÓN */}
                <Col xs={24} md={12}>
                    <Card style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Title level={4}><ScanOutlined /> Escanea para Pagar</Title>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                            {/* Generamos un QR único con los datos de la factura */}
                            <QRCode 
                                value={`univida-pay:FAC-${facturaPendiente.numero_factura}-MONTO-${facturaPendiente.monto}`} 
                                size={200} 
                                icon="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" // Puedes poner tu logo aquí
                            />
                        </div>

                        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                            Usa tu aplicación bancaria favorita
                        </Text>

                        <Button 
                            type="primary" 
                            size="large" 
                            block 
                            icon={<CheckCircleOutlined />} 
                            loading={processing}
                            onClick={handlePagar}
                        >
                            Ya realicé el pago
                        </Button>
                    </Card>
                </Col>
            </Row>
        ) : (
            // ESTADO: AL DÍA
            <Card>
                <Result
                    status="success"
                    title="¡Estás al día con tus pagos!"
                    subTitle="No tienes facturas pendientes en este momento. Gracias por mantener tu póliza activa."
                    extra={[
                        <Button type="primary" key="console" onClick={() => navigate('/mi-poliza')}>
                            Volver al Inicio
                        </Button>,
                    ]}
                />
            </Card>
        )}
    </div>
  );
};

export default ClientePagarPolizaPage;