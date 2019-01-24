function PasswordVM(user) {
    var self = this;

    self.OldPassword = ko.observable();
    self.NewPassword = ko.observable();
    self.NewPasswordConfirmation = ko.observable();
}

function ChangePasswordEditVM(options) {
    var self = this;

    self.ChangePasswordUrl = options.changePasswordUrl;
    self.LoginUrl = options.loginUrl
    self.EditedElement = ko.observable(new PasswordVM());

    self.Save = function (form) {
        $.ajax({
            async: true,
            method: 'POST',
            url: self.ChangePasswordUrl,
            data: {
                oldPassword: self.EditedElement().OldPassword,
                newPassword: self.EditedElement().NewPassword,
                newConfirmationPassword: self.EditedElement().NewPasswordConfirmation,
            },
            success: function (e) {
                window.location.href = self.LoginUrl;
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