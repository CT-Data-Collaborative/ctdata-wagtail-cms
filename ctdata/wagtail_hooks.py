from wagtail.contrib.modeladmin.options import ModelAdmin, modeladmin_register
from taggit.models import Tag, TaggedItem
from .models import DataAcademyPage, DataAcademyTag

class TagsModelAdmin(ModelAdmin):
    model = DataAcademyTag
    menu_label = 'Tags' # ditch this to use verbose_name_plural from model
    menu_icon = 'tag' # change as required
    menu_order = 311 # will put in 3rd place (000 being 1st, 100 2nd)
    add_to_settings_menu = False # or True to add your model to the Settings sub-menu
    list_display = ["name", "slug"]


# Now you just need to register your customised ModelAdmin class with Wagtail
modeladmin_register(TagsModelAdmin)

class DataAcademyAdmin(ModelAdmin):
    model = DataAcademyPage
    menu_label = 'DataAcademy'
    menu_icon = 'user'
    menu_order = 320
    add_to_settings_menu = False
    list_display = ["title", "slug"]

modeladmin_register(DataAcademyAdmin)
