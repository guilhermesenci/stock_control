from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
# from decimal import Decimal

class Transacao(models.Model):
    id_transacao = models.AutoField(primary_key=True)
    cod_nf = models.CharField(max_length=50, null=True, blank=True)
    cod_sku = models.ForeignKey(
        'Item',
        db_column='cod_sku',
        on_delete=models.DO_NOTHING
    )
    quantidade = models.DecimalField(max_digits=20, decimal_places=2)
    valor_unit = models.DecimalField(max_digits=12, decimal_places=2)
    cod_fornecedor = models.ForeignKey(
        'Fornecedor',
        db_column='cod_fornecedor',
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'projinteg.transacoes'
        verbose_name = 'Transação'
        verbose_name_plural = 'Transações'

    def __str__(self):
        return f"Transação {self.id_transacao}"


class Item(models.Model):
    cod_sku = models.CharField(primary_key=True, max_length=50)
    descricao_item = models.TextField()
    unid_medida = models.CharField(max_length=50)
    active = models.BooleanField(default=True)

    class Meta:
        db_table = 'projinteg.itens'
        verbose_name = 'Item'
        verbose_name_plural = 'Itens'

    def __str__(self):
        return f"{self.cod_sku} - {self.descricao_item}"


class Usuario(models.Model):
    mat_usuario = models.BigIntegerField(primary_key=True)
    nome_usuario = models.TextField()
    auth_user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='inventory_user'
    )

    class Meta:
        db_table = 'projinteg.usuarios'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return self.nome_usuario


# Signal to create a Usuario when a User is created
@receiver(post_save, sender=User)
def create_usuario(sender, instance, created, **kwargs):
    """
    Create a Usuario instance for newly created User instances
    """
    if created:
        # Get the last usuario ID to generate a unique mat_usuario
        last_usuario = Usuario.objects.order_by('-mat_usuario').first()
        new_mat_usuario = 1 if not last_usuario else last_usuario.mat_usuario + 1
        
        Usuario.objects.create(
            mat_usuario=new_mat_usuario,
            nome_usuario=instance.username,
            auth_user=instance
        )


class Fornecedor(models.Model):
    cod_fornecedor = models.AutoField(primary_key=True)
    nome_fornecedor = models.TextField()
    active = models.BooleanField(default=True)

    class Meta:
        db_table = 'projinteg.fornecedores'
        verbose_name = 'Fornecedor'
        verbose_name_plural = 'Fornecedores'

    def __str__(self):
        return self.nome_fornecedor


class Entrada(models.Model):
    cod_entrada = models.AutoField(primary_key=True)
    transacao = models.ForeignKey(
        Transacao,
        related_name='entradas',
        on_delete=models.CASCADE
    )
    mat_usuario = models.ForeignKey(
        Usuario,
        db_column='mat_usuario',
        on_delete=models.DO_NOTHING
    )
    data_entrada = models.DateField()
    hora_entrada = models.TimeField()

    class Meta:
        db_table = 'projinteg.entradas'
        verbose_name = 'Entrada'
        verbose_name_plural = 'Entradas'

    def __str__(self):
        return f"Entrada {self.cod_entrada}"


class Saida(models.Model):
    cod_pedido = models.AutoField(primary_key=True)
    transacao = models.ForeignKey(
        Transacao,
        related_name='saidas',
        on_delete=models.CASCADE
    )
    mat_usuario = models.ForeignKey(
        Usuario,
        db_column='mat_usuario',
        on_delete=models.DO_NOTHING
    )
    data_saida = models.DateField()
    hora_saida = models.TimeField()

    class Meta:
        db_table = 'projinteg.saidas'
        verbose_name = 'Saída'
        verbose_name_plural = 'Saídas'

    def __str__(self):
        return f"Pedido {self.cod_pedido}"
