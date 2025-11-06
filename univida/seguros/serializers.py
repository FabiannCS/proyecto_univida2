from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Usuario, Cliente, Poliza, Beneficiario, Agente, Pago, Factura, Siniestro, NotaPoliza


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

class AgenteProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agente
        # Excluimos 'usuario' porque ya lo tendremos del modelo Usuario
        exclude = ('usuario',)

#Aireyu
class AgenteSerializer(serializers.ModelSerializer):
    # Para mostrar campos del Usuario relacionado
    username = serializers.CharField(source='usuario.username', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    first_name = serializers.CharField(source='usuario.first_name', read_only=True)
    last_name = serializers.CharField(source='usuario.last_name', read_only=True)
    rol = serializers.CharField(source='usuario.rol', read_only=True) # Mostrar el rol
    class Meta:
        model = Agente
        # Incluye campos de Agente y los campos anidados de Usuario
        fields = ['id', 'usuario', 'codigo_agente', 'fecha_contratacion', 
                  'especialidad', 'comision', 'estado', 
                  'username', 'email', 'first_name', 'last_name', 'rol']
        read_only_fields = ['usuario'] # El usuario se asignará en la vista al crear
    # (Opcional pero recomendado para CREAR/EDITAR)
    # Necesitaríamos personalizar los métodos create/update para manejar
    # la creación/actualización del objeto Agente asociado al Usuario.
    # Por ahora, nos enfocaremos en LISTAR.

class UsuarioAgenteSerializer(serializers.ModelSerializer):
    # Podrías añadir validación extra aquí si es necesario
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'telefono', 'rol', 'identificacion']
        extra_kwargs = {'password': {'write_only': True}} # No mostrar password al leer

    def create(self, validated_data):
        # Asegurarse de que el rol sea AGENTE y hashear la contraseña
        validated_data['rol'] = 'AGENTE' 
        user = Usuario.objects.create_user(**validated_data)
        # Aquí podrías crear el perfil Agente asociado si es necesario
        # Agente.objects.create(usuario=user, codigo_agente=..., fecha_contratacion=...) 
        return user

    def update(self, instance, validated_data):
        # Manejar actualización de contraseña si se provee
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        # Asegurarse de que el rol siga siendo AGENTE
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

#aireyuclose


# Serializers para nuevos modelos
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

        # --- Añade tus datos personalizados ---
        token['rol'] = user.rol 
        token['username'] = user.username
        # --- Fin ---

        return token
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


#mas apis para el front crear cliente

# En seguros/serializers.py - AÑADE ESTE SERIALIZER:

class CrearClienteSerializer(serializers.ModelSerializer):
    # Campos para crear el Usuario primero
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
        # Extraer datos del usuario
        usuario_data = {
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password'),
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
            'email': validated_data.pop('email', ''),
            'telefono': validated_data.pop('telefono', ''),
            'rol': 'CLIENTE',
            'es_cliente': True
        }
        
        # Crear el usuario
        user = Usuario.objects.create_user(**usuario_data)
        
        # Crear el cliente asociado
        cliente = Cliente.objects.create(usuario=user, **validated_data)
        
        return cliente