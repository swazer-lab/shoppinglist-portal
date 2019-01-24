using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using System.Web.Mvc;
using System.Web.Routing;
         
namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class LocalizedControllerActivator : IControllerActivator
    {
        public const string _DefaultLanguage = "en";
        public const string _DefaultLanguageKey = "lang";

        public IController Create(RequestContext requestContext, Type controllerType)
        {
            string lang = GetCurrentLanguageOrDefaultFromRouteData(requestContext);

            try
            {
                Thread.CurrentThread.CurrentUICulture = CultureInfo.GetCultureInfo(lang);
            }
            catch (Exception)
            {
                Thread.CurrentThread.CurrentUICulture = new CultureInfo(_DefaultLanguage);
            }

            return DependencyResolver.Current.GetService(controllerType) as IController;
        }

        private string GetCurrentLanguageOrDefaultFromRouteData(RequestContext requestContext)
        {
            // Get the {language} parameter from the RouteData
            RouteValueDictionary routeData = requestContext.RouteData.Values;


            if (!routeData.ContainsKey(_DefaultLanguageKey))
                routeData[_DefaultLanguageKey] = _DefaultLanguage;

            return routeData[_DefaultLanguageKey].ToString();
        }
    }
}