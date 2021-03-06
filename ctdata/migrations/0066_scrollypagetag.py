# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-05-26 17:04
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import modelcluster.fields


class Migration(migrations.Migration):

    dependencies = [
        ('taggit', '0002_auto_20150616_2121'),
        ('ctdata', '0065_scrollystory_introduction'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScrollyPageTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content_object', modelcluster.fields.ParentalKey(on_delete=django.db.models.deletion.CASCADE, related_name='tagged_items', to='ctdata.ScrollyStory')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ctdata_scrollypagetag_items', to='taggit.Tag')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
