# en seguros/views.py - VERSIÓN MERGED

from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
from django.db import transaction 
from django.db.models import Sum, Count
import random
from datetime import date

import random
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
    EditarClienteSerializer, AgenteSerializer, EditarPerfilClienteSerializer, EditarPerfilAgenteSerializer,
    SolicitarPolizaSerializer, BeneficiarioInputSerializer, AgenteEditarClienteSerializer
)

# API para Clientes
@api_view(['GET', 'POST']) # <-- ¡IMPORTANTE! Agregamos POST
@permission_classes([IsAuthenticated]) # Mantenemos la seguridad
def lista_clientes(request):
    # --- VER LISTA (GET) ---
    if request.method == 'GET':
        clientes = Cliente.objects.all()
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data)
    
    # --- CREAR CLIENTE (POST) ---
    elif request.method == 'POST':
        # Usamos el serializer especial que sabe crear Usuario + Cliente
        serializer = CrearClienteSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save() # Esto ejecuta el método .create() de tu serializer
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Pólizas

# en seguros/views.py
from datetime import date, timedelta # Asegúrate de tener timedelta importado

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_polizas(request):
    # --- GET: LISTAR ---
    if request.method == 'GET':
        polizas = Poliza.objects.all().order_by('-id')
        serializer = PolizaSerializer(polizas, many=True)
        return Response(serializer.data)
    
    # --- POST: CREAR ---
    elif request.method == 'POST':
        serializer = CrearPolizaSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # 1. Generar Número y Guardar Póliza Base
                    numero_gen = f"POL-{random.randint(10000, 99999)}"
                    tipo_seguro = request.data.get('tipo_seguro', 'Plan General')
                    info_extra = f"Plan: {tipo_seguro}. Emitido por Agente."

                    poliza = serializer.save(
                        numero_poliza=numero_gen,
                        cobertura=info_extra
                    )
                    
                    # Asignar Agente (siempre que lo crea un agente)
                    if hasattr(request.user, 'agente'):
                        poliza.agente = request.user.agente

                    # 2. Verificar si es PAGO INMEDIATO
                    if request.data.get('pago_inmediato') is True:
                        # CASO A: COBRAR AHORA
                        
                        # Crear Factura PAGADA
                        factura = Factura.objects.create(
                            poliza=poliza,
                            numero_factura=f"FAC-{random.randint(10000, 99999)}",
                            monto=poliza.prima_anual, 
                            fecha_emision=date.today(),
                            fecha_vencimiento=date.today(),
                            estado='pagada',
                            concepto=f"Pago inicial póliza {poliza.numero_poliza}"
                        )
                        
                        # Registrar el Pago
                        Pago.objects.create(
                            factura=factura,
                            monto_pagado=poliza.prima_anual,
                            metodo_pago=request.data.get('metodo_pago', 'efectivo'),
                            referencia_pago=request.data.get('referencia_pago', 'Ventanilla'),
                            estado='completado'
                        )
                        
                        poliza.estado = 'activa'
                    
                    else:
                        # CASO B: COBRAR DESPUÉS (¡ESTO ES LO NUEVO!)
                        
                        # Crear Factura PENDIENTE
                        Factura.objects.create(
                            poliza=poliza,
                            numero_factura=f"FAC-{random.randint(10000, 99999)}",
                            monto=poliza.prima_anual, 
                            fecha_emision=date.today(),
                            fecha_vencimiento=date.today() + timedelta(days=30), # 30 días para pagar
                            estado='pendiente',
                            concepto=f"Primera prima póliza {poliza.numero_poliza}"
                        )
                        
                        # La póliza pasa a 'pendiente_pago', no 'cotizacion'
                        # porque ya fue emitida por un agente oficial.
                        poliza.estado = 'pendiente_pago'

                    poliza.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)

            except Exception as e:
                print(f"ERROR: {e}") 
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) # O IsAdminUser según tu lógica
def crear_poliza(request): # O la vista que usas para POST /api/polizas/
    # (Si usas un ViewSet, esto iría en el método create)
    
    # ... (tu código de validación inicial) ...
    
    serializer = CrearPolizaSerializer(data=request.data) # O PolizaSerializer
    if serializer.is_valid():
        try:
            with transaction.atomic(): # Inicia una transacción segura
                # 1. Crear la Póliza (Inicialmente pendiente o cotización)
                poliza = serializer.save()
                
                # 2. Verificar si es PAGO INMEDIATO
                if request.data.get('pago_inmediato') is True:
                    # A. Generar Factura
                    factura = Factura.objects.create(
                        poliza=poliza,
                        numero_factura=f"FAC-{random.randint(10000, 99999)}",
                        monto=poliza.prima_anual, 
                        fecha_emision=date.today(),
                        fecha_vencimiento=date.today(),
                        estado='pagada', # Ya nace pagada
                        concepto=f"Pago inicial póliza {poliza.numero_poliza}"
                    )
                    
                    # B. Registrar el Pago
                    Pago.objects.create(
                        factura=factura,
                        monto_pagado=poliza.prima_anual,
                        metodo_pago=request.data.get('metodo_pago', 'efectivo'), # Default efectivo
                        referencia_pago=request.data.get('referencia_pago', 'Pago en ventanilla'),
                        estado='completado'
                    )
                    
                    # C. Activar la Póliza
                    poliza.estado = 'activa'
                    poliza.save()
                
                else:
                    # Si no es pago inmediato, se queda como 'cotizacion' (o lo que definiste antes)
                    poliza.estado = 'cotizacion'
                    poliza.save()

                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Beneficiarios
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_beneficiarios(request):
    beneficiarios = Beneficiario.objects.all()
    serializer = BeneficiarioSerializer(beneficiarios, many=True)
    return Response(serializer.data)

# en seguros/views.py

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agregar_beneficiario(request):
    """
    Permite agregar un beneficiario a una póliza existente.
    """
    # Validar que la póliza exista
    poliza_id = request.data.get('poliza')
    try:
        poliza = Poliza.objects.get(id=poliza_id)
    except Poliza.DoesNotExist:
        return Response({'error': 'Póliza no encontrada'}, status=404)

    # (Opcional) Validar que el usuario sea el Agente de esa póliza o un Admin
    if request.user.rol == 'AGENTE' and poliza.agente.usuario != request.user:
        return Response({'error': 'No tienes permiso'}, status=403)

    serializer = BeneficiarioSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(poliza=poliza)
        return Response(serializer.data, status=201)
    
    return Response(serializer.errors, status=400)

# Y también una para ELIMINAR beneficiario
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_beneficiario(request, beneficiario_id):
    try:
        beneficiario = Beneficiario.objects.get(id=beneficiario_id)
        beneficiario.delete()
        return Response({'mensaje': 'Eliminado'}, status=204)
    except Beneficiario.DoesNotExist:
        return Response({'error': 'No encontrado'}, status=404)


# API para una póliza específica
@api_view(['GET', 'PUT', 'PATCH'])
def detalle_poliza(request, poliza_id):
    try:
        poliza = Poliza.objects.get(id=poliza_id)
    except Poliza.DoesNotExist:
        return Response({'error': 'Póliza no encontrada'}, status=404)

    if request.method == 'GET':
        serializer = PolizaSerializer(poliza)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = PolizaSerializer(poliza, data=request.data, partial=True)
        
        if serializer.is_valid():
            nuevo_estado = request.data.get('estado')

            # --- LÓGICA: AGENTE ACEPTA LA SOLICITUD ---
            if nuevo_estado == 'pendiente_pago' and poliza.estado == 'cotizacion':
                try:
                    # 1. Asignar Agente (si el usuario es agente)
                    if hasattr(request.user, 'agente'):
                        poliza.agente = request.user.agente
                    
                    # 2. Generar FACTURA Automática
                    Factura.objects.create(
                        poliza=poliza,
                        numero_factura=f"FAC-{random.randint(10000, 99999)}",
                        monto=poliza.prima_anual, # O prima_mensual si es pago fraccionado
                        fecha_emision=date.today(),
                        fecha_vencimiento=date.today() + timedelta(days=15), # 15 días para pagar
                        estado='pendiente',
                        concepto=f"Primera prima póliza {poliza.numero_poliza}"
                    )
                except Exception as e:
                    print(f"Error al generar factura: {e}")
            
            # Guardamos los cambios en la póliza
            serializer.save()
            return Response(serializer.data)
            
        return Response(serializer.errors, status=400)

# API para Facturas
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_facturas(request):
    """
    Gestión de Facturas. Permite filtrar por 'poliza_id' o 'estado'.
    """
    if request.method == 'GET':
        queryset = Factura.objects.all()
        
        # Filtros desde la URL (ej: /api/facturas/?poliza_id=5)
        poliza_id = request.query_params.get('poliza_id')
        estado = request.query_params.get('estado')
        
        if poliza_id:
            queryset = queryset.filter(poliza_id=poliza_id)
        if estado:
            queryset = queryset.filter(estado=estado)
            
        serializer = FacturaSerializer(queryset, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CrearFacturaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para Pagos
# en seguros/views.py
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lista_pagos(request):

    if request.method == 'GET':
        # Si es Admin o Agente, ve todo (o filtra por factura si quiere)
        if request.user.rol in ['ADMIN', 'AGENTE']:
            factura_id = request.query_params.get('factura_id')
            pagos = Pago.objects.filter(factura_id=factura_id) if factura_id else Pago.objects.all()
        
        # Si es CLIENTE, solo ve sus propios pagos
        elif request.user.rol == 'CLIENTE':
            # Filtramos pagos donde la factura -> poliza -> cliente -> usuario sea el actual
            pagos = Pago.objects.filter(factura__poliza__cliente__usuario=request.user)
            
        serializer = PagoSerializer(pagos, many=True)
        return Response(serializer.data)
    """
    Gestión de Pagos. Al crear uno, verifica si la factura se completó.
    """
    if request.method == 'GET':
        # Opcional: filtrar pagos por factura
        factura_id = request.query_params.get('factura_id')
        pagos = Pago.objects.filter(factura_id=factura_id) if factura_id else Pago.objects.all()
        serializer = PagoSerializer(pagos, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CrearPagoSerializer(data=request.data)
        if serializer.is_valid():
            # 1. Guardar el pago
            pago = serializer.save()
            
            # 2. LÓGICA AUTOMÁTICA
            factura = pago.factura
            
            # Sumar todos los pagos hechos a esta factura
            total_pagado = Pago.objects.filter(factura=factura).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
            
            # Si ya se pagó todo el monto...
            if total_pagado >= factura.monto:
                # A. Marcar Factura como PAGADA
                factura.estado = 'pagada'
                factura.save()
                
                # B. Activar la Póliza (si estaba pendiente)
                poliza = factura.poliza
                if poliza.estado == 'pendiente_pago' or poliza.estado == 'cotizacion':
                    poliza.estado = 'activa'
                    poliza.save()
                    
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

# API para detalles de cliente (ver y editar desde agente)
@api_view(['GET', 'PUT', 'PATCH']) # <-- ¡ASEGÚRATE DE QUE ESTÉ ASÍ (SIN #)!
@permission_classes([IsAuthenticated])
def detalle_cliente(request, cliente_id):
    try:
        cliente = Cliente.objects.get(id=cliente_id)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    # --- VER (GET) ---
    if request.method == 'GET':
        # Usamos el serializer estándar para VER (tiene usuario_info)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)

    # --- EDITAR (PATCH/PUT) ---
    elif request.method in ['PUT', 'PATCH']:
        # Usamos el serializer especial para GUARDAR
        serializer = AgenteEditarClienteSerializer(cliente, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            # Devolvemos los datos formateados para lectura
            return Response(ClienteSerializer(cliente).data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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


# APIs para que un cliente vea y edite su propio perfil
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated]) # Solo usuarios logueados
def mi_perfil_cliente(request):
    try:
        # Busca el cliente asociado al usuario actual
        cliente = Cliente.objects.get(usuario=request.user)
    except Cliente.DoesNotExist:
        return Response({'error': 'Perfil de cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = EditarPerfilClienteSerializer(cliente)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = EditarPerfilClienteSerializer(cliente, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#APIs para que un agente vea y edite su propio perfil
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def mi_perfil_agente(request):
    try:
        # Busca al Agente asociado al usuario logueado
        agente = Agente.objects.get(usuario=request.user)
    except Agente.DoesNotExist:
        return Response({'error': 'Perfil de agente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = EditarPerfilAgenteSerializer(agente)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = EditarPerfilAgenteSerializer(agente, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

#Api para que un cliente solicite una póliza con beneficiarios
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def solicitar_poliza(request):
    try:
        cliente = Cliente.objects.get(usuario=request.user)
    except Cliente.DoesNotExist:
        return Response({'error': 'No tienes perfil de cliente'}, status=400)

    # --- VALIDACIÓN CORREGIDA ---
    # Solo impedimos crear si tiene una póliza 'VIVA'
    poliza_activa = Poliza.objects.filter(
        cliente=cliente, 
        # Estados que BLOQUEAN una nueva solicitud
        estado__in=['cotizacion', 'pendiente_pago', 'activa'] 
    ).exists()

    if poliza_activa:
        return Response({
            'error': 'Ya tienes un trámite en curso o una póliza activa. Debes terminar ese proceso antes de solicitar otra.'
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer = SolicitarPolizaSerializer(data=request.data)
    
    if serializer.is_valid():
        datos = serializer.validated_data
        
        # 1. Extraer lista de beneficiarios
        beneficiarios_data = datos.pop('beneficiarios', [])

        # 2. Cálculos automáticos para la póliza
        import random
        numero_poliza = f"SOL-{random.randint(10000, 99999)}"
        
        inicio = date.today()
        fin = inicio + timedelta(days=365)
        
        suma = Decimal(str(datos['suma_asegurada'])) 
        porcentaje_prima = Decimal('0.02') # 2% placeholder
        prima_estimada = suma * porcentaje_prima
        prima_mensual_estimada = prima_estimada / Decimal('12')

        info_extra = f"Tipo: {datos['tipo_seguro']}. Obs: {datos.get('observaciones', '')}"

        try:
            # Usamos transaction.atomic para asegurar que si fallan los beneficiarios, no se cree la póliza
            with transaction.atomic():
                # A. Crear la Póliza
                poliza = Poliza.objects.create(
                    cliente=cliente,
                    numero_poliza=numero_poliza,
                    suma_asegurada=suma,
                    prima_anual=prima_estimada,
                    prima_mensual=prima_mensual_estimada,
                    fecha_inicio=inicio,
                    fecha_vencimiento=fin,
                    estado='cotizacion',
                    cobertura=info_extra
                )

                # B. Crear los Beneficiarios con los NUEVOS CAMPOS
                for ben in beneficiarios_data:
                    Beneficiario.objects.create(
                        poliza=poliza,
                        nombre_completo=ben.get('nombre_completo'),
                        paterno=ben.get('paterno', ''),    # <-- Nuevo campo
                        materno=ben.get('materno', ''),    # <-- Nuevo campo
                        parentesco=ben.get('parentesco'),
                        porcentaje=ben.get('porcentaje'),
                        fecha_nacimiento=ben.get('fecha_nacimiento'),
                        ci=ben.get('ci', ''),
                        telefono=ben.get('telefono', '')   # <-- Nuevo campo
                    )

            return Response({
                'mensaje': 'Solicitud recibida con beneficiarios correctamente',
                'id': poliza.id,
                'numero': poliza.numero_poliza
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"ERROR AL GUARDAR PÓLIZA: {str(e)}") 
            return Response({'error': f'Error interno: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# en seguros/views.py
#API PARA GENERAR PDF DE PÓLIZA
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generar_pdf_poliza(request, poliza_id):
    try:
        # Buscamos la póliza
        poliza = Poliza.objects.get(id=poliza_id)
        
        # (Opcional) Seguridad: Verificar que la póliza pertenezca al usuario que la pide
        # if poliza.cliente.usuario != request.user:
        #     return Response({'error': 'No autorizado'}, status=403)

    except Poliza.DoesNotExist:
        return Response({'error': 'Póliza no encontrada'}, status=404)

    # Datos que enviaremos al HTML del PDF
    context = {
        'poliza': poliza,
        'cliente': poliza.cliente,
        'usuario': poliza.cliente.usuario,
        'beneficiarios': poliza.beneficiarios.all(),
        'fecha_hoy': date.today()
    }

    # Renderizar el HTML (Crearemos este archivo en el siguiente paso)
    template = get_template('poliza_pdf.html')
    html = template.render(context)

    # Crear el PDF
    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html.encode("ISO-8859-1")), result)

    if not pdf.err:
        response = HttpResponse(result.getvalue(), content_type='application/pdf')
        # Esto hace que se descargue con el nombre correcto
        filename = f"Poliza_{poliza.numero_poliza}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    
    return Response({'error': 'Error al generar PDF'}, status=500)


# en seguros/views.py
#API PARA ACTIVAR/DESACTIVAR CLIENTE Y SUS PÓLIZAS
@api_view(['PATCH'])
@permission_classes([IsAuthenticated]) # Asegúrate de importar esto
def toggle_estado_cliente(request, cliente_id):
    """
    Activa o Desactiva un cliente.
    Si se desactiva (Baja), también inactiva todas sus pólizas vigentes.
    """
    try:
        cliente = Cliente.objects.get(id=cliente_id)
        usuario = cliente.usuario
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    # Leemos el valor que envía el frontend (True o False)
    nuevo_estado = request.data.get('is_active')
    
    if nuevo_estado is None:
         return Response({'error': 'Se requiere el campo is_active'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Actualizar el estado del Usuario (Login)
    usuario.is_active = nuevo_estado
    usuario.save()

    # 2. Lógica de Negocio: Si se está dando de BAJA (False)
    if nuevo_estado is False:
        # Buscamos pólizas que estén 'vivas' (activa, pendiente, cotización)
        polizas_activas = Poliza.objects.filter(
            cliente=cliente, 
            estado__in=['activa', 'pendiente_pago', 'cotizacion']
        )
        
        # Las pasamos a 'inactiva'
        count = 0
        for p in polizas_activas:
            p.estado = 'inactiva'
            p.save()
            count += 1
            
        mensaje = f'Cliente desactivado y {count} pólizas inactivadas.'
    else:
        mensaje = 'Cliente reactivado exitosamente.'

    return Response({'mensaje': mensaje, 'is_active': usuario.is_active})


# en seguros/views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agente_dashboard_stats(request):
    """
    Devuelve las estadísticas clave para el dashboard del agente.
    """
    try:
        # Verificar que sea agente
        agente = Agente.objects.get(usuario=request.user)
    except Agente.DoesNotExist:
        return Response({'error': 'No eres un agente'}, status=403)

    # 1. Total Clientes (Usuarios únicos con pólizas de este agente o asignados)
    # Una forma simple es contar las pólizas únicas, o si tienes relación directa en Cliente.
    # Usaremos las pólizas para saber cuántos clientes activos tiene.
    total_clientes = Poliza.objects.filter(agente=agente).values('cliente').distinct().count()

    # 2. Pólizas Vendidas (Activas)
    polizas_activas = Poliza.objects.filter(agente=agente, estado='activa').count()

    # 3. Solicitudes Pendientes (En cotización, sin agente o asignadas a él)
    # (Aquí asumimos que el agente ve todas las cotizaciones como "oportunidad" o solo las suyas)
    solicitudes_pendientes = Poliza.objects.filter(estado='cotizacion').count()

    # 4. Ventas del Mes (Suma de primas de pólizas creadas este mes)
    hoy = timezone.now()
    ventas_mes = Poliza.objects.filter(
        agente=agente,
        estado='activa',
        creado_en__month=hoy.month,
        creado_en__year=hoy.year
    ).aggregate(total=Sum('prima_anual'))['total'] or 0

    data = {
        'total_clientes': total_clientes,
        'polizas_activas': polizas_activas,
        'solicitudes_pendientes': solicitudes_pendientes,
        'ventas_mes': ventas_mes
    }
    
    return Response(data)