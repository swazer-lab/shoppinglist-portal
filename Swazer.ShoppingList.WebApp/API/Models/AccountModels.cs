using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain.BusinessRuleResource;
using Swazer.ShoppingList.WebApp.API.Resources.ErrorMessages;
using Swazer.ShoppingList.WebApp.API.Resources.Register;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.Resources;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

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

        [Required(ErrorMessageResourceName = "RegisterMobileRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Mobile { get; set; }
    }

    public class UserProfileBindingModel
    {
        public string Name { get; set; }

        public string Email { get; set; }
        
        public string Mobile { get; set; }
    }

    public class UserBindingModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "ArabicNameRequired")]
        [StringLength(250, ErrorMessageResourceName = "FullNameLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string ArabicName { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EnglishNameRequired")]
        [StringLength(250, ErrorMessageResourceName = "FullNameLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string EnglishName { get; set; }

        [EmailAddress]
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EmailRequired")]
        [StringLength(250, ErrorMessageResourceName = "EmailLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string Email { get; set; }

        [Required(ErrorMessageResourceName = "MobileRequiredError", ErrorMessageResourceType = typeof(RegisterApiStrings))]
        public string Mobile { get; set; }

        [StringLength(20, ErrorMessageResourceName = "PasswordLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 8)]
        [PasswordRegex(ErrorMessageResourceName = "GeneralPasswordErrorMessage", ErrorMessageResourceType = typeof(AccountStrings))]
        public string Password { get; set; }

        [Required(ErrorMessageResourceName = "RefIdRequiredError", ErrorMessageResourceType = typeof(RegisterApiStrings))]
        public Guid RefId { get; set; }

        [Required(ErrorMessageResourceName = "CodeRequiredError", ErrorMessageResourceType = typeof(RegisterApiStrings))]
        public string Code { get; set; }
    }

    public class UserEditBindingModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EnglishNameRequired")]
        [StringLength(250, ErrorMessageResourceName = "FullNameLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string EnglishName { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "ArabicNameRequired")]
        [StringLength(250, ErrorMessageResourceName = "FullNameLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string ArabicName { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EmailRequired")]
        [EmailAddress]
        [StringLength(250, ErrorMessageResourceName = "EmailLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string Email { get; set; }

        [Required(ErrorMessageResourceName = "MobileRequiredError", ErrorMessageResourceType = typeof(RegisterApiStrings))]
        public string Mobile { get; set; }

        public bool IsExternal { get; set; }
    }

    public class ChangePasswordBindingModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "PasswordRequired")]
        [StringLength(20, ErrorMessageResourceName = "PasswordLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 8)]
        [DataType(DataType.Password)]
        [PasswordRegex(ErrorMessageResourceName = "GeneralPasswordErrorMessage", ErrorMessageResourceType = typeof(AccountStrings))]
        public string OldPassword { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "PasswordRequired")]
        [StringLength(20, ErrorMessageResourceName = "PasswordLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 8)]
        [DataType(DataType.Password)]
        [PasswordRegex(ErrorMessageResourceName = "GeneralPasswordErrorMessage", ErrorMessageResourceType = typeof(AccountStrings))]
        public string NewPassword { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "PasswordRequired")]
        [StringLength(20, ErrorMessageResourceName = "PasswordLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 8)]
        [Compare("NewPassword", ErrorMessageResourceType = typeof(RegisterApiStrings), ErrorMessageResourceName = "ComparePassword")]
        [PasswordRegex(ErrorMessageResourceName = "GeneralPasswordErrorMessage", ErrorMessageResourceType = typeof(AccountStrings))]
        public string ConfirmPassword { get; set; }
    }

    public class RegisterExternalBindingModel
    {
        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EnglishNameRequired")]
        [StringLength(250, ErrorMessageResourceName = "FullNameLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string ArabicName { get; set; }

        [Required(ErrorMessageResourceType = typeof(AccountStrings), ErrorMessageResourceName = "EnglishNameRequired")]
        [StringLength(250, ErrorMessageResourceName = "FullNameLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string EnglishName { get; set; }

        [EmailAddress(ErrorMessageResourceName = "EmailNotCorrect", ErrorMessageResourceType = typeof(RegisterApiStrings))]
        [StringLength(250, ErrorMessageResourceName = "EmailLengthError", ErrorMessageResourceType = typeof(RegisterApiStrings), MinimumLength = 1)]
        public string Email { get; set; }

        [Required(ErrorMessageResourceName = "MobileRequiredError", ErrorMessageResourceType = typeof(RegisterApiStrings))]
        public string Mobile { get; set; }

        [Required(ErrorMessageResourceName = "Token", ErrorMessageResourceType = typeof(RegisterApiStrings))]
        public string Token { get; set; }

        [Required(ErrorMessageResourceName = "Provider", ErrorMessageResourceType = typeof(RegisterApiStrings))]
        public string Provider { get; set; }
    }
}