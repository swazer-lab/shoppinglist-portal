using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.Models;
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
            CartIndexViewModel model = getCartIndexModel(criteria);
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        private CartIndexViewModel getCartIndexModel(CartIndexSearchCriteria criteriaModel, string message = "")
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
                cart.AccessLevel = CartService.Obj.GetCartUser(cart.CartId.Value, user.Id).AccessLevel;
                cart.Items = Domain.Service.User.ItemService.Obj.GetItemsByCard(cart.CartId.Value).Select(x => x.ToViewModel(ItemService.Obj.GetById(x.ItemId))).ToList();
            }

            return result;
        }

        [HttpPost]
        [HandleAjaxException]
        public ActionResult Create(CartViewModel viewModel, CartIndexSearchCriteria criteria)
        {
            User user = GetCurrentUser();

            Cart cart = null;

            if (!viewModel.CartId.HasValue || viewModel.CartId == 0)
            {
                cart = Cart.Create(viewModel.Title, viewModel.Notes, viewModel.Date);

                List<CartItem> items = viewModel.Items?.Select(x => CartItem.Create(cart, Item.Create(x.Title), x.Status)).ToList();

                cart = CartService.Obj.Create(cart, user, items);
            }

            else
            {
                cart = CartMobileService.Obj.GetById(viewModel.CartId.Value);
                cart.Update(viewModel.Title, viewModel.Notes, viewModel.Date);

                List<CartItem> items = viewModel.Items?.Select(x => CartItem.Create(cart, Item.Create(x.Title), x.Status)).ToList();

                CartMobileService.Obj.Update(cart, items);
            }

            return Json(getCartIndexModel(criteria, "Success"));
        }

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

            return Json(getCartIndexModel(criteria, "Success"));
        }

        [HttpPost]
        [HandleAjaxException]
        public ActionResult Delete(int id, CartIndexSearchCriteria criteria)
        {
            CartService.Obj.Delete(id);

            return Json(getCartIndexModel(criteria, "Success"));
        }

        [HttpGet]
        [HandleAjaxException]
        public ActionResult GenerateShareUrl(GenerateSharingUrlViewModel model)
        {
            string codedUrl = UserCodeOperation.ProduceCode(new int[] { model.CartId, (int)model.AccessLevel });

            string fullUrl = $"http://shopping.swazerlab.com/Cart/GetAccess/" + $"{codedUrl}";

            return Json(fullUrl, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetAccess(string id)
        {
            int[] parameters = UserCodeOperation.DecodeCode(id);

            int cartId = parameters[0];
            AccessLevel accessLevel = (AccessLevel)parameters[1];

            User user = GetCurrentUser();

            Cart cart = CartService.Obj.GetById(cartId);

            CartOwner cartOwner = CartOwner.Create(cart, user, accessLevel);

            CartService.Obj.Create(cartOwner);

            return RedirectToAction("Index");
        }
    }
}