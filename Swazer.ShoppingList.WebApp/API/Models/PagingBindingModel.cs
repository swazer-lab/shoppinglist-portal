using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API
{
    public class PagingBindingModel<T>
    {
        public int TotalCount { get; set; }

        public List<T> Items { get; set; }
    }
}