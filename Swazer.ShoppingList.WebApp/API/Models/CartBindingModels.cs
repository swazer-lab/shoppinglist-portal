using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class CartBindingModel
    {
        public int CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime Date { get; set; }
    }

    public class CreateCartBindingModel
    {
        public int? CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime Date { get; set; }

        public List<ItemBindingModel> Items { get; set; }
    }

    public class CartIndexBindingModel
    {
        public CartBindingModel Cart { get; set; }

        public List<ItemBindingModel> Items { get; set; }
    }

    public class CartSearchCriteriaBindingModel : SearchCriteriaBindingModel
    {

    }
}