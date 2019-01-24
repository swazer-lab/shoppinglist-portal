function AppointmentStatisticsSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.StartDate = ko.observable();
    self.EndDate = ko.observable();
    self.MedicalCenter = ko.observable();
    self.MedicalClinic = ko.observable();
    self.Doctor = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        if (self.StartDate() !== undefined)
            criteria.ToDate = self.StartDate().format("MM/DD/YYYY");

        if (self.EndDate() !== undefined)
            criteria.FromDate = self.EndDate().format("MM/DD/YYYY");

        if (self.MedicalCenter() !== undefined)
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.MedicalClinic() !== undefined)
            criteria.MedicalClinicId = self.MedicalClinic().MedicalClinicId;

        if (self.Doctor() !== undefined)
            criteria.DoctorId = self.Doctor().DoctorId;
        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}


function AppointmentStatisticsMainVM(options) {
    var self = this;


    self.SearchUrl = options.searchUrl;


    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.DisplayMode = 2;
    self.NoResultMode = 3;


    self.Doctors = ko.observableArray(options.doctors);
    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.MedicalClinics = ko.observableArray(options.medicalClinics);


    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.AppointmentStatistics = ko.observable(options.items);
    self.Spinning = ko.observable(false);



    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)   
            self.Search();
        return true;
    };

    self.ClearSearch = function () {
        self.SearchCriteria().StartDate(moment(''));
        self.SearchCriteria().EndDate(moment(''));
        self.SearchCriteria().MedicalCenter(undefined);
        self.SearchCriteria().MedicalClinic(undefined);
        self.SearchCriteria().Doctor(undefined);
    }

    self.Search = function () {


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
        self.AppointmentStatistics(e.Items);
        self.SearchCriteria().updateSearchCriteria(e);
    };

    self.HandleError = function (message) {
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