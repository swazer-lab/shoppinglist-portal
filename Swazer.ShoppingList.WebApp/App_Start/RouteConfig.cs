using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Swazer.ShoppingList.WebApp
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
               name: "WithLang",
               url: "{lang}/{controller}/{action}/{id}",
               //constraints: new { lang = @"(\w{2})" },   // In this case any two char will be accepted even 'ux' for example will work
               constraints: new { lang = "en|ar" },     // here is the list of all the supported languages by the website.
               defaults: new { lang = "ar", controller = "Home", action = "Index", id = UrlParameter.Optional },
               namespaces: new string[] { "Swazer.ShoppingList.WebApp.Areas.Admin.Controllers" }
            );

            routes.MapRoute(
                name: "WithoutLang",
                url: "{controller}/{action}/{id}",
                defaults: new { lang = "ar", controller = "Home", action = "Index", id = UrlParameter.Optional },
                namespaces: new string[] { "Swazer.ShoppingList.WebApp.Areas.Admin.Controllers" }
            );
        }
    }
}
