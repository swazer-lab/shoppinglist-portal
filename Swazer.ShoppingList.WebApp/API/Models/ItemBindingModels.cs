using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class ItemBindingModel
    {
        public int ItemId { get; set; }

        public string Title { get; set; }

        public ItemStatus Status { get; set; }
    }

    public class CreateItemsBindingModel
    {
        public List<ItemBindingModel> Items { get; set; }

        public int CardId { get; set; }
    }

    public class UpdateItemBindingModel
    {
        public List<ItemBindingModel> Items { get; set; }
    }
}