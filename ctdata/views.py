from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from wagtail.wagtailcore.models import Page
from wagtail.wagtailsearch.models import Query

from .models import DataAcademyTag

# try:
#     # Wagtail >= 1.1
#     from wagtail.contrib.wagtailsearchpromotions.models import SearchPromotion
# except ImportError:
#     # Wagtail < 1.1
#     from wagtail.wagtailsearch.models import EditorsPick as SearchPromotion
#
#
# def search(request):
#     # Search
#     search_query = request.GET.get('query', None)
#     if search_query:
#         search_results = Page.objects.live().search(search_query)
#         query = Query.get(search_query)
#
#         # Record hit
#         query.add_hit()
#
#         # Get search picks
#         search_picks = query.editors_picks.all()
#     else:
#         search_results = Page.objects.none()
#         search_picks = SearchPromotion.objects.none()
#
#     # Pagination
#     page = request.GET.get('page', 1)
#     paginator = Paginator(search_results, 10)
#     try:
#         search_results = paginator.page(page)
#     except PageNotAnInteger:
#         search_results = paginator.page(1)
#     except EmptyPage:
#         search_results = paginator.page(paginator.num_pages)
#
#     return render(request, 'ctdata/search_results.html', {
#         'search_query': search_query,
#         'search_results': search_results,
#         'search_picks': search_picks,
#     })


def categories(request, tag_name):
    if tag_name:
        tag = DataAcademyTag.objects.get(name=tag_name)
        events_tags = tag.ctdata_academyeventtag_items.all()
        resources_tags = tag.ctdata_academyresourcetag_items.all()
    else:
        events_tags = None
        resources_tags = None
    return render(request, 'ctdata/categories.html', {
        'tag': tag,
        'events': sorted([e.content_object for e in events_tags], key=lambda e: e.date_from),
        'resources': [r.content_object for r in resources_tags]
    })
