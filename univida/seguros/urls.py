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
    
    # APIs para Pólizas - CORREGIDO
    path('polizas/', views.lista_polizas, name='lista_polizas'),  # ← Esta maneja GET y POST
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
]