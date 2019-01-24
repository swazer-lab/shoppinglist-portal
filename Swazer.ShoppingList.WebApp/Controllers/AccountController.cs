using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Swazer.ShoppingList.WebApp.Models;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.Infrastructure;
using Swazer.ShoppingList.WebApp.Resources;

namespace Swazer.ShoppingList.WebApp.Controllers
{
    [Authorize]
    public class AccountController : BaseController
    {
        #region User Managment section

        private ApplicationSignInManager _signInManager;
        private UserService _userManager;

        public AccountController()
        {
        }

        public AccountController(UserService userManager, ApplicationSignInManager signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get => _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            private set => _signInManager = value;
        }

        public UserService UserManager
        {
            get => _userManager ?? HttpContext.GetOwinContext().GetUserManager<UserService>();
            private set => _userManager = value;
        }

        #endregion

        public ActionResult Redirection()
        {
            if (User.HasPermission(RoleNames.AdminRole))
                return RedirectToAction("Index", "Dashboard", new { area = "Admin" });
            else
                return RedirectToAction("Create", "UserReservation", new { area = "" });
        }

        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;

            TempData["SuccessMessage"] = TempData["SuccessMessage"];

            return View();
        }

        // POST: /Account/Login
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult Login(LoginViewModel model, string returnUrl)
        {
            if (!ModelState.IsValid)
                return View(model);

            User user = UserService.Obj.FindByEmail(model.Email);
            if (user == null)
            {
                ModelState.AddModelError("", AccountStrings.WrongUserNamePassword);
                return View(model);
            }

            //UserSmsVerificationService.Obj.SendSMSVerification(user, UserVerificationReason.Login);
            SignInStatus result = SignInManager.PasswordSignIn(model.Email, model.Password, model.RememberMe, shouldLockout: false);

            //return View("VerifyMobile", new VerifyMobileViewModel { UserName = user.UserName, PhoneNumber = user.Mobile });
            // This doesn't count login failures towards account lockout
            // To enable password failures to trigger account lockout, change to shouldLockout: true
            //var result = await ApplicationSignInManager.

            switch (result)
            {
                case SignInStatus.Success:
                    //UserSmsVerificationService.Obj.SendSMSVerification(user, UserVerificationReason.Login);
                    user.UpdateLastLoginTime();
                    UserService.Obj.ShallowUpdate(user);
                    return RedirectToAction("Redirection", "Account", new { area = "" });
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.RequiresVerification:
                    return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = model.RememberMe });
                case SignInStatus.Failure:
                default:
                    ModelState.AddModelError("", AccountStrings.WrongUserNamePassword);
                    return View(model);
            }
        }

        #region Wathiq

        #endregion

        // GET: /Account/VerifyCode
        [AllowAnonymous]
        public async Task<ActionResult> VerifyCode(string provider, string returnUrl, bool rememberMe)
        {
            // Require that the user has already logged in via username/password or external login
            if (!await SignInManager.HasBeenVerifiedAsync())
            {
                return View("Error");
            }
            return View(new VerifyCodeViewModel { Provider = provider, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //// POST: /Account/VerifyCode
        //[HttpPost]
        //[AllowAnonymous]
        //[ValidateAntiForgeryToken]
        //public async Task<ActionResult> VerifyCode(VerifyCodeViewModel model)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return View(model);
        //    }

        //    // The following code protects for brute force attacks against the two factor codes. 
        //    // If a user enters incorrect codes for a specified amount of time then the user account 
        //    // will be locked out for a specified amount of time. 
        //    // You can configure the account lockout settings in IdentityConfig
        //    var result = await SignInManager.TwoFactorSignInAsync(model.Provider, model.Code, isPersistent: model.RememberMe, rememberBrowser: model.RememberBrowser);
        //    switch (result)
        //    {
        //        case SignInStatus.Success:
        //            return RedirectToLocal(model.ReturnUrl);
        //        case SignInStatus.LockedOut:
        //            return View("Lockout");
        //        case SignInStatus.Failure:
        //        default:
        //            ModelState.AddModelError("", "Invalid code.");
        //            return View(model);
        //    }
        //}

        [AllowAnonymous]
        public ActionResult Register()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        [HandleAjaxException]
        public ActionResult Register(RegisterViewModel model, string code, Guid smsRefId)
        {
            if (!ModelState.IsValid)
                throw new BusinessRuleException(ModelState.GetFirstError());

            UserSmsVerificationService.Obj.ThrowExceptionIfInvalidVerficationCode(smsRefId, code, UserVerificationReason.Registeration);

            User user = user = new User(model.ArabicName, model.Mobile, model.Email);

            user.UpdateRoles(RoleService.Obj.GetByNames(RoleNames.UserRole));
            User result = UserService.Obj.Create(user, model.Password);
            return Json("");
        }

        [HttpPost]
        [AllowAnonymous]
        [HandleAjaxException]
        public ActionResult SendRegisterCode(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
                throw new BusinessRuleException(ModelState.GetFirstError());

            User user = user = new User(model.ArabicName, model.Mobile, model.Email);
            user.UpdateRoles(RoleService.Obj.GetByNames(RoleNames.UserRole));
            UserService.Obj.ValidateUserWithPassword(user, model.Password);

            UserSmsVerification userSmsVerification = UserSmsVerificationService.Obj.SendSmsVerificationForApi(UserVerificationReason.Registeration);

            return Json(userSmsVerification.SMSRefId);
        }

        [HttpPost]
        [AllowAnonymous]
        [HandleAjaxException]
        public ActionResult ResendCode(Guid smsRefId, string mobile)
        {
            UserSmsVerification verificationRequest = null;
            try
            {
                verificationRequest = UserSmsVerificationService.Obj.ResendVerificationRequest(mobile, smsRefId);

                return Json(new { message = "لقد تم إرسال رمز تحقق جديد إلى جوالك", status = true, resendTimeout = verificationRequest.ResendTimeout }, JsonRequestBehavior.AllowGet);
            }
            catch (BusinessRuleException bizRuleEx)
            {
                return Json(new { message = bizRuleEx.Message, status = false, resendTimeout = verificationRequest.ResendTimeout }, JsonRequestBehavior.AllowGet);
            }
            catch (RepositoryException repEx)
            {
                return Json(new { message = repEx.Message, status = false });
            }
            catch (WebServiceException webSvcEx)
            {
                return Json(new { message = webSvcEx.Message, status = false });
            }
            catch (Exception ex)
            {
                return Json(new { message = "حدث خطأ لا يمكن اتمام العملية", status = false });
            }
        }

        // GET: /Account/ConfirmEmail
        [AllowAnonymous]
        public async Task<ActionResult> ConfirmEmail(int userId, string code)
        {
            if (code == null)
            {
                return View("Error");
            }
            IdentityResult result = await UserManager.ConfirmEmailAsync(userId, code);
            return View(result.Succeeded ? "ConfirmEmail" : "Error");
        }

        // GET: /Account/ForgotPassword
        [AllowAnonymous]
        public ActionResult ForgotPassword()
        {
            return View();
        }

        // POST: /Account/ForgotPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return View(model);

                Func<string, string, string> action = (id, code) => Url.Action("ResetPassword", "Account", new { userId = id, code = code }, protocol: Request.Url.Scheme);
                await UserManager.ForgotPasswordAsync(model.Email, action);

                return RedirectToAction("ForgotPasswordConfirmation", "Account");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", ex.Message);
                return View();
            }
        }

        // GET: /Account/ForgotPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

        // GET: /Account/ResetPassword
        [AllowAnonymous]
        public ActionResult ResetPassword(int userId, string code)
        {
            ResetPasswordViewModel resetPasswordViewModel = new ResetPasswordViewModel()
            {
                Code = code,
                UserId = userId,
            };

            return code == null ? View("Error") : View(resetPasswordViewModel);
        }

        // POST: /Account/ResetPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            IdentityResult result = await UserManager.ResetPasswordAsync(model.UserId, model.Code, model.Password);
            if (result.Succeeded)
            {
                return RedirectToAction("ResetPasswordConfirmation", "Account");
            }
            AddErrors(result);
            return View(model);
        }

        // GET: /Account/ResetPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ResetPasswordConfirmation()
        {
            return View();
        }

        #region External Logins
        // POST: /Account/ExternalLogin
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ExternalLogin(string provider, string returnUrl)
        {
            Session["Workaround"] = 0;

            // Request a redirect to the external login provider
            return new ChallengeResult(provider, Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl }));
        }

        // GET: /Account/ExternalLoginCallback
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLoginCallback(string returnUrl)
        {
            ExternalLoginInfo loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync();
            if (loginInfo == null)
            {
                return RedirectToAction("Login");
            }

            // Sign in the user with this external login provider if the user already has a login
            SignInStatus result = await SignInManager.ExternalSignInAsync(loginInfo, isPersistent: false);
            switch (result)
            {
                case SignInStatus.Success:
                    User user = await UserService.Obj.FindAsync(loginInfo.Login);
                    user.UpdateLastLoginTime();
                    UserService.Obj.Update(user);
                    return RedirectToLocal(returnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.RequiresVerification:
                    return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = false });
                case SignInStatus.Failure:
                default:
                    // If the user does not have an account, then prompt the user to create an account
                    ViewBag.ReturnUrl = returnUrl;
                    ViewBag.LoginProvider = loginInfo.Login.LoginProvider;
                    ExternalLoginConfirmationViewModel model = new ExternalLoginConfirmationViewModel { Email = loginInfo.Email };
                    if (loginInfo.Login.LoginProvider.ToLower() == "facebook" || loginInfo.Login.LoginProvider.ToLower() == "twitter")
                        model.Email = loginInfo.DefaultUserName;

                    return View("ExternalLoginConfirmation", model);
            }
        }

        // POST: /Account/ExternalLoginConfirmation
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ExternalLoginConfirmation(ExternalLoginConfirmationViewModel model, string returnUrl)
        {
            if (User.Identity.IsAuthenticated)
                return RedirectToAction("Index", "Manage");

            if (!ModelState.IsValid)
                return View(model);

            // Get the information about the user from the external login provider
            ExternalLoginInfo info = await AuthenticationManager.GetExternalLoginInfoAsync();
            if (info == null)
                return View("ExternalLoginFailure");

            try
            {
                User user = await UserService.Obj.FindAsync(info.Login);
                if (user == null)
                {
                    user = new User(model.ArabicName, model.Mobile, model.Email);
                    user.UpdateRoles(RoleService.Obj.GetByNames(RoleNames.UserRole));

                    user = await UserService.Obj.CreateExternalUserAsync(user, info.Login);
                }

                SignInStatus result = await SignInManager.ExternalSignInAsync(info, false);

                switch (result)
                {
                    case SignInStatus.Success:
                        user.UpdateLastLoginTime();
                        UserService.Obj.Update(user);
                        return RedirectToLocal(returnUrl);
                    case SignInStatus.LockedOut:
                        return View("Lockout");
                    case SignInStatus.RequiresVerification:
                        return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = false });
                    case SignInStatus.Failure:
                        return View("ExternalLoginFailure");
                }

                return RedirectToAction("Index", "Home");
            }
            catch (BusinessRuleException ex)
            {
                ModelState.AddModelError("", ex.Message);
                return View(model);
            }
            catch (Exception ex)
            {
                return View("ExternalLoginFailure");
            }
        }

        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }

        #endregion

        // GET: /Account/SendCode
        [AllowAnonymous]
        public async Task<ActionResult> SendCode(string returnUrl, bool rememberMe)
        {
            int userId = await SignInManager.GetVerifiedUserIdAsync();
            if (userId == null)
            {
                return View("Error");
            }
            IList<string> userFactors = await UserManager.GetValidTwoFactorProvidersAsync(userId);
            List<SelectListItem> factorOptions = userFactors.Select(purpose => new SelectListItem { Text = purpose, Value = purpose }).ToList();
            return View(new SendCodeViewModel { Providers = factorOptions, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        // POST: /Account/SendCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> SendCode(SendCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            // Generate the token and send it
            if (!await SignInManager.SendTwoFactorCodeAsync(model.SelectedProvider))
            {
                return View("Error");
            }
            return RedirectToAction("VerifyCode", new { Provider = model.SelectedProvider, ReturnUrl = model.ReturnUrl, RememberMe = model.RememberMe });
        }

        // POST: /Account/LogOff
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
            return RedirectToAction("Index", "Home");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }

                if (_signInManager != null)
                {
                    _signInManager.Dispose();
                    _signInManager = null;
                }
            }

            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager => HttpContext.GetOwinContext().Authentication;

        private void AddErrors(IdentityResult result)
        {
            foreach (string error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "Home");
        }

        internal class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                //context.RequestContext.HttpContext.Response.SuppressFormsAuthenticationRedirect = true;

                AuthenticationProperties properties = new AuthenticationProperties { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion
    }
}