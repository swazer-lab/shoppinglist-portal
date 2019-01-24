using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Swazer.ShoppingList.Core;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class HandleAjaxExceptionAttribute : FilterAttribute, IExceptionFilter
    {
        public virtual void OnException(ExceptionContext filterContext)
        {
            if (filterContext.Exception == null)
                return;

            TracingSystem.TraceException(filterContext.Exception);

            string message = HandleHttpRequestValidationException(filterContext.Exception);

            filterContext.ExceptionHandled = true;
            filterContext.HttpContext.Response.Clear();
            filterContext.HttpContext.Response.TrySkipIisCustomErrors = true;

            if (filterContext.Exception is PermissionException)
                filterContext.HttpContext.Response.StatusCode = (int) System.Net.HttpStatusCode.Unauthorized;
            else
                filterContext.HttpContext.Response.StatusCode = (int)System.Net.HttpStatusCode.BadRequest;

            filterContext.Result = new JsonResult { Data = message };
        }

        private string HandleHttpRequestValidationException(Exception exception)
        {
            if (exception is HttpRequestValidationException valExp)
            {
                if (valExp.Message.StartsWith("A potentially dangerous Request.Form value was detected from the client"))
                    return "You can not send html as data, please check that the information you send does not contain special charecters like '<' , '>'.";
            }
            return exception.Message;
        }
    }
}