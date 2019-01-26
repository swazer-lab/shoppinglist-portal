using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.API.Models;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.API.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Swazer.ShoppingList.WebApp.API.Controllers
{
    [RoutePrefix("api/cart")]
    [AllowApiUser]
    public class CartController : BaseApiController
    {
        [Route("fetch")]
        [HttpGet]
        public IHttpActionResult FetchCards([FromUri]CartSearchCriteriaBindingModel model)
        {
            User user = GetCurrentUser();

            CartMobileSearchCriteria cartMobileSearchCriteria = model.ToSearchCriteria(user.Id);

            IQueryResult<Cart> carts = CartMobileService.Obj.Find(cartMobileSearchCriteria);

            var result = new PagingBindingModel<CartIndexBindingModel>()
            {
                Items = carts.Items.Select(x => x.ToCartIndexBindingModel()).ToList(),
                TotalCount = carts.TotalCount
            };

            foreach (var cart in result.Items.ToList())
            {
                cart.Items = ItemMobileService.Obj.GetItemsByCard(cart.Cart.CartId).Select(x => x.ToItemBindingModel()).ToList();
            }

            return Ok(result);
        }

        [HttpPost]
        [Route("create")]
        public IHttpActionResult CreateCard(CreateCartBindingModel model)
        {
            User user = GetCurrentUser();

            Cart cart = null;

            List<Item> items = model.Items?.Select(x => Item.Create(x.Title, x.Status)).ToList();

            if (!model.CartId.HasValue)
            {
                cart = Cart.Create(model.Title, model.Notes, model.Date);

                CartMobileService.Obj.Create(cart, user, items);
            }

            else
            {
                cart = CartMobileService.Obj.GetById(model.CartId.Value);
                cart.Update(model.Title, model.Notes, model.Date);

                CartMobileService.Obj.Update(cart, items);
            }

            return Ok();
        }

        [HttpPost]
        [Route("remove")]
        public IHttpActionResult RemoveCard(int cartId)
        {
            CartMobileService.Obj.Delete(cartId);

            return Ok();
        }
    }
}
