function Step1VM(options) {
    var self = this;

    self.DoctorId = ko.observable(options.DoctorId);
    self.DoctorName = ko.observable(options.DoctorName);
    self.DoctorNationality = ko.observable(options.Nationality);
    self.MedicalCenter = ko.observable(options.MedicalCenter);
    self.MedicalClinic = ko.observable(options.MedicalClinic);
    self.Leaves = ko.observableArray(options.Leaves);

    self.FromDateJs = ko.observable().extend({ required: true });
    self.ToDateJs = ko.observable().extend({ required: true });

    self.FromDate = ko.pureComputed({
        read: function () {
            return moment(self.FromDateJs());
        },
        write: function (value) {
            var s = convertMomentToUnix(value);
            self.FromDateJs(s);
        }
    }).extend({ required: true });

    self.ToDate = ko.pureComputed({
        read: function () {
            return moment(self.ToDateJs());
        },
        write: function (value) {
            var s = convertMomentToUnix(value);
            self.ToDateJs(s);
        }
    }).extend({ greaterThan: self.FromDate, required: true });

    self.ToDate(moment().add(1, 'days'));

    self.FromDateDisplay = ko.pureComputed(function () {
        if (!self.FromDate())
            return '';
        return self.FromDate().format("M/D/YYYY");
    });

    self.ToDateDisplay = ko.pureComputed(function () {
        if (!self.ToDate())
            return '';
        return self.ToDate().format("M/D/YYYY");
    });

    self.ReservationNumbers = ko.observableArray(options.ReservationNumbers);
    self.SelectedReservationNumbers = ko.observable().extend({ required: true });

    self.AppointmentCounts = ko.observableArray(options.AppointmentCounts);
    self.SelectedAppointmentCounts = ko.observable().extend({ required: true });

    self.FindDefaultAppointmentCounts = function () {
        return ko.utils.arrayFirst(self.AppointmentCounts(), function (e) {
            return e.IsDefault === true;
        });
    };

    self.FindDefaultReservationNumbers = function () {
        return ko.utils.arrayFirst(self.ReservationNumbers(), function (e) {
            return e.IsDefault === true;
        });
    };

    self.SelectedAppointmentCounts(self.FindDefaultAppointmentCounts());
    self.SelectedReservationNumbers(self.FindDefaultReservationNumbers());

    self.FullValidation = function () {
        if (!self.SelectedReservationNumbers() || !self.SelectedAppointmentCounts()
            || !self.FromDateJs() || !self.ToDateJs())
            return false;

        if (self.FromDate() >= self.ToDate())
            return false;

        return true;
    }

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }
}

function Step2VM(options) {
    var self = this;

    self.map = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            return new PeriodVM(item.LocalizedName, false, item.FromHour, item.ToHour, undefined, item.WorkPeriodKind);
        });
    };

    self.WorkPeriods = ko.observableArray(self.map(options.WorkPeriods));
    self.MorningPeriod = ko.pureComputed(function () {
        return ko.utils.arrayFirst(self.WorkPeriods(), function (p) {
            return p.WorkPeriodKind() === 0;
        });
    });

    self.EveningPeriod = ko.pureComputed(function () {
        return ko.utils.arrayFirst(self.WorkPeriods(), function (p) {
            return p.WorkPeriodKind() === 1;
        });
    });

    self.NightPeriod = ko.pureComputed(function () {
        return ko.utils.arrayFirst(self.WorkPeriods(), function (p) {
            return p.WorkPeriodKind() === 2;
        });
    });

    self.MorningWorkHours = ko.observableArray(options.MorningWorkHours);
    self.EveningWorkHours = ko.observableArray(options.EveningWorkHours);
    self.NightWorkHours = ko.observableArray(options.NightWorkHours);

    self.AppointmentPeriods = ko.observableArray(options.AppointmentPeriods);

    self.IsPeriodInActiveValidation = ko.observableArray(self.WorkPeriods()).extend({ isPeriodInActive: true });
    self.IsAllPeriodsAreValidation = ko.observableArray(self.WorkPeriods()).extend({ isAllPeriodsAreValid: true });

    self.FullValidation = function () {
        if (self.IsPeriodsInActive())
            return false;
        
        if (self.IsAllPeriodsAreValid())
            return false;
    }

    self.IsPeriodsInActive = ko.pureComputed(function () {
        var activatedPeriodsCount = ko.utils.arrayFilter(self.WorkPeriods(), function (wp) {
            return wp.IsActive() === false;
        }).length;
        return activatedPeriodsCount === 3;
    });

    self.IsAllPeriodsAreValid = ko.pureComputed(function () {
        var validPeriodsCount = ko.utils.arrayFilter(self.WorkPeriods(), function (wp) {
            if (wp.IsActive() === false)
                return true;
            return wp.SelectedFromHour().Hour < wp.SelectedToHour().Hour;
        }).length;
        return validPeriodsCount !== 3;
    });

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }
}

function Step3VM(options) {
    var self = this;

    self.GetDays = function () {
        var days = [];
        ko.utils.arrayForEach(options.Days, function (e) {
            var d = new Day(e.value);
            days.push(d);
        });

        return days;
    };

    self.InitializeActivePeriods = function (step3) {
        ko.utils.arrayForEach(self.Days(), function (d) {
            d.IsMorningPeriodActive(step3.WorkPeriods()[0].IsActive());
            d.IsEveningPeriodActive(step3.WorkPeriods()[1].IsActive());
            d.IsNightPeriodActive(step3.WorkPeriods()[2].IsActive());
        });
    }

    self.Days = ko.observableArray(self.GetDays(options.Days));

    self.FullValidation = function () {
        if (!self.AtLeastOneHolidayOrOneRestPeriod())
            return false;
    }

    self.IsAtLeastOneHolidayValidation = ko.observableArray(self.Days()).extend({ isHolidayValid: true });

    self.AtLeastOneHolidayOrOneRestPeriod = ko.pureComputed(function () {
        var aHoliday = ko.utils.arrayFirst(self.Days(), function (e) {
            return e.IsHoliday() === true;
        });

        if (aHoliday != null)
            return true;

        var aRestPeriod = ko.utils.arrayFirst(self.Days(), function (e) {
            return e.IsMorningPeriodRest() === true || e.IsEveningPeriodRest() === true || e.IsNightPeriodRest() === true;
        });

        if (aRestPeriod != null)
            return true;

        return false;
    });

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }
}

function Step4VM() {
    var self = this;

    self.Days = ko.observableArray();

    self.WorkingDaysCount = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.Days(), function (d) {
            return d.IsHoliday === false && d.IsLeave === false;
        }).length;
    });

    self.HolidayDaysCount = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.Days(), function (d) {
            return d.IsHoliday === true || d.IsLeave === true;
        }).length;
    });

    self.TotalDaysCount = ko.pureComputed(function () {
        return self.Days().length;
    });

    self.WorkPeriodsCount = ko.pureComputed(function () {
        var sum = 0;
        var length = self.Days().length;
        ko.utils.arrayForEach(self.Days(), function (e) {
            if (e.IsHoliday === true || e.IsLeave === true)
                return;

            if (e.IsEveningPeriodActive === true && e.IsEveningPeriodRest === false)
                sum++;

            if (e.IsMorningPeriodActive === true && e.IsMorningPeriodRest === false)
                sum++;

            if (e.IsNightPeriodActive === true && e.IsNightPeriodRest === false)
                sum++;
        });
        return sum;
    });

    self.RestPeriodsCount = ko.pureComputed(function () {
        return (self.Days().length * 3) - self.WorkPeriodsCount();
    });

    self.TotalWorkPeriodsCount = ko.pureComputed(function () {
        return self.Days().length * 3;
    });

    self.TotalAppointmentsCount = ko.pureComputed(function () {
        var sum = 0;
        ko.utils.arrayForEach(self.Days(), function (e) {
            sum += e.Total;
        });

        return sum;
    });

    self.FullValidation = function () {
        return true;
    }

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.Initialize = function (e) {
        self.Days(e);
    }
}

function PeriodVM(name, isActive, from, to, appointmentPeriod, kind) {
    var self = this;

    self.Name = ko.observable(name);
    self.IsActive = ko.observable(isActive);
    self.SelectedFromHour = ko.observable(from);
    self.SelectedToHour = ko.observable(to);
    self.SelectedPeriod = ko.observable(appointmentPeriod);
    self.WorkPeriodKind = ko.observable(kind);
}

function Day(day, date) {
    var self = this;

    self.Day = ko.observable(day);
    self.IsHoliday = ko.observable();

    self.IsMorningPeriodActive = ko.observable();
    self.IsEveningPeriodActive = ko.observable();
    self.IsNightPeriodActive = ko.observable();

    self.IsMorningPeriodRest = ko.observable();
    self.IsEveningPeriodRest = ko.observable();
    self.IsNightPeriodRest = ko.observable();
}

function InitializeAppointmentDialogVM(options) {
    var self = this;

    self.StepsIndex = [0, 1, 2, 3];
    options.viewModel.Step1.getMedicalClinicsUrl = options.getMedicalClinicsUrl;

    self.Step1VM = ko.observable(new Step1VM(options.viewModel.Step1));
    self.Step2VM = ko.observable(new Step2VM(options.viewModel.Step2));
    self.Step3VM = ko.observable(new Step3VM(options.viewModel.Step3));
    self.Step4VM = ko.observable(new Step4VM());

    self.CalculateAgendaUrl = options.calculateAgendaUrl;
    self.GenerateAgendaUrl = options.generateAgendaUrl;
    self.DoctorUrl = options.doctorUrl;

    self.Steps = [self.Step1VM, self.Step2VM, self.Step3VM, self.Step4VM];

    self.CurrentStepIndex = ko.observable(self.StepsIndex[0]);
    self.CurrentStep = ko.pureComputed(function () {
        return self.Steps[self.CurrentStepIndex()]();
    });

    self.CanGoNextStep = ko.pureComputed(function () {
        return (self.CurrentStepIndex() !== self.StepsIndex[3])
    });

    self.GoNextStep = function () {
        if (self.CanGoNextStep() === false)
            return;

        if (self.CurrentStep().FullValidation() === false) {
            self.CurrentStep().ShowErrors();
            return;
        }

        self.CurrentStepIndex(self.CurrentStepIndex() + 1);

        if (self.CurrentStepIndex() === 1)
            self.CheckIsLeave();

        if (self.CurrentStepIndex() === 2)
            self.Step3VM().InitializeActivePeriods(self.Step2VM());

        if (self.CurrentStepIndex() === 3)
            self.CalculateAgenda();
    }

    self.Spinning = ko.observable(false);

    self.ShowSpinning = function () {
        self.Spinning(true);
    };

    self.HideSpinning = function () {
        self.Spinning(false);
    };

    self.toSubmitModel = function () {
        var morning = self.Step2VM().WorkPeriods()[0];
        var evening = self.Step2VM().WorkPeriods()[1];
        var night = self.Step2VM().WorkPeriods()[2];

        var model = {
            FromDate: self.Step1VM().FromDate().format(''),
            ToDate: self.Step1VM().ToDate().format(''),
            DoctorId: self.Step1VM().DoctorId,
            MedicalCenterId: self.Step1VM().MedicalCenter().MedicalCenterId,
            MedicalClinicId: self.Step1VM().MedicalClinic().MedicalClinicId,
            AppointmentCountId: self.Step1VM().SelectedAppointmentCounts().AppointmentsCountId,
            ReservationNumberId: self.Step1VM().SelectedReservationNumbers().ReservationNumberId,

            MorningPeriod: {
                IsActive: morning.IsActive(),
                FromHourId: morning.SelectedFromHour().WorkHourId,
                ToHourId: morning.SelectedToHour().WorkHourId,
                AppointmentPeriodId: morning.SelectedPeriod().AppointmentPeriodId,
            },
            EveningPeriod: {
                IsActive: evening.IsActive(),
                FromHourId: evening.SelectedFromHour().WorkHourId,
                ToHourId: evening.SelectedToHour().WorkHourId,
                AppointmentPeriodId: evening.SelectedPeriod().AppointmentPeriodId,
            },
            NightPeriod: {
                IsActive: night.IsActive(),
                FromHourId: night.SelectedFromHour().WorkHourId,
                ToHourId: night.SelectedToHour().WorkHourId,
                AppointmentPeriodId: night.SelectedPeriod().AppointmentPeriodId,
            },
            Days: []
        };

        ko.utils.arrayForEach(self.Step3VM().Days(), function (e) {
            var d = {
                IsHoliday: e.IsHoliday(),
                WeekDay: e.Day(),
                IsMorningRest: e.IsMorningPeriodRest(),
                IsEveningRest: e.IsEveningPeriodRest(),
                IsNightRest: e.IsNightPeriodRest(),
            };

            model.Days.push(d);
        });

        return model;
    }

    self.CalculateAgenda = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.CalculateAgendaUrl,
            data: {
                viewModel: self.toSubmitModel(),
            },
            success: function (e) {
                self.HideSpinning();
                self.HandleSuccess(e);
            },
            error: function (e) {
                self.CurrentStepIndex(self.CurrentStepIndex() - 1);
                self.HandleError(e);
            }
        });

        return false;
    }

    self.IsStep4 = ko.pureComputed(function () {
        return self.CurrentStepIndex() === 3;
    });

    self.CheckIsLeave = function () {
        $.ajax({
            async: true,
            method: 'POST',
            url: options.getIsLeaveUrl,
            data: {
                doctorId: self.Step1VM().DoctorId(),
                fromDate: self.Step1VM().FromDateDisplay(),
                toDate: self.Step1VM().ToDateDisplay(),
            },
            success: function (e) {

            },
            error: function (e) {
                self.CurrentStepIndex(self.CurrentStepIndex() - 1);
                ShowErrorMessage(e.responseJSON);
                self.HandleError(e);
            }
        });
    }

    self.GenerateAgenda = function () {
        if (self.IsStep4() === false)
            return false;

        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.GenerateAgendaUrl,
            data: {
                viewModel: self.toSubmitModel(),
            },
            success: function (e) {
                self.HideSpinning();
                ShowSuccessMessage(e);
            },
            error: self.HandleError
        });

        return false;
    }

    self.HandleSuccess = function (e) {
        self.Step4VM().Initialize(e);
    }

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };

    self.CanGoPreviousStep = ko.pureComputed(function () {
        return (self.CurrentStepIndex() !== self.StepsIndex[0]);
    });

    self.GoPreviousStep = function () {
        if (self.CanGoPreviousStep() === false)
            return;
        self.CurrentStepIndex(self.CurrentStepIndex() - 1);
    }

    self.dispose = function () {
        disposeComputedProperties();
    }
}