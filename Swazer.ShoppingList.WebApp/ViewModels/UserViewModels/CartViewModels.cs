using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.Models
{
    public class CartIndexViewModel
    {
        public int TotalCount { get; set; }

        public int PageSize { get; set; }

        public CartIndexSearchCriteria SearchCriteriaModel { get; set; }

        public List<CartViewModel> Items { get; set; }

        public IEnumerable<EnumSelectListItem> AccessLevels => HtmlExtensions.GetList<AccessLevel>();

        public int SelectedRowId { get; set; }

        public string Message { get; set; }
    }

    public class CartViewModel
    {
        public int? CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime? Date { get; set; }

        public AccessLevel AccessLevel { get; set; }

        public List<ItemViewModel> Items { get; set; }
    }

    public class EnumSelectListItem
    {
        public string text { get; set; }

        public int value { get; set; }
    }

    public class GenerateSharingUrlViewModel
    {
        public int CartId { get; set; }

        public AccessLevel AccessLevel { get; set; }
    }

    public class CartIndexSearchCriteria : SearchCriteriaModel
    {

    }
}