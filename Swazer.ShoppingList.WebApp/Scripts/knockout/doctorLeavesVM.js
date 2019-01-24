function DoctorLeavesSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.LeaveType = ko.observable();
    self.FromDate = ko.observable();
    self.ToDate = ko.observable();
    self.DoctorId = ko.observable(options.doctorId);

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.DoctorId = self.DoctorId();

        if (self.FromDate() !== undefined)
            criteria.From = self.FromDate().format("MM/DD/YYYY");

        if (self.ToDate() !== undefined)
            criteria.To = self.ToDate().format("MM/DD/YYYY");

        if (self.LeaveType() !== undefined)
            criteria.LeaveTypeId = self.LeaveType().LeaveTypeId;

        return criteria;

    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function LeaveVM(id, startDate, endDate, notes, doctorId, leaveType) {
    var self = this;

    self.DoctorId = doctorId;
    self.LeaveId = ko.observable(id);
    self.LeaveType = ko.observable(leaveType).extend({ required: true });

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

    self.Notes = ko.observable(notes);

    self.copy = function () {
        return new LeaveVM(self.LeaveId(), self.StartDate(), self.EndDate(), self.Notes(), self.DoctorId(), self.LeaveType());
    }

    self.toSubmitModel = function () {
        return {
            LeaveId: self.LeaveId(),
            DoctorId: self.DoctorId,
            Start: self.StartDate().format("MM/DD/YYYY"),
            End: self.EndDate().format("MM/DD/YYYY"),
            Notes: self.Notes(),
            LeaveTypeId: self.LeaveType().LeaveTypeId,
        };
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.StartDateJs() === undefined || self.StartDateJs() === "")
            return false;

        if (self.EndDateJs() === undefined || self.EndDateJs() === "")
            return false;

        if (self.LeaveType() === undefined)
            return false;

        return true;
    }
}

function DoctorLeavesVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;
    self.SelectedDoctorId = options.selectedDoctorId;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.Doctor = ko.observable(options.doctor);
    self.LeaveTypes = ko.observableArray(options.leaveTypes);

    self.SearchLeaveTypes = function (leaveTypeId) {
        return ko.utils.arrayFirst(self.LeaveTypes(), function (leaveType) {
            return leaveType.LeaveTypeId === leaveTypeId;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var leaveType = self.SearchLeaveTypes(item.LeaveTypeId);
            return new LeaveVM(item.LeaveId, item.Start, item.End, item.Notes, item.DoctorId, leaveType);
        });
    };

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Leaves = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Leaves().length === 0);
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
        return new LeaveVM(0, '', '', '', self.SelectedDoctorId, undefined);
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

        return ko.utils.arrayFirst(self.Leaves(), function (element) {
            return element.LeaveId() === self.SelectedElement().LeaveId();
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
            return self.Leaves()[0];
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
        self.Leaves(observableItems);

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
        return ko.utils.arrayFirst(self.Leaves(), function (temp) {
            return temp.LeaveId() === id;
        });
    }

    self.Delete = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.DeleteUrl,
            data: {
                id: self.SelectedElement().LeaveId(),
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
    };

    self.ChangeStatus = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.ChangeStatusUrl,
            data: {
                id: self.SelectedElement().LeaveId(),
                isActive: !self.SelectedElement().IsActive(),
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
        self.Leaves(observableItems);
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

    self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
}