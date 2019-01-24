var getMedicalClinicsUrl = '';

function DoctorSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.EnglishName = ko.observable();
    self.ArabicName = ko.observable();
    self.SelectedStatus = ko.observable();
    self.MedicalCenter = ko.observable();
    self.MC_Component = new MedicalClinicComponent(self.MedicalCenter, options.getMedicalClinicsUrl);
    self.MedicalClinics = self.MC_Component.MedicalClinics;
    self.MedicalClinic = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();

        criteria.EnglishName = self.EnglishName();
        criteria.ArabicName = self.ArabicName();

        if (self.SelectedStatus())
            criteria.IsActive = self.SelectedStatus().value;

        if (self.MedicalCenter())
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.MedicalClinic())
            criteria.MedicalClinicId = self.MedicalClinic().MedicalClinicId;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function ContactInformationVM(id, contactType, contact, showOnSite) {
    var self = this;

    self.ContactInformationId = ko.observable(id);
    self.SelectedContactType = ko.observable(contactType).extend({ required: true });
    self.Contact = ko.observable(contact).extend({ contactVal: self.SelectedContactType });
    self.ShowOnSite = ko.observable(showOnSite).extend({ required: true });

    self.ContactSubscription = self.Contact.subscribe(function (newVal) {
        forceJustContact(self.Contact, self.SelectedContactType);
    });

    self.Mode = ko.observable(0);

    self.copy = function () {
        return new ContactInformationVM(self.ContactInformationId(), self.SelectedContactType(), self.Contact(), self.ShowOnSite());
    }

    self.IsUpdateMode = ko.pureComputed(function () {
        return self.Mode() === 1;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return self.Mode() === 0;
    });

    self.EnterUpdateMode = function () {
        self.Mode(1);
    };

    self.EnterDisplayMode = function () {
        if (!self.IsValid())
            return;

        self.Mode(0);
    };

    self.IsValid = ko.pureComputed(function () {
        self.Contact();
        self.SelectedContactType();
        self.ShowOnSite();

        if (self.SelectedContactType() === undefined)
            return false;

        var errors = ko.validation.group(self, { deep: false });
        return (errors().length === 0);
    });

    self.toSubmitModel = function () {
        return {
            ContactInformationId: self.ContactInformationId(),
            ContactTypeId: self.SelectedContactType().ContactTypeId,
            Contact: self.Contact(),
            ShowOnSite: self.ShowOnSite()
        };
    };

    self.onEditContactInformationRecordPress = function (d, e) {
        if (e.keyCode !== 13)
            return true;

        if (self.IsValid())
            d.Mode(0);

        return false;
    };

    self.GetFocus = ko.observable(false);
}

function DoctorMedicalCenterVM(medicalCenter, medicalClinic, isActive, isshallow) {
    var self = this;

    self.MedicalCenter = ko.observable(medicalCenter).extend({ required: true });
    self.MedicalClinics = null;
    self.MC_Component = null;
    if (isshallow === false) {
        self.MedicalClinics = ko.observableArray([medicalClinic]);
    }

    else {
        self.MC_Component = new MedicalClinicComponent(self.MedicalCenter, getMedicalClinicsUrl);
        self.MedicalClinics = self.MC_Component.MedicalClinics;
    }

    self.MedicalClinic = ko.observable(medicalClinic).extend({ required: true });
    self.IsActive = ko.observable(isActive).extend({ required: true });

    self.Mode = ko.observable(0);

    self.copy = function () {
        return new DoctorMedicalCenterVM(self.MedicalCenter(), self.MedicalClinic(), self.IsActive(), false);
    }

    self.IsUpdateMode = ko.pureComputed(function () {
        return self.Mode() === 1;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return self.Mode() === 0;
    });

    self.EnterUpdateMode = function () {
        self.Mode(1);
    };

    self.EnterDisplayMode = function () {
        if (!self.IsValid())
            return;

        self.Mode(0);
    };

    self.IsValid = ko.pureComputed(function () {
        self.MedicalCenter();
        self.MedicalClinic();
        self.IsActive();

        var errors = ko.validation.group(self, { deep: false });
        return (errors().length === 0);
    });

    self.toSubmitModel = function () {
        return {
            MedicalCenterId: self.MedicalCenter().MedicalCenterId,
            MedicalClinicId: self.MedicalClinic().MedicalClinicId,
            IsActive: self.IsActive()
        };
    };

    self.onEditMedicalCenterRecordPress = function (d, e) {
        if (e.keyCode !== 13)
            return true;

        if (self.IsValid())
            d.Mode(0);

        return false;
    };

    self.GetFocus = ko.observable(false);
}

function DoctorVM(id, arabicName, englishName, nationality, showNationality, doctorContractType,
    showDoctorContractType, arabicQualification, englishQualification, arabicMedicalSpeciality,
    englishMedicalSpeciality, birthDate, showBirthDate, gender, showGender, isActive, arabicBiography,
    englishBiography, pictureId, logoAsString, medicalCenters, contactInformation) {
    var self = this;

    self.IsMarked = ko.observable();
    self.DoctorId = ko.observable(id).extend({ required: true });
    self.ArabicName = ko.observable(arabicName).extend({ required: true });
    self.EnglishName = ko.observable(englishName).extend({ required: true });
    self.Nationality = ko.observable(nationality).extend({ required: true });
    self.ShowNationality = ko.observable(showNationality).extend({ required: true });
    self.DoctorContractType = ko.observable(doctorContractType).extend({ required: true });
    self.ShowDoctorContractType = ko.observable(showDoctorContractType).extend({ required: true });
    self.ArabicQualification = ko.observable(arabicQualification).extend({ required: true });
    self.EnglishQualification = ko.observable(englishQualification).extend({ required: true });
    self.ArabicMedicalSpeciality = ko.observable(arabicMedicalSpeciality).extend({ required: true });
    self.EnglishMedicalSpeciality = ko.observable(englishMedicalSpeciality).extend({ required: true });
    self.BirthDateJs = ko.observable(birthDate).extend({ required: true });

    self.BirthDate = ko.pureComputed({
        read: function () {
            return moment(self.BirthDateJs());
        },
        write: function (value) {
            var s = convertMomentToUnix(value);
            self.BirthDateJs(s);
        }
    });

    self.ContactInformations = ko.observableArray(contactInformation);

    self.IsContactInformationEmpty = ko.pureComputed(function () {
        return (self.ContactInformations().length === 0);
    });

    self.MedicalCenters = ko.observableArray(medicalCenters).extend({ oneElementAtLeast: true });
    self.ActivatedMedicalCenters = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.MedicalCenters(), function (e) {
            return e.MedicalCenter().IsActive === true && e.MedicalClinic().IsActive === true;
        })
    });

    self.BirthDateDisplay = ko.pureComputed(function () {
        if (!self.BirthDate())
            return '';
        return self.BirthDate().format("M/D/YYYY");
    });

    self.ShowBirthDate = ko.observable(showBirthDate).extend({ required: true });
    self.Gender = ko.observable(gender).extend({ required: true });
    self.ShowGender = ko.observable(showGender).extend({ required: true });
    self.IsActive = ko.observable(isActive).extend({ required: true });
    self.ArabicBiography = ko.observable(arabicBiography).extend({ required: true });
    self.EnglishBiography = ko.observable(englishBiography).extend({ required: true });
    self.PersonalPictureId = ko.observable(pictureId).extend({ required: true });

    self.arabicFile = ko.observable(logoAsString).extend({ required: true });

    self.CreateContactInformationVM = function () {
        var c = { ContactType: 0 };
        return new ContactInformationVM(0, c, '', false);
    };

    self.DeleteContactInformation = function (old) {
        self.ContactInformations.remove(old);
        self.ContactInformation(self.CreateContactInformationVM());
    };

    self.NewContactInformation = ko.observable(self.CreateContactInformationVM());

    self.AddContactInformation = function () {
        if (!self.NewContactInformation().IsValid())
            return;

        var created = new ContactInformationVM(self.NewContactInformation().ContactInformationId(), self.NewContactInformation().SelectedContactType(), self.NewContactInformation().Contact(), self.NewContactInformation().ShowOnSite());
        self.ContactInformations.push(created);

        var newCI = self.CreateContactInformationVM();
        self.NewContactInformation(newCI);
        self.NewContactInformation().GetFocus(true);
    };

    self.onNewContactInformationRecordPress = function (d, e) {
        if (e.keyCode !== 13)
            return true;

        if (self.ContactInformation().IsValid())
            self.AddContactInformation();

        return false;
    };

    self.CreateMedicalCenterVM = function () {
        return new DoctorMedicalCenterVM(undefined, undefined, false);
    };

    self.DeleteMedicalCenter = function (old) {
        self.MedicalCenters.remove(old);
    };

    self.NewMC = ko.observable(self.CreateMedicalCenterVM());

    self.AddMedicalCenter = function () {
        var created = new DoctorMedicalCenterVM(self.NewMC().MedicalCenter(), self.NewMC().MedicalClinic(), self.NewMC().IsActive(), false);
        self.MedicalCenters.push(created);

        var newCI = self.CreateMedicalCenterVM();
        self.NewMC(newCI);
        self.NewMC().GetFocus(true);
    };

    self.onNewMedicalCenterRecordPress = function (d, e) {
        if (e.keyCode !== 13)
            return true;

        if (self.MedicalCenter().IsValid())
            self.AddMedicalCenter();

        return false;
    };

    self.DisplayLocation = ko.pureComputed(function () {
        if (!self.Location() && !self.Location().Lat() && !self.Location().Lng())
            return '';
        return '(' + self.Location().Lat() + ',' + self.Location().Lng() + ')';
    });

    self.copy = function () {
        var contactInformations = [];
        ko.utils.arrayForEach(self.ContactInformations(), function (c) {
            contactInformations.push(c.copy());
        });

        var medicalCenters = [];
        ko.utils.arrayForEach(self.MedicalCenters(), function (c) {
            medicalCenters.push(c.copy());
        });

        return new DoctorVM(self.DoctorId(), self.ArabicName(), self.EnglishName(), self.Nationality(),
            self.ShowNationality(), self.DoctorContractType(), self.ShowDoctorContractType(), self.ArabicQualification(),
            self.EnglishQualification(), self.ArabicMedicalSpeciality(), self.EnglishMedicalSpeciality(), self.BirthDate(),
            self.ShowBirthDate(), self.Gender(), self.ShowGender(), self.IsActive(), self.ArabicBiography(),
            self.EnglishBiography(), self.PersonalPictureId(), self.arabicFile(), medicalCenters, contactInformations);
    }

    self.toSubmitModel = function () {
        var model = {
            DoctorId: self.DoctorId(),
            ArabicName: self.ArabicName(),
            EnglishName: self.EnglishName(),
            NationalityId: self.Nationality().NationalityId,
            ShowNationality: self.ShowNationality(),
            ShowBirthDate: self.ShowBirthDate(),
            DoctorContractTypeId: self.DoctorContractType().DoctorContractTypeId,
            ShowDoctorContractType: self.ShowDoctorContractType(),
            ArabicQualification: self.ArabicQualification(),
            EnglishQualification: self.EnglishQualification(),
            ArabicMedicalSpeciality: self.ArabicMedicalSpeciality(),
            EnglishMedicalSpeciality: self.EnglishMedicalSpeciality(),
            BirthDate: self.BirthDate().format("MM/DD/YYYY"),
            Gender: self.Gender().value,
            ShowGender: self.ShowGender(),
            IsActive: self.IsActive(),
            ArabicBiography: self.ArabicBiography(),
            EnglishBiography: self.EnglishBiography(),
            PersonalPicture: self.arabicFile(),
            PersonelPictureId: self.PersonalPictureId(),
            MedicalCenters: [],
            ContactInformations: [],
        };

        ko.utils.arrayForEach(self.MedicalCenters(), function (e) {
            model.MedicalCenters.push(e.toSubmitModel());
        });

        ko.utils.arrayForEach(self.ContactInformations(), function (e) {
            model.ContactInformations.push(e.toSubmitModel());
        });

        return model;
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.ArabicName() === undefined || self.ArabicName() === '')
            return false;

        if (self.EnglishName() === undefined || self.EnglishName() === '')
            return false;

        if (self.Nationality() === undefined)
            return false;

        if (self.DoctorContractType() === undefined)
            return false;

        if (self.ArabicQualification() === undefined || self.ArabicQualification() === '')
            return false;

        if (self.EnglishQualification() === undefined || self.EnglishQualification() === '')
            return false;

        if (self.ArabicMedicalSpeciality() === undefined || self.ArabicMedicalSpeciality() === '')
            return false;

        if (self.EnglishMedicalSpeciality() === undefined || self.EnglishMedicalSpeciality() === '')
            return false;

        if (self.BirthDateJs() === undefined || self.BirthDateJs() === "")
            return false;

        if (self.ArabicBiography() === undefined || self.ArabicBiography() === '')
            return false;

        if (self.EnglishBiography() === undefined || self.EnglishBiography() === '')
            return false;

        if (self.MedicalCenters().length === 0)
            return false;

        if (self.arabicFile() === undefined || self.arabicFile() === '')
            return false;

        return true;
    }
}

function DoctorMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.SearchUrl = options.searchUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.GetPictureUrl = options.getPictureUrl;
    self.GetContentUrl = options.getContentUrl;
    getMedicalClinicsUrl = options.getMedicalClinicsUrl;
    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.ActivationOptions = ko.observableArray(options.activationOptions);

    self.Nationalities = ko.observableArray(options.nationalities);
    self.ActiveNationalities = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.Nationalities(), function (n) {
            return n.IsActive === true;
        });
    });

    self.Genders = ko.observableArray(options.genders);
    self.DoctorContractTypes = ko.observableArray(options.doctorContractTypes);

    self.ActiveDoctorContractTypes = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.DoctorContractTypes(), function (e) {
            return e.IsActive === true;
        });
    });

    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.ActiveMedicalCenters = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.MedicalCenters(), function (e) {
            return e.IsActive === true;
        });
    });

    self.ContactTypes = ko.observableArray(options.contactTypes);
    self.MedicalClinics = ko.observableArray(options.medicalClinics);

    self.SearchMedicalCenters = function (mcId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (mc) {
            return mc.MedicalCenterId === mcId;
        });
    };

    self.SearchMedicalClinics = function (mcId) {
        return ko.utils.arrayFirst(self.MedicalClinics(), function (mc) {
            return mc.MedicalClinicId === mcId;
        });
    };

    self.SearchContactTypes = function (cti) {
        return ko.utils.arrayFirst(self.ContactTypes(), function (e) {
            return e.ContactTypeId === cti;
        });
    }

    self.SearchNationalities = function (nationalityId) {
        return ko.utils.arrayFirst(self.Nationalities(), function (nationality) {
            return nationality.NationalityId === nationalityId;
        });
    };

    self.SearchDoctorContractTypes = function (doctorContractTypeId) {
        return ko.utils.arrayFirst(self.DoctorContractTypes(), function (doctorContractType) {
            return doctorContractType.DoctorContractTypeId === doctorContractTypeId;
        });
    };

    self.SearchGender = function (genderValue) {
        return ko.utils.arrayFirst(self.Genders(), function (gender) {
            return gender.value === genderValue;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var nationality = self.SearchNationalities(item.NationalityId);
            var doctorContractType = self.SearchDoctorContractTypes(item.DoctorContractTypeId)
            var gender = self.SearchGender(item.Gender);

            var contactInformations = [];
            ko.utils.arrayForEach(item.ContactInformations, function (ci) {
                var ct = self.SearchContactTypes(ci.ContactTypeId);
                contactInformations.push(new ContactInformationVM(ci.ContactInformationId, ct, ci.Contact, ci.ShowOnSite));
            });

            var medicalCenters = [];
            ko.utils.arrayForEach(item.MedicalCenters, function (e) {
                var mct = self.SearchMedicalCenters(e.MedicalCenterId);
                var mcc = self.SearchMedicalClinics(e.MedicalClinicId);
                var dmc = new DoctorMedicalCenterVM(mct, mcc, e.IsActive);
                medicalCenters.push(dmc);
            });

            var result = new DoctorVM(item.DoctorId, item.ArabicName, item.EnglishName, nationality, item.ShowNationality
                , doctorContractType, item.ShowDoctorContractType, item.ArabicQualification, item.EnglishQualification
                , item.ArabicMedicalSpeciality, item.EnglishMedicalSpeciality, item.BirthDate, item.ShowBirthDate, gender
                , item.ShowGender, item.IsActive, item.ArabicBiography, item.EnglishBiography, item.PersonalPictureId, undefined, medicalCenters, contactInformations);

            if (self.IsMarkedDoctor(item.DoctorId))
                result.IsMarked(true);
            else
                result.IsMarked(false);

            return result;
        });
    };

    self.IsMarkedDoctor = function (id) {
        return ko.utils.arrayFirst(self.SelectedItemsIds(), function (selectedId) {
            if (selectedId === id)
                return true;
        });
        return false;
    };

    self.IsMultipleDelete = ko.observable(false);
    self.ShowDeleteModal = ko.observable(false);
    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Doctors = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Doctors().length === 0);
    });

    self.IsCreateOrEditMode = ko.pureComputed(function () {
        var mode = self.Mode();
        return (mode === self.CreateMode || mode === self.EditMode);
    });

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsCreateOrEditMode() && !self.IsNoResultMode();
    });

    self.CreateNewElement = function () {
        var contactInformations = [];
        return new DoctorVM(0, '', '', undefined, false, undefined, false, '', '', '', '', '', false, undefined, false, false, '', '', 0, undefined, [], contactInformations);
    };

    self.EnterEditMode = function () {
        self.PanelTitle(self.EditModePanelTitle);
        self.Mode(self.EditMode);
        self.EditedElement(self.SelectedElement().copy());
    };

    self.EnterCreateMode = function () {
        self.PanelTitle(self.CreateModePanelTitle);
        self.Mode(self.CreateMode);
    };

    self.EnterDetailsMode = function () {
        self.PanelTitle(self.DisplayModePanelTitle);
        self.Mode(self.DisplayMode);
    };

    self.EnterNoResultMode = function () {
        self.Mode(self.NoResultMode);
    }

    self.FindSelectedElement = function () {
        if (!self.SelectedElement())
            return undefined;

        return ko.utils.arrayFirst(self.Doctors(), function (element) {
            return element.DoctorId() === self.SelectedElement().DoctorId();
        });
    };

    self.GetSelectedElementOrFirstOrNew = function () {
        var newEl = self.CreateNewElement();
        self.EditedElement(newEl);

        var founded = self.FindSelectedElement();
        if (founded) {
            self.EnterDetailsMode();
            return founded;
        }

        if (self.IsItemsEmpty() === false) {
            self.EnterDetailsMode();
            return self.Doctors()[0];
        }

        self.EnterNoResultMode();
        return newEl;
    };

    self.PressCreate = function () {
        self.EnterCreateMode();
        var newEl = self.CreateNewElement();
        self.EditedElement(newEl);
        self.SelectedElement(newEl);
    };

    self.SelectRow = function (row) {
        row.arabicFile(undefined);
        row.ArabicBiography(undefined);
        row.EnglishBiography(undefined);
        self.EnterDetailsMode();
        self.SelectedElement(row);
    };

    self.ShowSpinning = function () {
        self.Spinning(true);
    };

    self.HideSpinning = function () {
        self.Spinning(false);
    };

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)
            self.Search();
        return true;
    };

    self.GetUrl = function () {
        if (self.Mode() === self.CreateMode)
            return self.CreateUrl;
        else if (self.Mode() === self.EditMode)
            return self.EditUrl;
        else
            return '';
    };

    self.Cancel = function () {
        if (self.Mode() === self.EditMode)
            self.EnterDetailsMode();
        else if (self.Mode() === self.CreateMode)
            self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
    };

    self.Save = function (form) {
        if (self.Mode() === self.DisplayMode)
            return false;

        if (!self.EditedElement().FullValidation()) {
            self.EditedElement().ShowErrors();
            return false;
        }

        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.GetUrl(),
            data: {
                viewModel: self.EditedElement().toSubmitModel(),
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                if (self.Mode() === self.CreateMode)
                    self.HandleCreateSuccess(e);
                else
                    self.HandleSuccess(e);

                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError,
        });

        return false;
    };

    self.GetPicture = function (newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetPictureUrl,
            data: {
                logoId: self.SelectedElement().PersonalPictureId(),
            },
            success: function (e) {
                if (temp.DoctorId() === self.SelectedElement().DoctorId()) {
                    if (self.Mode() === self.EditMode)
                        self.EditedElement().arabicFile(e);
                    self.SelectedElement().arabicFile(e);
                }
            },
            error: self.HandleError
        });
    }

    self.HandleCreateSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.Doctors(observableItems);

        var founded = self.SelectedTheNewCreatedElement(e);
        if (founded !== null) {
            self.SelectedElement(founded);
            self.EnterDetailsMode();
        }
        else
            self.SelectedElement(self.GetSelectedElementOrFirstOrNew());

        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.SelectedTheNewCreatedElement = function (e) {
        var selectedId = e.SelectedRowId;
        if (selectedId === undefined)
            return;

        return self.FindById(selectedId);
    }

    self.FindById = function (id) {
        return ko.utils.arrayFirst(self.Doctors(), function (temp) {
            return temp.DoctorId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.Doctors(), function (r) {
            if (r.IsMarked() === true)
                self.SelectedItemsIds().push(r.DoctorId());
            return r.IsMarked() === true;
        });
    });

    self.SelectedItemsIds = ko.observableArray();

    self.IsThereMultipleSelected = ko.pureComputed(function () {
        return self.SelectedItems().length !== 0;
    });

    self.ActivateMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.ChangeStatus(ids, true);
    };

    self.DeactivateMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.ChangeStatus(ids, false);
    };

    self.ChangeStatusSingle = function () {
        var id = [self.SelectedElement().DoctorId()];
        self.ChangeStatus(id, !self.SelectedElement().IsActive());
    };

    self.ChangeStatus = function (ids, isActive) {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.ChangeStatusUrl,
            data: {
                ids: ids,
                isActive: isActive,
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
    };

    self.DeleteMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.DeleteSingleOrMultiple(ids);
    };

    self.Delete = function () {
        var id = [self.SelectedElement().DoctorId()];
        self.DeleteSingleOrMultiple(id);
    };

    self.DeleteSingleOrMultiple = function (ids) {
        self.ShowSpinning();
        $.ajax({
            async: true,
            method: 'POST',
            url: self.DeleteUrl,
            data: {
                ids: ids,
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
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
        var observableItems = self.mapItems(e.Items);
        self.Doctors(observableItems);
        self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };

    self.currentPageSubscription = self.SearchCriteria().Paging().CurrentPage.subscribe(function (newValue) {
        self.Search();
    });

    self.dispose = function () {
        disposeComputedProperties();
        self.currentPageSubscription.dispose();
        self.SelectedElementSubscription.dispose();
    }

    self.GetContent = function (lng, newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetContentUrl,
            data: {
                contentType: lng,
                id: self.SelectedElement().DoctorId()
            },
            success: function (e) {
                if (lng === 0) {
                    if (temp.DoctorId() === self.SelectedElement().DoctorId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().ArabicBiography(e);
                        self.SelectedElement().ArabicBiography(e);
                    }
                }
                else if (lng === 1) {
                    if (temp.DoctorId() === self.SelectedElement().DoctorId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().EnglishBiography(e);
                        self.SelectedElement().EnglishBiography(e);
                    }
                }
            },
            error: self.HandleError
        });
    }

    self.SelectedElementSubscription = self.SelectedElement.subscribe(function (newSE) {
        if (newSE.arabicFile() === undefined && newSE.PersonalPictureId() !== 0) {
            self.GetPicture(newSE);
        }

        if (newSE.DoctorId() !== 0) {
            self.GetContent(0, newSE);
            self.GetContent(1, newSE);
        }
    });
    self.Search();
}