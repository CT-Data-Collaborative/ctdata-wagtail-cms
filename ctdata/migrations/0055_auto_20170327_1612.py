# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-03-27 20:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ctdata', '0054_auto_20170104_1552'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataacademyabstractevent',
            name='academy_resources_list_display',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='eventpage',
            name='academy_resources_list_display',
            field=models.BooleanField(default=False),
        ),
    ]
