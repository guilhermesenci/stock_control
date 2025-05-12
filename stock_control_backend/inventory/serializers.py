from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transacao, Item, Entrada, Saida, Fornecedor, Usuario
from .utils import camelize_dict_keys, snakify_dict_keys


class CamelCaseModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that converts snake_case field names to camelCase in response
    and accepts camelCase field names in requests.
    """
    def to_representation(self, instance):
        # Convert to camelCase on output (response)
        data = super().to_representation(instance)
        return camelize_dict_keys(data)
    
    def to_internal_value(self, data):
        # Convert from camelCase to snake_case on input (request)
        snake_data = snakify_dict_keys(data)
        return super().to_internal_value(snake_data)


class TransacaoSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Transacao
        fields = ['id_transacao', 'cod_nf', 'cod_sku', 'quantidade', 'valor_unit', 'cod_fornecedor']


class ItemSerializer(CamelCaseModelSerializer):
    quantity = serializers.IntegerField(read_only=True, required=False)
    estimated_consumption_time = serializers.CharField(read_only=True, required=False)
    
    class Meta:
        model = Item
        fields = ['cod_sku', 'descricao_item', 'unid_medida', 'active', 'quantity', 'estimated_consumption_time']


class StockItemSerializer(serializers.Serializer):
    """Serializer for stock information including quantity and estimated consumption time."""
    cod_sku = serializers.CharField()
    descricao_item = serializers.CharField()
    unid_medida = serializers.CharField()
    active = serializers.BooleanField()
    quantity = serializers.FloatField()
    estimated_consumption_time = serializers.CharField(allow_null=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return camelize_dict_keys(data)


class EntradaSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Entrada
        fields = '__all__'


class SaidaSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Saida
        fields = '__all__'


class FornecedorSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__'


class UsuarioSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
