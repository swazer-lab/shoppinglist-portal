function AgendaSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.FromDate = ko.observable();
    self.ToDate = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        if (self.FromDate() !== undefined)
            criteria.FromDate = self.FromDate().format("MM/DD/YYYY");

        if (self.ToDate() !== undefined)
            criteria.ToDate = self.ToDate().format("MM/DD/YYYY");

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function AgendaConfigurationItemVM(id, fromDate, toDate, daysCount, workingDaysCount, workingPeriodsCount, appointmentsCount) {
    var self = this;

    self.AgendaConfigurationId = ko.observable(id);
    self.FromDate = ko.observable(fromDate);
    self.ToDate = ko.observable(toDate);
    self.DaysCount = ko.observable(daysCount);
    self.WorkingDaysCount = ko.observable(workingDaysCount);
    self.WorkingPeriodsCount = ko.observable(workingPeriodsCount);
    self.AppointmentsCount = ko.observable(appointmentsCount);
}

function AgendaConfigurationVM(id, from, to, maxAppointmentCount, ) {
    var self = this;

    AgendaConfigurationId = ko.observable(id);
    AllowedReservationNumber = ko.observable();
    AllowedReservationNumberId = ko.observable();
    FromDate = ko.observable();
    ToDate = ko.observable();
    MaxAppointmensCount = ko.observable();
    MaxAppointmentCountId = ko.observable();
    MedicalCenter = ko.observable();
    MedicalCenterId = ko.observable();
    MedicalClinic = ko.observable();
    MedicalClinicId = ko.observable();
    self.AgendaConfigurationItems = ko.observableArray();

    self.InitializeAppointmentsUrl = ko.pureComputed(function () {
        return InitializeAppointmentsUrl + '/' + self.DoctorId();
    });

    self.ShowAppointmentsUrl = ko.pureComputed(function () {
        return ShowAppointmentsUrl + '/' + self.DoctorId();
    });

    self.DisplayDoctorProfileUrl = ko.pureComputed(function () {
        return DisplayDoctorProfileUrl + '/' + self.DoctorId();
    });
}

function AgendaMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.Mode = ko.observable();
    self.DoctorName = ko.observable();
    self.DoctorNationality = ko.observable();
    self.Agendas = ko.observableArray();

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            return new AgendaConfigurationVM(item.DoctorId, item.Name, item.Center);
        });
    };

    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Doctors = ko.observableArray(self.mapItems(options.items));
    self.Spinning = ko.observable(false);

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Doctors().length === 0);
    });

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.EnterNoResultMode = function () {
        self.Mode(self.NoResultMode);
    }

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
        self.Doctors(observableItems);
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
}