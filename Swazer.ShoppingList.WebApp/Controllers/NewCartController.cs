using Swazer.ShoppingList.WebApp.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Swazer.ShoppingList.WebApp.Controllers
{
    public class NewCartController : BaseController
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}