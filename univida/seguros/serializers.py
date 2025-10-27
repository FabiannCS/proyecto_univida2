from rest_framework import serializers
from .models import Usuario, Cliente, Poliza, Beneficiario, Agente, Pago, Factura

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'telefono']

class ClienteSerializer(serializers.ModelSerializer):
    usuario_info = UsuarioSerializer(source='usuario', read_only=True)
    
    class Meta:
        model = Cliente
        fields = ['id', 'usuario_info', 'fecha_nacimiento', 'direccion', 'identificacion', 'estado_salud']

class BeneficiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiario
        fields = ['id', 'nombre_completo', 'parentesco', 'porcentaje', 'fecha_nacimiento']

class PolizaSerializer(serializers.ModelSerializer):
    cliente_info = ClienteSerializer(source='cliente', read_only=True)
    beneficiarios = BeneficiarioSerializer(many=True, read_only=True)
    
    class Meta:
        model = Poliza
        fields = [
            'id', 'numero_poliza', 'cliente_info', 'suma_asegurada', 
            'prima_anual', 'fecha_inicio', 'fecha_vencimiento', 
            'estado', 'beneficiarios', 'creado_en'
        ]

class CrearPolizaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poliza
        fields = ['cliente', 'suma_asegurada', 'prima_anual', 'fecha_inicio', 'fecha_vencimiento']


#Aireyu
class AgenteSerializer(serializers.ModelSerializer):
    usuario_info = UsuarioSerializer(source='usuario', read_only=True)
    
    class Meta:
        model = Agente
        fields = [
            'id', 'usuario_info', 'codigo_agente', 'fecha_contratacion',
            'especialidad', 'comision', 'estado', 'telefono_oficina',
            'direccion_oficina'
        ]

class CrearAgenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agente
        fields = ['usuario', 'codigo_agente', 'fecha_contratacion', 'especialidad', 'comision']




class FacturaSerializer(serializers.ModelSerializer):
    poliza_info = PolizaSerializer(source='poliza', read_only=True)
    
    class Meta:
        model = Factura
        fields = [
            'id', 'poliza_info', 'numero_factura', 'monto', 
            'fecha_emision', 'fecha_vencimiento', 'estado', 'concepto'
        ]

class CrearFacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = ['poliza', 'numero_factura', 'monto', 'fecha_emision', 'fecha_vencimiento', 'concepto']

class PagoSerializer(serializers.ModelSerializer):
    factura_info = FacturaSerializer(source='factura', read_only=True)
    
    class Meta:
        model = Pago
        fields = [
            'id', 'factura_info', 'monto_pagado', 'fecha_pago',
            'metodo_pago', 'referencia_pago', 'estado', 'descripcion'
        ]

class CrearPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = ['factura', 'monto_pagado', 'metodo_pago', 'referencia_pago', 'descripcion']

#aireyuclose