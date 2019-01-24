function CompleteReservationSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.ToDate = ko.observable();
    self.FromDate = ko.observable();
    self.Doctor = ko.observable();

    self.MedicalCenterId = ko.observable(options.medicalCenterId);
    self.MedicalClinicId = ko.observable(options.medicalClinicId);
    self.ReservationId = ko.observable(options.reservationId);

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.MedicalCenterId = self.MedicalCenterId();
        criteria.MedicalClinicId = self.MedicalClinicId();
        criteria.ReservationId = self.ReservationId();
        if (self.ToDate() !== undefined)
            criteria.ToDate = self.ToDate().format("MM/DD/YYYY");

        if (self.FromDate() !== undefined)
            criteria.FromDate = self.FromDate().format("MM/DD/YYYY");

        if (self.Doctor() !== undefined)
            criteria.DoctorId = self.Doctor().DoctorId;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function CompleteReservationMainVM(options) {
    var self = this;

    self.ReturnUrl = options.returnUrl;
    self.SearchUrl = options.searchUrl;
    self.CompleteReservationUrl = options.completeReservationUrl;
    self.Reservation = ko.observable(options.reservation);
    self.Doctors = ko.observable(options.doctors);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.Doctor = ko.observable();
    self.Date = ko.observable();
    self.Agid = ko.observable();

    self.mapItems = function (collection) {
        var result = [];
        ko.utils.arrayForEach(collection, function (e) {
            result.push(new DoctorRecord(e));
        });

        return result;
    };

    self.UserReservations = ko.observable(self.mapItems(options.items));

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.IsItemsEmpty = ko.pureComputed(function () {
        return self.UserReservations().length === 0;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsNoResultMode();
    });

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)
            self.Search();
        return true;
    };

    self.ShowSpinning = function () {
        self.Spinning(true);
    };

    self.HideSpinning = function () {
        self.Spinning(false);
    };

    self.GoPrevious = function () {
        self.IsValidationStep(false);
    }

    self.IsValidationStep = ko.observable(false);

    self.MoveValidationStep = function (doctor, agid, date, e) {
        self.IsValidationStep(true);
        self.Doctor(doctor);
        self.Agid(agid);
        self.Date(date);
    }

    self.Save = function () {
        $.ajax({
            async: true,
            method: 'POST',
            url: self.CompleteReservationUrl,
            data: {
                ReservationId: self.Reservation().ReservationId,
                DoctorId: self.Doctor().DoctorId,
                AgendaConfigurationItemDetailId: self.Agid(),
            },
            success: function (e) {
                redirect(self.ReturnUrl);
            },
            error: self.HandleError
        });
    }

    self.Search = function () {
        self.ShowSpinning();

        var data = self.SearchCriteria().toSubmitModel();
        data.MedicalCenterId = self.Reservation().MedicalCenterId;
        data.MedicalClinicId = self.Reservation().MedicalClinicId;

        var search = self.SearchCriteria().toSubmitModel();
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
        self.UserReservations(self.mapItems(e.Items));
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}