function VideoVM(id, localizedTitle, localizedVideoUrl, medicalCenterName, embedUrl, medicalCenterNames) {
    var self = this;

    self.Id = ko.observable(id);
    self.LocalizedTitle = ko.observable(localizedTitle);
    self.localizedVideoUrl = ko.observable(localizedVideoUrl);
    self.MedicalCenterName = ko.observable(medicalCenterName);
    self.MedicalCenterNames = ko.observable(medicalCenterNames);
    self.EmbedUrl = ko.observable(embedUrl);
}

function VideoMainVM(options) {
    var self = this;

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            return new VideoVM(item.VideoId, item.LocalizedTitle, item.LocalizedVideoUrl, item.MedicalCenterName, item.EmbedUrl, item.MedicalCenterLists);
        });
    };

    self.Videos = ko.observableArray(self.mapItems(options.items));

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Videos().length === 0);
    });
}