# En seguros/urls.py - VERSIÓN CORREGIDA
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # APIs para Clientes
    path('clientes/', views.lista_clientes, name='lista_clientes'),
    path('clientes/crear/', views.crear_cliente, name='crear_cliente'),
    path('clientes/<int:cliente_id>/', views.detalle_cliente, name='detalle_cliente'),
    path('clientes/<int:cliente_id>/editar/', views.editar_cliente, name='editar_cliente'),
    path('clientes/<int:cliente_id>/eliminar/', views.eliminar_cliente, name='eliminar_cliente'),
    path('clientes/<int:cliente_id>/reactivar/', views.reactivar_cliente, name='reactivar_cliente'),
    #Ruta para que el cliente solicite una póliza
    path('polizas/solicitar/', views.solicitar_poliza, name='solicitar_poliza'),

    path('cliente/me/', views.mi_perfil_cliente, name='mi_perfil_cliente'),

    # APIs para Pólizas
    path('polizas/', views.lista_polizas, name='lista_polizas'),
    path('polizas/crear/', views.crear_poliza, name='crear_poliza'),
    path('polizas/<int:poliza_id>/', views.detalle_poliza, name='detalle_poliza'),
    path('polizas/<int:poliza_id>/activar/', views.activar_poliza, name='activar_poliza'),
    path('polizas/<int:poliza_id>/cancelar/', views.cancelar_poliza, name='cancelar_poliza'),

    # APIs para Beneficiarios
    path('beneficiarios/', views.lista_beneficiarios, name='lista_beneficiarios'),

    # APIs para Agentes
    path('agentes/', views.lista_agentes, name='lista_agentes'),
    path('agentes/crear/', views.crear_agente, name='crear_agente'),
    path('agentes/<int:agente_id>/', views.detalle_agente, name='detalle_agente'),
    path('agentes/<int:agente_id>/editar/', views.editar_agente, name='editar_agente'),
    path('agentes/<int:agente_id>/eliminar/', views.eliminar_agente, name='eliminar_agente'),
    path('agentes/<int:agente_id>/reactivar/', views.reactivar_agente, name='reactivar_agente'),
    path('agente/me/', views.mi_perfil_agente, name='mi_perfil_agente'),
    path('beneficiarios/agregar/', views.agregar_beneficiario, name='agregar_beneficiario'),
    path('beneficiarios/<int:beneficiario_id>/eliminar/', views.eliminar_beneficiario, name='eliminar_beneficiario'),
    path('agente/dashboard-stats/', views.agente_dashboard_stats, name='agente_dashboard_stats'),
    
    #API PARA ACTIVAR/INACTIVAR CLIENTES DESDE AGENTE
    path('clientes/<int:cliente_id>/toggle-estado/', views.toggle_estado_cliente, name='toggle_estado_cliente'),

    # APIs para Facturas y Pagos
    path('facturas/', views.lista_facturas, name='lista_facturas'),
    path('pagos/', views.lista_pagos, name='lista_pagos'),

    # APIs para Siniestros
    path('siniestros/', views.lista_siniestros, name='lista_siniestros'),
    path('siniestros/<int:siniestro_id>/', views.detalle_siniestro, name='detalle_siniestro'),
    path('siniestros/<int:siniestro_id>/aprobar/', views.aprobar_siniestro, name='aprobar_siniestro'),
    path('siniestros/<int:siniestro_id>/rechazar/', views.rechazar_siniestro, name='rechazar_siniestro'),

    # APIs para Notas
    path('notas-poliza/', views.lista_notas_poliza, name='lista_notas_poliza'),
    path('notas-poliza/<int:nota_id>/', views.detalle_nota_poliza, name='detalle_nota_poliza'),

    # Rutas públicas / registro
    path('registro/', views.registrar_cliente_publico, name='registro_publico'),

    # Ruta para generación de PDF de póliza
    path('polizas/<int:poliza_id>/pdf/', views.generar_pdf_poliza, name='generar_pdf_poliza'),

    # RUTAS PARA FACTURAS Y PAGOS
    path('facturas/', views.lista_facturas, name='lista_facturas'),
    path('pagos/', views.lista_pagos, name='lista_pagos'),
    path('pagos/iniciar-qr/', views.iniciar_pago_qr, name='iniciar_pago_qr'),
    path('pagos/estado/<int:pago_id>/', views.verificar_estado_pago, name='verificar_estado_pago'),
    path('pagos/simular-exito/<int:pago_id>/', views.simular_pago_exitoso, name='simular_pago_exitoso'),
]
