function AppointmentManagementDoctorSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.MedicalCenter = ko.observable();
    self.MedicalClinic = ko.observable();
    self.Doctor = ko.observable();
    self.Phone = ko.observable();
    self.ReservationStatus = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        if (self.MedicalCenter())
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.MedicalClinic())
            criteria.MedicalClinicId = self.MedicalClinic().MedicalClinicId;

        if (self.Doctor())
            criteria.DoctorId = self.Doctor().DoctorId;

        if (self.ReservationStatus())
            criteria.Status = self.ReservationStatus().value;

        criteria.Phone = self.Phone();

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };

}

function AppointmentManagementDoctorMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;

    self.Items = ko.observableArray();
    self.Doctors = ko.observableArray(options.doctors);
    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.MedicalClinics = ko.observableArray(options.medicalClinics);
    self.ReservationStatuses = ko.observableArray(options.reservationStatuses);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;


    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Items().length === 0);
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsNoResultMode();
    });

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)  
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

    self.Search();
}