# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-03-27 20:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ctdata', '0055_auto_20170327_1612'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataacademyabstractevent',
            name='display_in_event_index',
            field=models.BooleanField(default=True),
        ),
    ]