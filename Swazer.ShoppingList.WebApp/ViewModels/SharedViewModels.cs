using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Swazer.ShoppingList.WebApp.Models
{
    [ModelBinder(typeof(AliasModelBinder))]
    public class SearchCriteriaModel
    {
        [BindAlias("page")]
        public int CurrentPage { get; set; } = 1;

        [BindAlias("sort")]
        public string SortColumn { get; set; }

        [BindAlias("sortdir")]
        public string SortDirection { get; set; }

        public virtual string GetSortColumn()
        {
            if (SortColumn == "StatusDisplay")
                return "IsActive";

            if (SortColumn == "RequestTypeDisplay")
                return "RequestType";

            return SortColumn;
        }

        public virtual SortOrderEnum GetSortDirection()
        {
            return string.IsNullOrEmpty(SortDirection) || SortDirection.ToLower() == "asc"
                ? SortOrderEnum.Ascending
                : SortOrderEnum.Descending;
        }
    }

    public class BreadItem
    {
        public string Text { get; set; }

        public string Url { get; set; }

        public BreadItem(string text)
        {
            Text = text;
        }

        public BreadItem(string text, string url) : this(text)
        {
            Url = url;
        }
    }

    public class BreadcrumbModel
    {
        public List<BreadItem> Steps { get; set; }

        public BreadItem Current => Steps.LastOrDefault();

        public IEnumerable<BreadItem> InBetweenItems
        {
            get
            {
                if (Steps.Count < 2)
                    return new List<BreadItem>();

                return Steps.Take(Steps.Count - 1);
            }
        }

        public BreadcrumbModel(params BreadItem[] items)
        {
            Steps = items.ToList();
        }
    }

}