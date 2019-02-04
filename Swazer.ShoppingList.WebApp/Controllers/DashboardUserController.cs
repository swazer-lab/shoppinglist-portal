using Swazer.ShoppingList.WebApp.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Swazer.ShoppingList.WebApp.Controllers
{
    [AllowUser]
    public class DashboardUserController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}