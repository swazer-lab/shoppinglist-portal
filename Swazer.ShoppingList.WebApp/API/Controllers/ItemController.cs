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
    public class ItemController : BaseApiController
    {
        [HttpPost]
        [Route("create")]
        public IHttpActionResult CreateItem(CreateItemsBindingModel model)
        {
            List<Item> items = model.Items?.Select(x => Item.Create(x.Title, x.Status)).ToList();

            ItemMobileService.Obj.MultipleCreate(items, model.CardId);

            return Ok();
        }

        [HttpPost]
        [Route("remove")]
        public IHttpActionResult RemoveItem([FromUri]int itemId)
        {
            ItemMobileService.Obj.Delete(itemId);

            return Ok();
        }
    }
}
