using Microsoft.AspNet.Identity;
using System.Threading.Tasks;
using System.Collections.Generic;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface;

namespace Swazer.ShoppingList.Domain
{
    public class UserLoginStore : IUserLoginStore<User, int>
    {
        public Task CreateAsync(User user)
        {
            return _repository.CreateAsync(user);
        }

        public Task DeleteAsync(User user)
        {
            return _repository.DeleteAsync(user);
        }
   
        public Task<User> FindByIdAsync(int userId)
        {
            return _repository.FindByIdAsync(userId);
        }

        public Task<User> FindByNameAsync(string userName)
        {
            return _repository.FindByNameAsync(userName);
        }

        public Task AddLoginAsync(User user, UserLoginInfo login)
        {
            return _repository.AddLoginAsync(user, login);
        }

        public Task<IList<UserLoginInfo>> GetLoginsAsync(User user)
        {
            return _repository.GetLoginsAsync(user);
        }

        public Task RemoveLoginAsync(User user, UserLoginInfo login)
        {
            return _repository.RemoveLoginAsync(user, login);
        }

        public Task<User> FindAsync(UserLoginInfo login)
        {
            return _repository.FindAsync(login);
        }

        public Task UpdateAsync(User user)
        {
            return _repository.UpdateAsync(user);
        }

        public void Dispose()
        {
        }


        private IIdentityUserRepository _repository;

        private UserLoginStore(IIdentityUserRepository repository)
        {
            _repository = repository;
        }

        public static UserLoginStore Create()
        {
            IIdentityUserRepository store = Factory.CreateDbRepository<IIdentityUserRepository>("IdentityUserRepository");
            return new UserLoginStore(store);
        }

    }
}