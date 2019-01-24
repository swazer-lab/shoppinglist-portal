function AppointmentTableSearchCriteriaVm(options) {
    var self = this;

    self.FromDate = ko.observable();
    self.ToDate = ko.observable();

    self.MedicalCenterId = ko.observable(options.MedicalCenterId);
    self.MedicalClinicId = ko.observable(options.MedicalClinicId);
    self.DoctorId = ko.observable(options.DoctorId);

    self.toSubmitModel = function () {
        var criteria = {
            MedicalCenterId: self.MedicalCenterId(),
            MedicalClinicId: self.MedicalClinicId(),
            DoctorId: self.DoctorId(),
        };

        if (self.FromDate() !== undefined && self.FromDate().isValid)
            criteria.FromDate = self.FromDate().format("M/D/YYYY");

        if (self.ToDate() !== undefined && self.ToDate().isValid)
            criteria.ToDate = self.ToDate().format("M/D/YYYY");
        return criteria;
    };
}

function AppointmentTableMainVm(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;

    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.Items = ko.observable(options.items);
    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsNoResultMode();
    });

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Items().length === 0);
    });

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)
            self.Search();
        return true;
    };

    self.ShowSpinning = function () {
        self.Spinning(true);
    };

    self.HideSpinning = function () {
        self.Spinning(false);
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
        self.Items(e.Items);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}