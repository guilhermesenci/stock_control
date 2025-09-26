from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transacao, Item, Entrada, Saida, Fornecedor, Usuario
from .utils import camelize_dict_keys, snakify_dict_keys


class BrazilianDateField(serializers.DateField):
    """
    Campo de data personalizado que aceita formato brasileiro (DD/MM/YYYY)
    e converte para formato ISO para armazenamento.
    """
    
    def to_internal_value(self, value):
        if not value:
            return None
            
        # Se já é um objeto date, retorna como está
        if hasattr(value, 'year'):
            return value
            
        # Tenta parsear no formato brasileiro primeiro
        if isinstance(value, str):
            # Remove espaços em branco
            value = value.strip()
            
            # Tenta formatos brasileiros primeiro
            for date_format in ['%d/%m/%Y', '%d/%m/%y']:
                try:
                    from datetime import datetime
                    return datetime.strptime(value, date_format).date()
                except ValueError:
                    continue
            
            # Se não conseguiu parsear no formato brasileiro, tenta o padrão
            return super().to_internal_value(value)
        
        return super().to_internal_value(value)
    
    def to_representation(self, value):
        if not value:
            return None
            
        # Converte para formato brasileiro na saída
        if hasattr(value, 'strftime'):
            return value.strftime('%d/%m/%Y')
        
        return super().to_representation(value)


class BrazilianDateTimeField(serializers.DateTimeField):
    """
    Campo de data/hora personalizado que aceita formato brasileiro
    """
    
    def to_internal_value(self, value):
        if not value:
            return None
            
        # Se já é um objeto datetime, retorna como está
        if hasattr(value, 'year'):
            return value
            
        # Tenta parsear no formato brasileiro primeiro
        if isinstance(value, str):
            value = value.strip()
            
            # Tenta formatos brasileiros primeiro
            for datetime_format in ['%d/%m/%Y %H:%M:%S', '%d/%m/%Y %H:%M', '%d/%m/%Y']:
                try:
                    from datetime import datetime
                    return datetime.strptime(value, datetime_format)
                except ValueError:
                    continue
            
            # Se não conseguiu parsear no formato brasileiro, tenta o padrão
            return super().to_internal_value(value)
        
        return super().to_internal_value(value)
    
    def to_representation(self, value):
        if not value:
            return None
            
        # Converte para formato brasileiro na saída
        if hasattr(value, 'strftime'):
            return value.strftime('%d/%m/%Y %H:%M:%S')
        
        return super().to_representation(value)


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
    data_entrada = BrazilianDateField()
    hora_entrada = serializers.TimeField()
    
    class Meta:
        model = Entrada
        fields = '__all__'


class SaidaSerializer(CamelCaseModelSerializer):
    data_saida = BrazilianDateField()
    hora_saida = serializers.TimeField()
    
    class Meta:
        model = Saida
        fields = '__all__'


class FornecedorSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__'


class UsuarioSerializer(CamelCaseModelSerializer):
    # Campos do User relacionado
    username = serializers.CharField(source='auth_user.username', read_only=True)
    email = serializers.EmailField(source='auth_user.email', read_only=True)
    first_name = serializers.CharField(source='auth_user.first_name', read_only=True)
    last_name = serializers.CharField(source='auth_user.last_name', read_only=True)
    is_active = serializers.BooleanField(source='auth_user.is_active', read_only=True)
    is_staff = serializers.BooleanField(source='auth_user.is_staff', read_only=True)
    is_superuser = serializers.BooleanField(source='auth_user.is_superuser', read_only=True)
    groups = serializers.SerializerMethodField()
    user_permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['mat_usuario', 'nome_usuario', 'auth_user', 'username', 
                  'email', 'first_name', 'last_name', 'is_active', 'is_staff', 
                  'is_superuser', 'permissions', 'groups', 'user_permissions']
    
    def get_groups(self, obj):
        if not obj.auth_user:
            return []
        return [group.name for group in obj.auth_user.groups.all()]
    
    def get_user_permissions(self, obj):
        if not obj.auth_user:
            return []
        return [perm.codename for perm in obj.auth_user.user_permissions.all()]


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer para retornar detalhes do User do Django com seu perfil associado"""
    inventory_user = serializers.SerializerMethodField()
    permissions_list = serializers.SerializerMethodField()
    is_master = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_active', 'is_staff', 'is_superuser', 'inventory_user',
                  'permissions_list', 'is_master']
        read_only_fields = ['id']
    
    def get_inventory_user(self, obj):
        """Retorna informações do usuário do inventário se existir"""
        try:
            if hasattr(obj, 'inventory_user') and obj.inventory_user:
                return UsuarioSerializer(obj.inventory_user).data
        except Exception:
            pass
        return None
    
    def get_permissions_list(self, obj):
        """Retorna lista de permissões do usuário"""
        try:
            if hasattr(obj, 'inventory_user') and obj.inventory_user and obj.inventory_user.permissions:
                return obj.inventory_user.permissions
        except Exception:
            pass
        
        # Fallback - retornar permissões das apps que o usuário tem acesso
        try:
            from django.contrib.auth.models import Permission
            return list(Permission.objects.filter(
                user=obj
            ).values_list('codename', flat=True))
        except Exception:
            return []
    
    def get_is_master(self, obj):
        return obj.is_superuser
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return camelize_dict_keys(data)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    is_active = serializers.BooleanField(default=True, required=False)
    is_staff = serializers.BooleanField(default=False, required=False)
    is_superuser = serializers.BooleanField(default=False, required=False)
    permissions_list = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 
                  'last_name', 'is_active', 'is_staff', 'is_superuser', 'permissions_list']
    
    def to_internal_value(self, data):
        # Converter camelCase para snake_case
        if isinstance(data, dict):
            data = snakify_dict_keys(data)
        return super().to_internal_value(data)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        permissions_list = validated_data.pop('permissions_list', [])
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=validated_data.get('is_active', True),
            is_staff=validated_data.get('is_staff', False),
            is_superuser=validated_data.get('is_superuser', False)
        )
        
        # Adiciona as permissões na tabela de perfil do usuário
        if permissions_list and hasattr(user, 'inventory_user'):
            user.inventory_user.permissions = permissions_list
            user.inventory_user.save()
            
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    permissions_list = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    password2 = serializers.CharField(write_only=True, required=False, min_length=8)
    username = serializers.CharField(required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 
                  'is_active', 'is_staff', 'is_superuser', 'permissions_list',
                  'password', 'password2']
    
    def to_internal_value(self, data):
        # Converter camelCase para snake_case
        if isinstance(data, dict):
            data = snakify_dict_keys(data)
        return super().to_internal_value(data)
        
    def validate(self, data):
        # Validação de senha se fornecida
        password = data.get('password')
        password2 = data.get('password2')
        
        if password or password2:
            if not password or not password2:
                raise serializers.ValidationError("Ambos os campos de senha devem ser preenchidos.")
            if password != password2:
                raise serializers.ValidationError({"password": "As senhas não coincidem."})
        
        return data
        
    def update(self, instance, validated_data):
        permissions_list = validated_data.pop('permissions_list', None)
        password = validated_data.pop('password', None)
        validated_data.pop('password2', None)  # Remove password2 but don't use it
        
        # Atualiza a senha se fornecida
        if password:
            instance.set_password(password)
        
        # Atualiza os outros campos do usuário
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Atualiza permissões se fornecidas
        if permissions_list is not None and hasattr(instance, 'inventory_user'):
            instance.inventory_user.permissions = permissions_list
            instance.inventory_user.save()
            
        return instance
        
    def to_representation(self, instance):
        return UserDetailSerializer(instance=instance).data
