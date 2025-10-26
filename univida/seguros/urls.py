from django.urls import path
from . import views

urlpatterns = [
    # Apis para clientes
    path('clientes/', views.lista_clientes, name='lista_clientes'),
    
    # Apis para polizas
    path('polizas/', views.lista_polizas, name='lista_polizas'),
    path('polizas/<int:poliza_id>/', views.detalle_poliza, name='detalle_poliza'),
    
    # Apis para Beneficiarios
    path('beneficiarios/', views.lista_beneficiarios, name='lista_beneficiarios'),
]