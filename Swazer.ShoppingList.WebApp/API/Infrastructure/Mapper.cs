using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Infrastructure
{
    public static class Mapper
    {
        private static T CreateSearchCriteria<T>(SearchCriteriaBindingModel model) where T : SearchCriteria, new()
        {
            T criteria = new T();

            criteria.PageNumber = model.CurrentPage.Value;
            criteria.PageSize = model.PageSize;

            return criteria;
        }

        public static CartMobileSearchCriteria ToSearchCriteria(this CartSearchCriteriaBindingModel model, int userId)
        {
            CartMobileSearchCriteria criteria = CreateSearchCriteria<CartMobileSearchCriteria>(model);

            criteria.UserId = userId;

            return criteria;
        }

        public static CartBindingModel ToCartBindingModel(this Cart model)
        {
            return new CartBindingModel()
            {
                CartId = model.CartId,
                Title = model.Title,
                Notes = model.Notes,
                Date = model.Date
            };
        }

        public static ItemBindingModel ToItemBindingModel(this Item model)
        {
            return new ItemBindingModel()
            {
                ItemId = model.ItemId,
                Title = model.Title
            };
        }

        public static UserProfileBindingModel ToUserProfileBindingModel(this User model)
        {
            return new UserProfileBindingModel()
            {
                Email = model.Email,
                Mobile = model.Mobile,
                Name = model.Name
            };
        }

        public static CartIndexBindingModel ToCartIndexBindingModel(this Cart model)
        {
            return new CartIndexBindingModel()
            {
                Cart = model.ToCartBindingModel()
            };
        }
    }
}