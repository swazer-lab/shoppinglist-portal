function MedicalArticleSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        return self.Paging().toSubmitModel();
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function MedicalArticleVm(id, localizedTitle, logoId) {
    var self = this;

    self.LocalizedTitle = ko.observable(localizedTitle);
    self.MedicalArticleId = ko.observable(id);
    self.LogoId = ko.observable(logoId);
    self.LocalizedContent = ko.observable();
}

function MedicalArticleMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;
    self.GetMedicalArticleContentUrl = options.getMedicalArticleContent;

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
            url: self.GetMedicalArticleContentUrl,
            data: {
                medicalArticleId: item.MedicalArticleId(),
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
            var op = new MedicalArticleVm(it.MedicalArticleId, it.LocalizedTitle, it.LogoId);
            self.GetContent(op);
            result.push(op);
        };

        return result;
    }

    self.MedicalArticles = ko.observableArray(self.mapItems(options.items));

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.MedicalArticles().length === 0);
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
        self.MedicalArticles(e.Items);
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}