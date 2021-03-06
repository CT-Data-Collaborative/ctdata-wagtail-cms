# -*- coding: utf-8 -*-
# Generated by Django 1.9.9 on 2016-11-29 11:18
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import modelcluster.contrib.taggit
import modelcluster.fields


class Migration(migrations.Migration):

    dependencies = [
        ('taggit', '0002_auto_20150616_2121'),
        ('ctdata', '0039_auto_20161123_1818'),
    ]

    operations = [
        migrations.CreateModel(
            name='AcademyResourceTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content_object', modelcluster.fields.ParentalKey(on_delete=django.db.models.deletion.CASCADE, related_name='tagged_items', to='ctdata.DataAcademyResource')),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ctdata_academyresourcetag_items', to='taggit.Tag')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='dataacademyliveevent',
            name='size_limit',
        ),
        migrations.AddField(
            model_name='dataacademyabstractevent',
            name='size_limit',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='dataacademyabstractevent',
            name='eventbrite_event_id',
            field=models.CharField(default=None, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='dataacademyresource',
            name='tags',
            field=modelcluster.contrib.taggit.ClusterTaggableManager(blank=True, help_text='A comma-separated list of tags.', through='ctdata.AcademyResourceTag', to='taggit.Tag', verbose_name='Tags'),
        ),
    ]
