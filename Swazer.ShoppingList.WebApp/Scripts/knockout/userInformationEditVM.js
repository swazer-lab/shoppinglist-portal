function UserVM(user, clinics, centers, medicalClinicIds, medicalCenterIds) {
    var self = this;

    self.ArabicName = ko.observable(user.ArabicName).extend({ required: true });
    self.EnglishName = ko.observable(user.EnglishName).extend({ required: true });
    self.Email = ko.observable(user.Email).extend({ required: true });
    self.Mobile = ko.observable(user.Mobile).extend({ required: true });
    self.Address = ko.observable(user.Address);

    self.MobileSubscription = self.Mobile.subscribe(function (newVal) {
        forceJustMobile(self.Mobile);
    });

    self.FavoriteGender = ko.observable(user.FavoriteGender).extend({ required: true });
    self.Gender = ko.observable(user.Gender).extend({ required: true });
    self.Language = ko.observable(user.Language).extend({ required: true });

    self.FavoriteClinics = ko.observableArray(clinics);
    self.FavoriteCenters = ko.observableArray(centers);
    self.FavoriteCentersIds = ko.observableArray(medicalCenterIds);
    self.FavoriteClinicsIds = ko.observableArray(medicalClinicIds);

    self.CenterDisplayNames = ko.pureComputed(function () {
        return ko.utils.arrayMap(self.FavoriteCenters(), function (e) {
            return e.LocalizedName;
        }).join(' ');
    });

    self.ClinicDisplayNames = ko.pureComputed(function () {
        return ko.utils.arrayMap(self.FavoriteClinics(), function (e) {
            return e.LocalizedName;
        }).join(' ');
    });

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

        if (self.Email() === undefined || self.Email() === '')
            return false;

        if (self.Mobile() === undefined || self.Mobile() === '')
            return false;

        if (self.Gender() === undefined || self.Gender() === '')
            return false;

        if (self.FavoriteGender() === undefined || self.FavoriteGender() === '')
            return false;

        if (self.Language() === undefined || self.Language() === '')
            return false;

        return true;
    }

    self.copy = function () {
        return new UserVM({ EnglishName: self.EnglishName(), ArabicName: self.ArabicName(), Email: self.Email(), Mobile: self.Mobile(), FavoriteGender: self.FavoriteGender(), Gender: self.Gender(), Language: self.Language(), Address: self.Address() }, self.FavoriteClinics(), self.FavoriteCenters(), self.FavoriteClinicsIds(), self.FavoriteCentersIds());
    }
}

function UserInformationEditVM(options) {
    var self = this;

    self.AllMedicalClinics = ko.observableArray(options.medicalClinics);
    self.AllMedicalCenters = ko.observableArray(options.medicalCenters);
    self.Languages = ko.observableArray(options.languages);
    self.Genders = ko.observableArray(options.genders);

    self.SearchGender = function (gVal) {
        return ko.utils.arrayFirst(self.Genders(), function (e) {
            return e.value === gVal;
        });
    }

    self.SearchLanguage = function (lan) {
        return ko.utils.arrayFirst(self.Languages(), function (l) {
            return l.value === lan;
        });
    }

    self.SearchMedicalCenters = function (medicalCenterId) {
        return ko.utils.arrayFirst(self.AllMedicalCenters(), function (medicalCenter) {
            return medicalCenter.MedicalCenterId === medicalCenterId;
        });
    };

    self.SearchMedicalClinics = function (medicalClinicId) {
        return ko.utils.arrayFirst(self.AllMedicalClinics(), function (medicalClinic) {
            return medicalClinic.MedicalClinicId === medicalClinicId;
        });
    }

    self.map = function (item) {
        var medicalCenters = ko.utils.arrayMap(item.FavoriteMedicalCenters, function (e) {
            return self.SearchMedicalCenters(e);
        });

        var medicalCenterIds = ko.utils.arrayMap(item.FavoriteMedicalCenters, function (e) {
            return self.SearchMedicalCenters(e).MedicalCenterId;
        });

        var medicalClinics = ko.utils.arrayMap(item.FavoriteMedicalClinics, function (e) {
            return self.SearchMedicalClinics(e);
        });

        var medicalClinicIds = ko.utils.arrayMap(item.FavoriteMedicalClinics, function (e) {
            return self.SearchMedicalClinics(e).MedicalClinicId;
        });

        var g = self.SearchGender(item.Gender);
        var l = self.SearchLanguage(item.Language);
        var fav = self.SearchGender(item.FavoriteGender);
        item.Gender = g;
        item.Language = l;
        item.FavoriteGender = fav;
        item.Address = item.Address;
        return new UserVM(item, medicalClinics, medicalCenters, medicalClinicIds, medicalCenterIds);
    };

    self.EditUrl = ko.observable(options.editUrl);
    self.SelectedUser = ko.observable(self.map(options.user));
    self.EditedUser = ko.observable(self.SelectedUser().copy());
    self.IsEdit = ko.observable(false);
    self.IsDetail = ko.observable(true);

    self.GoEdit = function () {
        self.IsEdit(true);
        self.IsDetail(false);
    };

    self.GoDetail = function () {
        self.IsDetail(true);
        self.IsEdit(false);
    };

    self.Save = function (form) {
        var favoriteGender;
        if (self.EditedUser().FavoriteGender())
            favortieGender = self.EditedUser().FavoriteGender().value;

        if (!self.EditedUser().FullValidation()) {
            self.EditedUser().ShowErrors();
            return false;
        }

        var medicalCenterIds = [];
        ko.utils.arrayForEach(self.EditedUser().FavoriteCentersIds(), function (id) {
            medicalCenterIds.push(id);
        });

        var medicalClinicsIds = [];
        ko.utils.arrayForEach(self.EditedUser().FavoriteClinicsIds(), function (id) {
            medicalClinicsIds.push(id);
        });

        $.ajax({
            async: true,
            method: 'POST',
            url: self.EditUrl(),
            data: {
                EnglishName: self.EditedUser().EnglishName,
                ArabicName: self.EditedUser().ArabicName,
                Email: self.EditedUser().Email,
                Mobile: self.EditedUser().Mobile,
                Gender: self.EditedUser().Gender().value,
                Language: self.EditedUser().Language().value,
                FavoriteGender: self.EditedUser().FavoriteGender().value,
                FavoriteMedicalCenters: medicalCenterIds,
                FavoriteMedicalClinics: medicalClinicsIds,
                Address: self.EditedUser().Address
            },
            success: function (e) {
                self.IsDetail(true);
                self.IsEdit(false);
                self.SelectedUser(self.map(e));
            },
            error: self.HandleError
        });
        return false;
    };

    self.HandleError = function (message) {
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };
}