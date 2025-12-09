// en frontend/src/pages/cliente/ClientePagarPolizaPage.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Divider, message, Spin, Result, Row, Col, Alert } from 'antd';
import { ArrowLeftOutlined, ScanOutlined, SyncOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;

const ClientePagarPolizaPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [facturaPendiente, setFacturaPendiente] = useState<any>(null);
  
  // Estados para el QR Dinámico
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [pagoId, setPagoId] = useState<number | null>(null);
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false);

  const getToken = () => localStorage.getItem('accessToken');

  // 1. Cargar Deuda
  useEffect(() => {
    const fetchDeuda = async () => {
      try {
        const token = getToken();
        if (!token) { navigate('/login'); return; }
        const headers = { Authorization: `Bearer ${token}` };
        const decodedToken: any = jwtDecode(token);

        // Buscar Póliza y Factura (Igual que antes)
        const resPolizas = await axios.get('https://proyecto-univida2.onrender.com/api/polizas/', { headers });
        const miPoliza = resPolizas.data.find((p: any) => 
            p.cliente_info?.usuario_info?.username === decodedToken.username &&
            p.estado !== 'cancelada'
        );

        if (miPoliza) {
            const resFacturas = await axios.get(`https://proyecto-univida2.onrender.com/api/facturas/?poliza_id=${miPoliza.id}`, { headers });
            const pendiente = resFacturas.data.find((f: any) => f.estado === 'pendiente' || f.estado === 'vencida');
            setFacturaPendiente(pendiente);
            
            if (pendiente) {
                generarQR(pendiente.id); // <-- Generamos el QR apenas cargue
            }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeuda();
  }, [navigate]);

  // 2. Generar QR en el Backend
  const generarQR = async (facturaId: number) => {
      try {
          const token = getToken();
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.post('https://proyecto-univida2.onrender.com/api/pagos/iniciar-qr/', { 
              factura_id: facturaId 
          }, { headers });
          
          setQrImage(response.data.qr_image);
          setPagoId(response.data.pago_id);
          setEsperandoConfirmacion(true); // Empezamos a escuchar

      } catch (error) {
          message.error("Error al generar el código de pago");
      }
  };

  // 3. POLLING: Escuchar si el pago se completó
  useEffect(() => {
      let interval: NodeJS.Timeout;
      
      if (esperandoConfirmacion && pagoId) {
          interval = setInterval(async () => {
              try {
                  const token = getToken();
                  const headers = { Authorization: `Bearer ${token}` };
                  const res = await axios.get(`https://proyecto-univida2.onrender.com/api/pagos/estado/${pagoId}/`, { headers });
                  
                  if (res.data.status === 'completado') {
                      clearInterval(interval);
                      setEsperandoConfirmacion(false);
                      message.success("¡Pago confirmado automáticamente!");
                      
                      // Esperar un momento para que el usuario vea el éxito
                      setTimeout(() => window.location.reload(), 2000);
                  }
              } catch (e) {
                  console.error("Error verificando pago");
              }
          }, 3000); // Preguntar cada 3 segundos
      }

      return () => clearInterval(interval);
  }, [esperandoConfirmacion, pagoId]);


  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/mi-poliza')} shape="circle" style={{ marginRight: 16 }} />
            <Title level={2} style={{ margin: 0, fontFamily: "'Michroma', sans-serif" }}>Pago Express</Title>
        </div>

        {facturaPendiente ? (
            <Row gutter={24}>
                {/* INFO */}
                <Col xs={24} md={12}>
                    <Card title="Resumen de Cobro" style={{ height: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Text type="secondary">Monto Total</Text>
                            <Title level={1} style={{ margin: 0, color: '#096dd9' }}>Bs. {facturaPendiente.monto}</Title>
                        </div>
                        <Divider />
                        <p><strong>Factura:</strong> {facturaPendiente.numero_factura}</p>
                        <p><strong>Concepto:</strong> {facturaPendiente.concepto}</p>
                        <Alert 
                            message="Verificación Automática" 
                            description="No necesitas subir comprobante. El sistema detectará tu pago en segundos." 
                            type="success" 
                            showIcon 
                            style={{ marginTop: 20 }}
                        />
                    </Card>
                </Col>

                {/* QR */}
                <Col xs={24} md={12}>
                    <Card style={{ textAlign: 'center', height: '100%' }}>
                        <Title level={4}><ScanOutlined /> Escanea para Pagar</Title>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', minHeight: '200px', alignItems: 'center' }}>
                            {qrImage ? (
                                <img src={qrImage} alt="QR de Pago" style={{ width: '220px', borderRadius: '8px', border: '1px solid #eee' }} />
                            ) : (
                                <Spin tip="Generando QR..." />
                            )}
                        </div>

                        {esperandoConfirmacion && (
                            <div style={{ color: '#1890ff', marginTop: 10 }}>
                                <Spin size="small" style={{ marginRight: 8 }} />
                                Esperando confirmación del banco...
                            </div>
                        )}
                        
                        <div style={{ marginTop: 20 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                (Para probar: Escanea el QR o abre el enlace que contiene en otra pestaña)
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        ) : (
            <Card>
                <Result status="success" title="¡Todo pagado!" subTitle="No tienes deudas pendientes."
                    extra={[<Button type="primary" key="console" onClick={() => navigate('/mi-poliza')}>Ir al Inicio</Button>]}
                />
            </Card>
        )}
    </div>
  );
};

export default ClientePagarPolizaPage;