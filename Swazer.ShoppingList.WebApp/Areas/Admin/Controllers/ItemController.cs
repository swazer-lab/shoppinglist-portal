using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.Areas.Admin.Models;
using Swazer.ShoppingList.WebApp.Infrastructure;
using System.Linq;
using System.Web.Mvc;

namespace Swazer.ShoppingList.WebApp.Areas.Admin.Controllers
{
    public class ItemController : BaseController
    {
        public ActionResult Index(ItemIndexSearchCriteria criteria)
        {
            ItemIndexViewModel model = new ItemIndexViewModel
            {
                PageSize = PageSize,
                TotalCount = 0,
            };

            return View(model);
        }

        public ActionResult Search(ItemIndexSearchCriteria criteria)
        {
            ItemIndexViewModel model = getItemIndexModel(criteria);
            return Json(model, JsonRequestBehavior.AllowGet);
        }

        private ItemIndexViewModel getItemIndexModel(ItemIndexSearchCriteria criteriaModel, string message = "")
        {
            ItemSearchCriteria criteria = criteriaModel.ToSearchCriteria();
            IQueryResult<Item> results = ItemService.Obj.Find(criteria);

            return new ItemIndexViewModel
            {
                Items = results.Items.Select(x => x.ToViewModel()),
                TotalCount = results.TotalCount,
                PageSize = PageSize,
                SearchCriteriaModel = criteriaModel,
                Message = message
            };
        }

        [HttpPost]
        [HandleAjaxException]
        public ActionResult Create(ItemViewModel viewModel, ItemIndexSearchCriteria criteria)
        {
            if (!ModelState.IsValid)
                throw new BusinessRuleException(ModelState.GetFirstError());

            Item entity = Item.Create(viewModel.Title);
            entity = ItemService.Obj.Create(entity);

            ItemIndexViewModel result = getItemIndexModel(criteria, "Success");
            result.SelectedRowId = entity.ItemId;
            return Json(result);
        }

        [HttpPost]
        [HandleAjaxException]
        public ActionResult Edit(ItemViewModel viewModel, ItemIndexSearchCriteria criteria)
        {
            if (!ModelState.IsValid)
                throw new BusinessRuleException(ModelState.GetFirstError());

            Item entity = ItemService.Obj.GetById(viewModel.ItemId);

            entity.Update(viewModel.Title, entity.IsActive);
            ItemService.Obj.Update(entity);

            return Json(getItemIndexModel(criteria, "Success"));
        }

        [HttpPost]
        [HandleAjaxException]
        public ActionResult ChangeStatus(int id, bool isActive, ItemIndexSearchCriteria criteria)
        {
            Item entity = ItemService.Obj.GetById(id);

            if (isActive)
                entity.Activate();
            else
                entity.Deactivate();

            ItemService.Obj.Update(entity);

            return Json(getItemIndexModel(criteria, "Success"));
        }

        [HttpPost]
        [HandleAjaxException]
        public ActionResult Delete(int id, ItemIndexSearchCriteria criteria)
        {
            ItemService.Obj.Delete(id);

            return Json(getItemIndexModel(criteria, "Success"));
        }
    }
}