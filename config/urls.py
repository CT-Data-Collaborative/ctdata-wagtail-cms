# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic import TemplateView
from django.views import defaults as default_views
from wagtail.wagtailadmin import urls as wagtailadmin_urls
from wagtail.wagtaildocs import urls as wagtaildocs_urls
from wagtail.wagtailcore import urls as wagtail_urls
from ctdata.views import categories
# from wagtail_feeds.feeds import BasicFeed, ExtendedFeed

from site_feed.feeds import NewsFeed, EventFeed

urlpatterns = [
    # url(r'^$', TemplateView.as_view(template_name='pages/home.html'), name='home'),
    # url(r'^about/$', TemplateView.as_view(template_name='pages/about.html'), name='about'),

    # Django Admin, use {% url 'admin:index' %}
    url(settings.ADMIN_URL, include(admin.site.urls)),

    # User management
    url(r'^users/', include('ctdata_wagtail.users.urls', namespace='users')),
    url(r'^accounts/', include('allauth.urls')),

    # Category
    url(r'^categories/(?P<tag_name>.*)/$', categories),

    # RSS Feeds
    # url(r'^news/rss/basic$', BasicFeed(), name='basic_feed'),
    # url(r'^news/rss/extended$', ExtendedFeed(), name='extended_feed'),
    # Wagtail
    url(r'^feeds/rss/news', NewsFeed(), name='news_feed'),
    url(r'^feeds/rss/events', EventFeed(), name='events_feed'),
    url(r'^cms/', include(wagtailadmin_urls)),
    url(r'^documents/', include(wagtaildocs_urls)),
    url(r'', include(wagtail_urls)),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        url(r'^400/$', default_views.bad_request, kwargs={'exception': Exception('Bad Request!')}),
        url(r'^403/$', default_views.permission_denied, kwargs={'exception': Exception('Permission Denied')}),
        url(r'^404/$', default_views.page_not_found, kwargs={'exception': Exception('Page not Found')}),
        url(r'^500/$', default_views.server_error),
    ]
