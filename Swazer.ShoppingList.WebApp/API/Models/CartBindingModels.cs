using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.API.Resources.ErrorMessages;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class CartBindingModel
    {
        public int CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime? Date { get; set; }
    }

    public class CreateCartBindingModel
    {
        public int? CartId { get; set; }

        [Required(ErrorMessageResourceName = "CartTitleRequired", ErrorMessageResourceType = typeof(ErrorMessageStrings))]
        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime? Date { get; set; }

        public List<ItemBindingModel> Items { get; set; }
    }

    public class CartIndexBindingModel
    {
        public CartBindingModel Cart { get; set; }

        public List<UserProfileBindingModel> Users { get; set; }

        public List<ItemBindingModel> Items { get; set; }
    }

    public class CartGenerateShareBindingModel
    {
        public int CartId { get; set; }

        public AccessLevel AccessLevel { get; set; }
    }

    public class CartSearchCriteriaBindingModel : SearchCriteriaBindingModel
    {

    }
}