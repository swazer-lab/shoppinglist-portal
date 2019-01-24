function CodeSendModel(options) {
    var self = this;

    self.LastPartOfPhoneNumber = ko.observable(options.PhoneNumber);
    self.Period = ko.observable(moment(options.ExpirationPeriod, 'mm'));
    self.IsTimeFinished = ko.observable(false);
    self.Code = ko.observable();

    self.CodeSubscription = self.Code.subscribe(function (newVal) {
        forceJustNumber(self.Code);
    });

    self.RemeaningTimeDisplay = ko.pureComputed(function () {
        return self.Period().format("mm:ss");
    });

    self.PhoneNumberDisplay = ko.pureComputed(function () {
        return '********' + self.LastPartOfPhoneNumber();
    });

    self.IsCodeEmpty = ko.pureComputed(function () {
        return self.Code() === undefined || self.Code() === '';
    });

    self.DecreaseOneSecond = function () {
        var current = self.Period();
        if (current.minutes() === 0 && current.seconds() === 0) {
            self.IsTimeFinished(true);
            self.StopTimeDown();
        }
        self.Period(current.add(-1, 's'));
    };

    self.ResendFunction = null;
    self.ResendCode = function () {
        self.ResendFunction();
    };

    self.intervalObj = null;
    self.StartTimeDown = function (timeout) {
        if (timeout !== undefined)
            self.Period(moment({}).hours(0).minutes(0).seconds(timeout));

        if (self.intervalObj === null)
            self.intervalObj = setInterval(self.DecreaseOneSecond, 1000);
    };

    self.StopTimeDown = function () {
        clearInterval(self.intervalObj);
        self.intervalObj = null;
    };

    self.dispose = function () {
        self.CodeSubscription.dispose();
        self.StopTimeDown();
    };
}