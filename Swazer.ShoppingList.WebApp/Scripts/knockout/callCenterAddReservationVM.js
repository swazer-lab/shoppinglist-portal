function UserReservationSearchCriteriaVM(options) {
    var self = this;

    self.Region = ko.observable();
    self.MedicalClinic = ko.observable();
    self.MedicalCenter = ko.observable();
    self.Doctor = ko.observable();
    self.FromDate = ko.observable();
    self.ToDate = ko.observable();
    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        if (self.FromDate() !== undefined)
            criteria.FromDate = self.FromDate().format("MM/DD/YYYY");

        if (self.ToDate() !== undefined)
            criteria.ToDate = self.ToDate().format("MM/DD/YYYY");

        if (self.Region())
            criteria.RegionId = self.Region().RegionId;

        if (self.MedicalClinic())
            criteria.MedicalClinicId = self.MedicalClinic().MedicalClinicId;

        if (self.MedicalCenter())
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.Doctor())
            criteria.DoctorId = self.Doctor().DoctorId;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function AddFamilyMemberVM(options) {
    var self = this;

    self.IsModalShowed = ko.observable(false);

    self.Genders = ko.observableArray(options.genders);
    self.Relations = ko.observableArray(options.relations);
    self.UserId = ko.observable();
    self.Gender = ko.observable().extend({ required: true });
    self.Name = ko.observable().extend({ required: true });
    self.Age = ko.observable().extend({ required: true });
    self.Mobile = ko.observable().extend({ required: true });
    self.Relation = ko.observable().extend({ required: true });

    self.AgeSubscription = self.Age.subscribe(function (newVal) {
        forceJustNumber(self.Age);
    });

    self.MobileSubscription = self.Mobile.subscribe(function (newVal) {
        forceJustNumber(self.Mobile);
    });

    self.ModalOpen = function () {
        self.IsModalShowed(true);
    }

    self.ModalClose = function () {
        self.IsModalShowed(false);
    }

    self.CloseErrorMessage = function () {
        self.Age.isModified(false);
        self.Name.isModified(false);
        self.Gender.isModified(false);
        self.Mobile.isModified(false);
        self.Relation.isModified(false);
    }

    self.ModalClear = function () {
        self.Gender(undefined);
        self.Name(undefined);
        self.Age('');
        self.Mobile('');
        self.Relation(undefined);
    }

    self.toSubmitModel = function () {
        return {
            UserId: self.UserId(),
            Gender: self.Gender().value,
            Name: self.Name(),
            Age: self.Age(),
            Mobile: self.Mobile(),
            Relation: self.Relation().value,
        };
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages(true);
        }
    }

    self.FullValidation = function () {

        if (self.Age() === undefined || self.Age() === '')
            return false;

        if (self.Mobile() === undefined || self.Mobile() === '')
            return false;

        if (self.Name() === undefined || self.Name() === '')
            return false;

        if (self.Relation() === undefined)
            return false;

        if (self.Gender() === undefined)
            return false;

        return true;
    }
}

function CallCenterUserSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.Phone = ko.observable();
    self.EnglishName = ko.observable();
    self.ArabicName = ko.observable();
    self.UserFile = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.ArabicName = self.ArabicName();
        criteria.EnglishName = self.EnglishName();
        criteria.Phone = self.Phone();
        criteria.UserFile = self.UserFile();

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function Step1VM(options) {
    var self = this;

    self.SearchCriteria = ko.observable(options.searchCriteria);

    self.mapItems = function (collection) {
        var result = [];
        ko.utils.arrayForEach(collection, function (e) {
            result.push(new DoctorRecord(e));
        });

        return result;
    };

    self.Regions = ko.observableArray(options.Regions);
    self.MedicalCenters = ko.observableArray(options.MedicalCenters);
    self.MedicalClinics = ko.observable(options.MedicalClinics);
    self.Doctors = ko.observableArray(options.Doctors);

    self.UserReservations = ko.observableArray();

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)
            self.Search();
        return true;
    };

    self.Spinning = ko.observable(false);
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
            url: addReservationSearchUrl,
            data: self.SearchCriteria().toSubmitModel(),
            success: function (e) {
                self.HandleSuccess(e);
            },
            error: self.HandleError
        });
    };

    self.HandleSuccess = function (e) {
        self.UserReservations(self.mapItems(e.Step1.Items));
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };

    var medicalCenterId = self.SearchCriteria().InitializeMedicalCenterId;
    var selectedMedicalCenter = ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
        return medicalCenter.MedicalCenterId === medicalCenterId;
    });

    if (selectedMedicalCenter !== null)
        self.SearchCriteria().MedicalCenter(selectedMedicalCenter);

    var doctorId = self.SearchCriteria().InitializeDoctorId;
    var selectedDoctor = ko.utils.arrayFirst(self.Doctors(), function (doctor) {
        return doctor.DoctorId === doctorId;
    });

    if (selectedDoctor !== null)
        self.SearchCriteria().Doctor(selectedDoctor);
}

function Step2VM(options) {
    var self = this;

    self.SearchCriteria = ko.observable(options.searchCriteria);

    self.Users = ko.observableArray();
    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)
            self.Search();
        return true;
    };

    self.Spinning = ko.observable(false);
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
            url: callCenterUserSearchUrl,
            data: self.SearchCriteria().toSubmitModel(),
            success: function (e) {

                self.HandleSuccess(e);
            },
            error: self.HandleError
        });
    };

    self.HandleSuccess = function (e) {
        self.Users(e.Step2.Items);
        self.SearchCriteria().updateSearchCriteria(e.Step2);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);
    };

    self.currentPageSubscription = self.SearchCriteria().Paging().CurrentPage.subscribe(function (newValue) {
        self.Search();
    });
}

function Step3VM(options) {
    var self = this;

    self.SelectedMedicalCenter = ko.observable().extend({ required: true });
    self.SelectedMedicalClinic = ko.observable().extend({ required: true });
    self.SelectedFamilyMember = ko.observable().extend({ required: true });

    self.AgendaConfigurationItemDetailId = ko.observable();
    self.UserId = ko.observable();
    self.SelectedDoctor = ko.observable();
    self.SelectedUser = ko.observable();
    self.FamilyMembers = ko.observableArray();

    self.MedicalVisitReasons = ko.observableArray(options.MedicalVisitReasons);

    self.AppointmentDate = ko.observable();
    self.AppointmentDateDisplay = ko.pureComputed(function () {
        if (self.AppointmentDate() === undefined)
            return '';
        return self.AppointmentDate().format('D/M/YYYY');
    });

    self.MedicalCenters = ko.observableArray(options.MedicalCenters);

    self.MC_Component = new MedicalClinicComponent(self.SelectedMedicalCenter, options.getMedicalClinicsUrl);

    self.MedicalClinics = self.MC_Component.MedicalClinics;

    self.SearchMedicalClinics = function (medicalClinicId) {
        return ko.utils.arrayFirst(self.MedicalClinics(), function (medicalClinic) {
            return medicalClinic.MedicalClinicId === medicalClinicId;
        });
    };

    self.SearchMedicalCenters = function (medicalCenterId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === medicalCenterId;
        });
    };

    self.SelectedMedicalVisitReason = ko.observable();
    self.toUncompleteReservationSubmitModel = function () {
        var model = {
            UserId: self.UserId(),
            MedicalCenterId: self.SelectedMedicalCenter().MedicalCenterId,
            MedicalClinicId: self.SelectedMedicalClinic().MedicalClinicId,
            FamilyMemberId: self.SelectedFamilyMember().FamilyMemberId,
        };

        if (self.SelectedMedicalVisitReason() !== undefined)
            model.MedicalVisitReasonId = self.SelectedMedicalVisitReason().MedicalVisitReasonId;
        return model;
    }

    self.toCompleteReservationSubmitModel = function () {
        var model = {
            UserId: self.UserId(),
            MedicalCenterId: self.SelectedDoctor().MedicalCenterId,
            MedicalClinicId: self.SelectedDoctor().MedicalClinicId,
            DoctorId: self.SelectedDoctor().DoctorId,
            AppointmentDate: self.AppointmentDate().format('MM/DD/YYYY'),
            AgendaConfigurationItemDetailId: self.AgendaConfigurationItemDetailId,
            FamilyMemberId: self.SelectedFamilyMember().FamilyMemberId,
        };

        if (self.SelectedMedicalVisitReason() !== undefined)
            model.MedicalVisitReasonId = self.SelectedMedicalVisitReason().MedicalVisitReasonId;
        return model;
    };

    self.UpdateMedicalVisitReasons = function (mc) {
        if (mc === undefined || mc === null) {
            self.MedicalVisitReasons([]);
            return;
        };

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: visitReasonsUrl,
            data: {
                id: mc.MedicalClinicId
            },
            success: function (e) {
                self.MedicalVisitReasons(e);
            },
            error: self.HandleError
        });
    };

    self.GetFamilyMembers = function () {
        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: getFamilyMembersUrl,
            data: {
                userId: self.UserId(),
            },
            success: function (e) {
                self.FamilyMembers(e.FamilyMembers);
            },
            error: self.HandleError
        });
    }

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.SelectedFamilyMember() === undefined)
            return false;

        return true;
    }

    self.ClinicSubscription = self.SelectedMedicalClinic.subscribe(function (newValue) {
        self.UpdateMedicalVisitReasons(newValue);
    });
}

var visitReasonsUrl;
var reserveSureUrl;
var reserveUncompleteUrl;
var sendCodeUrl;
var addReservationSearchUrl;
var callCenterUserSearchUrl;
var getFamilyMembersUrl;

function CreateReservationVM(options) {
    var self = this;

    self.StepsIndex = [0, 1, 2];
    self.Step1VM = ko.observable(new Step1VM(options.Step1));
    self.Step2VM = ko.observable(new Step2VM(options.Step2));
    self.Step3VM = ko.observable(new Step3VM(options.Step3));
    self.AddFamilyMemberVM = ko.observable(new AddFamilyMemberVM({
        genders: options.genders,
        relations: options.relations,
    }));

    self.ReturnUrl = options.returnUrl;
    self.DoctorUrl = options.doctorUrl;
    self.SaveFamilyMemberUrl = options.saveFamilyMemberUrl;
    getFamilyMembersUrl = options.getFamilyMembersUrl;
    addReservationSearchUrl = options.addReservationSearchUrl;
    callCenterUserSearchUrl = options.callCenterUserSearchUrl;
    visitReasonsUrl = options.visitReasonsUrl;
    reserveSureUrl = options.reserveSureUrl;
    reserveUncompleteUrl = options.reserveUncompleteUrl;
    sendCodeUrl = options.sendCodeUrl;

    self.Steps = [self.Step1VM, self.Step2VM, self.Step3VM];

    self.IsCompletedReservation = ko.observable(false);

    self.CurrentStepIndex = ko.observable(self.StepsIndex[0]);
    self.CurrentStep = ko.pureComputed(function () {
        return self.Steps[self.CurrentStepIndex()]();
    });

    self.CanGoPreviousStep = ko.pureComputed(function () {
        return (self.CurrentStepIndex() !== self.StepsIndex[0]);
    });

    self.GoPreviousStep = function () {
        if (self.CanGoPreviousStep() === false)
            return;

        self.CurrentStepIndex(self.CurrentStepIndex() - 1);
    };

    self.GoStep1 = function () {
        self.CurrentStepIndex(self.CurrentStepIndex() - 2);
    }

    self.CanGoNextStep = ko.pureComputed(function () {
        return (self.CurrentStepIndex() !== self.StepsIndex[3]);
    });

    self.GoNextStep = function () {
        if (self.CanGoNextStep() === false)
            return;

        if (self.CurrentStepIndex() === 1 && self.IsCompletedReservation() === false) {
            var valid = self.Step2VM().FullValidation();
            if (valid === false) {
                var errors = ko.validation.group({ v1: self.Step2VM().SelectedMedicalCenter, v2: self.Step2VM().SelectedMedicalClinic }, { deep: true });
                if (errors().length !== 0) {
                    return errors.showAllMessages();
                }
            }
        }

        self.CurrentStepIndex(self.CurrentStepIndex() + 1);
        if (self.CurrentStepIndex() === 2)
            self.SendCode();
    }

    self.SendCode = function () {
        $.ajax({
            async: true,
            method: 'POST',
            url: sendCodeUrl,
            data: {},
            success: function (e) { },
            error: self.HandleError
        });
    };

    self.Mode = ko.observable(self.DisplayMode);
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsNoResultMode();
    });

    self.MoveWithcompleteReservation = function (doctor, agid, e) {
        self.IsCompletedReservation(true);

        self.Step3VM().AgendaConfigurationItemDetailId(agid);
        self.Step3VM().SelectedDoctor(doctor);
        self.Step3VM().AppointmentDate(moment(e.DateTime));
        self.Step3VM().UpdateMedicalVisitReasons({ MedicalClinicId: doctor.MedicalClinicId });
        self.GoNextStep();
    }

    self.selectUser = function (data) {
        self.Step3VM().UserId(data.UserId);
        self.Step3VM().GetFamilyMembers();
        self.Step3VM().SelectedUser(data);
        self.AddFamilyMemberVM().UserId(data.UserId);
        self.GoNextStep();
    }

    self.MoveWithUncompleteReservation = function () {
        self.IsCompletedReservation(false);
        self.GoNextStep();
    }

    self.ModifyTheReservation = function () {
        self.GoStep1();
    }

    self.Save = function (form) {
        if (!self.Step3VM().FullValidation()) {
            self.Step3VM().ShowErrors();
            return false;
        }

        if (self.IsCompletedReservation())
            self.ReserveCompleteSave(form);
        else
            self.ReserveUncompleteSave(form);
        return false;
    }

    self.ReserveUncompleteSave = function (form) {
        $.ajax({
            async: true,
            method: 'POST',
            url: reserveUncompleteUrl,
            data: {
                viewModel: self.Step3VM().toUncompleteReservationSubmitModel()
            },
            success: function (e) {
                redirect(self.ReturnUrl);
            },
            error: self.HandleError
        });
    };

    self.ReserveCompleteSave = function (form) {
        $.ajax({
            async: true,
            method: 'POST',
            url: reserveSureUrl,
            data: {
                viewModel: self.Step3VM().toCompleteReservationSubmitModel()
            },
            success: function (e) {
                redirect(self.ReturnUrl);
            },
            error: self.HandleError
        });
    };

    self.SaveFamilyMember = function (form) {

        if (!self.AddFamilyMemberVM().FullValidation()) {
            self.AddFamilyMemberVM().ShowErrors();
            return false;
        }

        $.ajax({
            async: true,
            method: 'POST',
            url: self.SaveFamilyMemberUrl,
            data: {
                viewModel: self.AddFamilyMemberVM().toSubmitModel(),
            },
            success: function (e) {
                ShowSuccessMessage(e.Message);
                self.AddFamilyMemberVM().ModalClear();
                self.AddFamilyMemberVM().ModalClose();
                self.AddFamilyMemberVM().CloseErrorMessage();
                self.Step3VM().FamilyMembers(e.FamilyMembers);
            },
            error: self.HandleError
        });
        return false;
    };

    self.Step1VM().Search();
    self.Step2VM().Search();
}

// use the medical clinic component
// use the validation