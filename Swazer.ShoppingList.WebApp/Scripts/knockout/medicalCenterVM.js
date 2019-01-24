function MedicalCenterSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.Region = ko.observable();
    self.MedicalCenterCategory = ko.observable();
    self.ArabicName = ko.observable();
    self.EnglishName = ko.observable();
    self.SelectedStatus = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();
        criteria.ArabicName = self.ArabicName();
        criteria.EnglishName = self.EnglishName();

        if (self.MedicalCenterCategory())
            criteria.CategoryId = self.MedicalCenterCategory().MedicalCenterCategoryId;

        if (self.Region())
            criteria.RegionId = self.Region().RegionId;

        if (self.SelectedStatus())
            criteria.IsActive = self.SelectedStatus().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function MedicalClinicCheckBoxVM(id, name, isChecked) {
    var self = this;

    self.MedicalClinicId = ko.observable(id);
    self.Name = ko.observable(name);
    self.IsChecked = ko.observable(isChecked);

    self.toSubmitModel = function () {
        return self.MedicalClinicId();
    };

    self.copy = function () {
        return new MedicalClinicCheckBoxVM(self.MedicalClinicId(), self.Name(), self.IsChecked());
    }
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
        // if the pressed key is Enter
        if (e.keyCode !== 13)
            return true;

        if (self.IsValid())
            d.Mode(0);

        return false;
    };

    self.GetFocus = ko.observable(false);
}

function MedicalCenterVM(id, englishName, arabicName, englishAddress, arabicAddress, arabicBrief, englishBrief, category, region, isActive, logoId, logoAsString, lat, lng, clinics, contactInformations) {
    var self = this;

    self.IsMarked = ko.observable();
    self.MedicalCenterId = ko.observable(id);
    self.ArabicName = ko.observable(arabicName).extend({ required: true });
    self.EnglishName = ko.observable(englishName).extend({ required: true });
    self.ArabicAddress = ko.observable(arabicAddress).extend({ required: true });
    self.EnglishAddress = ko.observable(englishAddress).extend({ required: true });
    self.ArabicBrief = ko.observable(arabicBrief).extend({ required: true });
    self.EnglishBrief = ko.observable(englishBrief).extend({ required: true });
    self.IsActive = ko.observable(isActive).extend({ required: true });
    self.Category = ko.observable(category).extend({ required: true });
    self.Region = ko.observable(region).extend({ required: true });
    self.LogoId = ko.observable(logoId);
    self.ContactInformations = ko.observableArray(contactInformations);
    self.MedicalClinics = ko.observableArray(clinics).extend({ oneElementAtLeastCheckBoxList: true });

    self.IsContactInformationsEmpty = ko.pureComputed(function () {
        return (self.ContactInformations().length === 0);
    });

    self.SelectedMedicalClinics = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.MedicalClinics(), function (mc) {
            return mc.IsChecked() === true;
        });
    });

    self.arabicFile = ko.observable(logoAsString).extend({ required: true });

    self.Location = ko.observable({
        Lat: ko.observable(lat),
        Lng: ko.observable(lng),
    });

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

        var con = self.NewContactInformation();
        var created = new ContactInformationVM(con.ContactInformationId(), con.SelectedContactType(), con.Contact(), con.ShowOnSite());
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

    self.DisplayLocation = ko.pureComputed(function () {
        if (!self.Location() && !self.Location().Lat() && !self.Location().Lng())
            return '';
        return '(' + self.Location().Lat() + ',' + self.Location().Lng() + ')';
    });

    self.copy = function () {
        var clinics = [];
        ko.utils.arrayForEach(self.MedicalClinics(), function (c) {
            clinics.push(c.copy());
        });

        var contactInformations = [];
        ko.utils.arrayForEach(self.ContactInformations(), function (c) {
            contactInformations.push(c.copy());
        });

        return new MedicalCenterVM(self.MedicalCenterId(), self.EnglishName(), self.ArabicName(), self.EnglishAddress(), self.ArabicAddress(), self.ArabicBrief(), self.EnglishBrief(), self.Category(), self.Region(), self.IsActive(), self.LogoId(), self.arabicFile(), self.Location().Lat(), self.Location().Lng(), clinics, contactInformations);
    }

    self.toSubmitModel = function () {
        var model = {
            MedicalCenterId: self.MedicalCenterId(),
            EnglishName: self.EnglishName(),
            ArabicName: self.ArabicName(),
            EnglishAddress: self.EnglishAddress(),
            ArabicAddress: self.ArabicAddress(),
            ArabicBrief: self.ArabicBrief(),
            EnglishBrief: self.EnglishBrief(),
            CategoryId: self.Category().MedicalCenterCategoryId,
            RegionId: self.Region().RegionId,
            IsActive: self.IsActive(),
            Logo: self.arabicFile(),
            LogoId: self.LogoId(),
            Latitude: self.Location().Lat(),
            Longitude: self.Location().Lng(),
            MedicalClinicIds: [],
            ContactInformations: [],
        };

        ko.utils.arrayForEach(self.MedicalClinics(), function (e) {
            if (e.IsChecked() === true)
                model.MedicalClinicIds.push(e.MedicalClinicId);
        });

        ko.utils.arrayForEach(self.ContactInformations(), function (e) {
            model.ContactInformations.push(e.toSubmitModel());
        });
        return model;
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.ArabicName() === undefined || self.ArabicName() === '')
            return false;

        if (self.EnglishName() === undefined || self.EnglishName() === '')
            return false;

        if (self.EnglishAddress() === undefined || self.EnglishAddress() === '')
            return false;

        if (self.ArabicAddress() === undefined || self.ArabicAddress() === '')
            return false;

        if (self.ArabicBrief() === undefined || self.ArabicBrief() === '')
            return false;

        if (self.EnglishBrief() === undefined || self.EnglishBrief() === '')
            return false;

        if (self.Region() === undefined)
            return false;

        if (self.Category() === undefined)
            return false;

        if (self.arabicFile() === undefined || self.arabicFile() === '')
            return false;

        var clinicsCount = ko.utils.arrayFilter(self.MedicalClinics(), function (e) {
            return (e.IsChecked() === true);
        }).length;

        if (clinicsCount === 0)
            return false;

        return true;
    }
}

function MedicalCenterMainVM(options) {
    var self = this;

    //#region constans
    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;
    self.GetLogoUrl = options.getLogoUrl;
    self.GetBriefUrl = options.getBriefUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    //#endregion

    //#region map

    self.Categories = ko.observableArray(options.categories);
    self.Regions = ko.observableArray(options.regions);
    self.ActivationOptions = ko.observableArray(options.activationOptions);
    self.ContactTypes = ko.observableArray(options.contactTypes);
    self.AllMedicalClinics = ko.observableArray(options.medicalClinics);
    self.IsActiveMedicalClinicsEmpty = ko.observable(false);

    self.SearchCategories = function (categoryId) {
        return ko.utils.arrayFirst(self.Categories(), function (category) {
            return category.MedicalCenterCategoryId === categoryId;
        });
    };

    self.SearchRegion = function (regionId) {
        return ko.utils.arrayFirst(self.Regions(), function (region) {
            return region.RegionId === regionId;
        });
    };

    self.SearchContactTypes = function (cti) {
        return ko.utils.arrayFirst(self.ContactTypes(), function (e) {
            return e.ContactTypeId === cti;
        });
    }

    self.mapItems = function (collection) {
        var result = [];
        for (var i = 0; i < collection.length; i++) {
            var it = collection[i];
            var category = self.SearchCategories(it.CategoryId);
            var region = self.SearchRegion(it.RegionId);
            var contactInformations = [];

            ko.utils.arrayForEach(it.ContactInformations, function (ci) {
                var ct = self.SearchContactTypes(ci.ContactTypeId);
                contactInformations.push(new ContactInformationVM(ci.ContactInformationId, ct, ci.Contact, ci.ShowOnSite));
            });

            var clinics = ko.utils.arrayMap(self.AllMedicalClinics(), function (clinic) {
                var medicalClinic = ko.utils.arrayFirst(it.MedicalClinicIds, function (cc) {
                    return cc === clinic.MedicalClinicId;
                });

                var isChecked = medicalClinic == null ? false : true;
                return new MedicalClinicCheckBoxVM(clinic.MedicalClinicId, clinic.LocalizedName, isChecked);
            });

            var op = new MedicalCenterVM(it.MedicalCenterId, it.EnglishName, it.ArabicName, it.EnglishAddress, it.ArabicAddress, it.ArabicBrief, it.EnglishBrief, category, region, it.IsActive, it.LogoId, undefined, it.Latitude, it.Longitude, clinics, contactInformations);

            if (self.IsMarkedMedicalCenter(it.MedicalCenterId))
                op.IsMarked(true);
            else
                op.IsMarked(false);

            result.push(op);
        }
        return result;
    };

    self.IsMarkedMedicalCenter = function (id) {
        return ko.utils.arrayFirst(self.SelectedItemsIds(), function (selectedId) {
            if (selectedId === id)
                return true;
        });
        return false;
    };

    //#endregion

    //#region Observables
    self.IsMultipleDelete = ko.observable(false);
    self.ShowDeleteModal = ko.observable(false);
    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.MedicalCenters = ko.observableArray();

    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();
    //#endregion 

    //#region pureComputed
    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.MedicalCenters().length === 0);
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

    //#endregion

    //#region functions
    self.CreateNewElement = function () {
        var contactInformations = [];
        var clinics = [];
        ko.utils.arrayForEach(self.AllMedicalClinics(), function (clinic) {
            var c = new MedicalClinicCheckBoxVM(clinic.MedicalClinicId, clinic.LocalizedName, false);
            clinics.push(c);
        });

        return new MedicalCenterVM(0, '', '', '', '', '', '', undefined, undefined, false,
            0, undefined, undefined, undefined, clinics, contactInformations);
    };


    self.EnterEditMode = function () {
        if (self.AllMedicalClinics().length === 0) {
            ShowErrorMessage("Can not be created a medical center without active medical clinic or medical clinics");
            return;
        }
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

        return ko.utils.arrayFirst(self.MedicalCenters(), function (element) {
            return element.MedicalCenterId() === self.SelectedElement().MedicalCenterId();
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
            return self.MedicalCenters()[0];
        }

        self.EnterNoResultMode();
        return newEl;
    };

    self.PressCreate = function () {
        if (self.AllMedicalClinics().length === 0) {
            ShowErrorMessage("لايوجد عيادات طبية الرجاء إنشاء عيادة طبية والمحاولة لاحقا");
            return;
        }
        self.EnterCreateMode();
        var newEl = self.CreateNewElement();
        self.EditedElement(newEl);
        self.SelectedElement(newEl);
    };

    self.SelectRow = function (row) {
        row.arabicFile(undefined);
        row.ArabicBrief(undefined);
        row.EnglishBrief(undefined);
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
        if (e.keyCode === 13)   // if the pressed key is Enter
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

    self.GetLogo = function (newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetLogoUrl,
            data: {
                logoId: self.SelectedElement().LogoId(),
            },
            success: function (e) {
                if (temp.MedicalCenterId() === self.SelectedElement().MedicalCenterId()) {
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
        self.MedicalCenters(observableItems);

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
        return ko.utils.arrayFirst(self.MedicalCenters(), function (temp) {
            return temp.MedicalCenterId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.MedicalCenters(), function (r) {
            if (r.IsMarked() === true)
                self.SelectedItemsIds().push(r.MedicalCenterId());
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
        var id = [self.SelectedElement().MedicalCenterId()];
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
        var id = [self.SelectedElement().MedicalCenterId()];
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
        self.MedicalCenters(observableItems);
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

    self.GetBrief = function (lng, newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetBriefUrl,
            data: {
                contentType: lng,
                id: self.SelectedElement().MedicalCenterId()
            },
            success: function (e) {
                if (lng === 0) {
                    if (temp.MedicalCenterId() === self.SelectedElement().MedicalCenterId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().ArabicBrief(e);
                        self.SelectedElement().ArabicBrief(e);
                    }
                }
                else if (lng === 1) {
                    if (temp.MedicalCenterId() === self.SelectedElement().MedicalCenterId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().EnglishBrief(e);
                        self.SelectedElement().EnglishBrief(e);
                    }
                }
            },
            error: self.HandleError
        });
    }

    self.SelectedElementSubscription = self.SelectedElement.subscribe(function (newSE) {
        if (newSE.arabicFile() === undefined && newSE.LogoId() !== 0)
            self.GetLogo(newSE);

        if (newSE.MedicalCenterId() !== 0) {
            self.GetBrief(0, newSE);
            self.GetBrief(1, newSE);
        }
    });

    self.Search();
}