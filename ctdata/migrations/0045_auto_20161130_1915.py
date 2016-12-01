# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-11-30 19:15
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('wagtailimages', '0013_make_rendition_upload_callable'),
        ('ctdata', '0044_auto_20161130_1730'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataacademyabstractevent',
            name='event_image',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='wagtailimages.Image'),
        ),
        migrations.AlterField(
            model_name='dataacademyabstractevent',
            name='eventbrite_event_id',
            field=models.CharField(blank=True, default=None, max_length=50, null=True),
        ),
    ]
