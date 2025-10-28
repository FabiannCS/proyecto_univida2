from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Cliente, Poliza, Beneficiario, Agente, Factura, Pago, Siniestro, NotaPoliza, Rol
from .serializers import ClienteSerializer, PolizaSerializer, CrearPolizaSerializer, BeneficiarioSerializer


from django.shortcuts import render #FRONT
# Vista para página de inicio
def inicio(request):
    estadisticas = {
        'total_clientes': Cliente.objects.count(),
        'total_polizas': Poliza.objects.count(),
        'polizas_activas': Poliza.objects.filter(estado='activa').count(),
        'total_agentes': Agente.objects.count(),
    }
    return render(request, 'seguros/inicio.html', {'estadisticas': estadisticas})

# Vista para lista de clientes
def lista_clientes(request):
    clientes = Cliente.objects.all()
    return render(request, 'seguros/lista_clientes.html', {'clientes': clientes})

# Vista para lista de pólizas
def lista_polizas(request):
    polizas = Poliza.objects.all()
    return render(request, 'seguros/lista_polizas.html', {'polizas': polizas})





 #END FOR FRONT


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
    
from .serializers import AgenteSerializer, CrearAgenteSerializer

# API para Agentes
@api_view(['GET', 'POST'])
def lista_agentes(request):
    if request.method == 'GET':
        agentes = Agente.objects.all()
        serializer = AgenteSerializer(agentes, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CrearAgenteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API para agente específico
@api_view(['GET'])
def detalle_agente(request, agente_id):
    try:
        agente = Agente.objects.get(id=agente_id)
        serializer = AgenteSerializer(agente)
        return Response(serializer.data)
    except Agente.DoesNotExist:
        return Response(
            {'error': 'Agente no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    

from .serializers import FacturaSerializer, CrearFacturaSerializer, PagoSerializer, CrearPagoSerializer

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
    NotaPolizaSerializer, CrearNotaPolizaSerializer,
    RolSerializer, CrearRolSerializer
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

# API para Roles
@api_view(['GET', 'POST'])
def lista_roles(request):
    if request.method == 'GET':
        roles = Rol.objects.all()
        serializer = RolSerializer(roles, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CrearRolSerializer(data=request.data)
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

@api_view(['GET'])
def detalle_rol(request, rol_id):
    try:
        rol = Rol.objects.get(id=rol_id)
        serializer = RolSerializer(rol)
        return Response(serializer.data)
    except Rol.DoesNotExist:
        return Response({'error': 'Rol no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    


    #tercera parte

# Vista para detalle de cliente
def detalle_cliente(request, cliente_id):
    try:
        cliente = Cliente.objects.get(id=cliente_id)
        polizas_cliente = Poliza.objects.filter(cliente=cliente)
        return render(request, 'seguros/detalle_cliente.html', {
            'cliente': cliente,
            'polizas': polizas_cliente
        })
    except Cliente.DoesNotExist:
        return render(request, 'seguros/404.html', status=404)

# Vista para detalle de póliza
def detalle_poliza_front(request, poliza_id):
    try:
        poliza = Poliza.objects.get(id=poliza_id)
        beneficiarios = poliza.beneficiarios.all()
        facturas = poliza.facturas.all()
        return render(request, 'seguros/detalle_poliza.html', {
            'poliza': poliza,
            'beneficiarios': beneficiarios,
            'facturas': facturas
        })
    except Poliza.DoesNotExist:
        return render(request, 'seguros/404.html', status=404)