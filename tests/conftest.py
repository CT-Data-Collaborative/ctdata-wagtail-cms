import os
import django
from django.conf import settings
from ctdata.models import ConferencePage, ConferenceSession, HomePage, DataAcademyPage, DataAcademyEventIndex, \
    DataAcademyResourceIndex, DataAcademyAbstractEvent, DataAcademyLiveEvent, DataAcademyWebEvent, DataAcademyResource, \
    DataAcademyCollection

# We manually designate which settings we will be using in an environment variable
# This is similar to what occurs in the `manage.py`
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ctdata_wagtail.config.settings.test')


# `pytest` automatically calls this function once when tests are run.
def pytest_configure():
    settings.DEBUG = False
    # If you have any test specific settings, you can declare them here,
    # e.g.
    # settings.PASSWORD_HASHERS = (
    #     'django.contrib.auth.hashers.MD5PasswordHasher',
    # )
    django.setup()
    # Note: In Django =< 1.6 you'll need to run this instead
    # settings.configure()


