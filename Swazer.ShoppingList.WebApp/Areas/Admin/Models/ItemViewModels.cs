using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.Areas.Admin.Models
{
    public class ItemIndexViewModel
    {
        public int TotalCount { get; set; }

        public int PageSize { get; set; }

        public ItemIndexSearchCriteria SearchCriteriaModel { get; set; }

        public IEnumerable<ItemViewModel> Items { get; set; }

        public int SelectedRowId { get; set; }

        public string Message { get; set; }
    }

    public class ItemViewModel
    {
        public int ItemId { get; set; }

        public string Title { get; set; }

        public bool IsActive { get; set; }
    }

    public class ItemIndexSearchCriteria: SearchCriteriaModel
    {

    }
}