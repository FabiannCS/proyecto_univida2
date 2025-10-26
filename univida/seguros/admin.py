from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Cliente, Poliza, Beneficiario

# Configuración personalizada para Usuario
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'es_cliente', 'es_agente', 'is_staff')
    list_filter = ('es_cliente', 'es_agente', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Información UNIVIDA', {
            'fields': ('telefono', 'es_cliente', 'es_agente')
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