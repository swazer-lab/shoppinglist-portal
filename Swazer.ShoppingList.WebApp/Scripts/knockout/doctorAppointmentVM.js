function DoctorAppointmentSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.EnglishName = ko.observable();
    self.ArabicName = ko.observable();
    self.SelectedMedicalClinic = ko.observable();
    self.SelectedMedicalCenter = ko.observable();   

    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.SupervisorCenterId = ko.observable(options.supervisorCenterId);

    self.SupervisorMedicalCenter = ko.pureComputed(function () {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === self.SupervisorCenterId();
        });
    });

    var d = self.SupervisorCenterId() !== null ? self.SupervisorMedicalCenter : self.SelectedMedicalCenter;
    self.MC_Component = new MedicalClinicComponent(d, options.getMedicalClinicsUrl);
    self.MedicalClinics = self.MC_Component.MedicalClinics;


    self.SelectedStatus = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.EnglishName = self.EnglishName();
        criteria.ArabicName = self.ArabicName();
        if (self.SelectedMedicalCenter())
            criteria.MedicalCenterId = self.SelectedMedicalCenter().MedicalCenterId;

        if (self.SelectedMedicalClinic())
            criteria.MedicalClinicId = self.SelectedMedicalClinic().MedicalClinicId;

        if (self.SelectedStatus())
            criteria.IsActive = self.SelectedStatus().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function DoctorAppointmentVM(id, name, centers) {
    var self = this;

    self.DoctorId = ko.observable(id);
    self.Name = ko.observable(name);
    self.Centers = ko.observableArray(centers);

    self.CentersDisplay = ko.pureComputed(function () {
        return self.Centers().join();
    });

    self.InitializeAppointmentsUrl = ko.pureComputed(function () {
        return InitializeAppointmentsUrl + '?doctorId=' + self.DoctorId();
    });

    self.ShowAppointmentsUrl = ko.pureComputed(function () {
        return ShowAppointmentsUrl + '/' + self.DoctorId();
    });

    self.DisplayDoctorProfileUrl = ko.pureComputed(function () {
        return DisplayDoctorProfileUrl + '?doctorId=' + self.DoctorId();
    });
}

var InitializeAppointmentsUrl;
var ShowAppointmentsUrl;
var DisplayDoctorProfileUrl;

function DoctorAppointmentMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    InitializeAppointmentsUrl = options.initializeAppointmentsUrl;
    ShowAppointmentsUrl = options.showAppointmentsUrl;
    DisplayDoctorProfileUrl = options.displayDoctorProfileUrl;

    self.IsCenterSupervisorRole = ko.observable(options.isSupervisorRole);
    self.ActivationOptions = ko.observableArray(options.activationOptions);
    self.Mode = ko.observable();

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            return new DoctorAppointmentVM(item.DoctorId, item.Name, item.Centers);
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