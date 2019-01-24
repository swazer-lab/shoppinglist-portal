function UserSearchCriteriaVM(options) {
    var self = this;

    self.ArabicName = ko.observable();
    self.EnglishName = ko.observable();
    self.Email = ko.observable();
    self.Role = ko.observable();
    self.SelectedStatus = ko.observable();
    self.MedicalCenter = ko.observable();
    self.MC_Component = new MedicalClinicComponent(self.MedicalCenter, options.getMedicalClinicsUrl);
    self.MedicalClinics = self.MC_Component.MedicalClinics;
    self.MedicalClinic = ko.observable();

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        var model = self.Paging().toSubmitModel();
        model.ArabicName = self.ArabicName();
        model.EnglishName = self.EnglishName();
        model.Email = self.Email();

        if (self.MedicalCenter())
            model.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.MedicalClinic())
            model.MedicalClinicId = self.MedicalClinic().MedicalClinicId;

        if (self.Role())
            model.Role = self.Role().Name;

        if (self.SelectedStatus())
            model.IsActive = self.SelectedStatus().value;

        return model;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function MedicalClinicVM(isChecked, clinic) {
    var self = this;

    self.IsChecked = ko.observable(isChecked);
    self.Clinic = ko.observable(clinic);

    self.copy = function () {
        return new MedicalClinicVM(self.IsChecked(), self.Clinic());
    }
}

function UserVM(id, englishUserName, arabicUserName, medicalCenterNameOrAll, mobile, isActive, email, medicalCenter, medicalClinicIds, role) {
    var self = this;

    self.IsMarked = ko.observable();
    self.UserId = ko.observable(id);
    self.EnglishUserName = ko.observable(englishUserName).extend({ required: true });
    self.ArabicUserName = ko.observable(arabicUserName).extend({ required: true });
    self.MedicalCenterNameOrAll = ko.observable(medicalCenterNameOrAll);
    self.Mobile = ko.observable(mobile).extend({ required: true });

    self.MobileSubscription = self.Mobile.subscribe(function (newVal) {
        forceJustMobile(self.Mobile);
    });

    self.IsActive = ko.observable(isActive).extend({ required: true });
    self.Email = ko.observable(email).extend({ email: true });
    self.MedicalClinicIds = ko.observableArray(medicalClinicIds);
    self.MedicalCenter = ko.observable(medicalCenter).extend({ required: true });
    self.MC_Component = new MedicalClinicComponent(self.MedicalCenter, componentUrl);

    self.MedicalClinics = ko.pureComputed(function () {
        return ko.utils.arrayMap(self.MC_Component.MedicalClinics(), function (e) {
            var r = ko.utils.arrayFirst(self.MedicalClinicIds(), function (id) {
                return id === e.MedicalClinicId;
            });

            var isChecked = (r !== null);

            return new MedicalClinicVM(isChecked, e)
        });
    });

    self.Role = ko.observable(role).extend({ required: true });

    self.MedicalCenterClinicNamesOrAll = ko.pureComputed(function () {
        if (self.MedicalClinics() === undefined)
            return 'All';

        var result = [];
        ko.utils.arrayForEach(self.MedicalClinicIds(), function (id) {
            var r = ko.utils.arrayFirst(self.MC_Component.MedicalClinics(), function (e) {
                return id === e.MedicalClinicId;
            });
            if (r !== null)
                result.push(r.LocalizedName);
        });

        return result.join();
    });

    self.NeedSpecifyMedicalCenter = ko.pureComputed(function () {
        if (self.Role() === undefined)
            return false;
        return self.Role().NeedSpecifyMedicalCenter;
    });

    self.NeedSpecifyMedicalClinics = ko.pureComputed(function () {
        if (self.Role() === undefined)
            return false;
        return self.Role().NeedSpecifyMedicalClinics;
    });

    self.copy = function () {
        var clinics = [];
        ko.utils.arrayForEach(self.MedicalClinics(), function (c) {
            clinics.push(c.copy());
        });

        return new UserVM(self.UserId(), self.EnglishUserName(), self.ArabicUserName(), self.MedicalCenterClinicNamesOrAll(), self.Mobile(),
            self.IsActive(), self.Email(), self.MedicalCenter(), self.MedicalClinicIds(), self.Role(), clinics);
    }

    self.toSubmitModel = function () {
        var model = {
            UserId: self.UserId(),

            EnglishUserName: self.EnglishUserName(),
            ArabicUserName: self.ArabicUserName(),
            IsActive: self.IsActive(),
            Mobile: self.Mobile(),
            Email: self.Email(),
            Role: self.Role(),
        };

        model.MedicalClinics = [];

        if (self.MedicalCenter() !== undefined)
            model.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        ko.utils.arrayForEach(self.MedicalClinics(), function (e) {
            if (e.IsChecked() === true)
                model.MedicalClinics.push(e.Clinic().MedicalClinicId);
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
        if (self.ArabicUserName() === undefined || self.ArabicUserName() === '')
            return false;

        if (self.EnglishUserName() === undefined || self.EnglishUserName() === '')
            return false;
        
        if (self.Email() === undefined || self.Email() === '' || !isValidEmail(self.Email()))
            return false;

        if (self.Mobile() === undefined || self.Mobile() === '')
            return false;

        if (self.Role() === undefined)
            return false;

        if (self.Role() !== undefined)
            if (self.Role().NeedSpecifyMedicalCenter && self.MedicalCenter() === undefined)
                return false;

        if (self.Role() !== undefined)
            if (self.Role().NeedSpecifyMedicalCenterCategory && self.MedicalCenterCategory() === undefined)
                return false;

        return true;
    }
}

var componentUrl;
function UserMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;
    componentUrl = options.getMedicalClinicsUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.ActivationOptions = ko.observableArray(options.activationOptions);
    self.MedicalCenters = ko.observableArray(options.medicalCenters);
    self.MedicalClinics = ko.observableArray(options.medicalCenterCategories);
    self.AllMedicalClinics = ko.observableArray(options.medicalClinics);
    self.Roles = ko.observableArray(options.roles);

    self.SearchMedicalCenters = function (medicalCenterId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === medicalCenterId;
        });
    };

    self.SearchRole = function (role) {
        return ko.utils.arrayFirst(self.Roles(), function (roleName) {
            return roleName.Name === role;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var medicalCenter = self.SearchMedicalCenters(item.MedicalCenterId);
            var role = undefined;
            if (item.Role !== null)
                role = self.SearchRole(item.Role.Name);

            var result = new UserVM(item.UserId, item.EnglishUserName, item.ArabicUserName, item.MedicalCenterNameOrAll, item.Mobile, item.IsActive, item.Email, medicalCenter, item.MedicalClinics, role);

            if (self.IsMarkedUser(item.UserId))
                result.IsMarked(true);
            else
                result.IsMarked(false);

            return result;
        });
    };

    self.IsMarkedUser = function (id) {
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
    self.Users = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Users().length === 0);
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
        return new UserVM(0, '', '', '', '', false, '', undefined, [], undefined);
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

        return ko.utils.arrayFirst(self.Users(), function (element) {
            return element.UserId() === self.SelectedElement().UserId();
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
            return self.Users()[0];
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
        self.Users(observableItems);

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
        return ko.utils.arrayFirst(self.Users(), function (temp) {
            return temp.UserId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.Users(), function (r) {
            if (r.IsMarked() === true)
                self.SelectedItemsIds().push(r.UserId());
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
        var id = [self.SelectedElement().UserId()];
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
        var id = [self.SelectedElement().UserId()];
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
        self.Users(observableItems);
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

    self.Search();
}