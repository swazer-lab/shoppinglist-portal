function UserResetPasswordSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.ArabicName = ko.observable();
    self.EnglishName = ko.observable();
    self.Phone = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.EnglishName = self.EnglishName();
        criteria.ArabicName = self.ArabicName();
        criteria.Phone = self.Phone();

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };

}

function UserResetPasswordMainVM(options) {
    var self = this;

    self.CurrentUser = ko.observable();
    self.SearchUrl = options.searchUrl;
    self.ResetPasswordUrl = options.resetPasswordUrl;

    self.Items = ko.observableArray();
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
        if (e.keyCode === 13)   // if the pressed key is Enter
            self.Search();
        return true;
    };

    self.ShowSpinning = function () {
        self.Spinning(true);
    };

    self.HideSpinning = function () {
        self.Spinning(false);
    };

    self.IsModalShowed = ko.observable(false);

    self.ModalOpen = function (user) {
        self.CurrentUser(user);
        self.IsModalShowed(true);
    };

    self.ModalClose = function () {
        self.IsModalShowed(false);
    };

    self.ResetPassword = function (form) {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.ResetPasswordUrl,
            data: {
                userId: self.CurrentUser().UserId,
            },
            success: function (e) {
                self.ModalClose();
                ShowSuccessMessage(e);
            },
            error: function (e) {
            }
        });
        return false;
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

    self.dispose = function () {
        disposeComputedProperties();
        self.currentPageSubscription().dispose();
    };

    self.Search();
}