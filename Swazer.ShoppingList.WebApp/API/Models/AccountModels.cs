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

        public string Mobile { get; set; }
    }

    public class UserProfileBindingModel
    {
        public int? PhotoId { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }
        
        public string Mobile { get; set; }
    }

    public class UpdateUserBindingModel
    {
        public string Name { get; set; }

        public string Mobile { get; set; }
    }
}