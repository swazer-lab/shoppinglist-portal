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
        private readonly string BODY_SHARECART_EMAIL = $@"<!doctype html><html> <head> <meta name=""viewport"" content=""width=device-width""> <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8""> <title>Share Cart</title> <style> @media only screen and (max-width: 620px) {{ table[class=body] h1 {{ font-size: 28px !important; margin-bottom: 10px !important; }} table[class=body] p, table[class=body] ul, table[class=body] ol, table[class=body] td, table[class=body] span, table[class=body] a {{ font-size: 16px !important; }} table[class=body] .wrapper, table[class=body] .article {{ padding: 10px !important; }} table[class=body] .content {{ padding: 0 !important; }} table[class=body] .container {{ padding: 0 !important; width: 100% !important; }} table[class=body] .main {{ border-left-width: 0 !important; border-radius: 0 !important; border-right-width: 0 !important; }} table[class=body] .btn table {{ width: 100% !important; }} table[class=body] .btn a {{ width: 100% !important; }} table[class=body] .img-responsive {{ height: auto !important; max-width: 100% !important; width: auto !important; }} }} @media all {{ .ExternalClass {{ width: 100%; }} .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {{ line-height: 100%; }} .apple-link a {{ color: inherit !important; font-family: inherit !important; font-size: inherit !important; font-weight: inherit !important; line-height: inherit !important; text-decoration: none !important; }} .btn-primary table td:hover {{ background-color: #34495e !important; }} .btn-primary a:hover {{ background-color: #34495e !important; border-color: #34495e !important; }} }} </style> </head> <body class="""" style=""background-color: #dcdcdc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" class=""body"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;""> <tr> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top;"">&nbsp;</td> <td class=""container"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;""> <div class=""content"" style=""box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;""> <span class=""preheader"" style=""color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;""></span> <table class=""main"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;""> <tr> <td class=""wrapper"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;""> <tr> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top; text-align: center""> <h1 style=""font-family:'Open Sans', sans-serif; font-size: 25px; font-weight: normal; margin: 0; Margin-bottom: 15px;"">Confirm Sharing Cart</h1> <p style=""font-family: 'Open Sans',sans-serif; color: #74787E;font-size: 15px; font-weight: normal; margin: 0; Margin-bottom: 15px;"">Hi You have this email bacause your email address was used to share cart with you. Pleae follow link below to complete your sharing cart process</p> <table border=""0"" cellpadding=""0"" cellspacing=""0"" class=""btn btn-primary"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;""> <tbody> <tr> <td align=""center"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;""> <tbody> <tr> <td style=""font-family: 'Open Sans', sans-serif; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;""> <a href=""PLACEHOLDER_URL"" target=""_blank"" style=""display: inline-block; color: #ffffff; background: #4C84D9; border-color: #4C84D9; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 15px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;"">Complete Sharing</a> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <p style=""font-family:'Open Sans', sans-serif;color: #74787E;font-size: 15px;font-weight: normal; margin: 0; Margin-bottom: 15px;"">Please dont open link and ignore this if you dont want to share this cart</p> </td> </tr> </table> </td> </tr> </table> </div> </td> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top;"">&nbsp;</td> </tr> </table> </body></html>";
        private readonly string BODY_CONFIRM_EMAIL = $@"<!doctype html><html> <head> <meta name=""viewport"" content=""width=device-width""> <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8""> <title>{CoreStrings.ConfirmEmail}</title> <style> @media only screen and (max-width: 620px) {{ table[class=body] h1 {{ font-size: 28px !important; margin-bottom: 10px !important; }} table[class=body] p, table[class=body] ul, table[class=body] ol, table[class=body] td, table[class=body] span, table[class=body] a {{ font-size: 16px !important; }} table[class=body] .wrapper, table[class=body] .article {{ padding: 10px !important; }} table[class=body] .content {{ padding: 0 !important; }} table[class=body] .container {{ padding: 0 !important; width: 100% !important; }} table[class=body] .main {{ border-left-width: 0 !important; border-radius: 0 !important; border-right-width: 0 !important; }} table[class=body] .btn table {{ width: 100% !important; }} table[class=body] .btn a {{ width: 100% !important; }} table[class=body] .img-responsive {{ height: auto !important; max-width: 100% !important; width: auto !important; }} }} @media all {{ .ExternalClass {{ width: 100%; }} .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {{ line-height: 100%; }} .apple-link a {{ color: inherit !important; font-family: inherit !important; font-size: inherit !important; font-weight: inherit !important; line-height: inherit !important; text-decoration: none !important; }} .btn-primary table td:hover {{ background-color: #34495e !important; }} .btn-primary a:hover {{ background-color: #34495e !important; border-color: #34495e !important; }} }} </style> </head> <body class="""" style=""background-color: #dcdcdc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" class=""body"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;""> <tr> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top;"">&nbsp;</td> <td class=""container"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;""> <div class=""content"" style=""box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;""> <span class=""preheader"" style=""color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;""></span> <table class=""main"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;""> <tr> <td class=""wrapper"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;""> <tr> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top; text-align: center""> <h1 style=""font-family:'Open Sans', sans-serif; font-size: 25px; font-weight: normal; margin: 0; Margin-bottom: 15px;"">{CoreStrings.ConfirmEmail}</h1> <p style=""font-family: 'Open Sans',sans-serif; color: #74787E;font-size: 15px; font-weight: normal; margin: 0; Margin-bottom: 15px;"">{CoreStrings.ConfirmEmailRegister}</p> <table border=""0"" cellpadding=""0"" cellspacing=""0"" class=""btn btn-primary"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;""> <tbody> <tr> <td align=""center"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;""> <tbody> <tr> <td style=""font-family: 'Open Sans', sans-serif; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;""> <a href=""PLACEHOLDER_URL"" target=""_blank"" style=""display: inline-block; color: #ffffff; background: #4C84D9; border-color: #4C84D9; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 15px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;"">{CoreStrings.UstadRegistration}</a> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <p style=""font-family:'Open Sans', sans-serif;color: #74787E;font-size: 15px;font-weight: normal; margin: 0; Margin-bottom: 15px;"">{CoreStrings.IfYouDidntRequestForRegister}</p> </td> </tr> </table> </td> </tr> </table> </div> </td> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top;"">&nbsp;</td> </tr> </table> </body></html>";
        private readonly string BODY_VERIFICATION_CODE = $@"<!doctype html><html> <head> <meta name=""viewport"" content=""width=device-width""> <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8""> <title>{CoreStrings.ResetPasswordTitle}</title> <style> @media only screen and (max-width: 620px) {{ table[class=body] h1 {{ font-size: 28px !important; margin-bottom: 10px !important; }} table[class=body] p, table[class=body] ul, table[class=body] ol, table[class=body] td, table[class=body] span, table[class=body] a {{ font-size: 16px !important; }} table[class=body] .wrapper, table[class=body] .article {{ padding: 10px !important; }} table[class=body] .content {{ padding: 0 !important; }} table[class=body] .container {{ padding: 0 !important; width: 100% !important; }} table[class=body] .main {{ border-left-width: 0 !important; border-radius: 0 !important; border-right-width: 0 !important; }} table[class=body] .btn table {{ width: 100% !important; }} table[class=body] .btn a {{ width: 100% !important; }} table[class=body] .img-responsive {{ height: auto !important; max-width: 100% !important; width: auto !important; }} }} @media all {{ .ExternalClass {{ width: 100%; }} .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {{ line-height: 100%; }} .apple-link a {{ color: inherit !important; font-family: inherit !important; font-size: inherit !important; font-weight: inherit !important; line-height: inherit !important; text-decoration: none !important; }} .btn-primary table td:hover {{ background-color: #34495e !important; }} .btn-primary a:hover {{ background-color: #34495e !important; border-color: #34495e !important; }} }} </style> </head> <body class="" style=""background-color: #dcdcdc; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" class=""body"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;""> <tr> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top;"">&nbsp;</td> <td class=""container"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;""> <div class=""content"" style=""box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;""> <span class=""preheader"" style=""color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;""></span> <table class=""main"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;""> <tr> <td class=""wrapper"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;""> <tr> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top; text-align: center""> <h1 style=""font-family:'Open Sans', sans-serif; font-size: 25px; font-weight: normal; margin: 0; Margin-bottom: 15px;"">{CoreStrings.ResetPasswordTitle}</h1> <p style=""font-family: 'Open Sans',sans-serif; color: #74787E;font-size: 15px; font-weight: normal; margin: 0; Margin-bottom: 15px;"">{CoreStrings.IfYouHaveLostYourPassword}</p> <table border=""0"" cellpadding=""0"" cellspacing=""0"" class=""btn btn-primary"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;""> <tbody> <tr> <td align=""center"" style=""font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;""> <table border=""0"" cellpadding=""0"" cellspacing=""0"" style=""border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;""> <tbody> <tr> <td style=""font-family: 'Open Sans', sans-serif; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;""> <span class=""button button--green"" target=""_blank"" style=""-webkit-text-size-adjust: none; background: #4C84D9; border-color: #4C84D9; border-radius: 3px; border-style: solid; border-width: 10px 18px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); box-sizing: border-box; color: #FFF; display: inline-block; font-family: 'Open Sans', sans-serif; text-decoration: none;font-size: 15px;padding: 0 35px"">PLACEHOLDER_CODE</span> </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <p style=""font-family:'Open Sans', sans-serif;color: #74787E;font-size: 15px;font-weight: normal; margin: 0; Margin-bottom: 15px;"">{CoreStrings.IfYouDidntRequestForReset}</p> </td> </tr> </table> </td> </tr> </table> </div> </td> <td style=""font-family: sans-serif; font-size: 14px; vertical-align: top;"">&nbsp;</td> </tr> </table> </body></html>";

        private async Task SendEmail(string to, string subject, string body)
        {
            try
            {
                using (SmtpClient client = new SmtpClient())
                {
                    using (MailMessage message = new MailMessage())
                    {
                        string userName = Settings.Provider.EmailAddress;
                        message.From = new MailAddress(userName, "Shopping App");
                        message.To.Add(new MailAddress(to));

                        message.IsBodyHtml = true;
                        message.Subject = subject;
                        message.Body = body;

                        await client.SendMailAsync(message);
                    }
                }
            }
            catch (Exception ex)
            {
                TracingSystem.TraceException("Email failed to send", ex);
                throw;
            }
        }

        public async Task SendConfirmEmailLinkToUser(string to, string token, int userId)
        {
            string url = $"http://shoppingweb.swazerlab.com/Account/ConfirmEmail/?userId={userId}&token={token}";
            string body = BODY_CONFIRM_EMAIL.Replace("PLACEHOLDER_URL", url);
            await SendEmail(to, "Shopping Account", body);
        }

        public async Task SendResetValidationCode(string to, string code)
        {
            string body = BODY_VERIFICATION_CODE.Replace("PLACEHOLDER_CODE", code);
            await SendEmail(to, CoreStrings.UstadAccount, body);
        }

        public async Task SendEmailToShareCard(string to, string code)
        {
            string url = $"http://shoppingweb.swazerlab.com/Cart/GetAccess/{code}";
            string body = BODY_SHARECART_EMAIL.Replace("PLACEHOLDER_URL", url);
            await SendEmail(to, "Shopping Account", body);
        }

        public void ResetPassword(string email, string password, string code)
        {
            User user = Obj.FindByEmail(email);

            if (user == null)
                throw new BusinessRuleException(nameof(User), BusinessRules.UserNotFound);

            var info = ResetPasswordInformationService.Obj.GetConfirmationInfo(email);

            if (info.IsExpiredDateForResetPasssword())
                throw new BusinessRuleException(nameof(ResetPasswordConfirmationInfo), BusinessRules.ExpiredDateForResetPassword);

            if (code != info.Code)
                throw new BusinessRuleException(nameof(User), BusinessRules.ValidationCodeIncorrect);

            var result = Obj.ResetPassword(user.Id, info.Token, password);

            if (!result.Succeeded)
                throw new BusinessRuleException(nameof(User), BusinessRules.ResetPasswordIncorrect);
        }

        #region Initialization
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
        #endregion

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

            if (name == null)
                throw new ArgumentNullException(nameof(name));

            IQueryConstraints<Friend> constraints = new QueryConstraints<Friend>()
                 .Where(x => x.RequestedById == currentUser.Id || x.RequestedToId == currentUser.Id);

            List<Friend> result = queryRepository.Find(constraints).Items.ToList();

            List<int> requestedByIds = result.Select(x => x.RequestedById).ToList();
            List<int> requestedToIds = result.Select(x => x.RequestedToId).ToList();

            requestedByIds.AddRange(requestedToIds);

            IQueryConstraints<User> constraintsUser = new QueryConstraints<User>()
                .Where(x => !requestedByIds.Contains(x.Id))
                .AndAlsoIf(x => x.Name.Contains(name), !string.IsNullOrEmpty(name))
                .AndAlso(x => x.Id != adminUser.Id);

            return queryRepository.Find(constraintsUser).Items.ToList();
        }

        public List<User> GetAll()
        {
            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .IncludePath(x => x.Roles);

            return queryRepository.Find(constraints).Items.ToList();
        }

        public List<User> GetUsersByEmails(List<string> emails)
        {
            IQueryConstraints<User> constraints = new QueryConstraints<User>()
                .AndAlsoIf(x => emails.Contains(x.Email), emails != null && emails.Count != 0);

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