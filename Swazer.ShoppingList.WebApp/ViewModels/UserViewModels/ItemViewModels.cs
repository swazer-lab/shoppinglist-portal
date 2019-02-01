using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.Models
{
    public class ItemViewModel
    {
        public int ItemId { get; set; }

        public string Title { get; set; }

        public ItemStatus Status { get; set; }
    }
}