using System.Threading.Tasks;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface;
using Swazer.ShoppingList.RepositoryInterface.Queries;

namespace Swazer.ShoppingList.SqlServerRepository
{
    public class IdentityRoleRepository : IIdentityRoleRepository
    {
        SqlServerQueryRepository queryRepository;
        SqlServerRepository repository;

        public IdentityRoleRepository()
        {
            this.queryRepository = new SqlServerQueryRepository();
            this.repository = new SqlServerRepository();
        }

        #region IRoleStore
        public Task CreateAsync(IdentityRole role)
        {
            return Task.FromResult(Create(role));
        }

        public Task DeleteAsync(IdentityRole role)
        {
            return Task.FromResult(Delete(role));
        }

        public Task<IdentityRole> FindByIdAsync(int roleId)
        {
            return Task.FromResult(FindById(roleId));
        }

        public Task<IdentityRole> FindByNameAsync(string roleName)
        {
            return Task.FromResult(FindByName(roleName));
        }

        public Task UpdateAsync(IdentityRole role)
        {
            return Task.FromResult(Update(role));
        }

        public void Dispose()
        {
        }


        #endregion

        #region IRoleStore Core
        public IdentityRole Create(IdentityRole role)
        {
            return repository.Create<IdentityRole>(role);
        }

        public bool Delete(IdentityRole role)
        {
            return repository.Delete<IdentityRole>(role);
        }

        public IdentityRole FindById(int roleId)
        {
            var constraints = new QueryConstraints<IdentityRole>()
                .Where(x => x.Id == roleId);

            return queryRepository.SingleOrDefault(constraints);
        }

        public IdentityRole FindByName(string roleName)
        {
            var constraints = new QueryConstraints<IdentityRole>()
                .Where(x => x.Name == roleName);

            return queryRepository.SingleOrDefault(constraints);
        }

        public IdentityRole Update(IdentityRole role)
        {
            return repository.Update<IdentityRole>(role);
        }
        #endregion

    }
}
