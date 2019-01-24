using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.Controllers;
using Swazer.ShoppingList.WebApp.Infrastructure;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Swazer.ShoppingList.WebApp
{
    public class MvcApplication : HttpApplication
    {
        protected void Application_Start()
        {
            HttpConfiguration config = GlobalConfiguration.Configuration;
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            config.Formatters.JsonFormatter.UseDataContractJsonSerializer = false;

            Factory.Initialize();

            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            RoleConfig.RegisterRoles();

            ControllerBuilder.Current.SetControllerFactory(new DefaultControllerFactory(new LocalizedControllerActivator()));
        }

        protected void Application_PostAuthenticateRequest(object sender, EventArgs e)
        {
            ClaimsPrincipal oldPrincipal = Thread.CurrentPrincipal as ClaimsPrincipal;
            if (oldPrincipal == null)
                return;

            ClaimsIdentity oldIdentity = oldPrincipal.Identity as ClaimsIdentity;

            if (oldIdentity != null && oldIdentity.IsAuthenticated)
            {
                User userProfile = new User(int.Parse(oldIdentity.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value));  // UserService.Obj.FindByName(oldIdentity.Name); //we will store things in claims so we will not go to db everytime
                Thread.CurrentPrincipal = HttpContext.Current.User = new UserProfilePrincipal(oldPrincipal, oldIdentity, userProfile);
            }
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            Core.TracingSystem.TraceInformation("Inside Global");

            Exception exception = Server.GetLastError();
            Core.TracingSystem.TraceError(exception.ToString());

            // if the error is NOT http error, then stop handling it.
            if (!(exception is HttpException httpException))
                return;

            if (httpException.GetHttpCode() != 404)
                TracingSystem.TraceException("Exception from [Global.Application_Error] method : ", httpException);

            Response.Clear();
            Response.TrySkipIisCustomErrors = true;
            Server.ClearError();

            if (new HttpRequestWrapper(Request).IsAjaxRequest())
                HandleExceptionInAjaxContext(exception);
            else
                HandleExceptionInNormalContext(httpException);
        }

        private void HandleExceptionInAjaxContext(Exception exception)
        {
            Response.ContentType = "application/json";
            Response.StatusCode = 400;
            JsonResult json = new JsonResult
            {
                Data = exception.Message
            };

            json.ExecuteResult(new ControllerContext(Request.RequestContext, new BaseController()));
        }

        private void HandleExceptionInNormalContext(HttpException httpException)
        {
            RouteData routeData = new RouteData();
            routeData.Values.Add("controller", "Home");
            routeData.Values.Add("area", "");

            switch (httpException.GetHttpCode())
            {
                case 404:
                    routeData.Values.Add("action", "NotFound");
                    break;

                default:
                    routeData.Values.Add("action", "Error");
                    break;
            }
            Response.ContentType = "text/html";

            // Call target Controller and pass the routeData.
            IController errorController = new HomeController();
            errorController.Execute(new RequestContext(new HttpContextWrapper(Context), routeData));
        }
    }
}