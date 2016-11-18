from wagtail.tests.utils import WagtailPageTests
from ctdata.models import ConferencePage, ConferenceSession, HomePage, DataAcademyPage, DataAcademyEventIndex, \
    DataAcademyResourceIndex, DataAcademyEvent, DataAcademyResource

class ConferencePageTests(WagtailPageTests):
    def test_can_create_session_under_conference(self):
        self.assertCanCreateAt(ConferencePage, ConferenceSession)


class DataAcademyPageTests(WagtailPageTests):

    def test_academy_allowable_parent_and_subpages(self):
        self.assertAllowedParentPageTypes(DataAcademyPage, {HomePage})
        self.assertAllowedSubpageTypes(DataAcademyPage, {DataAcademyEventIndex, DataAcademyResourceIndex})

    def test_academy_event_index(self):
        self.assertAllowedParentPageTypes(DataAcademyEventIndex, {DataAcademyPage})
        self.assertAllowedSubpageTypes(DataAcademyEventIndex, {DataAcademyEvent})

    def test_academy_resource_index(self):
        self.assertAllowedParentPageTypes(DataAcademyResourceIndex, {DataAcademyPage})
        self.assertAllowedSubpageTypes(DataAcademyResourceIndex, {DataAcademyResource})
