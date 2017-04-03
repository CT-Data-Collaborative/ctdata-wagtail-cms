from itertools import chain
from datetime import date
from django import template
from django.conf import settings
import re

from ctdata.models import BlogPage, EventPage, Page, DataAcademyAbstractEvent, ConferencePage

register = template.Library()


# settings value
@register.assignment_tag
def get_google_maps_key():
    return getattr(settings, 'GOOGLE_MAPS_KEY', "")


@register.assignment_tag(takes_context=True)
def get_site_root(context):
    # NB this returns a core.Page, not the implementation-specific model used
    # so object-comparison to self will return false as objects would differ
    return context['request'].site.root_page


def has_menu_children(page):
    return page.get_children().live().in_menu().exists()



# Retrieves all live pages which are children of the calling page
#for standard index listing
@register.inclusion_tag(
    'demo/tags/standard_index_listing.html',
    takes_context=True
)
def standard_index_listing(context, calling_page):
    pages = calling_page.get_children().live()
    return {
        'pages': pages,
        # required by the pageurl tag that we want to use within this template
        'request': context['request'],
    }


# Blog feed for home page
@register.inclusion_tag(
    'ctdata/tags/blog_listing_homepage.html',
    takes_context=True
)
def blog_listing_homepage(context, count=3):
    blogs = BlogPage.objects.live().order_by('-date')
    return {
        'blogs': blogs[:count].select_related('feed_image'),
        # required by the pageurl tag that we want to use within this template
        'request': context['request'],
    }


# Events feed for home page
@register.inclusion_tag(
    'ctdata/tags/event_listing_homepage.html',
    takes_context=True
)
def event_listing_homepage(context, count=3):
    events = EventPage.objects.live().filter(date_from__gte=date.today())
    data_academy_events = DataAcademyAbstractEvent.objects.live().\
        filter(display_in_event_index=True).\
        filter(date_from__gte=date.today())
    all_events = sorted(list(chain(events, data_academy_events)), key=lambda x: x.date_from)

    return {
        'events': all_events[:count],
        # required by the pageurl tag that we want to use within this template
        'request': context['request'],
    }


def parse_resource_to_dict(resource):
    r_dict = {'title': resource.title, 'id': resource.id, 'items': []}
    if resource.link:
        r_dict['items'].append({'type': 'link', 'link': resource.link})
    if resource.link_document and (resource.link_document.url != resource.link):
        r_dict['items'].append({'type': 'document', 'link': resource.link_document.url})
    if resource.link_external:
        r_dict['items'].append({'type': 'external', 'link': resource.link_external})
    return r_dict

def parse_session_to_dict(session):
    s_dict = {
        'title': session.title,
        'id': session.id,
        'items': [parse_resource_to_dict(r) for r in session.related_resources.all()]}
    return s_dict

def parse_event(event, event_type, get_resources=True):
    e_dict = {
        'title': event.title,
        'id': event.id,
        'item': event,
        'url': event.full_url,
        'date': event.date_from,
        'event_type': event_type,
        'resource_items': []
    }
    if get_resources:
        if event_type == 'Conference':
            e_dict['resource_items'] = [parse_session_to_dict(s) for s in event.sessions.all()]
        else:
            e_dict['resource_items'] = [parse_resource_to_dict(r) for r in event.related_links.prefetch_related()]
    return e_dict

def resources():
    events = EventPage.objects.live().filter(academy_resources_list_display=True)
    data_academy_events = DataAcademyAbstractEvent.objects.live().filter(academy_resources_list_display=True)
    conferences = ConferencePage.objects.live().all()

    # Build structured data for passing to template
    event_resources = [parse_event(e, event_type='Event') for e in events]
    da_resources = [parse_event(e, event_type='Data Academy Event', get_resources=False) for e in data_academy_events]
    c_resources = [parse_event(c, event_type='Conference') for c in conferences]

    # Join and sort by date the various resources
    resource_list = event_resources + da_resources + c_resources
    return sorted(resource_list, key=lambda x: x['date'], reverse=True)

@register.inclusion_tag(
    'ctdata/tags/event_resources_list.html',
    takes_context=True
)
def event_resource_list(context):
    """Consolidate different event types and pull out their resources and links"""
    # Fetch different events

    return {
        'events': resources(),
        # required by the pageurl tag that we want to use within this template
        'request': context['request']
    }


class SetVarNode(template.Node):
    def __init__(self, new_val, var_name):
        self.new_val = new_val
        self.var_name = var_name
    def render(self, context):
        context[self.var_name] = self.new_val
        return ''

@register.tag
def setvar(parser,token):
    # This version uses a regular expression to parse tag contents.
    try:
        # Splitting by None == splitting by spaces.
        tag_name, arg = token.contents.split(None, 1)
    except ValueError:
        raise template.TemplateSyntaxError("{} tag requires arguments".format(token.contents.split()[0]))
    m = re.search(r'(.*?) as (\w+)', arg)
    if not m:
        raise template.TemplateSyntaxError("{} tag had invalid arguments".format(tag_name))
    new_val, var_name = m.groups()
    if not (new_val[0] == new_val[-1] and new_val[0] in ('"', "'")):
        raise template.TemplateSyntaxError("{} tag's argument should be in quotes".format(tag_name))
    return SetVarNode(new_val[1:-1], var_name)

