function MedicalClinicComponent(medicalCenterObservable, url) {
    var self = this;
    self.MedicalClinics = ko.observableArray([]);

    self.UpdateMedicalClinic = function (center) {
        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: url,
            data: {
                medicalCenterId: center.MedicalCenterId,
            },
            success: function (e) {
                self.MedicalClinics(e);
            },
            error: function (e) {
                console.log(e);
            }
        });
    }

    self.medicalCenterSubscription = medicalCenterObservable.subscribe(function (newCenter) {
        if (newCenter === undefined)
            self.MedicalClinics([]);
        else
            self.UpdateMedicalClinic(newCenter);
    });

    self.dispose = function () {
        self.medicalCenterSubscription.dispose();
    }

    if (medicalCenterObservable() !== undefined &&
        medicalCenterObservable() !== null &&
        medicalCenterObservable().MedicalCenterId !== 0) {
        self.UpdateMedicalClinic(medicalCenterObservable());
    }
}