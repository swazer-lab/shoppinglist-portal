using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Web.Http;
using System.Threading.Tasks;
using System.Web;
using System.Threading;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.AspNet.Identity.Owin;
using Swazer.ShoppingList.WebApp.API.Infrastructure;

namespace Swazer.ShoppingList.WebApp.API
{
    [RoutePrefix("api/account")]
    public class AccountController : BaseApiController
    {
        private const string LocalLoginProvider = "Local";
        public ISecureDataFormat<AuthenticationTicket> AccessTokenFormat { get; }

        public AccountController()
        {
        }

        public AccountController(ISecureDataFormat<AuthenticationTicket> accessTokenFormat)
        {
            AccessTokenFormat = accessTokenFormat;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("exist")]
        public IHttpActionResult IsUserExist(string email)
        {
            return Ok();
        }

        //// GET api/Account/UserInfo
        ////[HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        //[Authorize]
        //[Route("UserInfo")]
        //public IHttpActionResult GetUserInfo()
        //{
        //    User user = GetCurrentUser();
        //    IList<UserLoginInfo> result = UserService.Obj.GetLogins(user.Id);

        //    return Ok(new UserEditBindingModel
        //    {
        //        Email = user.Email,
        //        Mobile = user.Mobile,
        //        IsExternal = result.Count != 0,
        //    });
        //}

        //[HttpPost]
        //[Route("Edit")]
        //[Authorize]
        //public IHttpActionResult Edit([FromBody] UserEditBindingModel model)
        //{

        //    return Ok();
        //}

        //// POST api/Account/ChangePassword
        //[Route("ChangePassword")]
        //[Authorize]
        //public async Task<IHttpActionResult> ChangePassword(ChangePasswordBindingModel model)
        //{
        //    if (!ModelState.IsValid)
        //        return BadRequest(ModelState);

        //    IdentityResult result = await UserService.Obj.ChangePasswordAsync(GetCurrentUser().Id, model.OldPassword, model.NewPassword);

        //    if (!result.Succeeded)
        //    {
        //        string message = result.Errors.FirstOrDefault();
        //        if (message == "Incorrect password.")
        //            return BadRequest("");

        //        return BadRequest(message);
        //    }

        //    return Ok();
        //}

        [HttpPost]
        [Route("verifyMobile")]
        [AllowAnonymous]
        public IHttpActionResult VerifyMobile()
        {
            UserSmsVerification userSmsVerification = UserSmsVerificationService.Obj.SendSmsVerificationForApi(UserVerificationReason.Registeration);

            return Ok(userSmsVerification.SMSRefId);
        }

        [HttpGet]
        [Route("profile")]
        [AllowApiUser]
        public IHttpActionResult UserProfile()
        {
            User user = GetCurrentUser();

            var userProfile = user.ToUserProfileBindingModel();
            userProfile.PhotoId = ImageService.Obj.FindByUserId(user.Id)?.ImageId;

            return Ok(userProfile);
        }

        [HttpPost]
        [Route("register")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> Register(RegisterBindingModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState.GetFirstError());

            User user = new User(model.Name, model.Mobile, model.Email);
            user.UpdateRoles(RoleService.Obj.GetByNames(RoleNames.UserRole));
            User result = UserService.Obj.Create(user, model.Password);

            //authenticate
            ClaimsIdentity identity = UserService.Obj.CreateIdentity(result, OAuthDefaults.AuthenticationType);
            //IEnumerable<Claim> claims = externalLogin.GetClaims();
            //identity.AddClaims(claims);
            Authentication.SignIn(identity);

            ClaimsIdentity oAuthIdentity = new ClaimsIdentity(Startup.OAuthOptions.AuthenticationType);

            oAuthIdentity.AddClaim(new Claim(ClaimTypes.Name, user.UserName));
            oAuthIdentity.AddClaim(new Claim(ClaimTypes.NameIdentifier, result.Id.ToString()));
            oAuthIdentity.AddClaim(new Claim(ClaimTypes.Role, RoleNames.UserRole));

            AuthenticationTicket ticket = new AuthenticationTicket(oAuthIdentity, new AuthenticationProperties());

            DateTime currentUtc = DateTime.UtcNow;
            ticket.Properties.IssuedUtc = currentUtc;
            ticket.Properties.ExpiresUtc = currentUtc.Add(Startup.OAuthOptions.AccessTokenExpireTimeSpan);

            string accessToken = Startup.OAuthOptions.AccessTokenFormat.Protect(ticket);
            Request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var confirmToken = UserService.Obj.GenerateConfirmEmailToken(result);
            var encodedToken = HttpUtility.UrlEncode(confirmToken);
            await UserService.Obj.SendConfirmEmailLinkToUser(model.Email, encodedToken, result.Id);

            var token = new
            {
                userName = user.UserName,
                userId = user.Id,
                access_token = accessToken,
                token_type = "bearer",
                expires_in = Startup.OAuthOptions.AccessTokenExpireTimeSpan.TotalSeconds.ToString(),
                issued = currentUtc.ToString("ddd, dd MMM yyyy HH':'mm':'ss 'GMT'"),
                expires = currentUtc.Add(Startup.OAuthOptions.AccessTokenExpireTimeSpan).ToString("ddd, dd MMM yyyy HH:mm:ss 'GMT'")
            };

            return Ok(token);
        }

        [HttpPost]
        [Route("ResendConfirmEmail")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> ResendConfirmEmail([FromUri]int userId)
        {
            User user = UserService.Obj.FindById(userId);

            if (user == null)
                throw new BusinessRuleException(nameof(User), BusinessRules.UserNotFound);

            var confirmToken = UserService.Obj.GenerateConfirmEmailToken(user);
            var encodedToken = HttpUtility.UrlEncode(confirmToken);
            await UserService.Obj.SendConfirmEmailLinkToUser(user.Email, encodedToken, user.Id);

            return Ok();
        }

        [HttpPost]
        [Route("ConfirmEmail")]
        [AllowAnonymous]
        public IHttpActionResult ConfirmEmail([FromBody]ConfirmEmailBindingModel confirmEmailBindingModel)
        {
            User user = UserService.Obj.FindById(confirmEmailBindingModel.UserId);
            if (user.EmailConfirmed)
            {
                return Ok();
            }

            bool isConfirmedSuccess = UserService.Obj.ValidateConfirmEmailToken(user, confirmEmailBindingModel.Token);

            if (!isConfirmedSuccess)
                throw new BusinessRuleException(nameof(User), BusinessRules.ConfirmEmailIncorrect);

            user = user.PerformConfirmEmail();

            UserService.Obj.Update(user);

            var data = new { userId = confirmEmailBindingModel.UserId };

            return Ok();
        }

        [Route("ForgotPassword")]
        [HttpPost]
        [AllowAnonymous]
        public async Task<IHttpActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            User user = UserService.Obj.FindByEmail(model.Email);

            if (user == null)
                throw new BusinessRuleException(nameof(User), BusinessRules.UserNotFound);

            string token = UserService.Obj.GeneratePasswordResetToken(user.Id);

            string resetCode = ResetCodeOperation.ProduceUserResetCode();
            ResetPasswordConfirmationInfo info = ResetPasswordConfirmationInfo.Create(token, model.Email, resetCode);

            ResetPasswordInformationService.Obj.Create(info);

            await UserService.Obj.SendResetValidationCode(model.Email, resetCode);

            return Ok();
        }

        [Route("ResetPassword")]
        [HttpPost]
        [AllowAnonymous]
        public IHttpActionResult ResetPassword(ResetPasswordViewModel model)
        {
            UserService.Obj.ResetPassword(model.Email, model.Password, model.Code);

            return Ok();
        }

        // POST api/Account/Logout
        [Route("Logout")]
        public IHttpActionResult Logout()
        {
            Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
            return Ok();
        }

        #region Helpers

        private IAuthenticationManager Authentication => this.Request.GetOwinContext().Authentication;

        public class ExternalLoginData
        {
            public string LoginProvider { get; set; }
            public string ProviderKey { get; set; }
            public string UserName { get; set; }

            public static async Task<ExternalLoginData> FromToken(string provider, string accessToken)
            {
                ClaimsIdentity identity = null;
                if (provider.ToLower() == "facebook")
                    identity = await GetFacebook(accessToken);
                else if (provider.ToLower() == "google")
                    identity = await GetGoogle(accessToken);

                if (identity == null)
                    return null;

                Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

                if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer) || String.IsNullOrEmpty(providerKeyClaim.Value))
                    return null;

                if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
                    return null;

                return new ExternalLoginData
                {
                    LoginProvider = providerKeyClaim.Issuer,
                    ProviderKey = providerKeyClaim.Value,
                    UserName = identity.FindFirstValue(ClaimTypes.Name)
                };
            }

            private static async Task<ClaimsIdentity> GetGoogle(string accessToken)
            {
                try
                {
                    string verifyTokenEndPoint = string.Format("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={0}", accessToken);

                    HttpClient client = new HttpClient();
                    Uri uri = new Uri(verifyTokenEndPoint);
                    HttpResponseMessage response = await client.GetAsync(uri);
                    ClaimsIdentity identity = null;

                    if (!response.IsSuccessStatusCode)
                        return null;

                    string content = await response.Content.ReadAsStringAsync();
                    dynamic iObj = (JObject)JsonConvert.DeserializeObject(content);

                    if (iObj["issued_to"] != Settings.Provider.Goggle_ClientId)
                    {
                        return null;
                    }

                    identity = new ClaimsIdentity(OAuthDefaults.AuthenticationType);
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, iObj["user_id"].ToString(), ClaimValueTypes.String, "Google", "Google"));
                    return identity;
                }
                catch (Exception ex)
                {
                    TracingSystem.TraceException(ex);
                    return null;
                }
            }

            private static async Task<ClaimsIdentity> GetFacebook(string accessToken)
            {
                try
                {
                    string verifyTokenEndPoint = string.Format("https://graph.facebook.com/me?access_token={0}", accessToken);
                    string verifyAppEndPoint = string.Format("https://graph.facebook.com/app?access_token={0}", accessToken);

                    HttpClient client = new HttpClient();

                    Uri uri = new Uri(verifyTokenEndPoint);
                    HttpResponseMessage response = await client.GetAsync(uri);
                    ClaimsIdentity identity = null;

                    if (!response.IsSuccessStatusCode)
                        return null;

                    string content = await response.Content.ReadAsStringAsync();
                    dynamic iObj = (JObject)JsonConvert.DeserializeObject(content);

                    identity = new ClaimsIdentity(OAuthDefaults.AuthenticationType);

                    uri = new Uri(verifyAppEndPoint);
                    response = await client.GetAsync(uri);
                    content = await response.Content.ReadAsStringAsync();
                    dynamic appObj = (JObject)JsonConvert.DeserializeObject(content);
                    if (appObj["id"] != Settings.Provider.Facebook_AppId)
                    {
                        return null;
                    }

                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, iObj["id"].ToString(), ClaimValueTypes.String, "Facebook", "Facebook"));
                    return identity;
                }
                catch (Exception ex)
                {
                    TracingSystem.TraceException(ex);
                    return null;
                }
            }

            public IList<Claim> GetClaims()
            {
                IList<Claim> claims = new List<Claim>();
                claims.Add(new Claim(ClaimTypes.NameIdentifier, ProviderKey, null, LoginProvider));

                if (UserName != null)
                {
                    claims.Add(new Claim(ClaimTypes.Name, UserName, null, LoginProvider));
                }

                return claims;
            }

            public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
            {
                if (identity == null)
                {
                    return null;
                }

                Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

                if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer)
                    || String.IsNullOrEmpty(providerKeyClaim.Value))
                {
                    return null;
                }

                if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
                {
                    return null;
                }

                return new ExternalLoginData
                {
                    LoginProvider = providerKeyClaim.Issuer,
                    ProviderKey = providerKeyClaim.Value,
                    UserName = identity.FindFirstValue(ClaimTypes.Name)
                };
            }
            #endregion
        }

        [OverrideAuthentication]
        [AllowAnonymous]
        [Route("RegisterExternal")]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalBearer)]
        public async Task<IHttpActionResult> RegisterExternal(RegisterExternalBindingModel model)
        {
            try
            {
                ExternalLoginData externalLogin = await ExternalLoginData.FromToken(model.Provider, model.Token);

                if (externalLogin == null)
                    throw new Exception("externalLogin can not be found, externalLogin is null");

                if (externalLogin.LoginProvider != model.Provider)
                {
                    Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                    throw new Exception("Provider Conflicts, the Provider which send by user is not the same of the externalLogin's provider");
                }

                User user = await UserService.Obj.FindByEmailAsync(model.Email);

                bool registered = user != null;
                if (!registered)
                {
                    user = new User(model.Name, model.Email);
                    user.UpdateRoles(RoleService.Obj.GetByNames(RoleNames.UserRole));
                    user.PerformConfirmEmail();

                    user = await UserService.Obj.CreateExternalUserAsync(user, new UserLoginInfo(externalLogin.LoginProvider, externalLogin.ProviderKey));
                }

                // Authenticate
                ClaimsIdentity identity = await UserService.Obj.CreateIdentityAsync(user, OAuthDefaults.AuthenticationType);
                IEnumerable<Claim> claims = externalLogin.GetClaims();
                identity.AddClaims(claims);
                Authentication.SignIn(identity);

                ClaimsIdentity oAuthIdentity = new ClaimsIdentity(Startup.OAuthOptions.AuthenticationType);

                oAuthIdentity.AddClaim(new Claim(ClaimTypes.Name, user.UserName));
                oAuthIdentity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));

                oAuthIdentity.AddClaim(new Claim(ClaimTypes.Role, RoleNames.UserRole));

                AuthenticationTicket ticket = new AuthenticationTicket(oAuthIdentity, new AuthenticationProperties());

                DateTime currentUtc = DateTime.UtcNow;
                ticket.Properties.IssuedUtc = currentUtc;
                ticket.Properties.ExpiresUtc = currentUtc.Add(Startup.OAuthOptions.AccessTokenExpireTimeSpan);

                string accessToken = Startup.OAuthOptions.AccessTokenFormat.Protect(ticket);
                string refreshToken = Startup.OAuthOptions.RefreshTokenFormat.Protect(ticket);
                Request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

                var token = new
                {
                    userName = user.UserName,
                    userId = user.Id,
                    access_token = accessToken,
                    refresh_token = refreshToken,
                    token_type = "bearer",
                    expires_in = Startup.OAuthOptions.AccessTokenExpireTimeSpan.TotalSeconds.ToString(),
                    issued = currentUtc.ToString("ddd, dd MMM yyyy HH':'mm':'ss 'GMT'"),
                    expires = currentUtc.Add(Startup.OAuthOptions.AccessTokenExpireTimeSpan).ToString("ddd, dd MMM yyyy HH:mm:ss 'GMT'")
                };

                return Ok(token);
            }
            catch (Exception ex)
            {
                TracingSystem.TraceException(ex);
                return InternalServerError();
            }
        }

    }
}
