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
    [RoutePrefix("api/card")]
    [AllowApiUser]
    public class CartController : ApiController
    {
        [HttpPost]
        [Route("create")]
        public IHttpActionResult CreateCard(CartCreateBindingModels model)
        {
            Cart cart = Cart.Create(model.Title, model.Notes, model.Date);

            CartMobileService.Obj.Create(cart);

            return Ok();
        }
    }
}
