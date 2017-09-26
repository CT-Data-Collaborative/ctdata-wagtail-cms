# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-11-23 18:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ctdata', '0038_auto_20161123_1227'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataacademyabstractevent',
            name='eventbrite_event_id',
            field=models.CharField(default='', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dataacademyabstractevent',
            name='publish_eventbrite',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='dataacademyabstractevent',
            name='time_from',
            field=models.TimeField(null=True, verbose_name='Start time'),
        ),
        migrations.AlterField(
            model_name='dataacademyabstractevent',
            name='time_to',
            field=models.TimeField(null=True, verbose_name='End time'),
        ),
    ]
