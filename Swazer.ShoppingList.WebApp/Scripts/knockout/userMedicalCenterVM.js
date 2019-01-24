function MedicalCenterSearchCriteriaVM(options) {
    var self = this;

    self.Region = ko.observable();
    self.ArabicName = ko.observable();
    self.EnglishName = ko.observable();
    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.ArabicName = self.ArabicName();
        criteria.EnglishName = self.EnglishName();

        if (self.Region())
            criteria.RegionId = self.Region().RegionId;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function MedicalCenterVM(id, name, address, regionName, photoId, phone) {
    var self = this;

    self.MedicalCenterId = ko.observable(id);
    self.MedicalCenterName = ko.observable(name);
    self.Address = ko.observable(address);
    self.RegionName = ko.observable(regionName);
    self.PhotoId = ko.observable(photoId);
    self.Brief = ko.observable();
    self.Phone = ko.observable(phone);
}

function MedicalCenterMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;
    self.GetMedicalCenterBriefUrl = options.getBriefUrl;

    self.Regions = ko.observableArray(options.regions);
    self.SearchCriteria = ko.observable(options.searchCriteria);

    self.GetBrief = function (item, contentType) {
        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetMedicalCenterBriefUrl,
            data: {
                medicalCenterId: item.MedicalCenterId(),
                contentType: contentType,
            },
            success: function (e) {
                item.Brief(e);
            },
            error: self.HandleError
        });
    }

    self.mapItems = function (collection) {
        var result = [];
        for (var i = 0; i < collection.length; i++) {
            var it = collection[i];
            var op = new MedicalCenterVM(it.MedicalCenterId, it.LocalizedName, it.LocalizedAddress, it.LocalizedRegionName, it.LogoId, it.Phone);
            if (it.ContentType === 1)
                self.GetBrief(op, 1);

            else (it.ContentType === 0)
            self.GetBrief(op, 0);

            result.push(op);
        };

        return result;
    }

    self.MedicalCenters = ko.observableArray(self.mapItems(options.items));

    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.MedicalCenters().length === 0);
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
        self.MedicalCenters(self.mapItems(e.Items));
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}