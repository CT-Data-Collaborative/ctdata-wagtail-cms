def _testCanCreateAt(parent_model, child_model):
    return child_model in parent_model.allowed_subpage_models()


def assertCanCreateAt(parent_model, child_model, msg=None):
    """
    Assert a particular child Page type can be created under a parent
    Page type. ``parent_model`` and ``child_model`` should be the Page
    classes being tested.
    """
    assert child_model in parent_model.allowed_subpage_models()
    # if not _testCanCreateAt(parent_model, child_model):
    #     msg = self._formatMessage(msg, "Can not create a %s.%s under a %s.%s" % (
    #         child_model._meta.app_label, child_model._meta.model_name,
    #         parent_model._meta.app_label, parent_model._meta.model_name))
    #     raise self.failureException(msg)

def assertAllowedSubpageTypes(parent_model, child_models):
    """
    Test that the only page types that can be created under
    ``parent_model`` are ``child_models``.
    The list of allowed child models may differ from those set in
    ``Page.subpage_types``, if the child models have set
    ``Page.parent_page_types``.
    """
    assert set(parent_model.allowed_subpage_models()) == set(child_models)

def assertAllowedParentPageTypes(child_model, parent_models):
    """
    Test that the only page types that ``child_model`` can be created under
    are ``parent_models``.
    The list of allowed parent models may differ from those set in
    ``Page.parent_page_types``, if the parent models have set
    ``Page.subpage_types``.
    """
    assert set(child_model.allowed_parent_page_models()) == set(parent_models)
