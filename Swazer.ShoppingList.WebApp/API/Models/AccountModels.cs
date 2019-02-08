using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.API.Resources.ErrorMessages;
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
    }

    public class UpdateUserBindingModel
    {
        public string Name { get; set; }

        public string Mobile { get; set; }
    }
}