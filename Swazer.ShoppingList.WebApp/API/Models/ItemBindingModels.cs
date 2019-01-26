using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.API.Resources.ErrorMessages;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class ItemBindingModel
    {
        public int ItemId { get; set; }

        [Required(ErrorMessageResourceName = "ItemTitleRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Title { get; set; }

        [Required(ErrorMessageResourceName = "ItemStatusRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public ItemStatus Status { get; set; }
    }
}