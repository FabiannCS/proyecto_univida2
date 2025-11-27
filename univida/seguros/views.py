# en seguros/views.py - VERSIÓN MERGED

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.utils import timezone

# Modelos
from .models import (
    Cliente, Poliza, Beneficiario, Agente, Factura, Pago,
    Siniestro, NotaPoliza, Usuario
)

# Serializers
from .serializers import (
    ClienteSerializer, PolizaSerializer, CrearPolizaSerializer, BeneficiarioSerializer,
    FacturaSerializer, CrearFacturaSerializer, PagoSerializer, CrearPagoSerializer,
    UsuarioAgenteSerializer, SiniestroSerializer, CrearSiniestroSerializer, ActualizarSiniestroSerializer,
    NotaPolizaSerializer, CrearNotaPolizaSerializer, CrearClienteSerializer,
    EditarClienteSerializer, AgenteSerializer
)

# API para Clientes
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_clientes(request):
    clientes = Cliente.objects.all()
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)

# API para Pólizas
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_polizas(request):
    if request.method == 'GET':
        polizas = Poliza.objects.all()
        serializer = PolizaSerializer(polizas, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CrearPolizaSerializer(data=request.data)
        if serializer.is_valid():
            # Generar número de póliza automáticamente si no se proporciona
            if not request.data.get('numero_poliza'):
                fecha = timezone.now()
                random = str(fecha.microsecond)[-3:].zfill(3)
                numero_poliza = f"POL-ACC-{fecha.year}{fecha.month:02d}{random}"
                serializer.validated_data['numero_poliza'] = numero_poliza

            poliza = serializer.save()
            return Response(PolizaSerializer(poliza).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Beneficiarios
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_beneficiarios(request):
    beneficiarios = Beneficiario.objects.all()
    serializer = BeneficiarioSerializer(beneficiarios, many=True)
    return Response(serializer.data)

# API para una póliza específica
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalle_poliza(request, poliza_id):
    try:
        poliza = Poliza.objects.get(id=poliza_id)
        serializer = PolizaSerializer(poliza)
        return Response(serializer.data)
    except Poliza.DoesNotExist:
        return Response({'error': 'Póliza no encontrada'}, status=status.HTTP_404_NOT_FOUND)

# API para Facturas
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_facturas(request):
    if request.method == 'GET':
        facturas = Factura.objects.all()
        serializer = FacturaSerializer(facturas, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CrearFacturaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Pagos
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_pagos(request):
    if request.method == 'GET':
        pagos = Pago.objects.all()
        serializer = PagoSerializer(pagos, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CrearPagoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Siniestros
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_siniestros(request):
    if request.method == 'GET':
        siniestros = Siniestro.objects.all().order_by('-fecha_reporte')
        serializer = SiniestroSerializer(siniestros, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CrearSiniestroSerializer(data=request.data)
        if serializer.is_valid():
            # Asignar fecha de reporte automáticamente
            siniestro = serializer.save(fecha_reporte=timezone.now().date())
            return Response(SiniestroSerializer(siniestro).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Notas de Póliza
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_notas_poliza(request):
    if request.method == 'GET':
        notas = NotaPoliza.objects.all()
        serializer = NotaPolizaSerializer(notas, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CrearNotaPolizaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# APIs para detalles individuales
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def detalle_siniestro(request, siniestro_id):
    try:
        siniestro = Siniestro.objects.get(id=siniestro_id)
    except Siniestro.DoesNotExist:
        return Response({'error': 'Siniestro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SiniestroSerializer(siniestro)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        # Solo ADMIN puede aprobar/rechazar siniestros
        if request.user.rol != 'ADMIN':
            return Response({'error': 'Solo los administradores pueden actualizar siniestros'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ActualizarSiniestroSerializer(siniestro, data=request.data, partial=True)
        if serializer.is_valid():
            datos_actualizados = serializer.validated_data

            # Si se aprueba o rechaza, registrar fecha de resolución
            if datos_actualizados.get('estado') in ['aprobado', 'rechazado']:
                datos_actualizados['fecha_resolucion'] = timezone.now().date()

            siniestro_actualizado = serializer.save()
            return Response(SiniestroSerializer(siniestro_actualizado).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalle_nota_poliza(request, nota_id):
    try:
        nota = NotaPoliza.objects.get(id=nota_id)
        serializer = NotaPolizaSerializer(nota)
        return Response(serializer.data)
    except NotaPoliza.DoesNotExist:
        return Response({'error': 'Nota no encontrada'}, status=status.HTTP_404_NOT_FOUND)

# En seguros/views.py - ACTUALIZAR lista_agentes
@api_view(['GET'])
@permission_classes([IsAdminUser])
def lista_agentes(request):
    """
    Lista todos los AGENTES (objetos Agente), no usuarios.
    """
    agentes = Agente.objects.all().select_related('usuario')
    serializer = AgenteSerializer(agentes, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def crear_agente(request):
    """
    Crea un nuevo usuario con rol AGENTE.
    """
    serializer = UsuarioAgenteSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save(rol='AGENTE')

        try:
            Agente.objects.create(
                usuario=user,
                codigo_agente=request.data.get('codigo_agente', f'TEMP-{user.id}'),
                fecha_contratacion=request.data.get('fecha_contratacion', None)
            )
        except Exception as e:
            user.delete()
            return Response({'error': f'No se pudo crear el perfil Agente: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def detalle_agente(request, agente_id):
    """
    Obtiene los detalles de un usuario agente específico por su ID de Usuario.
    """
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UsuarioAgenteSerializer(agente_usuario)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def editar_agente(request, agente_id):
    """Actualiza un usuario agente existente."""
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UsuarioAgenteSerializer(agente_usuario, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_agente(request, agente_id):
    """
    Elimina (o desactiva) un usuario agente existente.
    """
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    agente_usuario.is_active = False
    agente_usuario.save()

    try:
        agente_perfil = Agente.objects.get(usuario=agente_usuario)
        agente_perfil.estado = 'inactivo'
        agente_perfil.save()
    except Agente.DoesNotExist:
        pass

    return Response({'mensaje': 'Agente desactivado correctamente'}, status=status.HTTP_204_NO_CONTENT)

# API para crear cliente
@api_view(['POST'])
@permission_classes([IsAdminUser])
def crear_cliente(request):
    """Crea un nuevo cliente con su usuario asociado."""
    serializer = CrearClienteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para detalles de cliente
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalle_cliente(request, cliente_id):
    """Obtiene los detalles de un cliente específico."""
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ClienteSerializer(cliente)
    return Response(serializer.data)

# API para editar cliente
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def editar_cliente(request, cliente_id):
    """Edita un cliente existente."""
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = EditarClienteSerializer(cliente, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para eliminar cliente
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_cliente(request, cliente_id):
    """Elimina (desactiva) un cliente."""
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    cliente.usuario.is_active = False
    cliente.usuario.save()

    return Response({'mensaje': 'Cliente desactivado correctamente'}, status=status.HTTP_204_NO_CONTENT)

# PARA REACTIVAR AGENTES:
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def reactivar_agente(request, agente_id):
    """
    Reactiva un agente previamente desactivado.
    """
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    agente_usuario.is_active = True
    agente_usuario.save()

    try:
        agente_perfil = Agente.objects.get(usuario=agente_usuario)
        agente_perfil.estado = 'activo'
        agente_perfil.save()
    except Agente.DoesNotExist:
        pass

    return Response({'mensaje': 'Agente reactivado correctamente'}, status=status.HTTP_200_OK)

# VISTAS PARA CLIENTES:
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def reactivar_cliente(request, cliente_id):
    """
    Reactiva un cliente previamente desactivado.
    """
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    cliente.usuario.is_active = True
    cliente.usuario.save()

    return Response({'mensaje': 'Cliente reactivado correctamente'}, status=status.HTTP_200_OK)

# API para activar póliza
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def activar_poliza(request, poliza_id):
    """Activa una póliza en estado cotización"""
    try:
        poliza = Poliza.objects.get(id=poliza_id)
        if poliza.estado == 'cotizacion':
            poliza.estado = 'activa'
            poliza.save()
            return Response({'mensaje': 'Póliza activada correctamente'})
        else:
            return Response({'error': 'La póliza no está en cotización'}, status=400)
    except Poliza.DoesNotExist:
        return Response({'error': 'Póliza no encontrada'}, status=404)

# API para cancelar póliza
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def cancelar_poliza(request, poliza_id):
    """Cancela una póliza en estado cotización"""
    try:
        poliza = Poliza.objects.get(id=poliza_id)
        if poliza.estado == 'cotizacion':
            poliza.estado = 'cancelada'
            poliza.save()
            return Response({'mensaje': 'Póliza cancelada correctamente'})
        else:
            return Response({'error': 'Solo se pueden cancelar pólizas en cotización'}, status=400)
    except Poliza.DoesNotExist:
        return Response({'error': 'Póliza no encontrada'}, status=404)

# APIs para Siniestros - Aprobación y Rechazo específicos
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def aprobar_siniestro(request, siniestro_id):
    """
    Endpoint específico para aprobar siniestros
    """
    try:
        siniestro = Siniestro.objects.get(id=siniestro_id)
    except Siniestro.DoesNotExist:
        return Response({'error': 'Siniestro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    # Validar que tenga monto aprobado
    monto_aprobado = request.data.get('monto_aprobado')
    if not monto_aprobado:
        return Response({'error': 'Debe especificar el monto aprobado'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        siniestro.estado = 'aprobado'
        siniestro.monto_aprobado = monto_aprobado
        siniestro.fecha_resolucion = timezone.now().date()
        siniestro.resolucion = request.data.get('resolucion', 'Siniestro aprobado')
        siniestro.save()

        return Response(SiniestroSerializer(siniestro).data)

    except Exception as e:
        return Response({'error': f'Error al aprobar siniestro: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def rechazar_siniestro(request, siniestro_id):
    """
    Endpoint específico para rechazar siniestros
    """
    try:
        siniestro = Siniestro.objects.get(id=siniestro_id)
    except Siniestro.DoesNotExist:
        return Response({'error': 'Siniestro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    try:
        siniestro.estado = 'rechazado'
        siniestro.fecha_resolucion = timezone.now().date()
        siniestro.resolucion = request.data.get('resolucion', 'Siniestro rechazado')
        siniestro.save()

        return Response(SiniestroSerializer(siniestro).data)

    except Exception as e:
        return Response({'error': f'Error al rechazar siniestro: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def registrar_cliente_publico(request):
    """
    Permite a un usuario registrarse como Cliente desde la Landing Page.
    """
    serializer = CrearClienteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Esto crea el Usuario y el Cliente
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if serializer.is_valid():
            # Asignar fecha de reporte automáticamente
            siniestro = serializer.save(fecha_reporte=timezone.now().date())
            return Response(SiniestroSerializer(siniestro).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Notas de Póliza
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_notas_poliza(request):
    if request.method == 'GET':
        notas = NotaPoliza.objects.all()
        serializer = NotaPolizaSerializer(notas, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CrearNotaPolizaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# APIs para detalles individuales
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def detalle_siniestro(request, siniestro_id):
    try:
        siniestro = Siniestro.objects.get(id=siniestro_id)
    except Siniestro.DoesNotExist:
        return Response({'error': 'Siniestro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SiniestroSerializer(siniestro)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        # Solo ADMIN puede aprobar/rechazar siniestros
        if request.user.rol != 'ADMIN':
            return Response(
                {'error': 'Solo los administradores pueden actualizar siniestros'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ActualizarSiniestroSerializer(siniestro, data=request.data, partial=True)
        if serializer.is_valid():
            datos_actualizados = serializer.validated_data
            
            # Si se aprueba o rechaza, registrar fecha de resolución
            if datos_actualizados.get('estado') in ['aprobado', 'rechazado']:
                datos_actualizados['fecha_resolucion'] = timezone.now().date()
            
            siniestro_actualizado = serializer.save()
            return Response(SiniestroSerializer(siniestro_actualizado).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalle_nota_poliza(request, nota_id):
    try:
        nota = NotaPoliza.objects.get(id=nota_id)
        serializer = NotaPolizaSerializer(nota)
        return Response(serializer.data)
    except NotaPoliza.DoesNotExist:
        return Response({'error': 'Nota no encontrada'}, status=status.HTTP_404_NOT_FOUND)

# En seguros/views.py - ACTUALIZAR lista_agentes
@api_view(['GET'])
@permission_classes([IsAdminUser])
def lista_agentes(request):
    """
    Lista todos los AGENTES (objetos Agente), no usuarios.
    """
    if request.method == 'GET':
        # Cambiar: devolver objetos Agente, no Usuario
        agentes = Agente.objects.all().select_related('usuario')
        serializer = AgenteSerializer(agentes, many=True)  # ← Usar AgenteSerializer, no UsuarioAgenteSerializer
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def crear_agente(request):
    """
    Crea un nuevo usuario con rol AGENTE.
    """
    if request.method == 'POST':
        serializer = UsuarioAgenteSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(rol='AGENTE') 
            
            try:
                Agente.objects.create(
                    usuario=user,
                    codigo_agente=request.data.get('codigo_agente', f'TEMP-{user.id}'),
                    fecha_contratacion=request.data.get('fecha_contratacion', None)
                )
            except Exception as e:
                user.delete() 
                return Response({'error': f'No se pudo crear el perfil Agente: {e}'}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def detalle_agente(request, agente_id):
    """
    Obtiene los detalles de un usuario agente específico por su ID de Usuario.
    """
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE') 
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UsuarioAgenteSerializer(agente_usuario) 
        return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def editar_agente(request, agente_id):
    """Actualiza un usuario agente existente."""
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UsuarioAgenteSerializer(agente_usuario, data=request.data, partial=True) 
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_agente(request, agente_id):
    """
    Elimina (o desactiva) un usuario agente existente.
    """
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        agente_usuario.is_active = False
        agente_usuario.save()
        
        try:
            agente_perfil = Agente.objects.get(usuario=agente_usuario)
            agente_perfil.estado = 'inactivo'
            agente_perfil.save()
        except Agente.DoesNotExist:
            pass 
        
        return Response({'mensaje': 'Agente desactivado correctamente'}, status=status.HTTP_204_NO_CONTENT)

# API para crear cliente
@api_view(['POST'])
@permission_classes([IsAdminUser])
def crear_cliente(request):
    """Crea un nuevo cliente con su usuario asociado."""
    if request.method == 'POST':
        serializer = CrearClienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para detalles de cliente
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalle_cliente(request, cliente_id):
    """Obtiene los detalles de un cliente específico."""
    try:
        cliente = Cliente.objects.get(id=cliente_id)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

# API para editar cliente
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def editar_cliente(request, cliente_id):
    """Edita un cliente existente."""
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    serializer = EditarClienteSerializer(cliente, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para eliminar cliente
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_cliente(request, cliente_id):
    """Elimina (desactiva) un cliente."""
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    cliente.usuario.is_active = False
    cliente.usuario.save()
    
    return Response({'mensaje': 'Cliente desactivado correctamente'}, status=status.HTTP_204_NO_CONTENT)

# PARA REACTIVAR AGENTES:
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def reactivar_agente(request, agente_id):
    """
    Reactiva un agente previamente desactivado.
    """
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        agente_usuario.is_active = True
        agente_usuario.save()
        
        try:
            agente_perfil = Agente.objects.get(usuario=agente_usuario)
            agente_perfil.estado = 'activo'
            agente_perfil.save()
        except Agente.DoesNotExist:
            pass 
        
        return Response({'mensaje': 'Agente reactivado correctamente'}, status=status.HTTP_200_OK)

# VISTAS PARA CLIENTES:
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def reactivar_cliente(request, cliente_id):
    """
    Reactiva un cliente previamente desactivado.
    """
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        cliente.usuario.is_active = True
        cliente.usuario.save()
        
        return Response({'mensaje': 'Cliente reactivado correctamente'}, status=status.HTTP_200_OK)

# API para activar póliza
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def activar_poliza(request, poliza_id):
    """Activa una póliza en estado cotización"""
    try:
        poliza = Poliza.objects.get(id=poliza_id)
        if poliza.estado == 'cotizacion':
            poliza.estado = 'activa'
            poliza.save()
            return Response({'mensaje': 'Póliza activada correctamente'})
        else:
            return Response({'error': 'La póliza no está en cotización'}, status=400)
    except Poliza.DoesNotExist:
        return Response({'error': 'Póliza no encontrada'}, status=404)

# API para cancelar póliza
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def cancelar_poliza(request, poliza_id):
    """Cancela una póliza en estado cotización"""
    try:
        poliza = Poliza.objects.get(id=poliza_id)
        if poliza.estado == 'cotizacion':
            poliza.estado = 'cancelada'
            poliza.save()
            return Response({'mensaje': 'Póliza cancelada correctamente'})
        else:
            return Response({'error': 'Solo se pueden cancelar pólizas en cotización'}, status=400)
    except Poliza.DoesNotExist:
        return Response({'error': 'Póliza no encontrada'}, status=404)

