function AppointmentManagementSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.DoctorId = ko.observable(options.doctorId);
    self.MedicalCenterId = ko.observable(options.medicalCenterId);
    self.MedicalClinicId = ko.observable(options.medicalClinicId);
    self.Date = ko.observable(moment(options.defaultDate));
    self.WorkPeriod = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();
        if (self.Date() !== undefined)
            criteria.ReservationDate = self.Date().format("MM/DD/YYYY");

        if (self.WorkPeriod() !== undefined)
            criteria.WorkPeriodId = self.WorkPeriod().WorkPeriodId;

        criteria.DoctorId = self.DoctorId();
        criteria.MedicalCenterId = self.MedicalCenterId();
        criteria.MedicalClinicId = self.MedicalClinicId();

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };

    self.PureDate = ko.pureComputed(function () {
        if (self.Date() !== undefined)
            return self.Date().format("MM/DD/YYYY");
    });
}

function AppointmentManagementMainVM(options) {
    var self = this;

    self.SearchUrl = options.searchUrl;

    self.BaseUrl = options.baseUrl;
    self.CreateAppointmentResultUrl = options.CreateAppointmentResultUrl;
    self.ChangeStatusUrl = options.changeStatusReservation;
    self.WorkPeriods = ko.observableArray(options.workPeriods);
    self.Doctor = ko.observable(options.doctor);
    self.MedicalCenter = ko.observable(options.medicalCenter);
    self.MedicalClinic = ko.observable(options.medicalClinic);
    self.SearchCriteria = ko.observable(options.searchCriteria);

    self.MorningGroupedReservations = ko.observableArray(options.morningGroupedReservations);
    self.EveningGroupedReservations = ko.observableArray(options.eveningGroupedReservations);
    self.NightGroupedReservations = ko.observableArray(options.nightGroupedReservations);

    self.DailyAgendaDetail = ko.observable(options.dailyAgendaDetail);

    self.Spinning = ko.observable(false);
    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.IsSelectedDate = ko.pureComputed(function () {
        return self.SearchCriteria().Date() !== undefined;
    });

    self.CancelAllAppointmentsLink = ko.pureComputed(function () {
        return self.BaseUrl + '?doctorId=' + self.Doctor().DoctorId + '&medicalCenterId=' + self.MedicalCenter().MedicalCenterId + '&medicalClinicId=' + self.MedicalClinic().MedicalClinicId + '&date=' + self.SearchCriteria().PureDate();
    });

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.MorningGroupedReservations() === null &&
            self.EveningGroupedReservations() === null &&
            self.NightGroupedReservations() === null);
    });

    self.MustShow = ko.pureComputed(function () {
        return ((self.MorningGroupedReservations() != null && self.MorningGroupedReservations().length !== 0) ||
            (self.EveningGroupedReservations() != null && self.EveningGroupedReservations().length !== 0) ||
            (self.EveningGroupedReservations() != null && self.NightGroupedReservations().length !== 0));
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
        self.MorningGroupedReservations(e.MorningGroupedReservations);
        self.EveningGroupedReservations(e.EveningGroupedReservations);
        self.NightGroupedReservations(e.NightGroupedReservations);
        self.DailyAgendaDetail(e.DailyAgendaDetails);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}