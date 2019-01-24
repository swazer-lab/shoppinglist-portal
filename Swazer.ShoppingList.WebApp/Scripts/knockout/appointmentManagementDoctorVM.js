function AppointmentManagementDoctorSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.Doctor = ko.observable();
    self.MedicalCenters = ko.observableArray(options.medicalCenters);

    self.SelectedMedicalClinic = ko.observable();
    self.SelectedMedicalCenter = ko.observable();

    self.SupervisorCenterId = ko.observable(options.supervisorCenterId);

    self.SupervisorMedicalCenter = ko.pureComputed(function () {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === self.SupervisorCenterId();
        });
    });

    var d = self.SupervisorCenterId() !== null ? self.SupervisorMedicalCenter : self.SelectedMedicalCenter;
    self.MC_Component = new MedicalClinicComponent(d, options.getMedicalClinicsUrl);
    self.MedicalClinics = self.MC_Component.MedicalClinics;

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        if (self.SelectedMedicalCenter())
            criteria.MedicalCenterId = self.SelectedMedicalCenter().MedicalCenterId;

        if (self.SelectedMedicalClinic())
            criteria.MedicalClinicId = self.SelectedMedicalClinic().MedicalClinicId;

        if (self.Doctor())
            criteria.DoctorId = self.Doctor().DoctorId;

        return criteria;

    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };

}

function AppointmentManagementDoctorMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;

    self.BaseUrl = options.baseUrl;

    self.Items = ko.observableArray(options.items);
    self.Doctors = ko.observableArray(options.doctors);
    
    self.SearchCriteria = ko.observable(options.searchCriteria);

    self.IsCenterSupervisorRole = ko.observable(options.isCenterSupervisorRole);
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
}