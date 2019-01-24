using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Threading;

namespace Swazer.ShoppingList.Domain
{
    public static class Extensions
    {
        public static async Task<ClaimsIdentity> GenerateUserIdentityAsync(this User user, UserService manager, string authenticationType)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            ClaimsIdentity userIdentity = await manager.CreateIdentityAsync(user, authenticationType);

            // Add custom user claims here
            //userIdentity.AddClaims(claims());

            return userIdentity;
        }

        public static bool IsItemNameUnique(this Item item)
        {
            IGenericQueryRepository queryRepository = RepositoryFactory.CreateQueryRepository();

            IQueryConstraints<Item> constraints = new QueryConstraints<Item>()
                .Where(x => x.Title == item.Title);

            return queryRepository.SingleOrDefault(constraints) == null;
        }
    }
}