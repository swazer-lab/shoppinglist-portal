using Swazer.ShoppingList.WebApp.Infrastructure;
using System.Web;
using System.Web.Mvc;

namespace Swazer.ShoppingList.WebApp
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
