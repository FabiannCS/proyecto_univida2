from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
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
    path('notas-poliza/<int:nota_id>/', views.detalle_nota_poliza, name='detalle_nota_poliza')

]