# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-08-25 18:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ctdata', '0008_servicespageresourceitem_icon'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobpage',
            name='job_title',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
    ]
