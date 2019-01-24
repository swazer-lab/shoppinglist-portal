using Swazer.ShoppingList.Core;
using Microsoft.AspNet.Identity;

namespace Swazer.ShoppingList.RepositoryInterface
{
    public interface IIdentityRoleRepository : IRoleStore<IdentityRole, int>
    {
    }
}