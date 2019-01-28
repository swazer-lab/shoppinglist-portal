using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.Models
{
    public class ErrorModel : System.Web.Mvc.HandleErrorInfo
    {
        public string ErrorTitle { get; private set; }

        public string Message { get; private set; }

        public ErrorModel(Exception exception, string controllerName, string actionName, string errorTitle, string message)
            : base(exception, controllerName, actionName)
        {
            this.ErrorTitle = errorTitle;
            this.Message = message;
        }
    }
}