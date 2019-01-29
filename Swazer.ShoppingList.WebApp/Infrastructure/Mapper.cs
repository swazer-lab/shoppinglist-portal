using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.Areas.Admin.Models;
using Swazer.ShoppingList.WebApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public static class Mapper
    {
        private static T CreateSearchCriteria<T>(SearchCriteriaModel model) where T : SearchCriteria, new()
        {
            T criteria = new T();

            criteria.PageNumber = model.CurrentPage;
            criteria.PageSize = BaseController.PageSize;
            criteria.Sort = model.GetSortColumn();
            criteria.SortDirection = model.GetSortDirection();

            return criteria;
        }

        public static ItemSearchCriteria ToSearchCriteria(this ItemIndexSearchCriteria model)
        {
            ItemSearchCriteria criteria = CreateSearchCriteria<ItemSearchCriteria>(model);

            return criteria;
        }

        public static ItemViewModel ToViewModel(this Item model)
        {
            return new ItemViewModel
            {
                ItemId = model.ItemId,
                Title = model.Title,
                IsActive = model.IsActive
            };
        }
    }
}