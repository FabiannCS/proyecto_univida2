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


]