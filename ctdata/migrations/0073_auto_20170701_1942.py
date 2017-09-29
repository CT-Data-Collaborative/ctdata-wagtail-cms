# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-07-01 23:42
from __future__ import unicode_literals

import ctdata.models
from django.db import migrations
import wagtail.wagtailcore.blocks
import wagtail.wagtailcore.fields
import wagtail.wagtaildocs.blocks
import wagtail.wagtailimages.blocks
import wagtail.wagtailsnippets.blocks


class Migration(migrations.Migration):

    dependencies = [
        ('ctdata', '0072_auto_20170701_1938'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blogpage',
            name='body',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget')))),
        ),
        migrations.AlterField(
            model_name='dataacademyeventindex',
            name='body',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget')))),
        ),
        migrations.AlterField(
            model_name='dataacademypage',
            name='body',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget')))),
        ),
        migrations.AlterField(
            model_name='dataacademyresource',
            name='body',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget'))), blank=True),
        ),
        migrations.AlterField(
            model_name='dataacademyresourceindex',
            name='body',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget')))),
        ),
        migrations.AlterField(
            model_name='dataacademytag',
            name='description',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget'))), blank=True),
        ),
        migrations.AlterField(
            model_name='homepage',
            name='body',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget')))),
        ),
        migrations.AlterField(
            model_name='scrollystory',
            name='conclusion',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget')))),
        ),
        migrations.AlterField(
            model_name='scrollystory',
            name='introduction',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget')))),
        ),
        migrations.AlterField(
            model_name='standardstreamfieldpage',
            name='body',
            field=wagtail.wagtailcore.fields.StreamField((('h2', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h3', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('h4', wagtail.wagtailcore.blocks.CharBlock(classname='title', icon='title')), ('intro', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('paragraph', wagtail.wagtailcore.blocks.RichTextBlock(icon='pilcrow')), ('aligned_image', wagtail.wagtailcore.blocks.StructBlock((('image', wagtail.wagtailimages.blocks.ImageChooserBlock()), ('caption', wagtail.wagtailcore.blocks.RichTextBlock()), ('alignment', ctdata.models.ImageFormatChoiceBlock())), icon='image', label='Aligned image')), ('pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('aligned_html', wagtail.wagtailcore.blocks.StructBlock((('html', wagtail.wagtailcore.blocks.RawHTMLBlock()), ('alignment', ctdata.models.HTMLAlignmentChoiceBlock())), icon='code', label='Raw HTML')), ('document', wagtail.wagtaildocs.blocks.DocumentChooserBlock(icon='doc-full-inverse')), ('pym_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='Pym IFrame')), ('iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock()), ('bucket_name', wagtail.wagtailcore.blocks.CharBlock()), ('notes', wagtail.wagtailcore.blocks.CharBlock(required=False)), ('source', wagtail.wagtailcore.blocks.CharBlock(required=False))), icon='code', label='S3 IFrame')), ('external_iframe', wagtail.wagtailcore.blocks.StructBlock((('title', wagtail.wagtailcore.blocks.CharBlock(required=True)), ('embed_link', wagtail.wagtailcore.blocks.CharBlock(required=True))), icon='code', label='External Site IFrame')), ('sidebar_pullquote', wagtail.wagtailcore.blocks.StructBlock((('quote', wagtail.wagtailcore.blocks.TextBlock('quote title')), ('attribution', wagtail.wagtailcore.blocks.CharBlock(required=False))))), ('sidebar_note', wagtail.wagtailcore.blocks.StructBlock((('note', wagtail.wagtailcore.blocks.TextBlock('note title')),))), ('react_widget', wagtail.wagtailsnippets.blocks.SnippetChooserBlock(ctdata.models.ReactWidget, icon='code', label='Javascript Widget')))),
        ),
    ]