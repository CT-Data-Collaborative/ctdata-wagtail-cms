# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-12-20 20:57
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ctdata', '0052_auto_20161207_1114'),
    ]

    operations = [
        migrations.AddField(
            model_name='homepageprojectitem',
            name='project_publish_date',
            field=models.DateTimeField(blank=True, default=datetime.datetime(2016, 12, 20, 15, 57, 5, 251704)),
            preserve_default=False,
        ),
    ]
