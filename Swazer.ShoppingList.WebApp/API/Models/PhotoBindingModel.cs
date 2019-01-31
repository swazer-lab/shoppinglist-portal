using Swazer.ShoppingList.WebApp.API.Resources.ErrorMessages;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class PhotoBindingModel
    {
        [Required(ErrorMessageResourceName = "PhotoRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Photo { get; set; }
    }
}