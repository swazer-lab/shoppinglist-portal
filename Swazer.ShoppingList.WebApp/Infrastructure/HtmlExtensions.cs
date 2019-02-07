using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain;
using Swazer.ShoppingList.WebApp.Models;
using Swazer.ShoppingList.WebApp.Resources;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Xml;
using System.Xml.XPath;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public static class HtmlExtensions
    {
        //https://stackoverflow.com/questions/20036964
        public static IHtmlString Truncate(this HtmlHelper helper, string input, int length = 100, string ommission = "...")
        {
            return helper.Raw(input.StripTags().TruncateHtml(length, ommission));
        }

        internal static string TruncateHtml(this string input, int length, string ommission)
        {
            if (input == null || input.Length < length)
                return input;
            int iNextSpace = input.LastIndexOf(" ", length);
            return string.Format("{0}" + ommission, input.Substring(0, (iNextSpace > 0) ?
                                                                  iNextSpace : length).Trim());
        }

        internal static string StripTags(this string markup)
        {
            try
            {
                System.IO.StringReader sr = new System.IO.StringReader(markup);
                XPathDocument doc;
                using (XmlReader xr = XmlReader.Create(sr,
                                   new XmlReaderSettings()
                                   {
                                       ConformanceLevel = ConformanceLevel.Fragment
                                       // for multiple roots
                                   }))
                {
                    doc = new XPathDocument(xr);
                }

                return doc.CreateNavigator().Value; // .Value is similar to .InnerText of  
                                                    //  XmlDocument or JavaScript's innerText
            }
            catch
            {
                return string.Empty;
            }
        }

        public static string TranslateExternalProvider(this HtmlHelper helper, string providerName)
        {
            if (string.Compare(providerName, "google", true) == 0)
                return AccountStrings.Google;
            else if (string.Compare(providerName, "facebooK", true) == 0)
                return AccountStrings.Facebook;
            else if (string.Compare(providerName, "twitter", true) == 0)
                return AccountStrings.Twitter;

            return providerName;
        }

        public static string GetEmail(this IPrincipal user)
        {
            return user.Identity.Name;
        }

        public static string GetName(this IPrincipal user)
        {
            var name = UserService.Obj.FindByEmail(user.Identity.Name).Name;

            return name;
        }

        public static string GetPhoto(this IPrincipal user)
        {
            var id = UserService.Obj.FindByEmail(user.Identity.Name).Id;

            var image = ImageService.Obj.FindByUserId(id);

            if (image != null)
                return Convert.ToBase64String(image?.BlobContent);

            return string.Empty;
        }

        public static IEnumerable<EnumSelectListItem> GetList<TEnum>()
        {
            if (!typeof(TEnum).IsEnum)
                throw new ArgumentException("EnumT must be an enumerated type");

            foreach (object item in Enum.GetValues(typeof(TEnum)))
            {
                string localizedName;
                try
                {
                    Type type = typeof(TEnum);
                    MemberInfo[] memInfo = type.GetMember(item.ToString());
                    object[] attributes = memInfo[0].GetCustomAttributes(typeof(DisplayAttribute), false);
                    localizedName = ((DisplayAttribute)attributes[0]).GetName();
                }
                catch
                {
                    localizedName = item.ToString();
                }
                yield return new EnumSelectListItem { text = localizedName, value = (int)item };
            }
        }

        public static string KoValidationToken(this HtmlHelper helper)
        {
            return Thread.CurrentThread.IsArabic() ? "ar-SA" : null;
        }

        public static string JavascriptLocalization(this HtmlHelper helper)
        {
            return Thread.CurrentThread.IsArabic() ? "ar" : "en";
        }

        public static bool IsCurrentThreadArabic(this HtmlHelper helper)
        {
            return Thread.CurrentThread.IsArabic();
        }

        public static string GetDisplayAttribute<TEnum>(this TEnum item)
        {
            try
            {
                Type originalType = typeof(TEnum);

                //https://stackoverflow.com/a/374663/4390133
                Type underlyingType = Nullable.GetUnderlyingType(originalType);
                bool originalTypeIsNullable = underlyingType != null;

                if (originalTypeIsNullable)
                    originalType = underlyingType;

                MemberInfo[] memInfo = originalType.GetMember(item.ToString());
                object[] attributes = memInfo[0].GetCustomAttributes(typeof(DisplayAttribute), false);
                return ((DisplayAttribute)attributes[0]).GetName();
            }
            catch
            {
                return item.ToString();
            }
        }

        public static RouteValueDictionary Copy(this RouteValueDictionary dictionary, string lang, NameValueCollection queryString)
        {
            RouteValueDictionary newDic = new RouteValueDictionary();
            foreach (KeyValuePair<string, object> item in dictionary)
                newDic.Add(item.Key, item.Value);

            foreach (var item in queryString)
                newDic.Add(item.ToString(), queryString[item.ToString()]);

            if (newDic.ContainsKey("lang"))
                newDic["lang"] = lang;
            else
                newDic.Add("lang", lang);

            return newDic;
        }

        public static string GetFirstError(this ModelStateDictionary modelState) =>
            modelState.Values.SelectMany(v => v.Errors.Select(b => b.ErrorMessage)).FirstOrDefault();

        public static string GetFirstError(this System.Web.Http.ModelBinding.ModelStateDictionary modelState) =>
            modelState.Values.SelectMany(v => v.Errors.Select(b => b.ErrorMessage)).FirstOrDefault();

        public static bool IsDebug(this HtmlHelper helper)
        {

#if DEBUG
            return true;
#else
            return false;
#endif
        }

        public static string IsSelected(this HtmlHelper html, string controller = null, string action = null, string cssClass = "active")
        {
            string currentAction = (string)html.ViewContext.RouteData.Values["action"];
            string currentController = (string)html.ViewContext.RouteData.Values["controller"];

            if (String.IsNullOrEmpty(controller))
                controller = currentController;

            if (String.IsNullOrEmpty(action))
                action = currentAction;

            return controller == currentController && action == currentAction ?
                cssClass : String.Empty;
        }

        public static string HasControllerSelected(this HtmlHelper html, params string[] controllers)
        {
            string cssClass = "active";
            string currentController = (string)html.ViewContext.RouteData.Values["controller"];

            foreach (string controller in controllers)
                if (currentController == controller)
                    return cssClass;

            return string.Empty;
        }

        public static string PageClass(this HtmlHelper html)
        {
            return (string)html.ViewContext.RouteData.Values["action"];
        }
    }
}