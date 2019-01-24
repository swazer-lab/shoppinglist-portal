using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;

namespace Swazer.ShoppingList.Domain
{
    public class RoleService : BaseDomainService
    {
        public static RoleService Obj { get; }

        static RoleService()
        {
            Obj = new RoleService();
        }

        private RoleService()
        {
        }

        public List<IdentityRole> GetByNames(params string[] roleNames)
        {
            if (roleNames == null)
                return new List<IdentityRole>();

            IQueryConstraints<IdentityRole> constraints = new QueryConstraints<IdentityRole>(false)
                .SortBy("Name")
                .Where(x => roleNames.Contains(x.Name));

            return queryRepository.Find(constraints).Items.ToList();
        }

        public IdentityRole Create(IdentityRole role)
        {
            if (role == null)
                throw new ArgumentNullException(nameof(role), "must not be null.");

            if (!Thread.CurrentPrincipal.IsInRole(RoleNames.AdminRole))
                throw new PermissionException(Thread.CurrentPrincipal.Identity.Name, RoleNames.AdminRole);

            return repository.Create<IdentityRole>(role);
        }

        public IdentityRole FindById(int roleId)
        {
            if (roleId == 0)
                throw new ArgumentNullException(nameof(roleId), "must not be null.");

            IQueryConstraints<IdentityRole> constraints = new QueryConstraints<IdentityRole>()
                .Where(x => x.Id == roleId);

            return queryRepository.SingleOrDefault(constraints);
        }

        public IdentityRole Update(IdentityRole role)
        {
            if (role == null)
                throw new ArgumentNullException(nameof(role), "must not be null.");

            return repository.Update<IdentityRole>(role);
        }

        public List<IdentityRole> FindAllExceptUserRole()
        {
            IQueryConstraints<IdentityRole> constraints = new QueryConstraints<IdentityRole>(false)
                .SortBy("Name")
                .Where(x => x.Name != RoleNames.UserRole);

            return queryRepository.Find(constraints).Items.ToList();
        }

        public List<IdentityRole> FindByUserName(string userName)
        {
            IQueryConstraints<User> constraint = new QueryConstraints<User>()
                .IncludePath(x => x.Roles)
                .Where(x => x.UserName == userName);

            User user = queryRepository.SingleOrDefault(constraint);

            return user.Roles.ToList();
        }
    }
}
