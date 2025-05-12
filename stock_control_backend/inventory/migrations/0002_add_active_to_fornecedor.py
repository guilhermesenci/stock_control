from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='fornecedor',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ] 