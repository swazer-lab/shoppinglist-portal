function ReservationEditSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.ToDate = ko.observable();
    self.FromDate = ko.observable();
    self.Doctor = ko.observable();
    self.ReservationId = ko.observable(options.reservationId);

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        if (self.ToDate() !== undefined)
            criteria.ToDate = self.ToDate().format("MM/DD/YYYY");

        if (self.FromDate() !== undefined)
            criteria.FromDate = self.FromDate().format("MM/DD/YYYY");

        if (self.Doctor() !== undefined)
            criteria.DoctorId = self.Doctor().DoctorId;

        criteria.ReservationId = self.ReservationId();

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function Step1VM(options) {
    var self = this;
}

function ReservationEditMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;
    self.ChangeStatusUrl = options.changeStatusReservation;
    self.EditReservationUrl = options.editReservationUrl;

    self.Reservation = ko.observable(options.reservation);
    self.Doctors = ko.observable(options.doctors);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.mapItems = function (collection) {
        var result = [];
        ko.utils.arrayForEach(collection, function (e) {
            result.push(new DoctorRecord(e));
        });

        return result;
    };

    self.UserReservations = ko.observableArray(self.mapItems(options.items));

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
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

    self.toCompleteReservationSubmitModel = function () {
        return {
            MedicalClinicId: self.SelectedDoctor().MedicalClinicId,
        };
    };

    self.Save = function (doctor, agid, e) {
        $.ajax({
            async: true,
            method: 'POST',
            url: self.EditReservationUrl,
            data: {
                ReservationId: self.Reservation().ReservationId,
                DoctorId: doctor.DoctorId,
                AgendaConfigurationItemDetailId: agid,
            },
            success: function (e) {
                ShowSuccessMessage(e);
            },
            error: self.HandleError
        });
    }

    self.Search = function () {
        self.ShowSpinning();

        var data = self.SearchCriteria().toSubmitModel();
        data.MedicalCenterId = self.Reservation().MedicalCenterId;
        data.MedicalClinicId = self.Reservation().MedicalClinicId;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.SearchUrl,
            data: data,
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