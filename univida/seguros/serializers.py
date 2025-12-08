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

class InfoAgenteSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='usuario.first_name')
    last_name = serializers.CharField(source='usuario.last_name')
    email = serializers.EmailField(source='usuario.email')
    telefono = serializers.CharField(source='usuario.telefono')

    class Meta:
        model = Agente
        fields = ['first_name', 'last_name', 'email', 'telefono']


class PolizaSerializer(serializers.ModelSerializer):
    cliente_info = ClienteSerializer(source='cliente', read_only=True)
    beneficiarios = BeneficiarioSerializer(many=True, read_only=True)

    agente_info = InfoAgenteSerializer(source='agente', read_only=True)
    
    class Meta:
        model = Poliza
        fields = [
            'id', 'numero_poliza', 'cliente_info', 'agente_info', 'suma_asegurada', 
            'prima_anual', 'prima_mensual', 'fecha_inicio', 'fecha_vencimiento',  # ← AÑADIDO prima_mensual
            'estado', 'beneficiarios', 'creado_en', 'cobertura'  # ← AÑADIDO cobertura, QUITADO exclusiones
        ]

class BeneficiarioInputSerializer(serializers.Serializer):
    nombre_completo = serializers.CharField()
    paterno = serializers.CharField(required=False, allow_blank=True) # Nuevo
    materno = serializers.CharField(required=False, allow_blank=True) # Nuevo
    parentesco = serializers.CharField()
    porcentaje = serializers.DecimalField(max_digits=5, decimal_places=2)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    ci = serializers.CharField(required=False, allow_blank=True)
    telefono = serializers.CharField(required=False, allow_blank=True) # Nuevo

class SolicitarPolizaSerializer(serializers.ModelSerializer):
    tipo_seguro = serializers.CharField(write_only=True)
    observaciones = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Campo de lista para recibir múltiples beneficiarios
    beneficiarios = BeneficiarioInputSerializer(many=True, write_only=True)

    class Meta:
        model = Poliza
        fields = ['suma_asegurada', 'tipo_seguro', 'observaciones', 'beneficiarios']


# En seguros/serializers.py - ACTUALIZAR
# en seguros/serializers.py

class CrearPolizaSerializer(serializers.ModelSerializer):
    # 1. Campos extra que recibe el formulario pero no van directos al modelo
    tipo_seguro = serializers.CharField(write_only=True, required=False)
    observaciones = serializers.CharField(write_only=True, required=False, allow_blank=True)
    beneficiarios = BeneficiarioInputSerializer(many=True, write_only=True)

    class Meta:
        model = Poliza
        fields = [
            'cliente', 'agente', 'numero_poliza', 'suma_asegurada',
            'prima_anual', 'prima_mensual', 'fecha_inicio', 
            'fecha_vencimiento', 'cobertura', 'estado',
            # Incluimos los campos extra en la lista de campos aceptados
            'tipo_seguro', 'observaciones', 'beneficiarios'
        ]
        # Campos que calcula el sistema, no el usuario
        read_only_fields = ['numero_poliza', 'prima_mensual', 'cobertura', 'estado']
        extra_kwargs = {
            'agente': {'required': False, 'allow_null': True}
        }
    
    # --- 2. MÉTODO DE VALIDACIÓN (MANTENERLO) ---
    def validate(self, data):
        """Validaciones de lógica de negocio"""
        # Validar fechas
        if data.get('fecha_inicio') and data.get('fecha_vencimiento'):
            if data['fecha_inicio'] >= data['fecha_vencimiento']:
                raise serializers.ValidationError({
                    'fecha_vencimiento': 'La fecha de vencimiento debe ser posterior a la fecha de inicio'
                })
        
        # Validar monto positivo
        if data.get('suma_asegurada') and data['suma_asegurada'] <= 0:
            raise serializers.ValidationError({
                'suma_asegurada': 'La suma asegurada debe ser mayor a 0'
            })
        
        return data

    # --- 3. MÉTODO DE CREACIÓN (LIMPIEZA DE DATOS) ---
    def create(self, validated_data):
        """
        Elimina los campos que no pertenecen al modelo Poliza antes de guardar.
        """
        # Sacamos (pop) los datos que no son columnas de la tabla Poliza
        # (Nota: La vista 'lista_polizas' debería haber usado estos datos antes, 
        # aquí solo aseguramos que no rompan el guardado automático)
        validated_data.pop('tipo_seguro', None)
        validated_data.pop('observaciones', None)
        validated_data.pop('beneficiarios', None)
        
        # Llamamos al método original para crear la Poliza limpia
        return super().create(validated_data)

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

    is_active = serializers.BooleanField(source='usuario.is_active', read_only=True)
    
    class Meta:
        model = Agente
        fields = [
            'id', 'usuario_id', 'usuario', 'codigo_agente', 'fecha_contratacion',  # ← Incluir 'id' real del agente
            'especialidad', 'comision', 'estado', 
            'username', 'email', 'first_name', 'last_name', 'rol', 'is_active'
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
#PARA FACTURAS Y PAGOS
class FacturaSerializer(serializers.ModelSerializer):
    # Incluimos info básica de la póliza para mostrarla en el frontend
    poliza_info = PolizaSerializer(source='poliza', read_only=True)
    poliza_numero = serializers.CharField(source='poliza.numero_poliza', read_only=True)
    
    class Meta:
        model = Factura
        fields = ['id', 'poliza', 'poliza_info', 'poliza_numero', 'numero_factura', 'monto', 
                  'fecha_emision', 'fecha_vencimiento', 'estado', 'concepto']

class CrearFacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = ['poliza', 'numero_factura', 'monto', 'fecha_emision', 'fecha_vencimiento', 'concepto']

# en seguros/serializers.py

class PagoSerializer(serializers.ModelSerializer):
    # Esto trae los datos anidados de la factura (y la póliza/cliente dentro de ella)
    factura_info = FacturaSerializer(source='factura', read_only=True)
    
    class Meta:
        model = Pago
        fields = [
            'id', 
            'factura_info',  # <--- ¡ASEGÚRATE DE QUE ESTE ESTÉ AQUÍ!
            'monto_pagado', 
            'fecha_pago',
            'metodo_pago', 
            'referencia_pago', 
            'estado', 
            'descripcion'
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
        # NO incluyas 'numero_siniestro', 'fecha_reporte' ni 'estado' aquí, 
        # o asegúrate de que sean read_only si usas 'fields = __all__'
        fields = [
            'poliza', 'tipo_siniestro', 'fecha_siniestro',
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
        # Extraer datos del usuario
        usuario_data = {
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password'),
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', ''),
            'email': validated_data.pop('email', ''),
            'telefono': validated_data.pop('telefono', ''),
            'rol': 'CLIENTE',
            # 'es_cliente': True # (Ya borraste este campo del modelo, así que BORRA esta línea si aún la tienes)
        }
        
        # Crear el usuario
        user = Usuario.objects.create_user(**usuario_data)
        
        # Crear el cliente asociado
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
    

#AUMENTANDO UN SERIALIZER PARA QUE EL CLIENTE EDITE SUS DATOS
# en seguros/serializers.py

class EditarPerfilClienteSerializer(serializers.ModelSerializer):
    # Campos del Usuario (Nombre, Apellido, Email)
    first_name = serializers.CharField(source='usuario.first_name')
    last_name = serializers.CharField(source='usuario.last_name')
    email = serializers.EmailField(source='usuario.email')
    telefono = serializers.CharField(source='usuario.telefono')

    class Meta:
        model = Cliente
        # Campos propios del Cliente + los del Usuario
        fields = ['first_name', 'last_name', 'email', 'telefono', 'direccion', 'fecha_nacimiento']

    def update(self, instance, validated_data):
        # Extraer datos del usuario anidado
        usuario_data = validated_data.pop('usuario', {})
        
        # Actualizar modelo Usuario
        usuario = instance.usuario
        usuario.first_name = usuario_data.get('first_name', usuario.first_name)
        usuario.last_name = usuario_data.get('last_name', usuario.last_name)
        usuario.email = usuario_data.get('email', usuario.email)
        usuario.telefono = usuario_data.get('telefono', usuario.telefono)
        usuario.save()

        # Actualizar modelo Cliente (Dirección, Fecha)
        instance.direccion = validated_data.get('direccion', instance.direccion)
        instance.fecha_nacimiento = validated_data.get('fecha_nacimiento', instance.fecha_nacimiento)
        instance.save()

        return instance
    
#AUMENTANDO UN SERIALIZER PARA QUE EL AGENTE EDITE SUS DATOS
# en seguros/serializers.py

class EditarPerfilAgenteSerializer(serializers.ModelSerializer):
    # Campos del Usuario (Nombre, Apellido, Email, Teléfono Personal)
    first_name = serializers.CharField(source='usuario.first_name')
    last_name = serializers.CharField(source='usuario.last_name')
    email = serializers.EmailField(source='usuario.email')
    telefono = serializers.CharField(source='usuario.telefono', required=False)
    
    class Meta:
        model = Agente
        # Campos propios del Agente + los del Usuario que queremos mostrar/editar
        fields = [
            'codigo_agente', 'especialidad', 'comision', 'estado', 
            'telefono_oficina', 'direccion_oficina',
            'first_name', 'last_name', 'email', 'telefono'
        ]
        # Estos campos no deberían poder editarlos ellos mismos (solo lectura)
        read_only_fields = ['codigo_agente', 'comision', 'estado']

    def update(self, instance, validated_data):
        # Extraer datos del usuario anidado
        usuario_data = validated_data.pop('usuario', {})
        
        # Actualizar modelo Usuario
        usuario = instance.usuario
        usuario.first_name = usuario_data.get('first_name', usuario.first_name)
        usuario.last_name = usuario_data.get('last_name', usuario.last_name)
        usuario.email = usuario_data.get('email', usuario.email)
        usuario.telefono = usuario_data.get('telefono', usuario.telefono)
        usuario.save()

        # Actualizar modelo Agente (Oficina, Especialidad)
        instance.telefono_oficina = validated_data.get('telefono_oficina', instance.telefono_oficina)
        instance.direccion_oficina = validated_data.get('direccion_oficina', instance.direccion_oficina)
        instance.especialidad = validated_data.get('especialidad', instance.especialidad)
        instance.save()

        return instance
    
# en seguros/serializers.py
class SolicitarPolizaSerializer(serializers.ModelSerializer):
    # Campos que envía el frontend pero no están directos en el modelo Poliza
    tipo_seguro = serializers.CharField(write_only=True)
    observaciones = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Poliza
        # Solo pedimos la suma asegurada. El resto lo calculamos en la vista.
        fields = ['suma_asegurada', 'tipo_seguro', 'observaciones']




# 1. Serializer auxiliar para actualizar los datos del Usuario
class UsuarioEdicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['first_name', 'last_name', 'email', 'telefono']

# 2. Serializer PRINCIPAL para editar Cliente
class AgenteEditarClienteSerializer(serializers.ModelSerializer):
    # Esto permite acceder y editar los datos del usuario asociado
    usuario = UsuarioEdicionSerializer() 

    class Meta:
        model = Cliente
        fields = ['identificacion', 'direccion', 'fecha_nacimiento', 'estado_salud', 'usuario']

    def update(self, instance, validated_data):
        # A. Sacamos los datos del usuario (si vienen)
        usuario_data = validated_data.pop('usuario', {})
        
        # B. Actualizamos la tabla Usuario (Nombre, Email, etc.)
        usuario = instance.usuario
        for attr, value in usuario_data.items():
            setattr(usuario, attr, value)
        usuario.save()

        # C. Actualizamos la tabla Cliente (Dirección, CI, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance