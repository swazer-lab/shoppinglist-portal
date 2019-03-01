using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.API.Infrastructure;
using Swazer.ShoppingList.WebApp.API.Models;
using Swazer.ShoppingList.WebApp.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Swazer.ShoppingList.WebApp.API.Controllers
{
    [RoutePrefix("api/item")]
    [AllowApiUser]
    public class ItemController : BaseApiController
    {
        [HttpPost]
        [Route("changeStatus")]
        public IHttpActionResult ChangeStatus(ItemChangeStatusBindingModel model)
        {
            CartItem cartItem = ItemCardMobileService.Obj.GetByCartIdAndItemId(model.CartId, model.ItemId);

            cartItem.ChangeStatus(model.Status);

            ItemCardMobileService.Obj.Update(cartItem);

            Cart cart = CartMobileService.Obj.GetById(model.CartId);

            CartIndexBindingModel bindingModel = cart.ToCartIndexBindingModel();

            bindingModel.Items = ItemMobileService.Obj.GetItemsByCard(bindingModel.Cart.CartId).Select(x => x.ToCartItemBindingModel(ItemMobileService.Obj.GetById(x.ItemId))).ToList();
            bindingModel.Users = CartOwnerMobileService.Obj.GetUsersByCart(bindingModel.Cart.CartId).Select(x => x.ToUserProfileBindingModel(UserService.Obj.FindById(x.UserId), ImageService.Obj.FindByUserId(x.UserId))).ToList();

            return Ok(bindingModel);
        }

        [HttpGet]
        [Route("fetch")]
        public IHttpActionResult FetchItems()
        {
            User currentUser = GetCurrentUser();

            var admin = UserService.Obj.FindByEmail("admin@admin.com");

            List<string> items = ItemService.Obj.GetItems(currentUser.Id, admin.Id);

            return Ok(items);
        }
    }
}
