using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;

namespace Swazer.ShoppingList.WebApp
{
    public class RoleConfig
    {
        public static void RegisterRoles()
        {
            bool isAdminNotExists = UserService.Obj.FindByEmail("admin@admin.com") == null;

            if (isAdminNotExists)
            {
                User user = new User("admin", "123", "admin@admin.com");
                user.UpdateRoles(RoleService.Obj.GetByNames(RoleNames.AdminRole));
                TaskUtil.Await(UserService.Obj.CreateAsync(user, "P@ssw0rd"));
            }
        }
    }
}