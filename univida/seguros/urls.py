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
    # APIs para Pólizas
    path('polizas/', views.lista_polizas, name='lista_polizas'),
    path('polizas/<int:poliza_id>/', views.detalle_poliza, name='detalle_poliza'),
    # ... (otras rutas de pólizas) ...
    
    # APIs para Beneficiarios
    path('beneficiarios/', views.lista_beneficiarios, name='lista_beneficiarios'),

    # --- APIs COMPLETAS para Agentes ---
    # GET: Obtener la lista de todos los agentes
    path('agentes/', views.lista_agentes, name='lista_agentes'), 
    # POST: Crear un nuevo agente
    path('agentes/crear/', views.crear_agente, name='crear_agente'), # <-- NUEVA RUTA PARA CREAR
    # GET: Obtener detalles de UN agente específico por ID
    path('agentes/<int:agente_id>/', views.detalle_agente, name='detalle_agente'),
    # PUT/PATCH: Actualizar un agente específico por ID
    path('agentes/<int:agente_id>/editar/', views.editar_agente, name='editar_agente'),
    # DELETE: Eliminar un agente específico por ID
    path('agentes/<int:agente_id>/eliminar/', views.eliminar_agente, name='eliminar_agente'), # <-- NUEVA RUTA PARA ELIMINAR
    path('agentes/<int:agente_id>/reactivar/', views.reactivar_agente, name='reactivar_agente'),
    # --- FIN APIs Agentes ---

    path('facturas/', views.lista_facturas, name='lista_facturas'),
    path('pagos/', views.lista_pagos, name='lista_pagos'),
    path('siniestros/', views.lista_siniestros, name='lista_siniestros'),
    path('siniestros/<int:siniestro_id>/', views.detalle_siniestro, name='detalle_siniestro'),
    path('notas-poliza/', views.lista_notas_poliza, name='lista_notas_poliza'),
    path('notas-poliza/<int:nota_id>/', views.detalle_nota_poliza, name='detalle_nota_poliza'),

    #Crear poliza
    path('polizas/', views.crear_poliza, name='crear_poliza'),

    path('polizas/<int:poliza_id>/activar/', views.activar_poliza, name='activar_poliza'),
path('polizas/<int:poliza_id>/cancelar/', views.cancelar_poliza, name='cancelar_poliza'),
]   
