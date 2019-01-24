function CallStatisticsSearchCriteriaVM(options) {
    var self = this;


    self.StartDate = ko.observable();
    self.EndDate = ko.observable();
    self.MedicalCenter = ko.observable();
    self.ContactReason = ko.observable();
    self.ResponseStatus = ko.observable();

    self.toSubmitModel = function () {
        var criteria = new Object();

        if (self.StartDate() !== undefined)
            criteria.FromDate = self.StartDate().format("MM/DD/YYYY");

        if (self.EndDate() !== undefined)
            criteria.ToDate = self.EndDate().format("MM/DD/YYYY");

        if (self.MedicalCenter() !== undefined)
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.ContactReason() !== undefined)
            criteria.ContactReasonId = self.ContactReason().ContactReasonId;

        if (self.ResponseStatus() !== undefined)
            criteria.ResponseStatus = self.ResponseStatus().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}


function CallStatisticsMainVM(options) {
    var self = this;



    self.SearchUrl = options.searchUrl;


    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.DisplayMode = 2;
    self.NoResultMode = 3;




    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.ContactReasons = ko.observableArray(options.contactReasons);
    self.ResponseStatuses = ko.observable(options.responseStatusEnumList);

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.CallStatistics = ko.observable(options.items);
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
        self.SearchCriteria().ContactReason(undefined);
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
        self.CallStatistics(e.Items);
        self.SearchCriteria().updateSearchCriteria(e);
    };

    self.HandleError = function (message) {
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };

    self.dispose = function () {
        disposeComputedProperties();
        self.currentPageSubscription.dispose();
    }


}