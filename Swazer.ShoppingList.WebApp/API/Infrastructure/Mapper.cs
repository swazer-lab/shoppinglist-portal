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
            criteria.Title = model.Title;

            return criteria;
        }

        public static UserMobileSearchCriteria ToSearchCriteria(this UserSearchCriteriaBindingModel model, int id)
        {
            UserMobileSearchCriteria criteria = CreateSearchCriteria<UserMobileSearchCriteria>(model);

            criteria.UserId = id;
            criteria.Name = model.Name;

            return criteria;
        }

        public static FriendMobileSearchCriteria ToSearchCriteria(this FriendSearchCriteriaBindingModel model, int userId)
        {
            FriendMobileSearchCriteria criteria = CreateSearchCriteria<FriendMobileSearchCriteria>(model);

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

        public static ItemBindingModel ToBindingModel(this Item model)
        {
            return new ItemBindingModel()
            {
                ItemId = model.ItemId,
                Title = model.Title
            };
        }

        public static ItemBindingModel ToCartItemBindingModel(this CartItem model, Item item)
        {
            return new ItemBindingModel()
            {
                ItemId = model.ItemId,
                Title = item.Title,
                Status = model.Status
            };
        }

        public static UserProfileBindingModel ToUserProfileBindingModel(this User user)
        {
            return new UserProfileBindingModel()
            {
                UserId = user.Id,
                Email = user.Email,
                Mobile = user.Mobile,
                Name = user.Name,
                IsConfirmed = user.EmailConfirmed
            };
        }

        public static UserProfileBindingModel ToUserProfileBindingModel(this CartOwner model, User user, Image image)
        {
            return new UserProfileBindingModel()
            {
                UserId = user.Id,
                Email = user.Email,
                Mobile = user.Mobile,
                Name = user.Name,
                AccessLevel = model.AccessLevel,
                PhotoId = image?.ImageId
            };
        }

        public static CartIndexBindingModel ToCartIndexBindingModel(this Cart model)
        {
            return new CartIndexBindingModel()
            {
                Cart = model.ToCartBindingModel()
            };
        }

        public static CartIndexBindingModel ToCartObjectIndexBindingModel(this CartObject model)
        {
            return new CartIndexBindingModel()
            {
                Cart = model.ToCartBindingModel(),
                Items = model.Items?.Select(x => x.ToCartItemBindingModel()).ToList()
            };
        }

        public static CartBindingModel ToCartBindingModel(this CartObject model)
        {
            return new CartBindingModel()
            {
                CartId = model.CartId,
                Title = model.Title,
                Notes = model.Notes,
                Date = model.Date,
                Index = model.CartIndex
            };
        }

        public static ItemBindingModel ToCartItemBindingModel(this CartItemObject model)
        {
            return new ItemBindingModel()
            {
                ItemId = model.ItemId,
                Title = model.Title,
                Status = model.Status
            };
        }
    }
}