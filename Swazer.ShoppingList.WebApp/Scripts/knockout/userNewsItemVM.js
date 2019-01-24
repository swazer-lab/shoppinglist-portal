function NewsItemSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        return self.Paging().toSubmitModel();
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function NewsItemVm(id, localizedTitle, logoId, date, medicalCenterName) {
    var self = this;

    self.NewsItemId = ko.observable(id);
    self.LocalizedTitle = ko.observable(localizedTitle);
    self.MedicalCenterName = ko.observable(medicalCenterName);
    self.NewsItemDate = ko.observable(moment(date));
    self.LogoId = ko.observable(logoId);
    self.LocalizedContent = ko.observable();
    self.Logo = ko.observable();

    self.DisplayNewsItemDate = ko.pureComputed(function () {
        if (!self.NewsItemDate())
            return '';
        return self.NewsItemDate().format("M/D/YYYY");
    });
}

function NewsItemMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;
    self.GetNewsItemContentUrl = options.getNewsItemContentUrl;

    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.GetContent = function (item) {
        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetNewsItemContentUrl,
            data: {
                newsItemId: item.NewsItemId(),
            },
            success: function (e) {
                item.LocalizedContent(e);
            },
            error: self.HandleError
        });
    }

    self.mapItems = function (collection) {
        var result = [];
        for (var i = 0; i < collection.length; i++) {
            var it = collection[i];
            var op = new NewsItemVm(it.NewsItemId, it.LocalizedTitle, it.LogoId, it.NewsItemDate, it.MedicalCenterName);
            self.GetContent(op);
            result.push(op);
        };

        return result;
    }

    self.NewsItems = ko.observable(self.mapItems(options.items));

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.NewsItems().length === 0);
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
        self.NewsItems(e.Items);
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}