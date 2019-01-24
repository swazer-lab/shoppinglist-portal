using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.Models;
using System;
using System.Web.Mvc;
using System.Web.Routing;
using System.Globalization;
using System.Threading;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class BaseController : Controller
    {
        public User GetCurrentUser()
        {
            return UserService.Obj.FindByName(User.Identity.Name);
        }

        protected override JsonResult Json(object data, string contentType, System.Text.Encoding contentEncoding, JsonRequestBehavior behavior)
        {
            return new JsonResult()
            {
                Data = data,
                ContentType = contentType,
                ContentEncoding = contentEncoding,
                JsonRequestBehavior = behavior,
                MaxJsonLength = Int32.MaxValue
            };
        }

        public static int PageSize => Settings.Provider.PageSize;

        protected override void OnException(ExceptionContext filterContext)
        {
            if (filterContext.ExceptionHandled)
                return;

            filterContext.ExceptionHandled = true;
            Exception exception = filterContext.Exception;

            // get the ControllerName and the ActionName where the exception has raised.
            string controller = filterContext.RouteData.Values["controller"].ToString();
            string action = filterContext.RouteData.Values["action"].ToString();

            // Log the error, which occurred.
            TracingSystem.TraceException(filterContext.Exception);

            HandleErrorInfo model = new HandleErrorInfo(exception, controller, action);
            filterContext.Result = View("~/Views/Shared/Error.cshtml", model);
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            SetCurrentThreadCulture(filterContext.RouteData);
        }

        private void SetCurrentThreadCulture(RouteData routeData)
        {
            string _DefaultLanguage = "en";
            string _DefaultLanguageKey = "lang";

            RouteValueDictionary route = routeData.Values;

            if (!route.ContainsKey(_DefaultLanguageKey))
                route[_DefaultLanguageKey] = _DefaultLanguage;

            string lang = route[_DefaultLanguageKey].ToString();

            try
            {
                Thread.CurrentThread.CurrentUICulture = CultureInfo.GetCultureInfo(lang);
            }
            catch (Exception)
            {
                Thread.CurrentThread.CurrentUICulture = new CultureInfo(_DefaultLanguage);
            }
        }
    }
}