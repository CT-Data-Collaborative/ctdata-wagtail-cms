import pytest
from pytest_wagtail import assertAllowedSubpageTypes, assertAllowedParentPageTypes, assertCanCreateAt
from ctdata.models import ConferencePage, ConferenceSession, HomePage, DataAcademyPage, DataAcademyEventIndex, \
    DataAcademyResourceIndex, DataAcademyAbstractEvent, DataAcademyLiveEvent, DataAcademyWebEvent, DataAcademyResource, \
    DataAcademyCollection
import datetime

def test_can_create_session_under_conference():
    assertCanCreateAt(ConferencePage, ConferenceSession)

def test_academy_allowable_parent_and_subpages():
    assertAllowedParentPageTypes(DataAcademyPage, {HomePage})
    assertAllowedSubpageTypes(DataAcademyPage, {DataAcademyEventIndex, DataAcademyResourceIndex, DataAcademyCollection})

def test_academy_event_index():
    assertAllowedParentPageTypes(DataAcademyEventIndex, {DataAcademyPage})
    assertAllowedSubpageTypes(DataAcademyEventIndex, {DataAcademyWebEvent, DataAcademyLiveEvent})

def test_academy_abstract_event():
    assertAllowedParentPageTypes(DataAcademyAbstractEvent, {})
    assertAllowedSubpageTypes(DataAcademyAbstractEvent, {})

def test_academy_resource_index():
    assertAllowedParentPageTypes(DataAcademyResourceIndex, {DataAcademyPage})
    assertAllowedSubpageTypes(DataAcademyResourceIndex, {DataAcademyResource})

def test_academy_collections():
    assertAllowedParentPageTypes(DataAcademyCollection, {DataAcademyPage})
