using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security.DataProtection;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class UserService : UserManager<User, int>
    {
        public static UserService Obj { get; private set; }

        private static IIdentityUserRepository identityUserRepository;
        private static IGenericQueryRepository queryRepository;
        private static IGenericRepository repository;

        static UserService()
        {
            IIdentityUserRepository store = Factory.CreateDbRepository<IIdentityUserRepository>("IdentityUserRepository");
            Obj = new UserService(store);
            repository = RepositoryFactory.CreateRepository();
            queryRepository = RepositoryFactory.CreateQueryRepository();

            //https://stackoverflow.com/a/22635517
            DpapiDataProtectionProvider provider = new DpapiDataProtectionProvider("Sample");
            Obj.UserTokenProvider = new DataProtectorTokenProvider<User, int>(provider.Create("EmailConfirmation"));
        }

        private static void ConfigureManager(UserService entity)
        {
            // Configure validation logic for usernames
            entity.UserValidator = new UserValidator<User, int>(entity)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };

            // Configure validation logic for passwords
            entity.PasswordValidator = new CustomPasswordValidator
            {
                RequiredLength = 6,
                RequireNonLetterOrDigit = false,
                RequireDigit = false,
                RequireLowercase = false,
                RequireUppercase = false,
                RequireLetter = false,
            };

            // Configure user lockout defaults
            entity.UserLockoutEnabledByDefault = false;
            entity.DefaultAccountLockoutTimeSpan = TimeSpan.FromMinutes(5);
            entity.MaxFailedAccessAttemptsBeforeLockout = 5;

            //Obj.UserTokenProvider = new DataProtectorTokenProvider<User, int>(new DpapiDataProtectionProvider("Wathiq").Create("ASP.NET Identity")) { TokenLifespan = TimeSpan.FromHours(2) };
        }

        private UserService(IIdentityUserRepository store)
            : base(store)
        {
            queryRepository = RepositoryFactory.CreateQueryRepository();
            identityUserRepository = store;
        }

        public static UserService Create(IdentityFactoryOptions<UserService> options, IOwinContext context)
        {
            UserService newUserService = new UserService(identityUserRepository);
            ConfigureManager(newUserService);
            IDataProtectionProvider dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null)
            {
                newUserService.UserTokenProvider =
                    new DataProtectorTokenProvider<User, int>(dataProtectionProvider.Create("ASP.NET Identity"));
            }
            Obj = newUserService;
            return Obj;

        }

        public async Task<User> GetByUserNameOrPhone(string emailOrPhone, string password)
        {
            User user = await FindAsync(emailOrPhone, password);
            if (user != null)
                return user;

            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .Where(x => x.Mobile == emailOrPhone);

            user = queryRepository.SingleOrDefault(constraints);
            if (user == null)
                return null;

            bool passwordCorrect = await CheckPasswordAsync(user, password);
            if (passwordCorrect)
                return user;
            return null;
        }

        public List<User> Find(string name)
        {
            var adminUser = FindByEmail("admin@admin.com");
            User currentUser = FindByName(Thread.CurrentPrincipal.Identity.Name);

            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .AndAlsoIf(c => c.Name.Contains(name), !string.IsNullOrEmpty(name))
                .AndAlso(c => c.Id != currentUser.Id)
                .AndAlso(c => c.Id != adminUser.Id);

            return queryRepository.Find(constraints).Items.ToList();
        }

        public List<User> GetAll()
        {
            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .IncludePath(x => x.Roles);

            return queryRepository.Find(constraints).Items.ToList();
        }

        public async Task<User> CreateExternalUserAsync(User user, UserLoginInfo login)
        {
            ValidateUser(user);

            using (IUnitOfWork uow = RepositoryFactory.CreateUnitOfWork())
            {
                Task result = identityUserRepository.CreateAsync(user);

                if (result.Exception != null)
                {
                    if (result.Exception.InnerException != null)
                        throw new RepositoryException(nameof(User), ErrorTypeEnum.DatabaseError, result.Exception.InnerException.Message, result.Exception.InnerException);
                    else
                        throw new RepositoryException(nameof(User), ErrorTypeEnum.DatabaseError, result.Exception.Message, result.Exception);
                }

                user = FindByName(user.UserName);

                await AddLoginAsync(user.Id, login);

                uow.Complete();

                return user;
            }
        }

        public User CreateUserFromCallCenter(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user), "must not be null.");

            // TODO: we should generate the password here
            string password = "P@ssw0rd";
            List<IdentityRole> roles = RoleService.Obj.GetByNames(RoleNames.UserRole);
            user.UpdateRoles(roles);

            user = Obj.Create(user, password);
            // TODO: Send Email with the password
            // TODO: Send SMS with the password.
            return user;
        }

        public void ValidateUserWithPassword(User user, string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentNullException(nameof(password), "must not be null.");

            ValidateUser(user);
            ValidateEmail(user.Email);
            ValidatePassword(password);
        }

        private void ValidateEmail(string email)
        {
            User user = FindByEmail(email);

            if (user != null)
                throw new BusinessRuleException(nameof(User), BusinessRules.EmailAlreadyExists);
        }

        private void ValidatePassword(string password)
        {
            if (password.Length <= 5)
                throw new BusinessRuleException(nameof(User), BusinessRules.PasswordInCorrect);
        }

        public User Create(User user, string password)
        {
            ValidateUserWithPassword(user, password);

            IdentityResult identity = TaskUtil.Await(() => CreateAsync(user, password));

            if (!identity.Succeeded)
                throw new BusinessRuleException(nameof(User), "");

            return TaskUtil.Await(() => identityUserRepository.FindByNameAsync(user.UserName));
        }

        private void ValidateUser(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user), "must not be null.");

            if (!user.Validate())
                throw new ValidationException(nameof(User), user.ValidationResults);
        }

        public User FindByEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                throw new ArgumentNullException(nameof(email), "must not be null or empty.");

            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .IncludePath(u => u.Roles)
                .Where(x => x.Email == email);

            return queryRepository.SingleOrDefault(constraints);
        }

        public User FindByName(string userName)
        {
            if (string.IsNullOrEmpty(userName))
                throw new ArgumentNullException(nameof(userName), "must not be null or empty.");

            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .IncludePath(u => u.Roles)
                .Where(x => x.UserName == userName);

            return queryRepository.SingleOrDefault(constraints);
        }

        public User FindById(int userId)
        {
            if (userId == 0)
                throw new ArgumentNullException(nameof(userId), "must not be null.");

            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .IncludePath(u => u.Roles)
                .Where(x => x.Id == userId);

            return queryRepository.SingleOrDefault(constraints);
        }

        public override Task<User> FindByIdAsync(int userId)
        {
            if (userId == 0)
                throw new ArgumentNullException(nameof(userId), "must not be null.");

            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .IncludePath(u => u.Roles)
                .Where(x => x.Id == userId);

            return Task.FromResult(queryRepository.SingleOrDefault(constraints));
        }

        public User UserDelete(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user), "must not be null.");

            if (!user.Validate())
                throw new ValidationException(nameof(User), user.ValidationResults);

            TaskUtil.Await(identityUserRepository.DeleteAsync(user));

            return FindById(user.Id);
        }

        public void Delete(int[] ids)
        {
            if (ids == null)
                throw new ArgumentNullException(nameof(ids));

            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .Where(x => ids.Contains(x.Id));

            IEnumerable<User> items = queryRepository.Find(constraints).Items;

            repository.Delete(items);

            foreach (int i in ids)
                Tracer.Log.EntityDeleted(nameof(User), i);
        }

        public void ChangeStatus(int[] ids, bool isActive)
        {
            if (ids == null)
                throw new ArgumentNullException(nameof(ids));

            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .Where(x => ids.Contains(x.Id))
                .IncludePath(u => u.Roles);

            IEnumerable<User> items = queryRepository.Find(constraints).Items;

            foreach (User user in items)
            {
                if (isActive)
                    user.Activate();
                else
                    user.Deactivate();

                Update(user);
            }
        }

        public User ShallowUpdate(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(User), "must not be null.");

            User result = repository.Update(user);

            return FindById(user.Id);
        }

        public User Update(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(User), "must not be null.");

            if (!user.Validate())
                throw new ValidationException(nameof(User), user.ValidationResults);

            User result = repository.Update(user);

            return FindById(user.Id);
        }

        public Task<IdentityResult> UpdateSubscriberAsync(User user, string newPassword)
        {
            Task<IdentityResult> result = base.UpdateAsync(user);
            string code = TaskUtil.Await(() => base.GeneratePasswordResetTokenAsync(user.Id));

            Task<IdentityResult> response = base.ResetPasswordAsync(user.Id, code, newPassword);

            return response;
        }

        public Task<IdentityResult> UpdateSubscriberAsync(User user)
        {
            return base.UpdateAsync(user);
        }

        public void UpdatePassword(int userId, string oldPassword, string newPassword, string confirmationPassword)
        {
            if (newPassword != confirmationPassword)
                throw new BusinessRuleException(nameof(User), "");

            IdentityResult result = Obj.ChangePassword(userId, oldPassword, newPassword);

            if (!result.Succeeded)
                if (result.Errors.Contains("Incorrect password."))
                    throw new BusinessRuleException(nameof(User), "");
        }

        public void UserResetPassword(int userId, string newPassword)
        {
            User user = queryRepository.SingleOrDefault<User>(userId);
            if (user == null)
                throw new BusinessRuleException(nameof(User), "");

            string token = Obj.GeneratePasswordResetToken(userId);
            IdentityResult result = Obj.ResetPassword(userId, token, newPassword);

            if (!result.Succeeded)
                throw new BusinessRuleException(string.Join(",", result.Errors));
        }

        public async Task ForgotPasswordAsync(string email, Func<string, string, string> createLinkFunction)
        {
            User user = await FindByEmailAsync(email);

            if (user == null)
                throw new BusinessRuleException(nameof(User), "");

            string code = await GeneratePasswordResetTokenAsync(user.Id);
            string link = createLinkFunction(user.Id.ToString(), code);

            try
            {
                string linkHtml = string.Format(CoreStrings.ResetPasswordEmail, link);
                string server = "smtpout.asia.secureserver.net";
                string userName = "noreply@swazerlab.com";
                string password = "Swazer@32145";

                using (SmtpClient client = new SmtpClient())
                {
                    client.Port = 80;
                    client.Host = server;
                    client.EnableSsl = false;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(userName, password);

                    using (MailMessage message = new MailMessage())
                    {
                        message.BodyEncoding = Encoding.GetEncoding("UTF-8");
                        message.SubjectEncoding = Encoding.Default;
                        message.IsBodyHtml = true;

                        // set the message body of the email
                        message.Subject = CoreStrings.ResetPasswordTitle;
                        message.Body = linkHtml;

                        // set the email where to go and where to went.
                        message.To.Add(new MailAddress(email));
                        message.From = new MailAddress(userName, CoreStrings.ResetPasswordFrom);

                        client.Send(message);
                    }
                }
            }
            catch (Exception ex)
            {
                TracingSystem.TraceException("Email failed to send", ex);
                throw;
            }
        }

        public IList<string> GetRoles(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            return user.Roles.Select(r => r.Name).ToList();
        }

        public int UpdateOrCreatePhoto(User user, string photo)
        {
            byte[] photoBytes = Convert.FromBase64String(photo);

            using (IUnitOfWork uow = RepositoryFactory.CreateUnitOfWork())
            {
                Image recordedImage = ImageService.Obj.FindByUserId(user.Id);
                if (recordedImage != null)
                    ImageService.Obj.Delete(recordedImage);

                Image image = Image.Create(user, photoBytes);
                image = ImageService.Obj.Create(image);

                uow.Complete();

                return image.ImageId;
            }
        }
    }
}