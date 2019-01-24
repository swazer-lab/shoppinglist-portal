function UserLogSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.ToDate = ko.observable();
    self.FromDate = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        if (self.FromDate() !== undefined)
            criteria.From = self.FromDate().format("MM/DD/YYYY");

        if (self.ToDate() !== undefined)
            criteria.To = self.ToDate().format("MM/DD/YYYY");

        return criteria;

    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function UserLogMainVM(options) {

    self.SearchUrl = options.searchUrl;

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)
            self.Search();
        return true;
    };


    self.UserName = options.userName;
    self.Mobile = options.mobile;
    self.Logs = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.SearchCriteria = ko.observable(options.searchCriteria);

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Logs().length === 0);
    });

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
        });
    };

    self.HandleSuccess = function (e) {
        self.Logs(e.Items);
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);
        handle401Error(message);
    };

    self.Search();
}