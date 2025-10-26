from rest_framework import serializers
from .models import Usuario, Cliente, Poliza, Beneficiario

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
        model = Beneficiarios123
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