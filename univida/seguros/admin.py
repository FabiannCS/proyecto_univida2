from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Cliente, Poliza, Beneficiario, Agente, Factura, Pago, Siniestro, NotaPoliza

# Configuración personalizada para Usuario
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'es_cliente', 'es_agente', 'is_staff', 'rol')
    list_filter = ('es_cliente', 'es_agente', 'is_staff', 'is_superuser', 'rol')
    fieldsets = UserAdmin.fieldsets + (
        ('Información UNIVIDA', {
            'fields': ('telefono', 'es_cliente', 'es_agente', 'rol')
        }),
    )

# Configuración para Cliente
@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('get_nombre', 'identificacion', 'fecha_nacimiento', 'estado_salud')
    list_filter = ('estado_salud',)
    search_fields = ('usuario__first_name', 'usuario__last_name', 'identificacion')
    
    def get_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}"
    get_nombre.short_description = 'Nombre Completo'

# Configuración para Póliza
@admin.register(Poliza)
class PolizaAdmin(admin.ModelAdmin):
    list_display = ('numero_poliza', 'get_cliente', 'suma_asegurada', 'prima_anual', 'estado', 'fecha_inicio')
    list_filter = ('estado', 'fecha_inicio')
    search_fields = ('numero_poliza', 'cliente__usuario__first_name', 'cliente__usuario__last_name')
    
    def get_cliente(self, obj):
        return f"{obj.cliente.usuario.first_name} {obj.cliente.usuario.last_name}"
    get_cliente.short_description = 'Cliente'

# Configuración para Beneficiario
@admin.register(Beneficiario)
class BeneficiarioAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'get_poliza', 'parentesco', 'porcentaje')
    list_filter = ('parentesco',)
    search_fields = ('nombre_completo', 'poliza__numero_poliza')
    
    def get_poliza(self, obj):
        return obj.poliza.numero_poliza
    get_poliza.short_description = 'Póliza'

# Configuracion para Agente
@admin.register(Agente)
class AgenteAdmin(admin.ModelAdmin):
    list_display = ('codigo_agente', 'get_nombre', 'especialidad', 'comision', 'estado', 'fecha_contratacion')
    list_filter = ('estado', 'especialidad', 'fecha_contratacion')
    search_fields = ('codigo_agente', 'usuario__first_name', 'usuario__last_name')
    
    def get_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}"
    get_nombre.short_description = 'Nombre del Agente'


@admin.register(Factura)
class FacturaAdmin(admin.ModelAdmin):
    list_display = ('numero_factura', 'get_poliza', 'get_cliente', 'monto', 'estado', 'fecha_emision', 'fecha_vencimiento')
    list_filter = ('estado', 'fecha_emision', 'fecha_vencimiento')
    search_fields = ('numero_factura', 'poliza__numero_poliza', 'poliza__cliente__usuario__first_name')
    
    def get_poliza(self, obj):
        return obj.poliza.numero_poliza
    get_poliza.short_description = 'Póliza'
    
    def get_cliente(self, obj):
        return f"{obj.poliza.cliente.usuario.first_name} {obj.poliza.cliente.usuario.last_name}"
    get_cliente.short_description = 'Cliente'

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_factura', 'monto_pagado', 'metodo_pago', 'estado', 'fecha_pago')
    list_filter = ('estado', 'metodo_pago', 'fecha_pago')
    search_fields = ('factura__numero_factura', 'referencia_pago')
    
    def get_factura(self, obj):
        return obj.factura.numero_factura
    get_factura.short_description = 'Factura'



@admin.register(Siniestro)
class SiniestroAdmin(admin.ModelAdmin):
    list_display = ('numero_siniestro', 'get_poliza', 'get_cliente', 'tipo_siniestro', 'estado', 'fecha_siniestro', 'monto_reclamado')
    list_filter = ('estado', 'tipo_siniestro', 'fecha_siniestro')
    search_fields = ('numero_siniestro', 'poliza__numero_poliza', 'poliza__cliente__usuario__first_name')
    
    def get_poliza(self, obj):
        return obj.poliza.numero_poliza
    get_poliza.short_description = 'Póliza'
    
    def get_cliente(self, obj):
        return f"{obj.poliza.cliente.usuario.first_name} {obj.poliza.cliente.usuario.last_name}"
    get_cliente.short_description = 'Cliente'


@admin.register(NotaPoliza)
class NotaPolizaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'get_poliza', 'get_usuario', 'tipo_nota', 'fecha_creacion')
    list_filter = ('tipo_nota', 'fecha_creacion')
    search_fields = ('titulo', 'contenido', 'poliza__numero_poliza', 'usuario__username')
    
    def get_poliza(self, obj):
        return obj.poliza.numero_poliza
    get_poliza.short_description = 'Póliza'
    
    def get_usuario(self, obj):
        return obj.usuario.username
    get_usuario.short_description = 'Usuario'




