from django import forms
from django.db import models

from wagtail.wagtailcore.blocks import TextBlock, StructBlock, StreamBlock, FieldBlock, CharBlock, RichTextBlock, \
    RawHTMLBlock, IntegerBlock
from wagtail.wagtailsnippets.blocks import SnippetChooserBlock
from wagtail.wagtailimages.blocks import ImageChooserBlock
from wagtail.wagtaildocs.blocks import DocumentChooserBlock
from wagtail.wagtailsnippets.edit_handlers import SnippetChooserPanel

from .snippets import ReactWidget

CHART_TYPE_CHOICES = (
    ('hbar', "Horizontal Bar"),
    ('vbar', "Vertical Bar"),
    ('line', "Line"),
    ('scatter', "Scatter"),
    ('table', "Table")
)

################################################################################################
########
########
########            Streamfield Structure Blocks
########
########
################################################################################################

class PullQuoteBlock(StructBlock):
    quote = TextBlock("quote title")
    attribution = CharBlock(required=False)

    class Meta:
        icon = "openquote"


class ImageFormatChoiceBlock(FieldBlock):
    field = forms.ChoiceField(choices=(
        ('left', 'Wrap left'), ('right', 'Wrap right'), ('mid', 'Mid width'), ('full', 'Full width'),
    ))


class HTMLAlignmentChoiceBlock(FieldBlock):
    field = forms.ChoiceField(choices=(
        ('normal', 'Normal'), ('full', 'Full width'),
    ))


class ChartTypeChoiceBlock(FieldBlock):
    field = forms.ChoiceField(choices=CHART_TYPE_CHOICES)


class ImageBlock(StructBlock):
    image = ImageChooserBlock()
    caption = RichTextBlock()
    alignment = ImageFormatChoiceBlock()


class AlignedHTMLBlock(StructBlock):
    html = RawHTMLBlock()
    alignment = HTMLAlignmentChoiceBlock()

    class Meta:
        icon = "code"

class SidebarPullQuote(StructBlock):
    quote = TextBlock("quote title")
    attribution = CharBlock(required=False)

    class Meta:
        icon = "openquote"


class SidebarNote(StructBlock):
    note = TextBlock("note title")

class PymIFrameBlock(StructBlock):
    title = CharBlock()
    bucket_name = CharBlock()
    notes = CharBlock(required=False)
    source = CharBlock(required=False)

class IFrameBlock(StructBlock):
    title = CharBlock()
    bucket_name = CharBlock()
    notes = CharBlock(required=False)
    source = CharBlock(required=False)

class ExternalIFrame(StructBlock):
    title = CharBlock(required=True)
    embed_link = CharBlock(required=True)

class ChartBlock(StructBlock):
    title = CharBlock()
    source = CharBlock()
    gdoc_link = models.URLField("Link to Google Spreadsheet", blank=False)
    chart_type = ChartTypeChoiceBlock()


class TwitterBlock(StructBlock):
    twitter_box_username = CharBlock(required=True)
    twitter_box_widget_id = CharBlock(required=True)
    twitter_box_tweet_limit = IntegerBlock(required=True)

    class Meta:
        icon = "cog"
        label = "Twitter Widget"
        template = "ctdata/blocks/twitter.html"

class ReactWidgetBlock(StructBlock):
    widget = SnippetChooserPanel(ReactWidget)

################################################################################################
########
########
########            CTData Streamfield Block
########
########
################################################################################################

class CTDataStreamBlock(StreamBlock):
    h2 = CharBlock(icon="title", classname="title")
    h3 = CharBlock(icon="title", classname="title")
    h4 = CharBlock(icon="title", classname="title")
    intro = RichTextBlock(icon="pilcrow")
    paragraph = RichTextBlock(icon="pilcrow")
    aligned_image = ImageBlock(label="Aligned image", icon="image")
    pullquote = PullQuoteBlock()
    aligned_html = AlignedHTMLBlock(icon="code", label='Raw HTML')
    document = DocumentChooserBlock(icon="doc-full-inverse")
    pym_iframe = PymIFrameBlock(icon="code", label='Pym IFrame')
    iframe = IFrameBlock(icon="code", label='S3 IFrame')
    external_iframe = ExternalIFrame(icon="code", label="External Site IFrame")
    sidebar_pullquote = SidebarPullQuote()
    sidebar_note = SidebarNote()
    react_widget = SnippetChooserBlock(ReactWidget, icon="code", label="Javascript Widget")
