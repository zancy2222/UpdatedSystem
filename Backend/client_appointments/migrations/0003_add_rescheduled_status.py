# Generated by Django 5.0.14 on 2025-07-08 09:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('client_appointments', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clientappointment',
            name='status',
            field=models.CharField(choices=[('Pending', 'Pending'), ('Confirmed', 'Confirmed'), ('Rescheduled', 'Rescheduled'), ('Cancelled', 'Cancelled'), ('Completed', 'Completed')], default='Pending', max_length=20),
        ),
    ]
