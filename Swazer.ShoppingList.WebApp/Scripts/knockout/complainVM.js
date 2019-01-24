function ComplainSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.ComplainType = ko.observable();
    self.ComplainStatus = ko.observable();
    self.ComplainId = ko.observable();
    self.UserPhoneNumber = ko.observableArray();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.PhoneNumber = self.UserPhoneNumber();

        criteria.ComplainId = self.ComplainId();

        if (self.ComplainType())
            criteria.ComplainTypeId = self.ComplainType().ComplainTypeId;

        if (self.ComplainStatus())
            criteria.ComplainStatusId = self.ComplainStatus().ComplainStatusId;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function ComplainVM(id, description, complainType, complainStatus, complainStatement, internalNote, userName, phoneNumber, createdAt, genderDisplay, userType) {
    var self = this;
    self.ComplainId = ko.observable(id);
    self.Description = ko.observable(description);
    self.ComplainType = ko.observable(complainType);
    self.UserTypeDisplay = ko.observable(userType);
    self.ComplainStatus = ko.observable(complainStatus).extend({ required: true });
    self.ComplainStatement = ko.observable(complainStatement).extend({ required: true });
    self.InternalNote = ko.observable(internalNote);
    self.GenderDisplay = ko.observable(genderDisplay);
    self.CreatedAt = ko.observable(moment(createdAt));
    self.UserName = ko.observable(userName);
    self.PhoneNumber = ko.observable(phoneNumber);

    self.copy = function () {
        return new ComplainVM(self.ComplainId(), self.Description(), self.ComplainType(), self.ComplainStatus(), self.ComplainStatement(), self.InternalNote(), self.UserName(), self.PhoneNumber(), self.CreatedAt(), self.GenderDisplay(), self.UserTypeDisplay());
    }

    self.toSubmitModel = function () {
        return {
            ComplainId: self.ComplainId(),
            ComplainStatusId: self.ComplainStatus().ComplainStatusId,
            ComplainStatement: self.ComplainStatement(),
            InternalNote: self.InternalNote(),
        };
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.ComplainStatus() === undefined)
            return false;

        if (!self.ComplainStatement())
            return false;

        return true;
    }
}

function ComplainMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;

    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;

    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.Complains = ko.observable(options.complains);
    self.ComplainStatuses = ko.observable(options.complainStatuses);
    self.ComplainTypes = ko.observable(options.complainTypes);
    self.SearchComplainStatuses = function (complainStatusId) {
        return ko.utils.arrayFirst(self.ComplainStatuses(), function (complainStatus) {
            return complainStatus.ComplainStatusId === complainStatusId;
        });
    };

    self.SearchComplainTypes = function (complainTypeId) {
        return ko.utils.arrayFirst(self.ComplainTypes(), function (complainType) {
            return complainType.ComplainTypeId === complainTypeId;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var complainStatus = self.SearchComplainStatuses(item.ComplainStatusId);
            var complainType = self.SearchComplainTypes(item.ComplainTypeId);
            return new ComplainVM(item.ComplainId, item.Description, complainType, complainStatus, item.ComplainStatement, item.InternalNote, item.UserName, item.PhoneNumber, item.CreatedAt, item.GenderDisplay, item.UserTypeDisplay);
        });
    };

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Items = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Items().length === 0);
    });

    self.IsEditMode = ko.pureComputed(function () {
        var mode = self.Mode();
        return (mode === self.EditMode);
    });

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsEditMode() && !self.IsNoResultMode();
    });

    self.EnterEditMode = function () {
        self.PanelTitle(self.EditModePanelTitle);
        self.Mode(self.EditMode);
        self.EditedElement(self.SelectedElement().copy());
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

        return ko.utils.arrayFirst(self.Items(), function (element) {
            return element.ComplainId() === self.SelectedElement().ComplainId();
        });
    };

    self.GetSelectedElementOrFirstOrNew = function () {
        var founded = self.FindSelectedElement();
        if (founded) {
            self.EnterDetailsMode();
            return founded;
        }

        if (self.IsItemsEmpty() === false) {
            self.EnterDetailsMode();
            return self.Items()[0];
        }

        self.EnterNoResultMode();
        return undefined;
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

    self.Cancel = function () {
        if (self.Mode() === self.EditMode)
            self.EnterDetailsMode();
        else if (self.Mode() === self.CreateMode)
            self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
    };

    self.ChangeStatus = function () {

        if (!self.EditedElement().FullValidation()) {
            self.EditedElement().ShowErrors();
            return false;
        }

        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.ChangeStatusUrl,
            data: {
                viewModel: self.EditedElement().toSubmitModel(),
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });

        return false;
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
        self.Items(observableItems);
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

    self.Search();
}