using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.Infrastructure;
using System.Web.Mvc;

namespace Swazer.ShoppingList.WebApp.Areas.Admin.Controllers
{
    [AllowAdmin]
    public class DashboardController : BaseController
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}