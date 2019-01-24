using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using System;
using System.Net;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class BaseApiController : ApiController
    {
        protected User GetCurrentUser()
        {
            return UserService.Obj.FindByName(User.Identity.Name);
        }

        protected Task<User> GetCurrentUserAsync()
        {
            return UserService.Obj.FindByIdAsync(User.Identity.GetUserId<int>());
        }
    }
}