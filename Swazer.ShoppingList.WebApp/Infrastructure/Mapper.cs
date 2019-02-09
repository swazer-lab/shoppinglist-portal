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

        public static CartSearchCriterias ToSearchCriteria(this CartIndexSearchCriteria model, int userId)
        {
            CartSearchCriterias criteria = CreateSearchCriteria<CartSearchCriterias>(model);
            criteria.UserId = userId;

            return criteria;
        }

        public static Areas.Admin.Models.ItemViewModel ToViewModel(this Item model)
        {
            return new Areas.Admin.Models.ItemViewModel
            {
                ItemId = model.ItemId,
                Title = model.Title,
                IsActive = model.IsActive
            };
        }

        public static Models.ItemViewModel ToViewModel(this CartItem model, Item item)
        {
            return new Models.ItemViewModel()
            {
                ItemId = model.ItemId,
                Title = item.Title,
                Status = model.Status
            };
        }


        public static UserProfileViewModel ToUserProfileViewModel(this CartOwner model, User user, Image image)
        {
            return new UserProfileViewModel()
            {
                UserId = user.Id,
                Email = user.Email,
                Mobile = user.Mobile,
                Name = user.Name,
                AccessLevel = model.AccessLevel
            };
        }

        public static CartViewModel ToViewModel(this Cart model)
        {
            return new CartViewModel()
            {
                CartId = model.CartId,
                Date = model.Date,
                Notes = model.Notes,
                Title = model.Title
            };
        }

        public static UserProfileViewModel ToViewModel(this User model)
        {
            return new UserProfileViewModel()
            {
                UserId = model.Id,
                Name = model.Name, 
                Email = model.Email,
                Mobile = model.Mobile
            };
        }
    }
}