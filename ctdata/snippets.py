from django.db import models

from wagtail.wagtailsnippets.models import register_snippet
from wagtail.wagtailadmin.edit_handlers import FieldPanel

@register_snippet
class ReactWidget(models.Model):
    name = models.CharField(max_length=255)
    dom_node = models.CharField(max_length=255)
    css_url = models.URLField(null=True, blank=True)
    jsbundle_url = models.URLField(null=True, blank=True)

    panels = [
        FieldPanel('css_url'),
        FieldPanel('jsbundle_url')
    ]

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    def __unicode__(self):
        return self.name
