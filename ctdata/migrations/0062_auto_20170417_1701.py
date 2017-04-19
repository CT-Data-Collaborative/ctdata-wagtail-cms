# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-04-17 21:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ctdata', '0061_scrollystory_polling_interval'),
    ]

    operations = [
        migrations.AlterField(
            model_name='scrollystory',
            name='polling_interval',
            field=models.IntegerField(blank=True, help_text='Enter how long (in minutes) the google sheets content \n    should be cached for. Leave blank to disable checking. Enter zero to disable caching.', null=True),
        ),
    ]