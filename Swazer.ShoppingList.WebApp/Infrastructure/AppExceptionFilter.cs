using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.WebApp.API.Resources.ErrorMessages;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class AppExceptionFilter : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext context)
        {
            TracingSystem.TraceException(context.ActionContext.Request.RequestUri.AbsolutePath, context.Exception);

            if (context.Exception is BusinessRuleException)
            {
                BusinessRuleException ex = context.Exception as BusinessRuleException;
                throw new HttpResponseException(context.Request.CreateErrorResponse(HttpStatusCode.BadRequest, context.Exception.Message));
            }

            if (context.Exception is ValidationException)
            {
                ValidationException ex = context.Exception as ValidationException;
                throw new HttpResponseException(context.Request.CreateErrorResponse(HttpStatusCode.BadRequest, context.Exception.Message));
            }

            if (context.Exception is ArgumentNullException)
                throw new HttpResponseException(context.Request.CreateErrorResponse(HttpStatusCode.BadRequest, context.Exception.Message));

            throw new HttpResponseException(context.Request.CreateErrorResponse(HttpStatusCode.InternalServerError, context.Exception.InnerException?.Message ?? context.Exception.Message));
        }
    }

    public class ValidateModelAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (actionContext.ActionArguments.ContainsKey("model")
                && actionContext.ActionArguments["model"] == null)
            {
                string localizedErrorMessage = ErrorMessageStrings.ThisRequestIsIncorrect;
                throw new BusinessRuleException(localizedErrorMessage);
            }

            if (!actionContext.ModelState.IsValid)
            {
                if (actionContext.ModelState["cartId"]?.Errors != null)
                    throw new BusinessRuleException("Cart Id must be provided");

                throw new BusinessRuleException(actionContext.ModelState.GetFirstError());
            }
        }
    }
}