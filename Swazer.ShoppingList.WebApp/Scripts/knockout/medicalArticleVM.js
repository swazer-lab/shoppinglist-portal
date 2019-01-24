function MedicalArticleSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.EnglishTitle = ko.observable();
    self.ArabicTitle = ko.observable();
    self.Gender = ko.observable();
    self.PublishingStatus = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.EnglishTitle = self.EnglishTitle();
        criteria.ArabicTitle = self.ArabicTitle();

        if (self.Gender())
            criteria.Gender = self.Gender().value;

        if (self.PublishingStatus())
            criteria.PublishingStatus = self.PublishingStatus().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function MedicalArticleVM(id, supportEnglish, supportArabic, englishTitle, arabicTitle, englishContent, arabicContent, targetedGender, publishingStatus, logoId, logoAsString, isActive, isMarked) {
    var self = this;

    self.IsMarked = ko.observable(isMarked);
    self.SupportEnglish = ko.observable(supportEnglish);
    self.SupportArabic = ko.observable(supportArabic);
    self.BothSupport = ko.observable({
        a: self.SupportArabic,
        b: self.SupportEnglish
    }).extend({ oneLangAtLeast: true });

    self.MedicalArticleId = ko.observable(id);
    self.EnglishTitle = ko.observable(englishTitle).extend({ required: true });
    self.ArabicTitle = ko.observable(arabicTitle).extend({ required: true });
    self.ArabicContent = ko.observable(arabicContent).extend({ required: true });
    self.EnglishContent = ko.observable(englishContent).extend({ required: true });
    self.TargetedGender = ko.observable(targetedGender);
    self.IsActive = ko.observable(isActive);
    self.PublishingStatus = ko.observable(publishingStatus).extend({ required: true });
    self.LogoId = ko.observable(logoId);

    self.arabicFile = ko.observable(logoAsString).extend({ required: true });

    self.copy = function () {
        return new MedicalArticleVM(self.MedicalArticleId(), self.SupportEnglish(), self.SupportArabic(), self.EnglishTitle(), self.ArabicTitle(), self.EnglishContent(), self.ArabicContent(),
            self.TargetedGender(), self.PublishingStatus(), self.LogoId(), self.arabicFile(), self.IsActive(), self.IsMarked());
    }

    self.toSubmitModel = function () {
        var model = {
            MedicalArticleId: self.MedicalArticleId(),

            SupportArabic: self.SupportArabic(),
            SupportEnglish: self.SupportEnglish(),
            EnglishTitle: self.EnglishTitle(),
            ArabicTitle: self.ArabicTitle(),
            ArabicContent: self.ArabicContent(),
            EnglishContent: self.EnglishContent(),
            PublishingStatus: self.PublishingStatus().value,
            Logo: self.arabicFile(),
            LogoId: self.LogoId(),
        };

        if (self.TargetedGender() !== undefined)
            model.TargetedGender = self.TargetedGender().value;

        return model;
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.SupportEnglish() === false && self.SupportArabic() === false) {
            return false;
        }

        if (self.SupportEnglish() === true) {
            if (self.EnglishTitle() === undefined || self.EnglishTitle() === '')
                return false;

            if (self.EnglishContent() === undefined || self.EnglishContent() === '')
                return false;
        }

        if (self.SupportArabic() === true) {
            if (self.ArabicTitle() === undefined || self.ArabicTitle() === '')
                return false;

            if (self.ArabicContent() === undefined || self.ArabicContent() === '')
                return false;
        }

        if (self.PublishingStatus() === undefined)
            return false;

        if (self.arabicFile() === undefined || self.arabicFile() === '')
            return false;

        return true;
    }
}

function MedicalArticleMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.SearchUrl = options.searchUrl;
    self.GetLogoUrl = options.getLogoUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;
    self.GetContentUrl = options.getContentUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.TargetedGenders = ko.observableArray(options.genders);
    self.PublishingStatuses = ko.observableArray(options.publishingStatuses);

    self.SearchTargetedGender = function (targetGenderValue) {
        return ko.utils.arrayFirst(self.TargetedGenders(), function (targetedGenger) {
            return targetedGenger.value === targetGenderValue;
        });
    };

    self.SearchPublishingStatus = function (publishingStatusValue) {
        return ko.utils.arrayFirst(self.PublishingStatuses(), function (publishingStatus) {
            return publishingStatus.value === publishingStatusValue;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var targetedGender = self.SearchTargetedGender(item.TargetedGender);
            var publishingStatus = self.SearchPublishingStatus(item.PublishingStatus);
            var result = new MedicalArticleVM(item.MedicalArticleId, item.SupportEnglish, item.SupportArabic, item.EnglishTitle, item.ArabicTitle, item.EnglishContent, item.ArabicContent, targetedGender, publishingStatus, item.LogoId, undefined, item.IsActive);

            if (self.IsMarkedMedicalArticle(item.MedicalArticleId))
                result.IsMarked(true);
            else
                result.IsMarked(false);

            return result;
        });
    };

    self.IsMarkedMedicalArticle = function (id) {
        return ko.utils.arrayFirst(self.SelectedItemsIds(), function (selectedId) {
            if (selectedId === id)
                return true;
        });
        return false;
    };

    self.IsMultipleDelete = ko.observable(false);
    self.ShowDeleteModal = ko.observable(false);
    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.MedicalArticles = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.MedicalArticles().length === 0);
    });

    self.IsCreateOrEditMode = ko.pureComputed(function () {
        var mode = self.Mode();
        return (mode === self.CreateMode || mode === self.EditMode);
    });

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsCreateOrEditMode() && !self.IsNoResultMode();
    });

    self.CreateNewElement = function () {
        return new MedicalArticleVM(0, false, false, '', '', '', '', undefined, undefined, 0, undefined, false);
    };

    self.EnterEditMode = function () {
        self.PanelTitle(self.EditModePanelTitle);
        self.Mode(self.EditMode);
        self.EditedElement(self.SelectedElement().copy());
    };

    self.EnterCreateMode = function () {
        self.PanelTitle(self.CreateModePanelTitle);
        self.Mode(self.CreateMode);
    };

    self.EnterDetailsMode = function () {
        self.PanelTitle(self.DisplayModePanelTitle);
        self.Mode(self.DisplayMode);
    };

    self.EnterNoResultMode = function () {
        self.Mode(self.NoResultMode);
    }

    self.FindSelectedElement = function () {
        if (!self.SelectedElement())
            return undefined;

        return ko.utils.arrayFirst(self.MedicalArticles(), function (element) {
            return element.MedicalArticleId() === self.SelectedElement().MedicalArticleId();
        });
    };

    self.GetSelectedElementOrFirstOrNew = function () {
        var newEl = self.CreateNewElement();
        self.EditedElement(newEl);

        var founded = self.FindSelectedElement();
        if (founded) {
            self.EnterDetailsMode();
            return founded;
        }

        if (self.IsItemsEmpty() === false) {
            self.EnterDetailsMode();
            return self.MedicalArticles()[0];
        }

        self.EnterNoResultMode();
        return newEl;
    };

    self.PressCreate = function () {
        self.EnterCreateMode();
        var newEl = self.CreateNewElement();
        self.EditedElement(newEl);
        self.SelectedElement(newEl);
    };

    self.SelectRow = function (row) {
        row.arabicFile(undefined);
        row.ArabicContent(undefined);
        row.EnglishContent(undefined);
        self.EnterDetailsMode();
        self.SelectedElement(row);
    };

    self.ShowSpinning = function () {
        self.Spinning(true);
    };

    self.HideSpinning = function () {
        self.Spinning(false);
    };

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)
            self.Search();
        return true;
    };

    self.GetUrl = function () {
        if (self.Mode() === self.CreateMode)
            return self.CreateUrl;
        else if (self.Mode() === self.EditMode)
            return self.EditUrl;
        else
            return '';
    };

    self.Cancel = function () {
        if (self.Mode() === self.EditMode)
            self.EnterDetailsMode();
        else if (self.Mode() === self.CreateMode)
            self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
    };

    self.Save = function (form) {
        if (self.Mode() === self.DisplayMode)
            return false;

        if (!self.EditedElement().FullValidation()) {
            self.EditedElement().ShowErrors();
            return false;
        }

        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.GetUrl(),
            data: {
                viewModel: self.EditedElement().toSubmitModel(),
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                if (self.Mode() === self.CreateMode)
                    self.HandleCreateSuccess(e);
                else
                    self.HandleSuccess(e);

                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });

        return false;
    };

    self.GetLogo = function (newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetLogoUrl,
            data: {
                logoId: self.SelectedElement().LogoId(),
            },
            success: function (e) {
                if (temp.MedicalArticleId() === self.SelectedElement().MedicalArticleId()) {
                    if (self.Mode() === self.EditMode)
                        self.EditedElement().arabicFile(e);
                    self.SelectedElement().arabicFile(e);
                }
            },
            error: self.HandleError
        });
    }

    self.HandleCreateSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.MedicalArticles(observableItems);

        var founded = self.SelectedTheNewCreatedElement(e);
        if (founded !== null) {
            self.SelectedElement(founded);
            self.EnterDetailsMode();
        }
        else
            self.SelectedElement(self.GetSelectedElementOrFirstOrNew());

        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.SelectedTheNewCreatedElement = function (e) {
        var selectedId = e.SelectedRowId;
        if (selectedId === undefined)
            return;

        return self.FindById(selectedId);
    }

    self.FindById = function (id) {
        return ko.utils.arrayFirst(self.MedicalArticles(), function (temp) {
            return temp.MedicalArticleId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.MedicalArticles(), function (m) {
            if (m.IsMarked() === true)
                self.SelectedItemsIds().push(m.MedicalArticleId());
            return m.IsMarked() === true;
        });
    });

    self.SelectedItemsIds = ko.observableArray();

    self.IsThereMultipleSelected = ko.pureComputed(function () {
        return self.SelectedItems().length !== 0;
    });

    self.ActivateMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.ChangeStatus(ids, true);
    };

    self.DeactivateMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.ChangeStatus(ids, false);
    };

    self.ChangeStatusSingle = function () {
        var id = [self.SelectedElement().MedicalArticleId()];
        self.ChangeStatus(id, !self.SelectedElement().IsActive());
    };

    self.ChangeStatus = function (ids, isActive) {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.ChangeStatusUrl,
            data: {
                ids: ids,
                isActive: isActive,
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
    };

    self.DeleteMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.DeleteSingleOrMultiple(ids);
    };

    self.Delete = function () {
        var id = [self.SelectedElement().MedicalArticleId()];
        self.DeleteSingleOrMultiple(id);
    };

    self.DeleteSingleOrMultiple = function (ids) {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.DeleteUrl,
            data: {
                ids: ids,
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
    };

    self.Search = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.SearchUrl,
            data: self.SearchCriteria().toSubmitModel(),
            success: function (e) {
                self.HandleSuccess(e);
            },
            error: self.HandleError
        });
    };

    self.HandleSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.MedicalArticles(observableItems);
        self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };

    self.currentPageSubscription = self.SearchCriteria().Paging().CurrentPage.subscribe(function (newValue) {
        self.Search();
    });

    self.dispose = function () {
        disposeComputedProperties();
        self.currentPageSubscription.dispose();
        self.SelectedElementSubscription.dispose();
    }

    self.GetContent = function (lng, newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetContentUrl,
            data: {
                contentType: lng,
                id: self.SelectedElement().MedicalArticleId()
            },
            success: function (e) {
                if (lng === 0) {
                    if (temp.MedicalArticleId() === self.SelectedElement().MedicalArticleId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().ArabicContent(e);
                        self.SelectedElement().ArabicContent(e);
                    }
                }
                else if (lng === 1) {
                    if (temp.MedicalArticleId() === self.SelectedElement().MedicalArticleId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().EnglishContent(e);
                        self.SelectedElement().EnglishContent(e);
                    }
                }
            },
            error: self.HandleError
        });
    }

    self.SelectedElementSubscription = self.SelectedElement.subscribe(function (newSE) {
        if (newSE.arabicFile() === undefined && newSE.LogoId() !== 0)
            self.GetLogo(newSE);

        if (newSE.MedicalArticleId() !== 0) {
            self.GetContent(0, newSE);
            self.GetContent(1, newSE);
        }
    });

    self.Search();
}