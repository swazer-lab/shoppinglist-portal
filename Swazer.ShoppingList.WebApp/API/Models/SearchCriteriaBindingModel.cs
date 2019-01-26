using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class SearchCriteriaBindingModel
    {
        public int? CurrentPage { get; set; } = 1;

        public int PageSize { get; set; } = 5;
    }
}