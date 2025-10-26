from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Cliente, Poliza, Beneficiario
from .serializers import ClienteSerializer, PolizaSerializer, CrearPolizaSerializer, BeneficiarioSerializer

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