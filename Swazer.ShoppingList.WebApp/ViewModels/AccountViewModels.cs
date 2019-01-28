using Swazer.ShoppingList.WebApp.API.Resources.ErrorMessages;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.Resources;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Swazer.ShoppingList.WebApp.Models
{
    
    public class ExternalLoginConfirmationViewModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EmailRequired")]
        [Display(ResourceType = typeof(AccountStrings), Name = "Email")]
        public string Email { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EnglishNameRequired")]
        [Display(ResourceType = typeof(AccountStrings), Name = "EnglishName")]
        [StringLength(250, ErrorMessageResourceName = "FullNameLengthMessage", ErrorMessageResourceType = typeof(AccountStrings), MinimumLength = 1)]
        public string EnglishName { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "ArabicNameRequired")]
        [Display(ResourceType = typeof(AccountStrings), Name = "ArabicName")]
        [StringLength(250, ErrorMessageResourceName = "FullNameLengthMessage", ErrorMessageResourceType = typeof(AccountStrings), MinimumLength = 1)]
        public string ArabicName { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "MobileRequired")]
        [Display(ResourceType = typeof(AccountStrings), Name = "Mobile")]
        [StringLength(10, ErrorMessageResourceName = "MobileLengthMessage", ErrorMessageResourceType = typeof(AccountStrings), MinimumLength = 10)]
        public string Mobile { get; set; }
    }

    public class ExternalLoginListViewModel
    {
        public string ReturnUrl { get; set; }
    }

    public class SendCodeViewModel
    {
        public string SelectedProvider { get; set; }
        public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
        public string ReturnUrl { get; set; }
        public bool RememberMe { get; set; }
    }

    public class VerifyMobileViewModel
    {
        public string LastPartOfPhoneNumber { get; set; }

        //public string PhoneNumber { get; set; }
        public string Code { get; set; }
        public string UserName { get; set; }
        //public string ReturnUrl { get; set; }
        public int ExpirationPeriod { get; set; } = 1;
    }

    public class VerifyCodeViewModel
    {
        [Required]
        public string Provider { get; set; }

        [Required]
        [Display(Name = "Code")]
        public string Code { get; set; }
        public string ReturnUrl { get; set; }

        [Display(Name = "Remember this browser?")]
        public bool RememberBrowser { get; set; }

        public bool RememberMe { get; set; }
    }

    public class ForgotViewModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EmailRequired")]
        [Display(ResourceType = typeof(AccountStrings), Name = "Email")]
        public string Email { get; set; }
    }

    public class LoginViewModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EmailRequired")]
        [Display(ResourceType = typeof(AccountStrings), Name = "Email")]
        [EmailAddress(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EmailNotCorrect")]
        public string Email { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "PasswordRequired")]
        [DataType(DataType.Password)]
        [Display(ResourceType = typeof(AccountStrings), Name = "Password")]
        public string Password { get; set; }

        [Display(ResourceType = typeof(AccountStrings), Name = "RememberMe")]
        public bool RememberMe { get; set; }
    }

    public class RegisterViewModel
    {
        [Required(ErrorMessageResourceName = "RegisterNameRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Name { get; set; }

        [Required(ErrorMessageResourceName = "RegisterEmailRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Email { get; set; }

        [Required(ErrorMessageResourceName = "RegisterPasswordRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Password { get; set; }

        [Required(ErrorMessageResourceName = "RegisterMobileRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Mobile { get; set; }
    }

    public class ResetPasswordViewModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "PasswordRequired")]
        [StringLength(20, ErrorMessageResourceName = "PasswordLengthMessage", ErrorMessageResourceType = typeof(AccountStrings), MinimumLength = 8)]
        [DataType(DataType.Password)]
        [Display(ResourceType = typeof(AccountStrings), Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(ResourceType = typeof(AccountStrings), Name = "ConfirmPassword")]
        [Compare("Password", ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "ConfirmPasswordValidationMessage")]
        public string ConfirmPassword { get; set; }

        public string Code { get; set; }

        public int UserId { get; set; }
    }

    public class ForgotPasswordViewModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EmailRequired")]
        [EmailAddress(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EmailNotCorrect")]
        [Display(ResourceType = typeof(AccountStrings), Name = "Email")]
        public string Email { get; set; }
    }
}
