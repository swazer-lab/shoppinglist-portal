using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class RolesAttribute : AuthorizeAttribute
    {
        public RolesAttribute(params string[] roles)
        {
            Roles = string.Join(",", roles);
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            // respond with different result according to the type of the request.

            if (filterContext.RequestContext.HttpContext.Request.IsAjaxRequest())
            {
                // throwing the exception in ajax request will trigger the HandleAjaxExceptionAttribute
                throw new PermissionException();
            }

            var returnUrl = filterContext.HttpContext.Request.Url.GetComponents(UriComponents.PathAndQuery, UriFormat.SafeUnescaped);

            filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary {
                { "area", "" },
                { "controller", "Account" },
                { "action", "Login" },
                { "returnUrl", returnUrl}
            });
        }
    }

    public class AllowUserAttribute : RolesAttribute
    {
        public AllowUserAttribute()
            : base(RoleNames.UserRole)
        {
        }
    }

    public class AllowAdminAttribute : RolesAttribute
    {
        public AllowAdminAttribute()
            : base(RoleNames.AdminRole)
        {
        }
    }

    public class AllowAdminOrPermissionAttribute : AllowAdminAttribute
    {
        private string[] _permission;

        public AllowAdminOrPermissionAttribute(params string[] permission)
             : base()
        {
            this._permission = permission;
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            bool isAdmin = base.AuthorizeCore(httpContext);
            bool hasPermission = Thread.CurrentPrincipal.HasPermission(this._permission);
            return isAdmin || hasPermission;
        }
    }
}