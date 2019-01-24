function OfferVm(id, localizedTitle, start, end, logoId) {
    var self = this;

    self.OfferId = ko.observable(id);
    self.LogoId = ko.observable(logoId);
    self.LocalizedTitle = ko.observable(localizedTitle);
    self.StartDate = ko.observable(moment(start));
    self.EndDate = ko.observable(moment(end));
    self.LocalizedContent = ko.observable();
    self.Logo = ko.observable();

    self.StartDateDisplay = ko.pureComputed(function () {
        return self.StartDate().format("D/M/YYYY");
    });

    self.EndDateDisplay = ko.pureComputed(function () {
        return self.EndDate().format("D/M/YYYY");
    });
}

function OfferMainVM(options) {

    self.GetOfferContentUrl = options.getOfferContentUrl;

    self.GetContent = function (item) {
        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetOfferContentUrl,
            data: {
                offerId: item.OfferId(),
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
            var op = new OfferVm(it.OfferId, it.LocalizedTitle, it.StartDate, it.EndDate, it.LocalizedPhotoId);
            self.GetContent(op);
            result.push(op);
        };

        return result;
    }

    self.Offers = ko.observableArray(self.mapItems(options.items));

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Offers().length === 0);
    });
}