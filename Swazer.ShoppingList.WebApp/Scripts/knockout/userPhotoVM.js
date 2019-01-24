function PhotoMainVM(options) {
    self.Photos = ko.observable(options.items);

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Photos().length === 0);
    });
}