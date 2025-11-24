from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Usuario, Cliente, Poliza, Beneficiario, Agente, Pago, Factura, Siniestro, NotaPoliza


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'telefono', 'is_active', 'rol']

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
            'prima_anual', 'prima_mensual', 'fecha_inicio', 'fecha_vencimiento',  # ← AÑADIDO prima_mensual
            'estado', 'beneficiarios', 'creado_en', 'cobertura'  # ← AÑADIDO cobertura, QUITADO exclusiones
        ]

# En seguros/serializers.py - ACTUALIZAR
class CrearPolizaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poliza
        fields = [
            'cliente', 'agente', 'numero_poliza', 'suma_asegurada',
            'prima_anual', 'prima_mensual', 'fecha_inicio', 
            'fecha_vencimiento', 'cobertura', 'estado'
        ]
        extra_kwargs = {
            'agente': {'required': False, 'allow_null': True}  # ← Hacer opcional
        }
    
    def validate(self, data):
        """Validaciones para crear pólizas"""
        # Validar que la fecha de vencimiento sea después de la fecha de inicio
        if data['fecha_inicio'] >= data['fecha_vencimiento']:
            raise serializers.ValidationError({
                'fecha_vencimiento': 'La fecha de vencimiento debe ser posterior a la fecha de inicio'
            })
        
        # Validar que la suma asegurada sea positiva
        if data['suma_asegurada'] <= 0:
            raise serializers.ValidationError({
                'suma_asegurada': 'La suma asegurada debe ser mayor a 0'
            })
        
        return data

class AgenteProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agente
        exclude = ('usuario',)

# En seguros/serializers.py - CORREGIR AgenteSerializer
class AgenteSerializer(serializers.ModelSerializer):
    # Para mostrar campos del Usuario relacionado
    username = serializers.CharField(source='usuario.username', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    first_name = serializers.CharField(source='usuario.first_name', read_only=True)
    last_name = serializers.CharField(source='usuario.last_name', read_only=True)
    rol = serializers.CharField(source='usuario.rol', read_only=True)
    usuario_id = serializers.IntegerField(source='usuario.id', read_only=True)  # ← AÑADIR esto
    
    class Meta:
        model = Agente
        fields = [
            'id', 'usuario_id', 'usuario', 'codigo_agente', 'fecha_contratacion',  # ← Incluir 'id' real del agente
            'especialidad', 'comision', 'estado', 
            'username', 'email', 'first_name', 'last_name', 'rol'
        ]
        read_only_fields = ['usuario']

class UsuarioAgenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'telefono', 'rol', 'identificacion', "is_active"]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['rol'] = 'AGENTE' 
        user = Usuario.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        validated_data['rol'] = 'AGENTE'
        return super().update(instance, validated_data)

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


class SiniestroSerializer(serializers.ModelSerializer):
    poliza_info = PolizaSerializer(source='poliza', read_only=True)
    
    class Meta:
        model = Siniestro
        fields = [
            'id', 'poliza_info', 'numero_siniestro', 'tipo_siniestro',
            'fecha_siniestro', 'fecha_reporte', 'descripcion', 
            'monto_reclamado', 'monto_aprobado', 'estado',
            'documentos_adjuntos', 'resolucion', 'fecha_resolucion'
        ]

class CrearSiniestroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Siniestro
        fields = [
            'poliza', 'numero_siniestro', 'tipo_siniestro', 'fecha_siniestro',
            'descripcion', 'monto_reclamado', 'documentos_adjuntos'
        ]

# En seguros/serializers.py - AÑADE este serializer:

class ActualizarSiniestroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Siniestro
        fields = [
            'estado', 'monto_aprobado', 'resolucion', 'fecha_resolucion'
        ]
    
    def validate(self, data):
        """Validaciones para actualización de siniestros"""
        instance = self.instance
        estado = data.get('estado', instance.estado)
        monto_aprobado = data.get('monto_aprobado')
        
        # Validar que si se aprueba, tenga monto aprobado
        if estado == 'aprobado' and not monto_aprobado:
            raise serializers.ValidationError({
                'monto_aprobado': 'Debe especificar el monto aprobado cuando el estado es "aprobado"'
            })
        
        # Validar que el monto aprobado no sea mayor al reclamado
        if monto_aprobado and monto_aprobado > instance.monto_reclamado:
            raise serializers.ValidationError({
                'monto_aprobado': f'El monto aprobado no puede ser mayor al monto reclamado (${instance.monto_reclamado})'
            })
            
        return data

class NotaPolizaSerializer(serializers.ModelSerializer):
    poliza_info = PolizaSerializer(source='poliza', read_only=True)
    usuario_info = UsuarioSerializer(source='usuario', read_only=True)
    
    class Meta:
        model = NotaPoliza
        fields = [
            'id', 'poliza_info', 'usuario_info', 'titulo', 'contenido',
            'tipo_nota', 'fecha_creacion', 'fecha_actualizacion'
        ]

class CrearNotaPolizaSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotaPoliza
        fields = ['poliza', 'usuario', 'titulo', 'contenido', 'tipo_nota']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['email'] = user.email
        token['rol'] = user.rol

        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class CrearClienteSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True, max_length=20)

    class Meta:
        model = Cliente
        fields = [
            'username', 'password', 'first_name', 'last_name', 'email', 'telefono',
            'fecha_nacimiento', 'direccion', 'identificacion', 'estado_salud'
        ]

    def create(self, validated_data):
        usuario_data = {
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password'),
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
            'email': validated_data.pop('email', ''),
            'telefono': validated_data.pop('telefono', ''),
            'rol': 'CLIENTE',
        }
        
        user = Usuario.objects.create_user(**usuario_data)
        cliente = Cliente.objects.create(usuario=user, **validated_data)
        
        return cliente

class EditarClienteSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='usuario.first_name', required=False)
    last_name = serializers.CharField(source='usuario.last_name', required=False)
    email = serializers.EmailField(source='usuario.email', required=False)
    telefono = serializers.CharField(source='usuario.telefono', required=False, max_length=20)

    class Meta:
        model = Cliente
        fields = [
            'first_name', 'last_name', 'email', 'telefono',
            'fecha_nacimiento', 'direccion', 'identificacion', 'estado_salud'
        ]

    def update(self, instance, validated_data):
        usuario_data = validated_data.pop('usuario', {})
        
        if usuario_data:
            usuario = instance.usuario
            for attr, value in usuario_data.items():
                setattr(usuario, attr, value)
            usuario.save()
        
        return super().update(instance, validated_data)