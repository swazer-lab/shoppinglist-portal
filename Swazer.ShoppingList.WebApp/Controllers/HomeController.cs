﻿using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Swazer.ShoppingList.WebApp.Resources;

namespace Swazer.ShoppingList.WebApp.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {
            return View();
        }

        #region Error pages
        public ActionResult NoPermission(bool showLoginButton = true)
        {
            return View(model: showLoginButton);
        }

        [AllowAnonymous]
        public ActionResult NotFound()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult Error()
        {
            return View();
        }
        #endregion
    }
}