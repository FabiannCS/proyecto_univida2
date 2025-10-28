from django.urls import path
from . import views

urlpatterns = [
    # APIs para Clientes
    path('clientes/', views.lista_clientes, name='lista_clientes'),
    
    # APIs para Pólizas
    path('polizas/', views.lista_polizas, name='lista_polizas'),
    path('polizas/<int:poliza_id>/', views.detalle_poliza, name='detalle_poliza'),
    
    # APIs para Beneficiarios
    path('beneficiarios/', views.lista_beneficiarios, name='lista_beneficiarios'),
    
    # NUEVAS: APIs para Agentes
    path('agentes/', views.lista_agentes, name='lista_agentes'),
    path('agentes/<int:agente_id>/', views.detalle_agente, name='detalle_agente'),

    path('facturas/', views.lista_facturas, name='lista_facturas'),
    path('pagos/', views.lista_pagos, name='lista_pagos'),

    # APIs para nuevos modelos
    path('siniestros/', views.lista_siniestros, name='lista_siniestros'),
    path('siniestros/<int:siniestro_id>/', views.detalle_siniestro, name='detalle_siniestro'),
    path('notas-poliza/', views.lista_notas_poliza, name='lista_notas_poliza'),
    path('notas-poliza/<int:nota_id>/', views.detalle_nota_poliza, name='detalle_nota_poliza'),
    path('roles/', views.lista_roles, name='lista_roles'),
    path('roles/<int:rol_id>/', views.detalle_rol, name='detalle_rol'),


    # URLs para FRONTEND - con nombres únicos
    path('', views.inicio, name='inicio'),
    path('front/clientes/', views.lista_clientes_front, name='lista_clientes_front'),
    path('front/clientes/<int:cliente_id>/', views.detalle_cliente, name='detalle_cliente'),
    path('front/polizas/', views.lista_polizas_front, name='lista_polizas_front'),
    path('front/polizas/<int:poliza_id>/detalle/', views.detalle_poliza_front, name='detalle_poliza_front'),
]