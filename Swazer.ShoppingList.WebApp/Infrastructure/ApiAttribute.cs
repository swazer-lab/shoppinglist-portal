using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class AllowApiUserAttribute : AuthorizeAttribute
    {
        public AllowApiUserAttribute()
        {
            Roles = RoleNames.UserRole;
        }
    }
}