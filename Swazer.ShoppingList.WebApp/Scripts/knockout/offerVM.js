function OfferSearchCriteriaVM(options) {
    var self = this;

    self.ArabicTitle = ko.observable();
    self.EnglishTitle = ko.observable();
    self.MedicalCenter = ko.observable();
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
            criteria.Gender = self.TargetedGender().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function OfferVM(id, englishTitle, arabicTitle, englishContent, arabicContent, startDate, endDate, targetedGender, publishingStatus, arabicPhotoId, arabicPhotoAsString, englishPhotoId, englishPhotoAsString, isActive, medicalCenter) {
    var self = this;

    self.IsMarked = ko.observable();
    self.OfferId = ko.observable(id);
    self.EnglishTitle = ko.observable(englishTitle).extend({ required: true });
    self.ArabicTitle = ko.observable(arabicTitle).extend({ required: true });
    self.ArabicContent = ko.observable(arabicContent).extend({ required: true });
    self.EnglishContent = ko.observable(englishContent).extend({ required: true });
    self.IsActive = ko.observable(isActive);

    self.StartDateJs = ko.observable(startDate).extend({ required: true });

    self.StartDate = ko.pureComputed({
        read: function () {
            return moment(self.StartDateJs());
        },
        write: function (value) {
            var s = convertMomentToUnix(value);
            self.StartDateJs(s);
        }
    });

    self.StartDateDisplay = ko.pureComputed(function () {
        if (!self.StartDate())
            return '';
        return self.StartDate().format("M/D/YYYY");
    });

    self.EndDateJs = ko.observable(endDate).extend({ required: true });

    self.EndDate = ko.pureComputed({
        read: function () {
            return moment(self.EndDateJs());
        },
        write: function (value) {
            var s = convertMomentToUnix(value);
            self.EndDateJs(s);
        }
    });

    self.EndDateDisplay = ko.pureComputed(function () {
        if (!self.EndDate())
            return '';
        return self.EndDate().format("M/D/YYYY");
    });

    self.MedicalCenter = ko.observable(medicalCenter);
    self.TargetedGender = ko.observable(targetedGender);
    self.PublishingStatus = ko.observable(publishingStatus).extend({ required: true });
    self.ArabicPhotoId = ko.observable(arabicPhotoId);
    self.EnglishPhotoId = ko.observable(englishPhotoId);

    self.arabicFile = ko.observable(arabicPhotoAsString).extend({ required: true });
    self.englishFile = ko.observable(englishPhotoAsString).extend({ required: true });

    self.copy = function () {
        return new OfferVM(self.OfferId(), self.EnglishTitle(), self.ArabicTitle(), self.EnglishContent(), self.ArabicContent(), self.StartDate(),
            self.EndDate(), self.TargetedGender(), self.PublishingStatus(), self.ArabicPhotoId(), self.arabicFile(), self.EnglishPhotoId(),
            self.englishFile(), self.IsActive(), self.MedicalCenter());
    }

    self.toSubmitModel = function () {
        var model = {
            OfferId: self.OfferId(),
            EnglishTitle: self.EnglishTitle(),
            ArabicTitle: self.ArabicTitle(),
            ArabicContent: self.ArabicContent(),
            EnglishContent: self.EnglishContent(),
            StartDate: self.StartDate().format("MM/DD/YYYY"),
            EndDate: self.EndDate().format("MM/DD/YYYY"),
            PublishingStatus: self.PublishingStatus().value,
            ArabicPhoto: self.arabicFile(),
            EnglishPhoto: self.englishFile(),
            EnglishPhotoId: self.EnglishPhotoId(),
            ArabicPhotoId: self.ArabicPhotoId(),
            IsActive: self.IsActive(),
        };

        if (self.TargetedGender() !== undefined)
            model.Gender = self.TargetedGender().value;

        if (self.MedicalCenter() !== undefined)
            model.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        return model;
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.EnglishTitle() === undefined || self.EnglishTitle() === '')
            return false;

        if (self.ArabicTitle() === undefined || self.ArabicTitle() === '')
            return false;

        if (self.ArabicContent() === undefined || self.ArabicContent() === '')
            return false;

        if (self.EnglishContent() === undefined || self.EnglishContent() === '')
            return false;

        if (self.StartDateJs() === undefined || self.StartDateJs() === false)
            return false;

        if (self.EndDateJs() === undefined || self.EndDateJs() === "")
            return false;

        if (self.PublishingStatus() === undefined)
            return false;

        if (self.arabicFile() === undefined || self.arabicFile() === '')
            return false;

        if (self.englishFile() === undefined || self.englishFile() === '')
            return false;

        return true;
    }
}

function OfferMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.SearchUrl = options.searchUrl;
    self.GetLogoUrl = options.getLogoUrl;
    self.GetContentUrl = options.getContentUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.TargetedGenders = ko.observableArray(options.genders);
    self.PublishingStatuses = ko.observableArray(options.publishingStatuses);

    self.SearchMedicalCenter = function (medicalCenterId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenterId === medicalCenter.MedicalCenterId;
        });
    }

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
            var targetedGender = self.SearchTargetedGender(item.Gender);
            var publishingStatus = self.SearchPublishingStatus(item.PublishingStatus);
            var medicalCenter = self.SearchMedicalCenter(item.MedicalCenterId);

            var result = new OfferVM(item.OfferId, item.EnglishTitle, item.ArabicTitle, item.EnglishContent, item.ArabicContent, item.StartDate, item.EndDate, targetedGender, publishingStatus, item.ArabicPhotoId, undefined, item.EnglishPhotoId, undefined, item.IsActive, medicalCenter);

            if (self.IsMarkedOffer(item.OfferId))
                result.IsMarked(true);
            else
                result.IsMarked(false);

            return result;
        });
    };

    self.IsMarkedOffer = function (id) {
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

    self.Offers = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Offers().length === 0)
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
        return new OfferVM(0, '', '', '', '', '', '', undefined, undefined, 0, undefined, 0, undefined, false, undefined);
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

        return ko.utils.arrayFirst(self.Offers(), function (element) {
            return element.OfferId() === self.SelectedElement().OfferId();
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
            return self.Offers()[0];
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
        row.englishFile(undefined);
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

    self.GetArabicLogo = function (newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetLogoUrl,
            data: {
                logoId: self.SelectedElement().ArabicPhotoId(),
            },
            success: function (e) {
                if (temp.OfferId() === self.SelectedElement().OfferId()) {
                    if (self.Mode() === self.EditMode)
                        self.EditedElement().arabicFile(e);
                    self.SelectedElement().arabicFile(e);
                }
            },
            error: function (e) {
                self.HandleError();
            }
        });
    }

    self.GetEnglishLogo = function (newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetLogoUrl,
            data: {
                logoId: self.SelectedElement().EnglishPhotoId(),
            },
            success: function (e) {
                if (temp.OfferId() === self.SelectedElement().OfferId()) {
                    if (self.Mode() === self.EditMode)
                        self.EditedElement().englishFile(e);
                    self.SelectedElement().englishFile(e);
                }
            },
            error: function (e) {
                self.HandleError();
            }
        });
    }

    self.HandleCreateSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.Offers(observableItems);

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
        return ko.utils.arrayFirst(self.Offers(), function (temp) {
            return temp.OfferId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.Offers(), function (r) {
            if (r.IsMarked() === true)
                self.SelectedItemsIds().push(r.OfferId());
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
        var id = [self.SelectedElement().OfferId()];
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
        var id = [self.SelectedElement().OfferId()];
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
        self.Offers(observableItems);
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
            data:
            {
                contentType: lng,
                id: self.SelectedElement().OfferId()
            },
            success: function (e) {
                if (lng === 0) {
                    if (temp.OfferId() === self.SelectedElement().OfferId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().ArabicContent(e);
                        self.SelectedElement().ArabicContent(e);
                    }
                }
                else if (lng === 1) {
                    if (temp.OfferId() === self.SelectedElement().OfferId()) {
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
        if ((newSE.englishFile() === undefined && newSE.EnglishPhotoId()) !== 0 && (newSE.arabicFile() === undefined && newSE.ArabicPhotoId() !== 0)) {
            self.GetArabicLogo(newSE);
            self.GetEnglishLogo(newSE);
        }

        if (newSE.OfferId() !== 0) {
            self.GetContent(0, newSE);
            self.GetContent(1, newSE);
        }
    });

    self.Search();
}