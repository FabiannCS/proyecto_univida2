# en seguros/views.py

from rest_framework import status, permissions # <--- Combinado
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser #para proteger las vistas

# Modelos (todos en una línea)
from .models import (Cliente, Poliza, Beneficiario, Agente, Factura, Pago, Siniestro, NotaPoliza, Usuario)
# Serializers (todos en un bloque)
from .serializers import (ClienteSerializer, PolizaSerializer, CrearPolizaSerializer, BeneficiarioSerializer,
    FacturaSerializer, CrearFacturaSerializer, PagoSerializer, CrearPagoSerializer, UsuarioAgenteSerializer,SiniestroSerializer, CrearSiniestroSerializer,
    NotaPolizaSerializer, CrearNotaPolizaSerializer)

# API para Clientes
@api_view(['GET'])
def lista_clientes(request):
    clientes = Cliente.objects.all()
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)

# API para Pólizas
@api_view(['GET', 'POST'])
def lista_polizas(request):
    if request.method == 'GET':
        polizas = Poliza.objects.all()
        serializer = PolizaSerializer(polizas, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CrearPolizaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Beneficiarios
@api_view(['GET'])
def lista_beneficiarios(request):
    beneficiarios = Beneficiario.objects.all()
    serializer = BeneficiarioSerializer(beneficiarios, many=True)
    return Response(serializer.data)

# API para una póliza específica
@api_view(['GET'])
def detalle_poliza(request, poliza_id):
    try:
        poliza = Poliza.objects.get(id=poliza_id)
        serializer = PolizaSerializer(poliza)
        return Response(serializer.data)
    except Poliza.DoesNotExist:
        return Response(
            {'error': 'Póliza no encontrada'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
# API para Facturas
@api_view(['GET', 'POST'])
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


   #aireyuclose

from .serializers import (
    SiniestroSerializer, CrearSiniestroSerializer,
    NotaPolizaSerializer, CrearNotaPolizaSerializer
)

# API para Siniestros
@api_view(['GET', 'POST'])
def lista_siniestros(request):
    if request.method == 'GET':
        siniestros = Siniestro.objects.all()
        serializer = SiniestroSerializer(siniestros, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CrearSiniestroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Notas de Póliza
@api_view(['GET', 'POST'])
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
@api_view(['GET'])
def detalle_siniestro(request, siniestro_id):
    try:
        siniestro = Siniestro.objects.get(id=siniestro_id)
        serializer = SiniestroSerializer(siniestro)
        return Response(serializer.data)
    except Siniestro.DoesNotExist:
        return Response({'error': 'Siniestro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def detalle_nota_poliza(request, nota_id):
    try:
        nota = NotaPoliza.objects.get(id=nota_id)
        serializer = NotaPolizaSerializer(nota)
        return Response(serializer.data)
    except NotaPoliza.DoesNotExist:
        return Response({'error': 'Nota no encontrada'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET']) # Solo permite peticiones GET
@permission_classes([IsAdminUser]) # Solo administradores pueden ver la lista
def lista_agentes(request):
    """
    Lista todos los usuarios con rol AGENTE.
    """
    if request.method == 'GET':
        # Filtra usuarios por rol='AGENTE'
        agentes_usuarios = Usuario.objects.filter(rol='AGENTE') 
        # Usa el serializer para convertir los datos a JSON
        serializer = UsuarioAgenteSerializer(agentes_usuarios, many=True) 
        return Response(serializer.data)
    
@api_view(['POST']) # Solo permite peticiones POST
@permission_classes([IsAdminUser]) # Solo administradores pueden crear agentes
def crear_agente(request):
    """
    Crea un nuevo usuario con rol AGENTE.
    """
    if request.method == 'POST':
        # Usa el serializer para validar y crear el Usuario
        serializer = UsuarioAgenteSerializer(data=request.data)
        if serializer.is_valid():
            # Guarda el nuevo usuario (el serializer ya pone rol='AGENTE' y hashea el pass)
            user = serializer.save() 
            
            # --- Opcional: Crear el perfil Agente asociado ---
            # Necesitarías recibir 'codigo_agente' y 'fecha_contratacion' en request.data
            try:
                Agente.objects.create(
                    usuario=user,
                    codigo_agente=request.data.get('codigo_agente', f'TEMP-{user.id}'), # Ejemplo
                    fecha_contratacion=request.data.get('fecha_contratacion', None) # Ejemplo
                    # Añade otros campos si los necesitas
                )
            except Exception as e:
                # Si falla crear el Agente, podrías borrar el Usuario o manejar el error
                user.delete() 
                return Response({'error': f'No se pudo crear el perfil Agente: {e}'}, status=status.HTTP_400_BAD_REQUEST)
            # --- Fin Opcional ---

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # Si los datos no son válidos, devuelve los errores
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET']) # Solo permite GET
@permission_classes([IsAdminUser])
def detalle_agente(request, agente_id):
    """
    Obtiene los detalles de un usuario agente específico por su ID de Usuario.
    """
    try:
        # Busca el usuario por ID y asegúrate de que sea AGENTE
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE') 
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Usa el serializer para convertir los datos a JSON
        serializer = UsuarioAgenteSerializer(agente_usuario) 
        # NOTA: Sería ideal usar AgenteSerializer aquí para mostrar más detalles
        # pero requeriría buscar el objeto Agente asociado al usuario.
        return Response(serializer.data)
    
@api_view(['PUT', 'PATCH']) # Permite actualización completa (PUT) o parcial (PATCH)
@permission_classes([IsAdminUser])
def editar_agente(request, agente_id):
    """Actualiza un usuario agente existente."""
    try:
        agente_usuario = Usuario.objects.get(pk=agente_id, rol='AGENTE')
    except Usuario.DoesNotExist:
        return Response({'error': 'Agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    # Usa el serializer para validar y actualizar el Usuario
    # partial=True permite actualizaciones parciales con PATCH
    serializer = UsuarioAgenteSerializer(agente_usuario, data=request.data, partial=True) 
    if serializer.is_valid():
        serializer.save() # El serializer ya se asegura de que el rol siga siendo AGENTE
        
        # --- Opcional: Actualizar el perfil Agente asociado ---
        # Podrías buscar el Agente y actualizar sus campos aquí si es necesario
        # try:
        #    agente_perfil = Agente.objects.get(usuario=agente_usuario)
        #    agente_perfil.comision = request.data.get('comision', agente_perfil.comision)
        #    # ... otros campos ...
        #    agente_perfil.save()
        # except Agente.DoesNotExist:
        #    pass # O manejar el error si el perfil no existe
        # --- Fin Opcional ---
        
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE']) # Solo permite DELETE
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
        # Opción 1: Desactivar (Recomendado)
        agente_usuario.is_active = False
        agente_usuario.save()
        # También podrías desactivar el perfil Agente
        try:
            agente_perfil = Agente.objects.get(usuario=agente_usuario)
            agente_perfil.estado = 'inactivo'
            agente_perfil.save()
        except Agente.DoesNotExist:
            pass 
        return Response({'mensaje': 'Agente desactivado correctamente'}, status=status.HTTP_204_NO_CONTENT)

        # Opción 2: Eliminar (¡CUIDADO! Borra permanentemente)
        # agente_usuario.delete()
        # return Response({'mensaje': 'Agente eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)

#vistas para la creacion de clientes

# En seguros/views.py - AÑADE ESTAS VISTAS:

from .serializers import CrearClienteSerializer  # Añade esto al import

# API para crear cliente
@api_view(['POST'])
@permission_classes([IsAdminUser])  # Solo administradores pueden crear clientes
def crear_cliente(request):
    """
    Crea un nuevo cliente con su usuario asociado.
    """
    if request.method == 'POST':
        serializer = CrearClienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para detalles de cliente
@api_view(['GET'])
def detalle_cliente(request, cliente_id):
    """
    Obtiene los detalles de un cliente específico.
    """
    try:
        cliente = Cliente.objects.get(id=cliente_id)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)
    except Cliente.DoesNotExist:
        return Response(
            {'error': 'Cliente no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

# API para editar cliente
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def editar_cliente(request, cliente_id):
    """
    Edita un cliente existente.
    """
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response(
            {'error': 'Cliente no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = ClienteSerializer(cliente, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para eliminar cliente
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def eliminar_cliente(request, cliente_id):
    """
    Elimina (desactiva) un cliente.
    """
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response(
            {'error': 'Cliente no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    # Desactivar el usuario en lugar de eliminar
    cliente.usuario.is_active = False
    cliente.usuario.save()
    
    return Response(
        {'mensaje': 'Cliente desactivado correctamente'}, 
        status=status.HTTP_204_NO_CONTENT
    )