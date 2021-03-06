﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface;
using Swazer.ShoppingList.RepositoryInterface.Queries;

namespace Swazer.ShoppingList.SqlServerRepository
{
    public class IdentityUserRepository : IIdentityUserRepository
    {
        SqlServerQueryRepository queryRepository;
        SqlServerRepository repository;

        public IdentityUserRepository()
        {
            this.queryRepository = new SqlServerQueryRepository();
            this.repository = new SqlServerRepository();
        }

        #region IUserStore
        public Task CreateAsync(User user)
        {
            return Task.FromResult(Create(user));
        }

        public Task DeleteAsync(User user)
        {
            return Task.FromResult(Delete(user));
        }

        public Task<User> FindByIdAsync(int userId)
        {
            if (userId == 0)
                throw new ArgumentNullException("userID", "must not be null.");

            var constraints = new QueryConstraints<User>()
                .IncludePath(u => u.Roles)
                .Where(x => x.Id == userId);

            return Task.FromResult(queryRepository.SingleOrDefault(constraints));
        }

        public Task<User> FindByNameAsync(string userName)
        {
            var result = FindByName(userName);
            return Task.FromResult(result);
        }

        public Task UpdateAsync(User user)
        {
            return Task.FromResult(Update(user));
        }

        public void Dispose()
        {
        }

        #endregion

        #region IUserStore (Core)

        public User Create(User user)
        {
            return repository.Create<User>(user);
        }

        public bool Delete(User user)
        {
            return repository.Delete<User>(user);
        }

        public User FindById(int userId)
        {
            var constraints = new QueryConstraints<User>()
                .IncludePath(x => x.Roles)
                .Where(x => x.Id == userId);
            return queryRepository.SingleOrDefault<User>(constraints);
        }

        public User FindByName(string userName)
        {
            var constraints = new QueryConstraints<User>()
                .IncludePath(x => x.Roles)
                .Where(x => x.UserName == userName);

            return queryRepository.SingleOrDefault<User>(constraints);
        }

        public User Update(User user)
        {
            return repository.Update<User>(user);
        }

        #endregion

        #region IUserPasswordStore
        public Task<string> GetPasswordHashAsync(User user)
        {
            return Task.FromResult(GetPasswordHash(user));
        }

        public Task<bool> HasPasswordAsync(User user)
        {
            return Task.FromResult(HasPassword(user));
        }

        public Task SetPasswordHashAsync(User user, string passwordHash)
        {
            SetPasswordHash(user, passwordHash);
            return Task.FromResult(0);
        }


        public Task<User> FindByIdAsync(string userId)
        {
            return FindByIdAsync(int.Parse(userId));
        }

        #endregion

        #region IUserPasswordStore (Core)
        public string GetPasswordHash(User user)
        {
            return user.PasswordHash;
        }

        public bool HasPassword(User user)
        {
            return !string.IsNullOrEmpty(user.PasswordHash);
        }

        public void SetPasswordHash(User user, string passwordHash)
        {
            user.PasswordHash = passwordHash;
        }
        #endregion

        #region IUserEmailStore
        public Task<User> FindByEmailAsync(string email)
        {
            return Task.FromResult(FindByEmail(email));
        }

        public Task<string> GetEmailAsync(User user)
        {
            return Task.FromResult(GetEmail(user));
        }

        public Task<bool> GetEmailConfirmedAsync(User user)
        {
            return Task.FromResult(GetEmailConfirmed(user));
        }

        public Task SetEmailAsync(User user, string email)
        {
            SetEmail(user, email);
            return Task.FromResult(0);
        }

        public Task SetEmailConfirmedAsync(User user, bool confirmed)
        {
            SetEmailConfirmed(user, confirmed);
            return Task.FromResult(0);
        }

        #endregion

        #region IUserEmailStore Core
        public User FindByEmail(string email)
        {
            var constraints = new QueryConstraints<User>()
                .IncludePath(x => x.Roles)
                .Where(x => x.Email == email);

            return queryRepository.SingleOrDefault(constraints);
        }

        public string GetEmail(User user)
        {
            return user.Email;
        }

        public bool GetEmailConfirmed(User user)
        {
            return user.EmailConfirmed;
        }

        public void SetEmail(User user, string email)
        {
            user.Email = email;
        }

        public void SetEmailConfirmed(User user, bool confirmed)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user), "must not be null or empty.");

            user.EmailConfirmed = confirmed;
        }

        #endregion

        #region IUserLockoutStore
        public Task<int> GetAccessFailedCountAsync(User user)
        {
            return Task.FromResult(GetAccessFailedCount(user));
        }

        public Task<bool> GetLockoutEnabledAsync(User user)
        {
            return Task.FromResult(GetLockoutEnabled(user));
        }

        public Task<DateTimeOffset> GetLockoutEndDateAsync(User user)
        {
            return Task.FromResult(GetLockoutEndDate(user));
        }

        public Task<int> IncrementAccessFailedCountAsync(User user)
        {
            return Task.FromResult(IncrementAccessFailedCount(user));
        }

        public Task ResetAccessFailedCountAsync(User user)
        {
            ResetAccessFailedCount(user);
            return Task.FromResult(0);
        }

        public Task SetLockoutEnabledAsync(User user, bool enabled)
        {
            SetLockoutEnabled(user, enabled);
            return Task.FromResult(0);
        }

        public Task SetLockoutEndDateAsync(User user, DateTimeOffset lockoutEnd)
        {
            SetLockoutEndDate(user, lockoutEnd);
            return Task.FromResult(0);
        }
        #endregion

        #region IUserLockoutStore Core
        public int GetAccessFailedCount(User user)
        {
            return user.AccessFailedCount;
        }

        public bool GetLockoutEnabled(User user)
        {
            return user.LockoutEnabled;
        }

        public DateTimeOffset GetLockoutEndDate(User user)
        {
            return user.LockoutEnd.Value;
        }

        public int IncrementAccessFailedCount(User user)
        {
            return ++user.AccessFailedCount;
        }

        public void ResetAccessFailedCount(User user)
        {
            user.AccessFailedCount = 0;
        }

        public void SetLockoutEnabled(User user, bool enabled)
        {
            user.LockoutEnabled = enabled;
        }

        public void SetLockoutEndDate(User user, DateTimeOffset? lockoutEnd)
        {
            user.LockoutEnd = lockoutEnd;
        }
        #endregion

        #region IUserTwoFactorStore
        public Task<bool> GetTwoFactorEnabledAsync(User user)
        {
            return Task.FromResult(GetTwoFactorEnabled(user));
        }

        public Task SetTwoFactorEnabledAsync(User user, bool enabled)
        {
            SetTwoFactorEnabled(user, enabled);
            return Task.FromResult(0);
        }

        #endregion

        #region IUserTwoFactorStore Core
        public bool GetTwoFactorEnabled(User user)
        {
            return user.TwoFactorEnabled;
        }

        public void SetTwoFactorEnabled(User user, bool enabled)
        {
            user.TwoFactorEnabled = enabled;
        }

        #endregion

        #region IUserRoleStore

        public Task AddToRoleAsync(User user, string roleName)
        {
            AddToRole(user, roleName);
            return Task.FromResult(0);
        }

        public Task<IList<string>> GetRolesAsync(User user)
        {
            return Task.FromResult(GetRoles(user));
        }

        public Task<bool> IsInRoleAsync(User user, string roleName)
        {
            return Task.FromResult(IsInRole(user, roleName));
        }

        public Task RemoveFromRoleAsync(User user, string roleName)
        {
            RemoveFromRole(user, roleName);
            return Task.FromResult(0);
        }

        #endregion

        #region IUserRoleStore core

        public void AddToRole(User user, string roleName)
        {
            var roleConstraints = new QueryConstraints<IdentityRole>()
                .Where(r => r.Name == roleName);
            var roleEntity = queryRepository.SingleOrDefault<IdentityRole>(roleConstraints);
            user.Roles.Add(roleEntity);
        }

        public IList<string> GetRoles(User user)
        {
            return user.Roles.Select(r => r.Name).ToList();
        }

        public bool IsInRole(User user, string roleName)
        {
            return user.Roles.Any(r => r.Name == roleName);
        }

        public void RemoveFromRole(User user, string roleName)
        {
            var role = user.Roles.FirstOrDefault(r => r.Name == roleName);
            if (role != null) user.Roles.Remove(role);
        }

        #endregion


        public Task<string> GenerateAsync(string purpose, Microsoft.AspNet.Identity.UserManager<User, int> manager, User user)
        {
            return Task.FromResult(manager.GenerateUserToken("ChangePassword", user.Id));
        }

        public Task<bool> IsValidProviderForUserAsync(Microsoft.AspNet.Identity.UserManager<User, int> manager, User user)
        {
            throw new NotImplementedException();
        }

        public Task NotifyAsync(string token, Microsoft.AspNet.Identity.UserManager<User, int> manager, User user)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ValidateAsync(string purpose, string token, Microsoft.AspNet.Identity.UserManager<User, int> manager, User user)
        {
            throw new NotImplementedException();
        }

        #region IUserLoginStore

        public Task AddLoginAsync(User user, UserLoginInfo login)
        {
            IdentityUserLogin identityUserLogin = new IdentityUserLogin
            {
                LoginProvider = login.LoginProvider,
                ProviderKey = login.ProviderKey,
                UserId = user.Id,
                ProviderDisplayName = login.LoginProvider
            };

            var result = repository.Create(identityUserLogin);

            return Task.FromResult(result);
        }

        public Task RemoveLoginAsync(User user, UserLoginInfo login)
        {
            IQueryConstraints<IdentityUserLogin> constraints = new QueryConstraints<IdentityUserLogin>()
                .Where(x => x.ProviderKey == login.ProviderKey && x.UserId == user.Id);

            bool result = repository.Delete(queryRepository.Find(constraints).Items.ToList());

            return Task.FromResult(result);
        }

        public Task<IList<UserLoginInfo>> GetLoginsAsync(User user)
        {
            IQueryConstraints<IdentityUserLogin> constraints = new QueryConstraints<IdentityUserLogin>()
                .Where(x => x.UserId == user.Id);

            IList<UserLoginInfo> result = queryRepository.Find(constraints).Items.Select(x => new UserLoginInfo(x.LoginProvider, x.ProviderKey)).ToList();

            return Task.FromResult(result);
        }

        public Task<User> FindAsync(UserLoginInfo login)
        {
            IQueryConstraints<IdentityUserLogin> constraints = new QueryConstraints<IdentityUserLogin>()
                .Where(x => x.ProviderKey == login.ProviderKey);

            IdentityUserLogin info = queryRepository.SingleOrDefault(constraints);
            if (info == null)
                return Task.FromResult<User>(null);

            User user = FindById(info.UserId);

            return Task.FromResult(user);
        }

        #endregion

    }
}
