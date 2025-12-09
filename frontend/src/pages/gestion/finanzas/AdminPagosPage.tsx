// en frontend/src/pages/gestion/AdminPagosPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Table, Tag, Card, Statistic, Row, Col, Input, DatePicker, Button, Tooltip, Space } from 'antd';
import { DollarOutlined, SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs'; // Asegúrate de tener dayjs instalado

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminPagosPage: React.FC = () => {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [fechasFiltro, setFechasFiltro] = useState<any>(null); // Estado para el rango de fechas

  const getToken = () => localStorage.getItem('accessToken');

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('https://proyecto-univida2.onrender.com/api/pagos/', { headers });
      setPagos(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  // --- LÓGICA DE FILTRADO Y CÁLCULO ---
  const { filteredData, totalFiltrado, pagosHoy } = useMemo(() => {
      // 1. Filtrar los datos
      const datos = pagos.filter(p => {
          // Filtro Texto
          const matchText = 
            p.factura_info?.numero_factura?.toLowerCase().includes(searchText.toLowerCase()) ||
            p.referencia_pago?.toLowerCase().includes(searchText.toLowerCase()) ||
            // Buscamos también por nombre de cliente
            p.factura_info?.poliza_info?.cliente_info?.usuario_info?.first_name?.toLowerCase().includes(searchText.toLowerCase());

          // Filtro Fecha
          let matchDate = true;
          if (fechasFiltro && fechasFiltro[0] && fechasFiltro[1]) {
              const fechaPago = dayjs(p.fecha_pago);
              matchDate = fechaPago.isAfter(fechasFiltro[0].startOf('day')) && 
                          fechaPago.isBefore(fechasFiltro[1].endOf('day'));
          }

          return matchText && matchDate;
      });

      // 2. Calcular Totales sobre los datos FILTRADOS
      const total = datos.reduce((sum: number, p: any) => {
          // Solo sumamos si el pago está completado
          return p.estado === 'completado' ? sum + parseFloat(p.monto_pagado) : sum;
      }, 0);

      // 3. Calcular pagos de hoy (global, no depende del filtro)
      const hoyStr = dayjs().format('YYYY-MM-DD');
      const countHoy = pagos.filter((p: any) => p.fecha_pago.startsWith(hoyStr)).length;

      return { filteredData: datos, totalFiltrado: total, pagosHoy: countHoy };
  }, [pagos, searchText, fechasFiltro]);


  const columns = [
    { 
        title: 'Fecha', dataIndex: 'fecha_pago', key: 'fecha',
        render: (f: string) => f ? new Date(f).toLocaleString() : 'N/A'
    },
    { 
        title: 'Nombre Cliente', 
        key: 'cliente',
        render: (_: any, record: any) => {
            // Navegamos por la estructura de datos:
            // Pago -> factura_info -> poliza_info -> cliente_info -> usuario_info
            const usuario = record.factura_info?.poliza_info?.cliente_info?.usuario_info;
            
            if (usuario) {
                return (
                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                        {usuario.first_name} {usuario.last_name}
                    </span>
                );
            }
            return <span style={{ color: '#999', fontStyle: 'italic' }}>Desconocido</span>;
        }
    },
    { 
        title: 'Nº Factura', dataIndex: ['factura_info', 'numero_factura'], key: 'factura',
        render: (t: string) => t || 'Sin Factura'
    },
    { 
        title: 'Monto', dataIndex: 'monto_pagado', key: 'monto',
        render: (v: string) => <b style={{ color: '#3f8600' }}>Bs. {v ? parseFloat(v).toLocaleString() : '0'}</b>
    },
    { 
        title: 'Método', dataIndex: 'metodo_pago', key: 'metodo',
        render: (m: string) => <Tag>{m ? m.toUpperCase() : 'N/A'}</Tag>
    },
    { 
        title: 'Estado', 
        dataIndex: 'estado', 
        render: (e: string) => {
            let color = 'default';
            let texto = 'DESCONOCIDO';

            if (e === 'completado') {
                color = 'green';
                texto = 'PAGADO'; // <-- Cambiamos el texto visualmente
            } else if (e === 'pendiente') {
                color = 'orange';
                texto = 'PENDIENTE';
            } else if (e === 'fallido') {
                color = 'red';
                texto = 'FALLIDO';
            }

            return <Tag color={color}>{texto}</Tag>;
        }
      }
  ];

  return (
    <div>
      <Title level={2} style={{ fontFamily: "'Michroma', sans-serif", marginBottom: 24 }}>Finanzas y Pagos</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
            <Card>
                <Statistic 
                    title={fechasFiltro ? "Ingresos (Filtrado)" : "Ingresos Totales (Histórico)"}
                    value={totalFiltrado} 
                    precision={2} 
                    prefix="Bs." 
                    valueStyle={{ color: '#3f8600' }}
                />
            </Card>
        </Col>
        <Col span={8}>
            <Card>
                <Statistic title="Transacciones Hoy" value={pagosHoy} prefix={<DollarOutlined />} />
            </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: '10px' }}>
            <Input 
                placeholder="Buscar cliente, factura..." 
                prefix={<SearchOutlined />} 
                style={{ width: 300 }}
                onChange={e => setSearchText(e.target.value)}
            />
            <Space>
                {/* --- FILTRO DE FECHAS --- */}
                <RangePicker 
                    onChange={(dates) => setFechasFiltro(dates)} 
                    placeholder={['Fecha Inicio', 'Fecha Fin']}
                />
                
                <Tooltip title="Recargar">
                    <Button icon={<ReloadOutlined />} onClick={fetchPagos} />
                </Tooltip>
            </Space>
        </div>

        <Table 
            dataSource={filteredData} 
            columns={columns} 
            rowKey="id" 
            loading={loading} 
        />
      </Card>
    </div>
  );
};

export default AdminPagosPage;