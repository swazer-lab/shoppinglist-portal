function WorkPeriodSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        return self.Paging().toSubmitModel();
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function WorkPeriodVM(id, arabicName, englishName, fromHour, toHour, maxHour, minHour, appointmentPeriod) {
    var self = this;

    self.WorkPeriodId = ko.observable(id);
    self.ArabicName = ko.observable(arabicName).extend({ required: true });
    self.EnglishName = ko.observable(englishName).extend({ required: true });
    self.FromHour = ko.observable(fromHour).extend({ required: true, min: minHour, max: maxHour });
    self.ToHour = ko.observable(toHour).extend({ required: true, min: minHour, max: maxHour });
    self.MaxHour = ko.observable(maxHour);
    self.MinHour = ko.observable(minHour);
    self.AppointmentPeriod = ko.observable(appointmentPeriod).extend({ required: true });

    self.copy = function () {
        return new WorkPeriodVM(self.WorkPeriodId(), self.ArabicName(), self.EnglishName(), self.FromHour(), self.ToHour(), self.MaxHour(), self.MinHour(), self.AppointmentPeriod());
    }

    self.toSubmitModel = function () {
        return {
            WorkPeriodId: self.WorkPeriodId(),
            ArabicName: self.ArabicName(),
            EnglishName: self.EnglishName(),
            ToHour: self.ToHour(),
            FromHour: self.FromHour(),
            AppointmentPeriodId: self.AppointmentPeriod().AppointmentPeriodId,
        };
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.ArabicName() === undefined || self.ArabicName() === '')
            return false;

        if (self.EnglishName() === undefined || self.EnglishName() === '')
            return false;

        if (self.FromHour() === undefined || self.FromHour() === '')
            return false;

        if (self.ToHour() === undefined || self.ToHour() === '')
            return false;

        if (self.FromHour() < self.MinHour() || self.FromHour() > self.MaxHour())
            return false;

        if (self.ToHour() < self.MinHour() || self.ToHour() > self.MaxHour())
            return false;

        if (self.AppointmentPeriod() === undefined || self.AppointmentPeriod() === '')
            return false;

        return true;
    }
}

function WorkPeriodMainVM(options) {
    var self = this;

    self.EditUrl = options.editUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;

    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;


    self.AppointmentPeriods = ko.observableArray(options.appointmentPeriods);
    self.SearchAppointmentPeriods = function (appPerId) {
        return ko.utils.arrayFirst(self.AppointmentPeriods(), function (ap) {
            return ap.AppointmentPeriodId === appPerId;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var ap = self.SearchAppointmentPeriods(item.AppointmentPeriodId);
            return new WorkPeriodVM(item.WorkPeriodId, item.ArabicName, item.EnglishName, item.FromHour, item.ToHour, item.MaxHour, item.MinHour, ap);
        });
    };

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.WorkPeriods = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.WorkPeriods().length === 0);
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

        return ko.utils.arrayFirst(self.WorkPeriods(), function (element) {
            return element.WorkPeriodId() === self.SelectedElement().WorkPeriodId();
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
            return self.WorkPeriods()[0];
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

    self.GetUrl = function () {
        if (self.Mode() === self.EditMode)
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
        self.WorkPeriods(observableItems);

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
        return ko.utils.arrayFirst(self.WorkPeriods(), function (temp) {
            return temp.WorkPeriodId() === id;
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
        self.WorkPeriods(observableItems);
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