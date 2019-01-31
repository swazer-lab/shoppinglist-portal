using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
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
    public class ItemController : ApiController
    {
        [HttpPost]
        [Route("changeStatus")]
        public IHttpActionResult ChangeStatus(ItemChangeStatusBindingModel model)
        {
            CartItem cartItem = ItemCardMobileService.Obj.GetByCartIdAndItemId(model.CartId, model.ItemId);

            cartItem.ChangeStatus(model.Status);

            ItemCardMobileService.Obj.Update(cartItem);

            return Ok();
        }
    }
}
