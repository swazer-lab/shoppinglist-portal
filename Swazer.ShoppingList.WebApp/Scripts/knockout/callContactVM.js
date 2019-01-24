function CallContactSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        return self.Paging().toSubmitModel();
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function CallContactVM(id, callerName, phoneNumber, note, responseStatus, callReason, medicalCenter) {
    var self = this;
    self.CallContactId = ko.observable(id);
    self.CallerName = ko.observable(callerName).extend({ required: true });
    self.PhoneNumber = ko.observable(phoneNumber).extend({ required: true });
    self.Note = ko.observable(note);
    self.ResponseStatus = ko.observable(responseStatus).extend({ required: true });
    self.CallReason = ko.observable(callReason).extend({ required: true });
    self.MedicalCenter = ko.observable(medicalCenter);

    self.MedicalCenterName = ko.pureComputed(function () {
        if (self.MedicalCenter() === null)
            return '';
        return self.MedicalCenter().LocalizedName;
    });
    self.MobileSubscription = self.PhoneNumber.subscribe(function (newVal) {
        forceJustMobile(self.PhoneNumber);
    });

    self.copy = function () {
        return new CallContactVM(self.CallContactId(), self.CallerName(), self.PhoneNumber(), self.Note(), self.ResponseStatus(), self.CallReason(), self.MedicalCenter());
    }

    self.toSubmitModel = function () {
        var model = {
            CallContactId: self.CallContactId(),
            CallerName: self.CallerName(),
            PhoneNumber: self.PhoneNumber(),
            Note: self.Note(),
            ResponseStatus: self.ResponseStatus().value,
            CallReasonId: self.CallReason().ContactReasonId,
        };

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

        if (self.CallerName() === undefined || self.CallerName === '')
            return false;

        if (self.PhoneNumber() === undefined || self.PhoneNumber === '')
            return false;

        if (self.CallReason() === undefined)
            return false;

        if (self.ResponseStatus() === undefined)
            return false;

        return true;
    }
}

function CallContactMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.SearchUrl = options.searchUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.EditMode = 1;
    self.CreateMode = 0;
    self.DisplayMode = 2;

    self.MedicalCenters = ko.observableArray(options.medicalCenters);

    self.SearchMedicalCenters = function (medicalCenterId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === medicalCenterId;
        });
    };

    self.CallReasons = ko.observableArray(options.callReasons);

    self.SearchCallReasons = function (callReasonId) {
        return ko.utils.arrayFirst(self.CallReasons(), function (callReason) {
            return callReason.ContactReasonId === callReasonId;
        });
    };

    self.ResponseStatuses = ko.observableArray(options.responseStatuses);

    self.SearchResponseStatuses = function (responseStatusValue) {
        return ko.utils.arrayFirst(self.ResponseStatuses(), function (responseStatus) {
            return responseStatus.value === responseStatusValue;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var medicalCenter = self.SearchMedicalCenters(item.MedicalCenterId);
            var callReason = self.SearchCallReasons(item.CallReasonId);
            var responseStatus = self.SearchResponseStatuses(item.ResponseStatus);
            return new CallContactVM(item.CallContactId, item.CallerName, item.PhoneNumber, item.Note, responseStatus, callReason, medicalCenter);
        });
    };

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.CallContacts = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();
  
    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.CallContacts().length === 0);
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
        return new CallContactVM(0, '', '', '', undefined, undefined, undefined);
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

        return ko.utils.arrayFirst(self.CallContacts(), function (element) {
            return element.CallContactId() === self.SelectedElement().CallContactId();
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
            return self.CallContacts()[0];
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
        self.CallContacts(observableItems);

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
        return ko.utils.arrayFirst(self.CallContacts(), function (temp) {
            return temp.CallContactId() === id;
        });
    }

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
        self.CallContacts(observableItems);
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