using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.API.Resources.ChangePassword;
using Swazer.ShoppingList.WebApp.API.Resources.ErrorMessages;
using Swazer.ShoppingList.WebApp.API.Resources.Register;
using System.ComponentModel.DataAnnotations;

namespace Swazer.ShoppingList.WebApp.API
{
    public class RegisterBindingModel
    {
        [Required(ErrorMessageResourceName = "RegisterNameRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Name { get; set; }
        
        [Required(ErrorMessageResourceName = "RegisterEmailRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Email { get; set; }

        [Required(ErrorMessageResourceName = "RegisterPasswordRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Password { get; set; }

        public string Mobile { get; set; }
    }

    public class UserProfileBindingModel
    {
        public int UserId { get; set; }

        public int? PhotoId { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }
        
        public string Mobile { get; set; }

        public AccessLevel AccessLevel { get; set; }

        public bool IsConfirmed { get; set; }
    }

    public class UpdateUserBindingModel
    {
        public string Name { get; set; }

        public string Mobile { get; set; }
    }

    public class ConfirmEmailBindingModel
    {
        public int UserId { get; set; }

        public string Token { get; set; }
    }

    public class ResetPasswordViewModel
    {
        [Required(ErrorMessageResourceName = "NewPasswordRequired", ErrorMessageResourceType = typeof(ChangePasswordErrorStrings))]
        [StringLength(100, ErrorMessageResourceName = "PasswordLengthError", ErrorMessageResourceType = typeof(ChangePasswordErrorStrings), MinimumLength = 6)]
        public string Password { get; set; }

        public string Code { get; set; }

        [EmailAddress(ErrorMessageResourceName = "EmailIsNotCorrectFormat", ErrorMessageResourceType = typeof(RegisterErrorStrings))]
        [Required(ErrorMessageResourceName = "Email", ErrorMessageResourceType = typeof(RegisterErrorStrings))]
        public string Email { get; set; }
    }

    public class ForgotPasswordViewModel
    {
        [EmailAddress(ErrorMessageResourceName = "EmailIsNotCorrectFormat", ErrorMessageResourceType = typeof(RegisterErrorStrings))]
        [Required(ErrorMessageResourceName = "Email", ErrorMessageResourceType = typeof(RegisterErrorStrings))]
        public string Email { get; set; }
    }

    public class RegisterExternalBindingModel
    {
        public string Name { get; set; }

        public string Email { get; set; }
        
        public string Token { get; set; }

        public string Provider { get; set; }
    }
}