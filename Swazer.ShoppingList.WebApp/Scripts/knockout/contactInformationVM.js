function ContactInformationSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        return self.Paging().toSubmitModel();
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function ContactInformationVM(id, contact, showOnSite, medicalCenter, contactType, doctor) {
    var self = this;

    self.ContactInformationId = ko.observable(id);
    self.Contact = ko.observable(contact).extend({ required: true });
    self.ShowOnSite = ko.observable(showOnSite);
    self.MedicalCenter = ko.observable(medicalCenter);
    self.Doctor = ko.observable(doctor);
    self.ContactType = ko.observable(contactType).extend({ required: true });
    self.MedicalCenterNameOrEmpty = ko.pureComputed(function () {
        if (self.MedicalCenter() === null)
            return '';
        return self.MedicalCenter().EnglishName;
    });
    self.DoctorNameOrEmpty = ko.pureComputed(function () {
        if (self.Doctor() === null)
            return '';
        return self.Doctor().EnglishName;
    });

    self.copy = function () {
        return new ContactInformationVM(self.ContactInformationId(), self.Contact(), self.ShowOnSite(), self.MedicalCenter(), self.ContactType(), self.Doctor());
    }

    self.toSubmitModel = function () {
        var submitModel = {
            ContactInformationId: self.ContactInformationId(),
            Contact: self.Contact(),
            ShowOnSite: self.ShowOnSite(),
            ContactTypeId: self.ContactType().ContactTypeId,
        };

        if (self.MedicalCenter() !== undefined)
            submitModel.medicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.Doctor() !== undefined)
            submitModel.DoctorId = self.Doctor().DoctorId;

        return submitModel;
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.Contact() === undefined || self.Contact() === '')
            return false;

        if (self.ContactType() === undefined)
            return false;

        return true;
    }
}

function ContactInformationMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.ContactTypes = ko.observableArray(options.contactTypes);
    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.Doctors = ko.observableArray(options.doctors);

    self.SearchMedicalCenters = function (medicalCenterId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === medicalCenterId;
        });
    };

    self.SearchContactTypes = function (contactTypeId) {
        return ko.utils.arrayFirst(self.ContactTypes(), function (contactType) {
            return contactType.ContactTypeId === contactTypeId;
        });
    };

    self.SearchDoctors = function (doctorId) {
        return ko.utils.arrayFirst(self.Doctors(), function (doctor) {
            return doctor.DoctorId === doctorId;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var medicalCenter = self.SearchMedicalCenters(item.MedicalCenterId);
            var contactType = self.SearchContactTypes(item.ContactTypeId);
            var doctor = self.SearchDoctors(item.DoctorId);
            return new ContactInformationVM(item.ContactInformationId, item.Contact, item.ShowOnSite, medicalCenter, contactType, doctor);
        });
    };

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.ContactInformations = ko.observableArray(self.mapItems(options.items));
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.ContactInformations().length === 0);
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
        return new ContactInformationVM(0, "", false, undefined, undefined, undefined);
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

        return ko.utils.arrayFirst(self.ContactInformations(), function (element) {
            return element.ContactInformationId() === self.SelectedElement().ContactInformationId();
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
            return self.ContactInformations()[0];
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
            error: self.HandleError
        });

        return false;
    };

    self.HandleCreateSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.ContactInformations(observableItems);

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
        return ko.utils.arrayFirst(self.ContactInformations(), function (temp) {
            return temp.ContactInformationId() === id;
        });
    }

    self.Delete = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.DeleteUrl,
            data: {
                id: self.SelectedElement().ContactInformationId(),
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
    };

    self.ChangeStatus = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.ChangeStatusUrl,
            data: {
                id: self.SelectedElement().ContactInformationId(),
                isActive: !self.SelectedElement().IsActive(),
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
        self.ContactInformations(observableItems);
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
    }

    self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
}