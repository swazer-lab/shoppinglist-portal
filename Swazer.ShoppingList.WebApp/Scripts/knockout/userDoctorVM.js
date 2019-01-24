function DoctorSearchCriteriaVM(options) {
    var self = this;
    self.InitializeMedicalCenterId = options.medicalCenterId;

    self.Region = ko.observable();
    self.MedicalClinic = ko.observable();
    self.MedicalCenter = ko.observable();
    self.ArabicName = ko.observable();
    self.EnglishName = ko.observable();
    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();
        
        criteria.ArabicName = self.ArabicName();
        criteria.EnglishName = self.EnglishName();

        if (self.Region())
            criteria.RegionId = self.Region().RegionId;

        if (self.MedicalClinic())
            criteria.MedicalClinicId = self.MedicalClinic().MedicalClinicId;

        if (self.MedicalCenter())
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function DoctorMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;

    self.Regions = ko.observableArray(options.regions);
    self.MedicalClinics = ko.observableArray(options.medicalClinics);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.Doctors = ko.observable(options.doctors);
    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Doctors().length === 0);
    });

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
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
        self.Doctors(e.Items);
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };

    var centerId = self.SearchCriteria().InitializeMedicalCenterId;
    var result = ko.utils.arrayFirst(self.MedicalCenters(), function(e) {
        return centerId === e.MedicalCenterId;
    });
    if (result !== null)
        self.SearchCriteria().MedicalCenter(result);
}