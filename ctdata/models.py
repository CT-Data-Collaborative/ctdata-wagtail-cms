import requests
import urllib
import pytz

from datetime import date, datetime

from django.db import models
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponse
from django.utils import timezone
from django.conf import settings
from django.template.response import TemplateResponse
from django.shortcuts import get_object_or_404, render
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django import forms

from wagtail.wagtailcore.models import Page, Orderable
from wagtail.wagtailcore.fields import RichTextField, StreamField
from wagtail.wagtailadmin.edit_handlers import FieldPanel, FieldRowPanel, MultiFieldPanel, \
    InlinePanel, PageChooserPanel, StreamFieldPanel
from wagtail.wagtailimages.edit_handlers import ImageChooserPanel
from wagtail.wagtaildocs.edit_handlers import DocumentChooserPanel

from wagtail.wagtailsnippets.edit_handlers import SnippetChooserPanel
from wagtail.wagtailforms.models import AbstractEmailForm, AbstractFormField
from wagtail.wagtailsearch import index

from wagtail.contrib.settings.models import BaseSetting, register_setting
from wagtail.contrib.wagtailroutablepage.models import RoutablePageMixin, route

from modelcluster.fields import ParentalKey
from modelcluster.tags import ClusterTaggableManager
from taggit.models import TaggedItemBase, TagBase, GenericTaggedItemBase, ItemBase

from ctdata.utils import export_event, is_tag_full
from ctdata.scrolly_content import get_content
from fontawesome.fields import IconField
from eventbrite import Eventbrite

from .blocks import CTDataStreamBlock, PullQuoteBlock, ImageFormatChoiceBlock, HTMLAlignmentChoiceBlock, ChartTypeChoiceBlock, ImageBlock, ImageChooserBlock, AlignedHTMLBlock, SidebarPullQuote, SidebarNote, PymIFrameBlock, IFrameBlock, ExternalIFrame, CharBlock, TwitterBlock, ReactWidgetBlock

from .snippets import ReactWidget

EVENT_AUDIENCE_CHOICES = (
    ('public', "Public"),
    ('private', "Private"),
)

PROJECT_CATEGORY_CHOICES = (
    ('story', 'Story'),
    ('portal', 'Portal'),
)


# A couple of abstract classes that contain commonly used fields

class LinkFields(models.Model):
    link_external = models.URLField("External link", blank=True)
    link_page = models.ForeignKey(
        'wagtailcore.Page',
        null=True,
        blank=True,
        related_name='+'
    )
    link_document = models.ForeignKey(
        'wagtaildocs.Document',
        null=True,
        blank=True,
        related_name='+'
    )

    @property
    def link(self):
        if self.link_page:
            return self.link_page.url
        elif self.link_document:
            return self.link_document.url
        else:
            return self.link_external

    panels = [
            FieldPanel('link_external'),
            PageChooserPanel('link_page'),
            DocumentChooserPanel('link_document')
    ]

    class Meta:
        abstract = True


class ContactFields(models.Model):
    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address_1 = models.CharField(max_length=255, blank=True)
    address_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=255, blank=True)
    post_code = models.CharField(max_length=10, blank=True)

    panels = [
        FieldPanel('telephone'),
        FieldPanel('email'),
        FieldPanel('address_1'),
        FieldPanel('address_2'),
        FieldPanel('city'),
        FieldPanel('country'),
        FieldPanel('post_code'),
    ]

    class Meta:
        abstract = True



################################################################################################
########
########
########            Carousel Items
########
########
################################################################################################


class CarouselItem(LinkFields):
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    embed_url = models.URLField("Embed URL", blank=True)
    caption = models.CharField(max_length=255, blank=True)

    panels = [
        ImageChooserPanel('image'),
        FieldPanel('embed_url'),
        FieldPanel('caption'),
        MultiFieldPanel(LinkFields.panels, "Link"),
    ]

    class Meta:
        abstract = True



################################################################################################
########
########
########            Project Items
########
########
################################################################################################

class ProjectItem(LinkFields):
    project_title = models.CharField(max_length=255, blank=True)
    project_category = models.CharField(max_length=255, choices=PROJECT_CATEGORY_CHOICES)
    project_link = models.URLField("Project Link", blank=False)
    project_description = models.CharField(max_length=750, blank=True)
    project_publish_date = models.DateTimeField(blank=True)
    featured = models.BooleanField()

    panels = [
        FieldPanel('project_title'),
        FieldPanel('project_category'),
        FieldPanel('project_link'),
        FieldPanel('project_description'),
        FieldPanel('project_publish_date'),
        FieldPanel('featured')
    ]

    class Meta:
        abstract = True


################################################################################################
########
########
########            Related Links
########
########
################################################################################################


class RelatedLink(LinkFields):
    title = models.CharField(max_length=255, help_text="Link title")
    description = models.CharField(max_length=500, help_text="Description", blank=True)
    panels = [
        FieldPanel('title'),
        FieldPanel('description'),
        MultiFieldPanel(LinkFields.panels)
    ]

    class Meta:
        abstract = True



################################################################################################
########
########
########           Sponsor Link
########
########
################################################################################################


class SponsorLink(LinkFields):
    title = models.CharField(max_length=255, help_text="Link title")
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    panels = [
        FieldPanel('title'),
        ImageChooserPanel('image'),
        MultiFieldPanel(LinkFields.panels, "Link"),
    ]

    class Meta:
        abstract = True


################################################################################################
########
########
########            Home Page
########
########
################################################################################################

# Home Page
class HomePageCarouselItem(Orderable, CarouselItem):
    page = ParentalKey('ctdata.HomePage', related_name='carousel_items')


class HomePageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.HomePage', related_name='related_links')


class HomePageProjectItem(Orderable, ProjectItem):
    page = ParentalKey('ctdata.HomePage', related_name='project_items')

    @property
    def active(self):
        if self.project_publish_date <= timezone.now():
            return True
        else:
            return False

class HomePage(Page):
    body = StreamField(CTDataStreamBlock())
    search_fields = Page.search_fields + [
        index.SearchField('body'),
    ]

    class Meta:
        verbose_name = "Homepage"

    @property
    def active_projects(self):
        return [p for p in self.project_items.all() if p.active]

    @property
    def blogs(self):
        # Get list of live blog pages that are descendants of this page
        news = Page.objects.live().descendant_of(self).type((BlogPage, ScrollyStory))
        # Order by most recent date first
        news = sorted([b.specific for b in news], key=lambda x:x.date, reverse=True)
        return news


HomePage.content_panels = [
    FieldPanel('title', classname="full title"),
    StreamFieldPanel('body'),
    InlinePanel('project_items', label="Project items"),
    InlinePanel('carousel_items', label="Carousel items"),
    InlinePanel('related_links', label="Related links"),
]

HomePage.promote_panels = Page.promote_panels

################################################################################################
########
########
########            Services Page
########
########
################################################################################################


class ServiceItem(LinkFields):
    title = models.CharField(max_length=255, blank=True)
    description = models.CharField(max_length=750, blank=True)
    icon = IconField()

    panels = [
        FieldPanel('title'),
        FieldPanel('description'),
        FieldPanel('icon')
    ]

    class Meta:
        abstract = True


class ServicesPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.ServicesPage', related_name='related_links')

class ServicesPageResourceItem(Orderable, ServiceItem):
    page = ParentalKey('ctdata.ServicesPage', related_name='services')

class ServicesPage(Page):
    body = RichTextField(blank=True)
    hero_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )


ServicesPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('body', classname="full"),
    InlinePanel('services', label="Services Offered"),
]


################################################################################################
########
########
########            Standard index page
########
########
################################################################################################


class StandardIndexPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.StandardIndexPage', related_name='related_links')


class StandardIndexPage(Page):
    intro = RichTextField(blank=True)
    feed_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    search_fields = Page.search_fields + [
        index.SearchField('intro'),
    ]

StandardIndexPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('intro', classname="full"),
    InlinePanel('related_links', label="Related links"),
]

StandardIndexPage.promote_panels = Page.promote_panels + [
    ImageChooserPanel('feed_image'),
]


################################################################################################
########
########
########            Standard page
########
########
################################################################################################

class StandardPageCarouselItem(Orderable, CarouselItem):
    page = ParentalKey('ctdata.StandardPage', related_name='carousel_items')


class StandardPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.StandardPage', related_name='related_links')


class StandardPage(Page):
    intro = RichTextField(blank=True)
    body = RichTextField(blank=True)
    feed_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    search_fields = Page.search_fields + [
        index.SearchField('intro'),
        index.SearchField('body'),
    ]

StandardPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('intro', classname="full"),
    InlinePanel('carousel_items', label="Carousel items"),
    FieldPanel('body', classname="full"),
    InlinePanel('related_links', label="Related links"),
]

StandardPage.promote_panels = Page.promote_panels + [
    ImageChooserPanel('feed_image'),
]

################################################################################################
########
########
########            Standard Streamfield page
########
########
################################################################################################

class StandardStreamfieldPageCarouselItem(Orderable, CarouselItem):
    page = ParentalKey('ctdata.StandardStreamfieldPage', related_name='carousel_items')


class StandardStreamfieldPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.StandardStreamfieldPage', related_name='related_links')


class StandardStreamfieldPage(Page):
    intro = RichTextField(blank=True)
    body = StreamField(CTDataStreamBlock())
    feed_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    search_fields = Page.search_fields + [
        index.SearchField('intro'),
        index.SearchField('body'),
    ]

StandardStreamfieldPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('intro', classname="full"),
    InlinePanel('carousel_items', label="Carousel items"),
    StreamFieldPanel('body'),
    InlinePanel('related_links', label="Related links"),
]

StandardStreamfieldPage.promote_panels = Page.promote_panels + [
    ImageChooserPanel('feed_image'),
]

################################################################################################
########
########
########            Blog index page
########
########
################################################################################################

class BlogIndexPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.BlogIndexPage', related_name='related_links')


class BlogIndexPage(Page):
    intro = RichTextField(blank=True)
    subpage_types = ['ctdata.BlogPage', 'ctdata.ScrollyStory']
    search_fields = Page.search_fields + [
        index.SearchField('intro'),
    ]

    @property
    def blogs(self):
        # Get list of live blog pages that are descendants of this page
        blogs = BlogPage.objects.live().descendant_of(self)

        # Order by most recent date first
        blogs = blogs.order_by('-date')

        return blogs

    def get_items(self, tag=None):
        blogs = BlogPage.objects.live().descendant_of(self)
        scrolly = ScrollyStory.objects.live().descendant_of(self)
        if tag:
            blogs = blogs.filter(tags__name=tag)
            scrolly = scrolly.filter(tags__name=tag)
        items = [b.specific for b in blogs] + [s.specific for s in scrolly]
        return sorted(items, key=lambda x:x.date, reverse=True)

    def get_context(self, request):
        # Get blogs
        # blogs = self.blogs

        # Filter by tag
        tag = request.GET.get('tag')
        items = self.get_items(tag)
        # if tag:
            # blogs = blogs.filter(tags__name=tag)

        # Pagination
        page = request.GET.get('page')
        paginator = Paginator(items, 10)  # Show 10 blogs per page
        try:
            items = paginator.page(page)
        except PageNotAnInteger:
            items = paginator.page(1)
        except EmptyPage:
            items = paginator.page(paginator.num_pages)

        # Update template context
        context = super(BlogIndexPage, self).get_context(request)
        context['blogs'] = items
        return context

BlogIndexPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('intro', classname="full"),
    InlinePanel('related_links', label="Related links"),
]

BlogIndexPage.promote_panels = Page.promote_panels


################################################################################################
########
########
########            Blog page
########
########
################################################################################################


class BlogPageCarouselItem(Orderable, CarouselItem):
    page = ParentalKey('ctdata.BlogPage', related_name='carousel_items')


class BlogPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.BlogPage', related_name='related_links')


class BlogPageTag(TaggedItemBase):
    content_object = ParentalKey('ctdata.BlogPage', related_name='tagged_items')


class BlogPage(Page):
    body = StreamField(CTDataStreamBlock())
    tags = ClusterTaggableManager(through=BlogPageTag, blank=True)
    author = models.CharField(max_length=255)
    date = models.DateField("Post date")
    feed_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    react_widget = models.ForeignKey(
        'ReactWidget',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    parent_page_types = ['ctdata.BlogIndexPage']

    search_fields = Page.search_fields + [
        index.SearchField('body'),
    ]

    @property
    def blog_index(self):
        # Find closest ancestor which is a blog index
        return self.get_ancestors().type(BlogIndexPage).last()

    def get_absolute_url(self):
        return self.full_url


BlogPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('author'),
    FieldPanel('date'),
    StreamFieldPanel('body'),
    InlinePanel('carousel_items', label="Carousel items"),
    InlinePanel('related_links', label="Related links")
]

BlogPage.promote_panels = Page.promote_panels + [
    ImageChooserPanel('feed_image'),
    FieldPanel('tags'),
]

################################################################################################
########
########
########            Google Sheets Scrolly Story Page
########
########
################################################################################################

class ScrollyPageTag(TaggedItemBase):
    content_object = ParentalKey('ctdata.ScrollyStory', related_name='tagged_items')

class ScrollyStory(RoutablePageMixin, Page):
    tags = ClusterTaggableManager(through=ScrollyPageTag, blank=True)
    author = models.CharField(max_length=255)
    date = models.DateField("Post date")
    google_sheet_name = models.CharField(max_length=255)
    polling_interval = models.IntegerField(
        null=True,
        blank=True,
        help_text="""Enter how long (in minutes) the google sheets content 
    should be cached for. Leave blank to disable checking. Enter zero to disable caching.""")
    introduction = StreamField(CTDataStreamBlock())
    conclusion = StreamField(CTDataStreamBlock())
    parent_page_types = ['ctdata.BlogIndexPage']


    @property
    def blog_index(self):
        # Find closest ancestor which is a blog index
        return self.get_ancestors().type(BlogIndexPage).last()

    def get_absolute_url(self):
        return self.full_url

    @route(r'^$')
    def base(self, request):
        try:
            polling_interval = self.polling_interval * 60
        except TypeError:
            polling_interval = None
        base_context = {}
        base_context['page'] = self
        base_context['content'] = get_content(self.google_sheet_name, cache_duration=polling_interval)

        return TemplateResponse(
            request,
            self.get_template(request), base_context)

ScrollyStory.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('author'),
    FieldPanel('date'),
    FieldPanel('google_sheet_name'),
    FieldPanel('polling_interval'),
    StreamFieldPanel('introduction'),
    StreamFieldPanel('conclusion')
]

ScrollyStory.promote_panels = Page.promote_panels + [
    FieldPanel('tags'),
]

################################################################################################
########
########
########            Person page
########
########
################################################################################################


class PersonPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.PersonPage', related_name='related_links')


class PersonPage(Page, ContactFields):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    staff_title = models.CharField(max_length=255)
    biography = RichTextField(blank=True)
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    feed_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    search_fields = Page.search_fields + [
        index.SearchField('first_name'),
        index.SearchField('last_name'),
        index.SearchField('biography'),
        index.SearchField('staff_title'),
    ]

PersonPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('first_name'),
    FieldPanel('last_name'),
    FieldPanel('staff_title'),
    FieldPanel('biography', classname="full"),
    ImageChooserPanel('image'),
    MultiFieldPanel(ContactFields.panels, "Contact"),
    InlinePanel('related_links', label="Related links"),
]

PersonPage.promote_panels = Page.promote_panels + [
    ImageChooserPanel('feed_image'),
]


################################################################################################
########
########
########            Contact page
########
########
################################################################################################

class ContactPage(Page, ContactFields):
    body = RichTextField(blank=True)
    feed_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    search_fields = Page.search_fields + [
        index.SearchField('body'),
    ]

ContactPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('body', classname="full"),
    MultiFieldPanel(ContactFields.panels, "Contact"),
]

ContactPage.promote_panels = Page.promote_panels + [
    ImageChooserPanel('feed_image'),
]


################################################################################################
########
########
########            Jobs index page
########
########
################################################################################################

class JobIndexPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.JobIndexPage', related_name='related_links')


class JobIndexPage(Page):
    intro = RichTextField(blank=True)

    @property
    def jobs(self):
        # Get a list of active job postigns
        jobs = JobPage.objects.live().descendant_of(self)
        return jobs


JobIndexPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('intro', classname="full")
]

JobIndexPage.promote_panels = Page.promote_panels


################################################################################################
########
########
########            Jobs page
########
########
################################################################################################


class JobPage(Page):
    job_title = models.CharField(max_length=255)
    overview = models.CharField(max_length=750)
    deadline_date = models.DateField("Application deadline")
    body = RichTextField(blank=True)

    @property
    def job_index(self):
        # Find closest ancestor which is an event index
        return self.get_ancestors().type(JobIndexPage).last()


JobPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('job_title'),
    FieldPanel('overview'),
    FieldPanel('deadline_date'),
    FieldPanel('body', classname="full"),
]


################################################################################################
########
########
########            Event index page
########
########
################################################################################################

class EventIndexPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.EventIndexPage', related_name='related_links')


class EventIndexPage(Page):
    intro = RichTextField(blank=True)
    subpage_types = ['ctdata.EventPage', 'ctdata.ConferencePage']
    search_fields = Page.search_fields + [
        index.SearchField('intro'),
    ]


    @property
    def events(self):
        # Get list of live event pages that are descendants of this page
        events = EventPage.objects.live().descendant_of(self)

        # Filter events list to get ones that are either
        # running now or start in the future
        events = events.filter(date_from__gte=date.today())

        # Order by date
        events = events.order_by('date_from')

        return events

    @property
    def past_events(self):
        # Get a list of past events
        past_events = EventPage.objects.live().descendant_of(self)

        # Filter events list to get ones that are either
        # running now or start in the future
        past_events = past_events.filter(date_from__lt=date.today())

        # Order by date
        past_events = past_events.order_by('date_from')

        return past_events


EventIndexPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('intro', classname="full"),
    InlinePanel('related_links', label="Related links"),
]

EventIndexPage.promote_panels = Page.promote_panels


################################################################################################
########
########
########            Event page
########
########
################################################################################################

class EventPageCarouselItem(Orderable, CarouselItem):
    page = ParentalKey('ctdata.EventPage', related_name='carousel_items')

class EventPageRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.EventPage', related_name='related_links')


class EventPageSpeaker(Orderable, LinkFields):
    page = ParentalKey('ctdata.EventPage', related_name='speakers')
    first_name = models.CharField("Name", max_length=255, blank=True)
    last_name = models.CharField("Surname", max_length=255, blank=True)
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    @property
    def name_display(self):
        return self.first_name + " " + self.last_name

    panels = [
        FieldPanel('first_name'),
        FieldPanel('last_name'),
        ImageChooserPanel('image'),
        MultiFieldPanel(LinkFields.panels, "Link"),
    ]


class EventPage(Page):
    date_from = models.DateField("Start date")
    date_to = models.DateField(
        "End date",
        null=True,
        blank=True,
        help_text="Not required if event is on a single day"
    )
    time_from = models.TimeField("Start time", null=True, blank=True)
    time_to = models.TimeField("End time", null=True, blank=True)
    location = models.CharField(max_length=255)
    body = RichTextField(blank=True)
    signup_link = models.URLField(blank=True)
    academy_resources_list_display = models.BooleanField("Resource List Display", default=False)
    feed_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    search_fields = Page.search_fields + [
        index.SearchField('location'),
        index.SearchField('body'),
    ]

    @property
    def event_index(self):
        # Find closest ancestor which is an event index
        return self.get_ancestors().type(EventIndexPage).last()

    def get_absolute_url(self):
        return self.full_url

    def serve(self, request):
        if "format" in request.GET:
            if request.GET['format'] == 'ical':
                # Export to ical format
                response = HttpResponse(
                    export_event(self, 'ical'),
                    content_type='text/calendar',
                )
                response['Content-Disposition'] = 'attachment; filename=' + self.slug + '.ics'
                return response
            else:
                # Unrecognised format error
                message = 'Could not export event\n\nUnrecognised format: ' + request.GET['format']
                return HttpResponse(message, content_type='text/plain')
        else:
            # Display event page as usual
            return super(EventPage, self).serve(request)

EventPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldRowPanel([
        FieldPanel('date_from'),
        FieldPanel('date_to'),
        FieldPanel('time_from'),
        FieldPanel('time_to')
    ]),
    FieldPanel('academy_resources_list_display'),
    FieldPanel('location'),
    FieldPanel('signup_link'),
    InlinePanel('carousel_items', label="Carousel items"),
    FieldPanel('body', classname="full"),
    InlinePanel('speakers', label="Speakers"),
    InlinePanel('related_links', label="Related links",
                help_text="""When adding a link it is preferable to include only one type of link 
                (external, internal link, or internal document. The Event resource archive will only display the first
                link found.""")
]

EventPage.promote_panels = Page.promote_panels + [
    ImageChooserPanel('feed_image'),
]

################################################################################################
########
########
########            Conference page
########
########
################################################################################################

class ConferenceSessionParticipants(Orderable, LinkFields):
    page = ParentalKey('ctdata.ConferenceSession', related_name='participants')
    first_name = models.CharField("Name", max_length=255, blank=True)
    last_name = models.CharField("Surname", max_length=255, blank=True)
    title = models.CharField("Title", max_length=255, blank=True)

    @property
    def name_display(self):
        return self.first_name + " " + self.last_name

    panels = [
        FieldPanel('first_name'),
        FieldPanel('last_name'),
        FieldPanel('title'),
        MultiFieldPanel(LinkFields.panels, "Link"),
    ]

class ConferenceSessionRelatedResources(Orderable, RelatedLink):
    page = ParentalKey('ctdata.ConferenceSession', related_name='related_resources')

# TODO FIX SORT ORDER
class ConferenceSession(Page):
    conference = models.ForeignKey(
        'ctdata.ConferencePage',
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name='sessions',
        help_text="Leave blank if you want to add session to the parent conference."
    )
    time_from = models.TimeField("Start time", null=True, blank=True)
    time_to = models.TimeField("End time", null=True, blank=True)
    description = RichTextField(blank=True)

    @property
    def parent_conference(self):
        parent_conference = ConferencePage.objects.live().ancestor_of(self).first()
        return parent_conference.title

    @property
    def name_display(self):
        return self.session_title

    def save(self, *args, **kwargs):
        if not self.conference:
            parent_conference = ConferencePage.objects.live().ancestor_of(self).first()
            self.conference = parent_conference
        super(ConferenceSession, self).save(*args, **kwargs)

ConferenceSession.content_panels = [
    PageChooserPanel('conference', 'ctdata.ConferencePage'),
    FieldPanel('title'),
    FieldPanel('time_from'),
    FieldPanel('time_to'),
    FieldPanel('description', classname="full"),
    InlinePanel('participants', label="Participants"),
    InlinePanel('related_resources', label="Related Resources",
                help_text="""When adding a link it is preferable to include only one type of link 
                (external, internal link, or internal document. The Event resource archive will only display the first
                link found.""")
]

class ConferenceSponsorLink(Orderable, SponsorLink):
    page = ParentalKey('ctdata.ConferencePage', related_name='sponsors')


class ConferencePage(EventPage):
    subpage_types = ['ctdata.ConferenceSession']

    @property
    def sessions(self):
        # Get list of live event pages that are descendants of this page
        sessions = ConferenceSession.objects.live().descendant_of(self)
        return sessions

    def serve(self, request):
        if "format" in request.GET:
            if request.GET['format'] == 'ical':
                # Export to ical format
                response = HttpResponse(
                    export_event(self, 'ical'),
                    content_type='text/calendar',
                )
                response['Content-Disposition'] = 'attachment; filename=' + self.slug + '.ics'
                return response
            else:
                # Unrecognised format error
                message = 'Could not export event\n\nUnrecognised format: ' + request.GET['format']
                return HttpResponse(message, content_type='text/plain')
        else:
            # Display event page as usual
            return super(ConferencePage, self).serve(request)

ConferencePage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('academy_resources_list_display'),
    FieldPanel('date_from'),
    FieldPanel('date_to'),
    FieldPanel('time_from'),
    FieldPanel('time_to'),
    FieldPanel('location'),
    FieldPanel('signup_link'),
    InlinePanel('carousel_items', label="Carousel items"),
    FieldPanel('body', classname="full"),
    InlinePanel('related_links', label="Related links"),
    InlinePanel('sponsors', label="Sponsors")
]

ConferencePage.promote_panels = Page.promote_panels + [
    ImageChooserPanel('feed_image'),
]



################################################################################################
########
########
########            Form page
########
########
################################################################################################


class FormField(AbstractFormField):
    page = ParentalKey('FormPage', related_name='form_fields')


class FormPage(AbstractEmailForm):
    intro = RichTextField(blank=True)
    thank_you_text = RichTextField(blank=True)

FormPage.content_panels = [
    FieldPanel('title', classname="full title"),
    FieldPanel('intro', classname="full"),
    InlinePanel('form_fields', label="Form fields"),
    FieldPanel('thank_you_text', classname="full"),
    MultiFieldPanel([
        FieldRowPanel([
            FieldPanel('from_address', classname="col6"),
            FieldPanel('to_address', classname="col6"),
        ]),
        FieldPanel('subject'),
    ], "Email"),
]


################################################################################################
########
########
########            Settings Models
########
########
################################################################################################

@register_setting(icon="placeholder")
class SocialMediaSettings(BaseSetting):
    facebook = models.URLField(
        help_text='Your Facebook page URL')
    twitter = models.CharField(
        max_length=255, help_text='Your twitter username, without the @')
    github = models.URLField(
        help_text='Your GitHub URL')

    class Meta:
        verbose_name = 'social media accounts'

@register_setting(icon="placeholder")
class EventBriteSettings(BaseSetting):
    eventbrite = models.CharField(
        max_length=20,
        help_text='Your eventbrite personal oauth token'
    )

    class Meta:
        verbose_name = 'eventbrite settings'

################################################################################################
########
########
########            Data Academy Models
########
########
################################################################################################

class RelatedResource(LinkFields):
    title = models.CharField(max_length=255, help_text="Link title")
    description = models.CharField(max_length=500, help_text="Description", blank=True)
    related_resource = models.ForeignKey(
        'wagtailcore.Page',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
    )
    panels = [
        FieldPanel('title'),
        FieldPanel('description'),
        PageChooserPanel('related_resource', 'ctdata.DataAcademyResource')
    ]

    class Meta:
        abstract = True


################################################################################################
########
########            Data Academy Tags and Tag Indices
########
################################################################################################
#
class DataAcademyTag(TagBase):
    description = StreamField(CTDataStreamBlock(), blank=True)
    panels = [
        FieldPanel('name'),
        StreamFieldPanel('description')
    ]
    class Meta:
        verbose_name = "Academy Tag"
        verbose_name_plural = "Academy Tags"


################################################################################################
########
########            Data Academy Indices and Main Pages
########
################################################################################################


class DataAcademyPage(RoutablePageMixin, Page):
    parent_page_types = ['HomePage']
    subpage_types = ['DataAcademyEventIndex', 'DataAcademyResourceIndex']
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    body = StreamField(CTDataStreamBlock())
    explore_resources_text = RichTextField(blank=True)
    category_list_text = RichTextField(blank=True)
    showcase_text = RichTextField(blank=True)
    resource_index_text = RichTextField(blank=True)
    resource_index_page_title = models.CharField(max_length=20, blank=False)

    @property
    def events(self):
        # Get list of live event pages that are descendants of this page
        events = DataAcademyAbstractEvent.objects.live().descendant_of(self)

        # Filter events list to get ones that are either
        # running now or start in the future
        events = events.filter(date_from__gte=date.today())

        # Order by date
        events = events.order_by('date_from').all()[0:3]
        return events

    @property
    def event_index(self):
        return DataAcademyEventIndex.objects.live().descendant_of(self).first()

    @property
    def highlighted_resources(self):
        return DataAcademyResource.objects.all()[0:3]

    @property
    def resource_index(self):
        return DataAcademyResourceIndex.objects.live().descendant_of(self).first()

    @property
    def tags(self):
        return [tag for tag in DataAcademyTag.objects.all() if is_tag_full(tag)]

    @property
    def resource_index_page(self):
        return r'^{}/$'.format(self.resource_index_page_title)

    @route(r'^$')
    def base(self, request):
        base_context = {}
        base_context['page'] = self
        base_context['events'] = self.events
        base_context['highlighted_resources'] = self.highlighted_resources
        base_context['event_index'] = self.event_index
        base_context['resource_index'] = self.resource_index
        base_context['tags'] = self.tags
        if self.image:
            base_context['image'] = self.image.file.url

        return TemplateResponse(
            request,
            self.get_template(request), base_context)

    @route(r'^event-resources-archive/$')
    def archive(self, request):
        self.title = self.resource_index_page_title
        return render(
            request,
            'ctdata/event_resource_archive_index.html', {
                'past': [],
                'page': self,
            }
        )

DataAcademyPage.content_panels = [
    FieldPanel('title'),
    FieldPanel('resource_index_page_title'),
    StreamFieldPanel('body'),
    FieldPanel('explore_resources_text', classname="full"),
    FieldPanel('category_list_text', classname="full"),
    FieldPanel('showcase_text', classname="full"),
    FieldPanel('resource_index_text', classname="full"),
    ImageChooserPanel('image')
    ]

class DataAcademyEventIndex(RoutablePageMixin, Page):
    """Page type for event index. This will also be """
    parent_page_types = ['DataAcademyPage']
    subpage_types = ['DataAcademyWebEvent', 'DataAcademyLiveEvent']
    body = StreamField(CTDataStreamBlock())

    @property
    def events(self):
        # Get list of live event pages that are descendants of this page
        events = DataAcademyAbstractEvent.objects.live().descendant_of(self)

        # Filter events list to get ones that are either
        # running now or start in the future
        events = events.filter(date_from__gte=date.today())

        # Order by date
        events = events.order_by('date_from')
        return events

    @property
    def past_events(self):
        # Get a list of past events
        past_events = DataAcademyAbstractEvent.objects.live().descendant_of(self)

        # Filter events list to get ones that are either
        # running now or start in the future
        past_events = past_events.filter(date_from__lt=date.today())

        # Order by date
        past_events = past_events.order_by('date_from')

        return past_events

    @property
    def tags(self):
        return [tag for tag in DataAcademyTag.objects.all() if is_tag_full(tag)]

    @property
    def highlighted_resources(self):
        return DataAcademyResource.objects.all()[0:3]

    @property
    def resource_index_url(self):
        resource_index = DataAcademyResourceIndex.objects.live().first()
        if resource_index:
            return resource_index.url
        else:
            return ''

    @route(r'^$')
    def base(self, request):
        events = self.events
        tag = request.GET.get('tag')
        if tag:
            events = events.filter(tags__name=tag)
        return TemplateResponse(
            request,
            self.get_template(request), {
                'page': self,
                'events': events,
                'tags': self.tags,
                'highlighted_resources': self.highlighted_resources,
                'resource_index': self.resource_index_url
            }
        )

    @route(r'^past/$')
    def archive(self, request):
        return render(
            request,
            'ctdata/data_academy_event_archive.html', {
                'past': self.past_events,
                'page': self,
            }
        )

DataAcademyEventIndex.content_panels = [
    FieldPanel('title'),
    StreamFieldPanel('body')
    ]

class DataAcademyResourceIndex(RoutablePageMixin, Page):
    parent_page_types = ['DataAcademyPage']
    subpage_types = ['MediaResource', 'TutorialResource', 'FileResource', 'LinkResource']
    body = StreamField(CTDataStreamBlock())

    @property
    def resources(self):
        return DataAcademyResource.objects.live().descendant_of(self).order_by('title')

    @property
    def tags(self):
        return [tag for tag in DataAcademyTag.objects.all() if is_tag_full(tag)]

    @property
    def events(self):
        return DataAcademyAbstractEvent.objects.live().order_by('-date_from').all()[0:2]

    @property
    def event_index_url(self):
        event_index = DataAcademyEventIndex.objects.live().first()
        return event_index.url

    @route(r'^$')
    def base(self, request):
        resources = self.resources
        tag = request.GET.get('tag')
        if tag:
            resources = resources.filter(tags__name=tag)
        return TemplateResponse(
            request,
            self.get_template(request), {
                'page': self,
                'resources': resources,
                'tags': self.tags,
                'upcoming_events': self.events,
                'event_index': self.event_index_url
            }
        )

DataAcademyResourceIndex.content_panels = [
    FieldPanel('title'),
    StreamFieldPanel('body')
    ]

################################################################################################
########
########            Data Academy Events
########
################################################################################################

class AcademyEventRelatedLink(Orderable, RelatedResource):
    page = ParentalKey('ctdata.DataAcademyAbstractEvent', related_name='related_resources')

class AcademyEventTag(ItemBase):
    tag = models.ForeignKey(DataAcademyTag, related_name="%(app_label)s_%(class)s_items", on_delete=models.CASCADE)
    content_object = ParentalKey('ctdata.DataAcademyAbstractEvent', related_name='tagged_items')

AcademyEventPanels = [
    FieldPanel('title'),
    MultiFieldPanel([FieldRowPanel([
        FieldPanel('academy_resources_list_display'),
        FieldPanel('display_in_event_index')
    ])],
        heading='Flags',
        classname='collapsible'
    ),
    MultiFieldPanel([
        FieldRowPanel([
            FieldPanel('date_from'),
            FieldPanel('time_from'),
            FieldPanel('date_to'),
            FieldPanel('time_to')])
    ],
        heading='Dates and Times',
        classname='collapsible'
    ),
    ImageChooserPanel('event_image'),
    FieldPanel('signup_link')
    ]


class DataAcademyAbstractEvent(Page):
    parent_page_types = []
    subpage_types = []
    event_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    tags = ClusterTaggableManager(through=AcademyEventTag, blank=True)
    academy_resources_list_display = models.BooleanField(default=False)
    display_in_event_index = models.BooleanField(default=True)
    date_from = models.DateField("Start date")
    date_to = models.DateField("End date")
    time_from = models.TimeField("Start time", null=True, blank=False)
    time_to = models.TimeField("End time", null=True, blank=False)
    signup_link = models.URLField(blank=True)
    body = RichTextField(blank=True)

    @property
    def event_type(self):
        if isinstance(self.specific, DataAcademyLiveEvent):
            return 'live'
        else:
            return 'web'

    @property
    def start(self):
        return datetime.combine(self.date_from, self.time_from)

    @property
    def start_str(self):
        return self.start.strftime('%Y-%m-%dT%H:%M:%SZ')

    @property
    def start_utc(self):
        local = pytz.timezone(settings.TIME_ZONE)
        local_dt = local.localize(self.start, is_dst=None)
        return local_dt.astimezone(pytz.utc)

    @property
    def start_utc_str(self):
        return self.start_utc.strftime('%Y-%m-%dT%H:%M:%SZ')

    @property
    def end(self):
        return datetime.combine(self.date_to, self.time_to)

    @property
    def end_str(self):
        return self.end.strftime('%Y-%m-%dT%H:%M:%SZ')

    @property
    def end_utc(self):
        local = pytz.timezone(settings.TIME_ZONE)
        local_dt = local.localize(self.end, is_dst=None)
        return local_dt.astimezone(pytz.utc)

    @property
    def end_utc_str(self):
        return self.end_utc.strftime('%Y-%m-%dT%H:%M:%SZ')

    def get_absolute_url(self):
        return self.full_url

    def serve(self, request):
        if "format" in request.GET:
            if request.GET['format'] == 'ical':
                # Export to ical format
                response = HttpResponse(
                    export_event(self, 'ical'),
                    content_type='text/calendar',
                )
                response['Content-Disposition'] = 'attachment; filename=' + self.slug + '.ics'
                return response
            else:
                # Unrecognised format error
                message = 'Could not export event\n\nUnrecognised format: ' + request.GET['format']
                return HttpResponse(message, content_type='text/plain')
        else:
            # Display event page as usual
            return super(DataAcademyAbstractEvent, self).serve(request)


DataAcademyAbstractEvent.content_panels = AcademyEventPanels

DataAcademyAbstractEvent.promote_panels = Page.promote_panels + [
    FieldPanel('tags'),
]

class DataAcademyWebEvent(DataAcademyAbstractEvent):
    parent_page_types = ['DataAcademyEventIndex']
    event_link = models.URLField(blank=True, help_text="Link to web conference page or archived webcast.")



DataAcademyWebEvent.content_panels = DataAcademyAbstractEvent.content_panels + [
    FieldPanel('event_link'),
    FieldPanel('body', classname="full"),
    InlinePanel('related_resources', label="Related Resources")
]


class DataAcademyLiveEvent(DataAcademyAbstractEvent):
    parent_page_types = ['DataAcademyEventIndex']
    location = models.CharField(max_length=255)

    @property
    def event_type(self):
        return 'live'


DataAcademyLiveEvent.content_panels = DataAcademyAbstractEvent.content_panels + [
    FieldPanel('location'),
    # FieldPanel('size_limit'),
    FieldPanel('body', classname="full"),
    InlinePanel('related_resources', label="Related Resources")
]


################################################################################################
########
########            Data Academy Resources
########
################################################################################################

class AcademyResourceRelatedLink(Orderable, RelatedLink):
    page = ParentalKey('ctdata.DataAcademyResource', related_name='related_links')


AcademyResourcePanels = [
    FieldPanel('title'),
    StreamFieldPanel('body')
    ]

class AcademyResourceTag(ItemBase):
    tag = models.ForeignKey(DataAcademyTag, related_name="%(app_label)s_%(class)s_items", on_delete=models.CASCADE)
    content_object = ParentalKey('ctdata.DataAcademyResource', related_name='tagged_items')

class DataAcademyResource(Page):
    parent_page_types = ['DataAcademyResourceIndex', 'EventPage', 'ConferencePage', 'ConferenceSession']
    body = StreamField(CTDataStreamBlock(), blank=True)
    tags = ClusterTaggableManager(through=AcademyResourceTag, blank=True)

    @property
    def icon(self):
        if isinstance(self.specific, MediaResource):
            return "fa fa-film"
        if isinstance(self.specific, TutorialResource):
            return "fa fa-book"
        if isinstance(self.specific, FileResource):
            return "fa fa-file"
        if isinstance(self.specific, LinkResource):
            return "fa fa-link"
        else:
            return ""

    @property
    def related_events(self):
        events = DataAcademyAbstractEvent.objects.filter(related_resources__related_resource=self)
        return events

DataAcademyResource.content_panels = AcademyResourcePanels
DataAcademyResource.promote_panels = Page.promote_panels + [
    FieldPanel('tags'),
]

class MediaResource(DataAcademyResource):
    parent_page_types = ['DataAcademyResourceIndex']
    template = 'ctdata/data_academy_media_resource.html'
    video_url = models.URLField("Video URL", blank=True)

MediaResource.content_panels = DataAcademyResource.content_panels + [FieldPanel('video_url')]

class TutorialResource(DataAcademyResource):
    parent_page_types = ['DataAcademyResourceIndex']
    template = 'ctdata/data_academy_resource.html'

class FileResource(DataAcademyResource):
    parent_page_types = ['DataAcademyResourceIndex']
    template = 'ctdata/data_academy_resource.html'

class LinkResource(DataAcademyResource):
    parent_page_types = ['DataAcademyResourceIndex']
    template = 'ctdata/data_academy_resource.html'

LinkResource.content_panels = DataAcademyResource.content_panels + [
    InlinePanel('related_links', label="Links")
]

