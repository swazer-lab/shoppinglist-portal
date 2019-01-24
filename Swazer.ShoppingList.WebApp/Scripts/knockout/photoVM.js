function PhotoSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.ArabicTitle = ko.observable();
    self.EnglishTitle = ko.observable();
    self.MedicalCenter = ko.observable();
    self.PublishingStatus = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.ArabicTitle = self.ArabicTitle();
        criteria.EnglishTitle = self.EnglishTitle();

        if (self.MedicalCenter())
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.PublishingStatus())
            criteria.PublishingStatus = self.PublishingStatus().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function PhotoVM(id, englishTitle, arabicTitle, medicalCenters, medicalCenterIds, publishingStatus, attachmentId, photoAsString, isActive) {
    var self = this;

    self.PhotoId = ko.observable(id);
    self.IsMarked = ko.observable();
    self.EnglishTitle = ko.observable(englishTitle).extend({ required: true });
    self.ArabicTitle = ko.observable(arabicTitle).extend({ required: true });
    self.PublishingStatus = ko.observable(publishingStatus).extend({ required: true });
    self.IsActive = ko.observable(isActive);
    self.AttachmentId = ko.observable(attachmentId);
    self.MedicalCenters = ko.observableArray(medicalCenters);
    self.MedicalCentersIds = ko.observableArray(medicalCenterIds);

    self.MedicalCentersNames = ko.pureComputed(function () {
        return ko.utils.arrayMap(self.MedicalCenters(), function (m) {
            return m.LocalizedName;
        }).join();
    });

    self.arabicFile = ko.observable(photoAsString).extend({ required: true });

    self.copy = function () {
        return new PhotoVM(self.PhotoId(), self.EnglishTitle(), self.ArabicTitle(), self.MedicalCenters(), self.MedicalCentersIds(), self.PublishingStatus(), self.AttachmentId(), self.arabicFile());
    }

    self.toSubmitModel = function () {
        var model = {
            PhotoId: self.PhotoId(),

            EnglishTitle: self.EnglishTitle(),
            ArabicTitle: self.ArabicTitle(),
            MedicalCenters: [],
            PublishingStatus: self.PublishingStatus().value,
            AttachmentId: self.AttachmentId(),
            Photo: self.arabicFile(),
        };

        ko.utils.arrayForEach(self.MedicalCentersIds(), function (id) {
            model.MedicalCenters.push(id);
        });

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

        if (self.PublishingStatus() === undefined)
            return false;

        if (self.MedicalCentersIds() === undefined || self.MedicalCentersIds().length === 0)
            return false;

        if (self.arabicFile() === undefined || self.arabicFile() === '')
            return false;

        return true;
    }
}

function PhotoMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.SearchUrl = options.searchUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.GetPictureUrl = options.getPictureUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2
    self.NoResultMode = 3;

    self.MedicalCenters = ko.observableArray(options.medicalCenters);

    self.ActiveMedicalCenters = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.MedicalCenters(), function (e) {
            return e.IsActive === true;
        });
    });

    self.SearchMedicalCenters = function (medicalCenterId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === medicalCenterId;
        });
    };

    self.PublishingStatuses = ko.observableArray(options.publishingStatuses);

    self.SearchPublishingStatus = function (publishingStatusValue) {
        return ko.utils.arrayFirst(self.PublishingStatuses(), function (publishingStatus) {
            return publishingStatus.value === publishingStatusValue;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var publishingStatus = self.SearchPublishingStatus(item.PublishingStatus);
            var mcs = ko.utils.arrayMap(item.MedicalCenters, function (e) {
                return self.SearchMedicalCenters(e);
            });

            var mcsIds = ko.utils.arrayMap(item.MedicalCenters, function (e) {
                return self.SearchMedicalCenters(e).MedicalCenterId;
            });

            var result = new PhotoVM(item.PhotoId, item.EnglishTitle, item.ArabicTitle, mcs, mcsIds, publishingStatus, item.AttachmentId, undefined, item.IsActive);

            if (self.IsMarkedPhoto(item.PhotoId))
                result.IsMarked(true);
            else
                result.IsMarked(false);

            return result;
        });
    };

    self.IsMarkedPhoto = function (id) {
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
    self.Photos = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Photos().length === 0);
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
        return new PhotoVM(0, '', '', undefined, undefined, undefined, undefined, undefined, false);
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

        return ko.utils.arrayFirst(self.Photos(), function (element) {
            return element.PhotoId() === self.SelectedElement().PhotoId();
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
            return self.Photos()[0];
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


    self.GetPicture = function (newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetPictureUrl,
            data: {
                logoId: self.SelectedElement().AttachmentId(),
            },
            success: function (e) {
                if (temp.PhotoId() === self.SelectedElement().PhotoId()) {
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

    self.HandleCreateSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.Photos(observableItems);

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
        return ko.utils.arrayFirst(self.Photos(), function (temp) {
            return temp.PhotoId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.Photos(), function (r) {
            if (r.IsMarked() === true)
                self.SelectedItemsIds().push(r.PhotoId());
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
        var id = [self.SelectedElement().PhotoId()];
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
        var id = [self.SelectedElement().PhotoId()];
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
        self.Photos(observableItems);
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

    self.SelectedElementSubscription = self.SelectedElement.subscribe(function (newSE) {
        if (newSE.arabicFile() === undefined && newSE.AttachmentId() !== undefined)
            self.GetPicture(newSE);
    });

    self.Search();
}