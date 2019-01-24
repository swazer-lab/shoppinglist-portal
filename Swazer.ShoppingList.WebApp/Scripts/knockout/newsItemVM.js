function NewsItemSearchCriteriaVM(options) {
    var self = this;

    self.MedicalCenter = ko.observable();
    self.ArabicTitle = ko.observable();
    self.EnglishTitle = ko.observable();
    self.PublishingStatus = ko.observable();
    self.TargetedGender = ko.observable();

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.ArabicTitle = self.ArabicTitle();
        criteria.EnglishTitle = self.EnglishTitle();

        if (self.MedicalCenter())
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.PublishingStatus())
            criteria.PublishingStatus = self.PublishingStatus().value;

        if (self.TargetedGender())
            criteria.TargetedGender = self.TargetedGender().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function NewsItemVM(id, supportEnglish, supportArabic, medicalCenter, arabicTitle, englishTitle, arabicContent, englishContent, newsItemDate, targetedGender, publishingStatus, photoId, photoAsString, isActive) {
    var self = this;

    self.IsMarked = ko.observable();
    self.SupportArabic = ko.observable(supportArabic);
    self.SupportEnglish = ko.observable(supportEnglish);
    self.NewsItemId = ko.observable(id);
    self.MedicalCenter = ko.observable(medicalCenter).extend({ required: true });
    self.ArabicTitle = ko.observable(arabicTitle).extend({ required: true });
    self.EnglishTitle = ko.observable(englishTitle).extend({ required: true });
    self.ArabicContent = ko.observable(arabicContent).extend({ required: true });
    self.EnglishContent = ko.observable(englishContent).extend({ required: true });
    self.IsActive = ko.observable(isActive);
    self.TargetedGender = ko.observable(targetedGender);
    self.PublishingStatus = ko.observable(publishingStatus).extend({ required: true });
    self.NewsItemDateJs = ko.observable(newsItemDate).extend({ required: true });

    self.NewsItemDate = ko.pureComputed({
        read: function () {
            return moment(self.NewsItemDateJs());
        },
        write: function (value) {
            var s = convertMomentToUnix(value);
            self.NewsItemDateJs(s);
        }
    });

    self.NewsItemDateDisplay = ko.pureComputed(function () {
        if (!self.NewsItemDate())
            return '';
        return self.NewsItemDate().format("M/D/YYYY");
    });

    self.PhotoId = ko.observable(photoId).extend({ required: true });

    self.arabicFile = ko.observable(photoAsString).extend({ required: true });

    self.copy = function () {
        return new NewsItemVM(self.NewsItemId(), self.SupportEnglish(), self.SupportArabic(), self.MedicalCenter(), self.ArabicTitle(), self.EnglishTitle(), self.ArabicContent(), self.EnglishContent(), self.NewsItemDate(), self.TargetedGender(), self.PublishingStatus(), self.PhotoId(), self.arabicFile(), self.IsActive());
    }

    self.toSubmitModel = function () {
        var model = {
            NewsItemId: self.NewsItemId(),
            SupportArabic: self.SupportArabic(),
            SupportEnglish: self.SupportEnglish(),
            MedicalCenterId: self.MedicalCenter().MedicalCenterId,
            ArabicTitle: self.ArabicTitle(),
            EnglishTitle: self.EnglishTitle(),
            ArabicContent: self.ArabicContent(),
            EnglishContent: self.EnglishContent(),
            PublishingStatus: self.PublishingStatus(),
            NewsItemDate: self.NewsItemDate().format("MM/DD/YYYY"),
            NewsItemPhoto: self.arabicFile(),
            NewsItemPhotoId: self.PhotoId(),
        };

        if (self.PublishingStatus() !== undefined)
            model.PublishingStatus = self.PublishingStatus().value;

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
        if (self.NewsItemDateJs() === undefined || self.NewsItemDateJs() === '')
            return false;

        if (self.MedicalCenter() === undefined)
            return false;

        if (self.PublishingStatus() === undefined)
            return false;

        if (self.arabicFile() === undefined || self.arabicFile() === '')
            return false;

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

        return true;
    }
}

function NewsItemMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;
    self.GetLogoUrl = options.getLogoUrl;
    self.GetContentUrl = options.getContentUrl;
    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.TargetedGenders = ko.observableArray(options.genders);
    self.PublishingStatuses = ko.observableArray(options.publishingStatuses);
    self.MedicalCenters = ko.observable(options.medicalCenters);

    self.SearchTargetedGender = function (targetGenderValue) {
        return ko.utils.arrayFirst(self.TargetedGenders(), function (targetedGenger) {
            return targetedGenger.value === targetGenderValue;
        });
    };

    self.SearchMedicalCenter = function (medicalCenterId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === medicalCenterId;
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
            var medicalCenter = self.SearchMedicalCenter(item.MedicalCenterId);
            var result = new NewsItemVM(item.NewsItemId, item.SupportEnglish, item.SupportArabic, medicalCenter, item.ArabicTitle, item.EnglishTitle, item.ArabicContent, item.EnglishContent, item.NewsItemDate, targetedGender, publishingStatus, item.NewsItemPhotoId, undefined, item.IsActive);

            if (self.IsMarkedNewsItem(item.NewsItemId))
                result.IsMarked(true);
            else
                result.IsMarked(false);

            return result;
        });
    };

    self.IsMarkedNewsItem = function (id) {
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
    self.NewsItems = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.NewsItems().length === 0);
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
        return new NewsItemVM(0, false, false, undefined, '', '', '', '', '', undefined, undefined, 0, undefined, false);
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

        return ko.utils.arrayFirst(self.NewsItems(), function (element) {
            return element.NewsItemId() === self.SelectedElement().NewsItemId();
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
            return self.NewsItems()[0];
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

   

    self.HandleCreateSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.NewsItems(observableItems);

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
        return ko.utils.arrayFirst(self.NewsItems(), function (temp) {
            return temp.NewsItemId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.NewsItems(), function (r) {
            if (r.IsMarked() === true)
                self.SelectedItemsIds().push(r.NewsItemId());
            return r.IsMarked() === true;
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
        var id = [self.SelectedElement().NewsItemId()];
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
        var id = [self.SelectedElement().NewsItemId()];
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
        self.NewsItems(observableItems);
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
                id: self.SelectedElement().NewsItemId()
            },
            success: function (e) {
                if (lng === 0) {
                    if (temp.NewsItemId() === self.SelectedElement().NewsItemId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().ArabicContent(e);
                        self.SelectedElement().ArabicContent(e);
                    }
                }
                else if (lng === 1) {
                    if (temp.NewsItemId() === self.SelectedElement().NewsItemId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().EnglishContent(e);
                        self.SelectedElement().EnglishContent(e);
                    }
                }
            },
            error: self.HandleError
        });
    }

    self.GetLogo = function (newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetLogoUrl,
            data: {
                logoId: temp.PhotoId(),
            },
            success: function (e) {
                if (temp.NewsItemId() === self.SelectedElement().NewsItemId()) {
                    if (self.Mode() === self.EditMode)
                        self.EditedElement().arabicFile(e);
                    self.SelectedElement().arabicFile(e);
                }
            },
            error: self.HandleError
        });
    }

    self.SelectedElementSubscription = self.SelectedElement.subscribe(function (newSE) {
        if (newSE.arabicFile() === undefined && newSE.PhotoId() !== 0)
            self.GetLogo(newSE);

        if (newSE.NewsItemId() !== 0) {
            self.GetContent(0, newSE);
            self.GetContent(1, newSE);
        }
    });

    self.Search();
}