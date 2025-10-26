from django.db import models
from django.contrib.auth.models import AbstractUser

# Modelo de Usuario personalizado (evita conflicto con auth.User)
class Usuario(AbstractUser):
    telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    es_cliente = models.BooleanField(default=False)
    es_agente = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'univida_usuario'  # Nombre diferente

class Cliente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    fecha_nacimiento = models.DateField()
    direccion = models.TextField()
    identificacion = models.CharField(max_length=20, unique=True)
    estado_salud = models.CharField(max_length=100, default='Bueno')
    
    def __str__(self):
        return f"{self.usuario.get_full_name()}"
    
    class Meta:
        db_table = 'univida_cliente'  # Nombre diferente

class Poliza(models.Model):
    ESTADO_CHOICES = [
        ('cotizacion', 'En Cotización'),
        ('activa', 'Activa'),
        ('inactiva', 'Inactiva'),
        ('vencida', 'Vencida'),
    ]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    numero_poliza = models.CharField(max_length=50, unique=True)
    suma_asegurada = models.DecimalField(max_digits=12, decimal_places=2)
    prima_anual = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_inicio = models.DateField()
    fecha_vencimiento = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='cotizacion')
    creado_en = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Póliza {self.numero_poliza} - {self.cliente}"
    
    class Meta:
        db_table = 'univida_poliza'  # Nombre diferente

class Beneficiario(models.Model):
    poliza = models.ForeignKey(Poliza, on_delete=models.CASCADE, related_name='beneficiarios')
    nombre_completo = models.CharField(max_length=200)
    parentesco = models.CharField(max_length=50)
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.nombre_completo} ({self.parentesco})"
    
    class Meta:
        db_table = 'univida_beneficiario'  # Nombre diferente