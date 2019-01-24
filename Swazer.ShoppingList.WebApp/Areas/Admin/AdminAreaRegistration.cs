using System.Web.Mvc;

namespace Swazer.ShoppingList.WebApp.Areas.Admin
{
    public class AdminAreaRegistration : AreaRegistration 
    {
        public override string AreaName => "Admin";

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                name: "Admin_default",
                url: "{lang}/Admin/{controller}/{action}/{id}",
                //constraints: new { lang = @"(\w{2})" },   // In this case any two char will be accepted even 'ux' for example will work
                constraints: new { lang = "en|ar" },     // here is the list of all the supported languages by the website.
                defaults: new { lang = "ar", controller = "Dashboard", action = "Index", id = UrlParameter.Optional }
            );

            context.MapRoute(
                name: "Admin_default_withoutLang",
                url: "Admin/{controller}/{action}/{id}",
                defaults: new { lang = "ar", controller = "Dashboard", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}