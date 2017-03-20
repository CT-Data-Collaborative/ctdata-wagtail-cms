import re
from itertools import chain
from operator import attrgetter
from django.db import models
from django.contrib.syndication.views import Feed
from django.utils.html import strip_tags
from ctdata.models import BlogPage, EventPage, DataAcademyAbstractEvent

class NewsFeed(Feed):
    title = 'CTData News'
    link = '/feeds/rss/news/'
    description = 'News from CTData'

    def items(self):
        return BlogPage.objects.live().order_by('-date')

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return strip_tags(item.body)


class EventFeed(Feed):
    title = 'CTData Events'
    link = '/feeds/rss/events'
    description = 'CTData and CTData DataAcademy Events'

    def items(self):
        regular_events = EventPage.objects.live().order_by('-date_from')
        academy_events = DataAcademyAbstractEvent.objects.live().order_by('-date_from')
        return sorted(
            chain(regular_events, academy_events),
            key = attrgetter('date_from')
        )

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        txt = strip_tags(item.body)
        return re.sub(r'([a-zA-Z])([?.!])', r'\1\2 ', txt)
