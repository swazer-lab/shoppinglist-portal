using Swazer.ShoppingList.Core;
using Microsoft.AspNet.Identity;

namespace Swazer.ShoppingList.RepositoryInterface
{
    public interface IIdentityUserRepository : IUserStore<User, int>,
        IUserPasswordStore<User, int>,
        IUserEmailStore<User, int>,
        IUserLockoutStore<User, int>,
        IUserTwoFactorStore<User, int>,
        IUserRoleStore<User, int>,
        IUserTokenProvider<User, int>,
        IUserLoginStore<User, int>
    {
    }
}
