# en seguros/models.py - VERSIÓN CORREGIDA
from django.db import models
from django.contrib.auth.models import AbstractUser

# Modelo de Usuario personalizado (evita conflicto con auth.User)
class Usuario(AbstractUser):
    telefono = models.CharField(max_length=20, blank=True, null=True)
    identificacion = models.CharField(max_length=20, unique=True, blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    ROL_CHOICES = [
        ('ADMIN', 'Administrador'),
        ('AGENTE', 'Agente'),
        ('CLIENTE', 'Cliente'),
    ]
    rol = models.CharField(
        max_length=10, 
        choices=ROL_CHOICES, 
        default='CLIENTE'
    )

    class Meta:
        db_table = 'univida_usuario' 

    def __str__(self):
        return self.username
    
class Cliente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    fecha_nacimiento = models.DateField()
    direccion = models.TextField()
    identificacion = models.CharField(max_length=20, unique=True)
    estado_salud = models.CharField(max_length=100, default='Bueno')
    
    def __str__(self):
        return f"{self.usuario.get_full_name()}"
    
    class Meta:
        db_table = 'univida_cliente'

class Poliza(models.Model):
    ESTADO_CHOICES = [
        ('cotizacion', 'En Cotización'),
        ('activa', 'Activa'),
        ('inactiva', 'Inactiva'),
        ('vencida', 'Vencida'),
        ('cancelada', 'Cancelada'),  # ← AÑADIDO
    ]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    agente = models.ForeignKey(
        'Agente', 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='polizas'
    )
    numero_poliza = models.CharField(max_length=50, unique=True)
    suma_asegurada = models.DecimalField(max_digits=12, decimal_places=2)
    prima_anual = models.DecimalField(max_digits=10, decimal_places=2)
    prima_mensual = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # ← ¡AÑADIDO ESTE CAMPO!
    fecha_inicio = models.DateField()
    fecha_vencimiento = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='cotizacion')
    cobertura = models.TextField(blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Póliza {self.numero_poliza} - {self.cliente}"
    
    def save(self, *args, **kwargs):
        # Calcular prima mensual automáticamente si no se especifica
        if self.prima_anual and not self.prima_mensual:
            self.prima_mensual = self.prima_anual / 12
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'univida_poliza'

# Aireyu
class Factura(models.Model):
    ESTADO_FACTURA = [
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('vencida', 'Vencida'),
        ('cancelada', 'Cancelada'),
    ]
    
    poliza = models.ForeignKey(Poliza, on_delete=models.CASCADE, related_name='facturas')
    numero_factura = models.CharField(max_length=50, unique=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_emision = models.DateField()
    fecha_vencimiento = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_FACTURA, default='pendiente')
    concepto = models.CharField(max_length=255, default='Prima anual de seguro')
    
    def __str__(self):
        return f"Factura {self.numero_factura} - {self.poliza.numero_poliza}"
    
    class Meta:
        db_table = 'univida_factura'
        verbose_name = 'Factura'
        verbose_name_plural = 'Facturas'

class Pago(models.Model):
    ESTADO_PAGO = [
        ('pendiente', 'Pendiente'),
        ('completado', 'Completado'),
        ('fallido', 'Fallido'),
        ('reembolsado', 'Reembolsado'),
    ]
    
    METODO_PAGO = [
        ('transferencia', 'Transferencia Bancaria'),
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
        ('efectivo', 'Efectivo'),
        ('cheque', 'Cheque'),
    ]
    
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='pagos')
    monto_pagado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO)
    referencia_pago = models.CharField(max_length=100, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_PAGO, default='completado')
    descripcion = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Pago {self.id} - Factura {self.factura.numero_factura}"
    
    class Meta:
        db_table = 'univida_pago'
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'

class Beneficiario(models.Model):
    poliza = models.ForeignKey(Poliza, on_delete=models.CASCADE, related_name='beneficiarios')
    nombre_completo = models.CharField(max_length=200)
    parentesco = models.CharField(max_length=50)
    porcentaje = models.DecimalField(max_digits=5, decimal_places=2)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.nombre_completo} ({self.parentesco})"
    
    class Meta:
        db_table = 'univida_beneficiario'

class Agente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='agente')
    codigo_agente = models.CharField(max_length=20, unique=True)
    fecha_contratacion = models.DateField()
    especialidad = models.CharField(max_length=100, default='Seguros de Vida')
    comision = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    estado = models.CharField(
        max_length=20, 
        choices=[
            ('activo', 'Activo'),
            ('inactivo', 'Inactivo'),
            ('vacaciones', 'De Vacaciones'),
        ],
        default='activo'
    )
    telefono_oficina = models.CharField(max_length=20, blank=True, null=True)
    direccion_oficina = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Agente {self.codigo_agente} - {self.usuario.get_full_name()}"
    
    class Meta:
        db_table = 'univida_agente'
        verbose_name = 'Agente'
        verbose_name_plural = 'Agentes'

class Siniestro(models.Model):
    ESTADO_SINIESTRO = [
        ('reportado', 'Reportado'),
        ('en_revision', 'En Revisión'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
        ('pagado', 'Pagado'),
    ]
    
    TIPO_SINIESTRO = [
        ('muerte', 'Muerte'),
        ('invalidez', 'Invalidez Total'),
        ('invalidez_parcial', 'Invalidez Parcial'),
        ('gastos_medicos', 'Gastos Médicos'),
        ('hospitalizacion', 'Hospitalización'),
        ('incapacidad_temporal', 'Incapacidad Temporal'),
        ('otros', 'Otros'),
    ]
    
    poliza = models.ForeignKey(Poliza, on_delete=models.CASCADE, related_name='siniestros')
    numero_siniestro = models.CharField(max_length=50, unique=True)
    tipo_siniestro = models.CharField(max_length=20, choices=TIPO_SINIESTRO)
    fecha_siniestro = models.DateField()
    fecha_reporte = models.DateTimeField(auto_now_add=True)
    descripcion = models.TextField()
    monto_reclamado = models.DecimalField(max_digits=12, decimal_places=2)
    monto_aprobado = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_SINIESTRO, default='reportado')
    documentos_adjuntos = models.TextField(blank=True, null=True)
    resolucion = models.TextField(blank=True, null=True)
    fecha_resolucion = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"Siniestro {self.numero_siniestro} - {self.poliza.numero_poliza}"
    
    class Meta:
        db_table = 'univida_siniestro'
        verbose_name = 'Siniestro'
        verbose_name_plural = 'Siniestros'

class NotaPoliza(models.Model):
    TIPO_NOTA = [
        ('general', 'General'),
        ('seguimiento', 'Seguimiento'),
        ('recordatorio', 'Recordatorio'),
        ('importante', 'Importante'),
    ]
    
    poliza = models.ForeignKey(Poliza, on_delete=models.CASCADE, related_name='notas')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    tipo_nota = models.CharField(max_length=20, choices=TIPO_NOTA, default='general')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Nota: {self.titulo} - {self.poliza.numero_poliza}"
    
    class Meta:
        db_table = 'univida_nota_poliza'
        verbose_name = 'Nota de Póliza'
        verbose_name_plural = 'Notas de Póliza'