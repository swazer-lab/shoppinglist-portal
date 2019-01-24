function UserReservationSearchCriteriaVM(options) {
    var self = this;

    self.ToDate = ko.observable();
    self.FromDate = ko.observable();
    self.ReservationStatus = ko.observable();

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        if (self.ToDate() !== undefined)
            criteria.ToDate = self.ToDate().format("MM/DD/YYYY");

        if (self.FromDate() !== undefined)
            criteria.FromDate = self.FromDate().format("MM/DD/YYYY");

        if (self.ReservationStatus())
            criteria.ReservationStatus = self.ReservationStatus().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function UserReservationVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;
    self.CancelReservationUrl = options.cancelReservationUrl;

    self.ReservationStatuses = ko.observableArray(options.reservationStatuses);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.UserReservationInformations = ko.observableArray(options.items);
    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.UserReservationInformations().length === 0);
    });

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
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

    self.openModal = function (row) {
        self.SelectedElement(row);
        self.IsModalOpen(true);
    }

    self.SelectedElement = ko.observable();

    self.IsModalOpen = ko.observable(false);

    self.CancelReservation = function () {
        self.ShowSpinning();
        $.ajax({
            async: true,
            method: 'POST',
            url: self.CancelReservationUrl,
            data: {
                reservationId: self.SelectedElement().ReservationId,
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
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
        self.UserReservationInformations(e.Items);
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}