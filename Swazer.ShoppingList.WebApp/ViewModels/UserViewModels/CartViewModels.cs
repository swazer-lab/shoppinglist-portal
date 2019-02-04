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

        public int SelectedRowId { get; set; }

        public string Message { get; set; }
    }

    public class CartViewModel
    {
        public int? CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime? Date { get; set; }

        public List<UserProfileViewModel> Users { get; set; }

        public List<ItemViewModel> Items { get; set; }
    }

    public class CartIndexSearchCriteria : SearchCriteriaModel
    {

    }
}