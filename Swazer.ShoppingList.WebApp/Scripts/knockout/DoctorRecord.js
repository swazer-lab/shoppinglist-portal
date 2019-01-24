function DoctorRecord(options) {
    var self = this;

    self.Doctor = options.Doctor;
    self.CurrentStepIndex = ko.observable(0);
    self.Days = ko.observableArray(options.Days);

    self.NearestAppointment = ko.observable(moment(options.NearestAppointment));
    self.HasMore = ko.observable(options.HasMore);
    self.NeedNearestAppointment = ko.pureComputed(function () {
        return self.NearestAppointment().isValid();
    });

    self.IsInShowMoreMode = ko.observable(false);

    self.ShowMore = function () {
        self.IsInShowMoreMode(true);
    };

    self.DisplayedDays = ko.pureComputed(function () {
        var index = self.CurrentStepIndex();
        var toIndex = index + 2;
        if (toIndex >= self.Days().length)
            toIndex = self.Days().length - 1;

        var result = [];
        for (var i = index; i <= toIndex; i++) {
            result.push(self.Days()[i]);
        }
        return result;
    });

    self.NeedPaging = ko.pureComputed(function () {
        return self.Days().length > 3;
    });

    self.GoPrevious = function () {
        if (self.CanGoPrevious() === false)
            return;
        self.CurrentStepIndex(self.CurrentStepIndex() - 1);
    }

    self.GoNext = function () {
        if (self.CanGoNext() === false)
            return;
        self.CurrentStepIndex(self.CurrentStepIndex() + 1);
    }

    self.CanGoPrevious = ko.pureComputed(function () {
        return self.CurrentStepIndex() > 0;
    });

    self.CanGoNext = ko.pureComputed(function () {
        return self.CurrentStepIndex() < self.Days().length - 3;
    });
}