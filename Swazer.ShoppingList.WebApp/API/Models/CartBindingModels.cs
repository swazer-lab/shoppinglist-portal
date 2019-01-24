using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class CartCreateBindingModels
    {
        public int CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime Date { get; set; }
    }
}