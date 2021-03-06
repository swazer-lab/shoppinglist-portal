﻿using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace Swazer.ShoppingList.WebApp.Controllers
{
    [AllowUser]
    public class CartController : BaseController
    {
        public ActionResult Index(CartIndexSearchCriteria criteria)
        {
            CartIndexViewModel model = new CartIndexViewModel
            {
                PageSize = PageSize,
                TotalCount = 0,
            };

            return View(model);
        }

        public ActionResult Search(CartIndexSearchCriteria criteria)
        {
            CartIndexViewModel model = GetCartIndexModel(criteria);
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        private CartIndexViewModel GetCartIndexModel(CartIndexSearchCriteria criteriaModel, string message = "")
        {
            User user = GetCurrentUser();

            CartSearchCriterias criteria = criteriaModel.ToSearchCriteria(user.Id);
            IQueryResult<Cart> results = CartService.Obj.Find(criteria);

            var result = new CartIndexViewModel
            {
                Items = results.Items.Select(x => x.ToViewModel()).ToList(),
                TotalCount = results.TotalCount,
                PageSize = PageSize,
                SearchCriteriaModel = criteriaModel,
                Message = message
            };

            foreach (var cart in result.Items)
            {
                cart.AccessLevel = CartOwnerService.Obj.GetCartUser(cart.CartId.Value, user.Id).AccessLevel;
                cart.Items = Domain.Service.User.ItemService.Obj.GetItemsByCard(cart.CartId.Value).Select(x => x.ToViewModel(ItemService.Obj.GetById(x.ItemId))).ToList();
                cart.Users = CartOwnerService.Obj.GetUsersByCart(cart.CartId.Value, user.Id).Select(x => x.ToUserProfileViewModel(UserService.Obj.FindById(x.UserId), ImageService.Obj.FindByUserId(x.UserId))).ToList();
            }

            return result;
        }

        //[HttpPost]
        //[HandleAjaxException]
        //public ActionResult Create(CartViewModel viewModel, CartIndexSearchCriteria criteria)
        //{
        //    User user = GetCurrentUser();

        //    Cart cart = null;

        //    if (!viewModel.CartId.HasValue || viewModel.CartId == 0)
        //    {
        //        cart = Cart.Create(viewModel.Title, viewModel.Notes, viewModel.Date);

        //        List<CartItem> items = viewModel.Items?.Select(x => CartItem.Create(cart, Item.Create(x.Title), x.Status)).ToList();

        //        cart = CartService.Obj.Create(cart, user, items);
        //    }

        //    else
        //    {
        //        cart = CartService.Obj.GetById(viewModel.CartId.Value);
        //        cart.Update(viewModel.Title, viewModel.Notes, viewModel.Date);

        //        List<CartOwner> users = new List<CartOwner>();

        //        if (viewModel.Users != null)
        //            users = viewModel.Users.Select(x => CartOwner.Create(cart, UserService.Obj.FindById(x.UserId), x.AccessLevel)).ToList();

        //        List<CartItem> items = viewModel.Items?.Select(x => CartItem.Create(cart, Item.Create(x.Title), x.Status)).ToList();

        //        CartService.Obj.Update(cart, items, users);
        //    }

        //    return Json(GetCartIndexModel(criteria, "Success"));
        //}

        [HttpPost]
        [HandleAjaxException]
        public ActionResult ChangeStatus(int id, bool isActive, CartIndexSearchCriteria criteria)
        {
            Item entity = ItemService.Obj.GetById(id);

            if (isActive)
                entity.Activate();
            else
                entity.Deactivate();

            ItemService.Obj.Update(entity);

            return Json(GetCartIndexModel(criteria, "Success"));
        }

        [HttpPost]
        [HandleAjaxException]
        public ActionResult Delete(int id, CartIndexSearchCriteria criteria)
        {
            CartService.Obj.Delete(id);

            return Json(GetCartIndexModel(criteria, "Success"));
        }

        [HttpGet]
        [HandleAjaxException]
        public ActionResult GenerateShareUrl(GenerateSharingUrlViewModel model)
        {
            string codedUrl = UserCodeOperation.ProduceCode(new int[] { model.CartId, (int)model.AccessLevel });

            string rootUrl = string.Format("{0}://{1}{2}", Request.Url.Scheme, Request.Url.Authority, Url.Content("~"));

            string fullUrl = $"{rootUrl}Cart/GetAccess/{codedUrl}";

            return Json(fullUrl, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetAccess(string id)
        {
            try
            {
                int[] parameters = UserCodeOperation.DecodeCode(id);

                int cartId = parameters[0];
                AccessLevel accessLevel = (AccessLevel)parameters[1];

                if (accessLevel == AccessLevel.Owner)
                    throw new BusinessRuleException("Owner access level must not be selected");

                User user = GetCurrentUser();

                CartOwner currentCartUser = CartOwnerService.Obj.GetCartUser(cartId, user.Id);

                if (currentCartUser != null)
                    if (currentCartUser.AccessLevel == AccessLevel.Owner)
                        return RedirectToAction("Index");

                FriendService.Obj.CreateFriends(user.Id, cartId);

                Cart cart = CartService.Obj.GetById(cartId);

                CartOwner cartOwner = CartOwner.Create(cart, user, accessLevel);

                CartOwnerService.Obj.Create(cartOwner);

                return RedirectToAction("Index");
            }

            catch (Exception ex)
            {
                TempData["ErrorMessage"] = ex.Message;

                return RedirectToAction("Login", "Account");
            }
        }

        public ActionResult UserProfile()
        {
            User user = GetCurrentUser();

            UserProfileViewModel viewModel = user.ToViewModel();

            var image = ImageService.Obj.FindByUserId(user.Id);

            if (image != null)
                viewModel.Photo = Convert.ToBase64String(image?.BlobContent);

            return View(viewModel);
        }

        [HttpGet]
        public ActionResult UserProfileEdit()
        {
            User user = GetCurrentUser();

            UserProfileViewModel viewModel = user.ToViewModel();

            var image = ImageService.Obj.FindByUserId(user.Id);

            if (image != null)
                viewModel.Photo = Convert.ToBase64String(image?.BlobContent);

            return View(viewModel);
        }

        [HttpPost]
        [HandleAjaxException]
        public ActionResult UserProfileEdit(UserProfileViewModel model)
        {
            if (!ModelState.IsValid)
                throw new BusinessRuleException(ModelState.GetFirstError());

            User user = GetCurrentUser();

            user.Update(model.Name, model.Mobile);

            UserService.Obj.Update(user);

            UserService.Obj.UpdateOrCreatePhoto(user, model.Photo);

            return Json(string.Empty);
        }
    }
}