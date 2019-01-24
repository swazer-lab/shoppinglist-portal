function AgendaSearchCriteriaVM(options) {
    var self = this;

    self.FromDate = ko.observable();
    self.ToDate = ko.observable();
    self.DoctorId = ko.observable(options.doctorId);

    self.toSubmitModel = function () {
        var criteria = {
            DoctorId : self.DoctorId()
        };

        if (self.FromDate() !== undefined)
            criteria.FromDate = self.FromDate().format("MM/DD/YYYY");

        if (self.ToDate() !== undefined)
            criteria.ToDate = self.ToDate().format("MM/DD/YYYY");

        return criteria;
    };
}

function AgendaMainVM(options) {
    var self = this;

    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.SearchUrl = options.searchUrl;

    self.Items = ko.observableArray(options.items);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Spinning = ko.observable(false);

    self.ShowSpinning = function () {
        self.Spinning(true);
    };

    self.HideSpinning = function () {
        self.Spinning(false);
    };

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Items().length === 0);
    });

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)  
            self.Search();
        return true;
    };

    self.ClearSearch = function () {
        self.SearchCriteria().FromDate(moment(''));
        self.SearchCriteria().ToDate(moment(''));
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
        self.Items(e.Items);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}