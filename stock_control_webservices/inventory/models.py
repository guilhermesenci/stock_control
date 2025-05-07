from django.db import models
# from decimal import Decimal

class NotaFiscal(models.Model):
    cod_nf = models.CharField(primary_key=True, max_length=50)
    cod_sku = models.DecimalField(max_digits=20, decimal_places=0)
    quantidade = models.DecimalField(max_digits=20, decimal_places=2)
    valor_unit = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'projinteg.notas_fiscais'
        verbose_name = 'Nota Fiscal'
        verbose_name_plural = 'Notas Fiscais'

    def __str__(self):
        return self.cod_nf


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

    class Meta:
        db_table = 'projinteg.usuarios'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return self.nome_usuario


class Fornecedor(models.Model):
    cod_fornecedor = models.BigIntegerField(primary_key=True)
    nome_fornecedor = models.TextField()

    class Meta:
        db_table = 'projinteg.fornecedores'
        verbose_name = 'Fornecedor'
        verbose_name_plural = 'Fornecedores'

    def __str__(self):
        return self.nome_fornecedor


class Entrada(models.Model):
    cod_entrada = models.BigIntegerField(primary_key=True)
    cod_nf = models.ForeignKey(
        NotaFiscal,
        db_column='cod_nf',
        to_field='cod_nf',
        on_delete=models.DO_NOTHING
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
    cod_pedido = models.BigIntegerField(primary_key=True)
    cod_sku = models.ForeignKey(
        Item,
        db_column='cod_sku',
        on_delete=models.DO_NOTHING
    )
    qtd_saida = models.BigIntegerField()
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
