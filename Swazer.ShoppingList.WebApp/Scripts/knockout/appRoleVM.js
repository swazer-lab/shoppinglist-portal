function AppRoleSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.ArabicRoleName = ko.observable();
    self.EnglishRoleName = ko.observable();
    self.SelectedStatus = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();
        criteria.ArabicRoleName = self.ArabicRoleName();
        criteria.EnglishRoleName = self.EnglishRoleName();

        if (self.SelectedStatus())
            criteria.IsActive = self.SelectedStatus().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function AppRoleVM(id, arabicRoleName, englishRoleName, isActive, isMarked, regionChecked,
    contentChecked, photoChecked, videoChecked, medicalArticleChecked, newsChecked,
    medicalCenterChecked, medicalVisitReasonChecked, offer) {
    var self = this;

    self.IsMarked = ko.observable(isMarked);
    self.RegionManagement = ko.observable(regionChecked);
    self.ContentManagement = ko.observable(contentChecked);
    self.PhotoManagement = ko.observable(photoChecked);
    self.VideoManagement = ko.observable(videoChecked);
    self.MedicalArticleManagement = ko.observable(medicalArticleChecked);
    self.NewsManagement = ko.observable(newsChecked);
    self.MedicalCenter = ko.observable(medicalCenterChecked);
    self.MedicalVisitReason = ko.observable(medicalVisitReasonChecked);
    self.Offer = ko.observable(offer);
    self.AppRoleId = ko.observable(id);
    self.ArabicRoleName = ko.observable(arabicRoleName).extend({ required: true });
    self.EnglishRoleName = ko.observable(englishRoleName).extend({ required: true });
    self.IsActive = ko.observable(isActive).extend({ required: true });

    self.copy = function () {
        return new AppRoleVM(self.AppRoleId(), self.ArabicRoleName(), self.EnglishRoleName(), self.IsActive(), self.IsMarked(), self.RegionManagement(),
            self.ContentManagement(), self.PhotoManagement(), self.VideoManagement(), self.MedicalArticleManagement(), self.NewsManagement(),
            self.MedicalCenter(), self.MedicalVisitReason(), self.Offer());
    }

    self.toSubmitModel = function () {
        return {
            AppRoleId: self.AppRoleId(),

            ArabicRoleName: self.ArabicRoleName(),
            EnglishRoleName: self.EnglishRoleName(),
            RegionManagement: self.RegionManagement(),
            ContentManagement: self.ContentManagement(),
            PhotoManagement: self.PhotoManagement(),
            VideoManagement: self.VideoManagement(),
            MedicalArticleManagement: self.MedicalArticleManagement(),
            NewsManagement: self.NewsManagement(),
            MedicalVisitReason: self.MedicalVisitReason(),
            MedicalCenter: self.MedicalCenter(),
            Offer: self.Offer()
        };
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.ArabicRoleName() === undefined || self.ArabicRoleName() === '')
            return false;

        if (self.EnglishRoleName() === undefined || self.EnglishRoleName() === '')
            return false;

        return true;
    }
}

function AppRoleMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.ActivationOptions = ko.observableArray(options.activationOptions);

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var result = new AppRoleVM(item.AppRoleId, item.ArabicRoleName, item.EnglishRoleName, item.IsActive, false, item.RegionManagement, item.ContentManagement
                , item.PhotoManagement, item.VideoManagement, item.MedicalArticleManagement, item.NewsManagement, item.MedicalCenter, item.MedicalVisitReason, item.Offer);

            if (self.IsMarkedAppRole(item.AppRoleId))
                result.IsMarked(true);
            else
                result.IsMarked(false);

            return result;
        });
    };

    self.IsMarkedAppRole = function (id) {
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
    self.AppRoles = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.AppRoles().length === 0);
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
        return new AppRoleVM(0, '', '', false, false, false, false, false, false, false, false, false, false, false);
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

        return ko.utils.arrayFirst(self.AppRoles(), function (element) {
            return element.AppRoleId() === self.SelectedElement().AppRoleId();
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
            return self.AppRoles()[0];
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
        self.AppRoles(observableItems);

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
        return ko.utils.arrayFirst(self.AppRoles(), function (temp) {
            return temp.AppRoleId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.AppRoles(), function (r) {
            if (r.IsMarked() === true)
                self.SelectedItemsIds().push(r.AppRoleId());
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
        var id = [self.SelectedElement().AppRoleId()];
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
        var id = [self.SelectedElement().AppRoleId()];
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
        self.AppRoles(observableItems);
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
    }

    self.OpenDeleteModal = function (val) {
        if (val === "multi")
            self.IsMultipleDelete(true);
        else
            self.IsMultipleDelete(false);

        self.ShowDeleteModal(true);
    }

    self.Search();
}