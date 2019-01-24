using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Principal;
using System.Threading;

namespace Swazer.ShoppingList.Core
{
    public static class RoleNames
    {
        [PermissionCaption(typeof(CoreStrings), "User")]
        public const string UserRole = "/ShoppingCenter/User";

        [PermissionCaption(typeof(CoreStrings), "Admin")]
        public const string AdminRole = "/ShoppingCenter/Admin";
        
        public static IEnumerable<string> GetAllRoles()
        {
            yield return AdminRole;
            yield return UserRole;
        }

        public static Dictionary<string, string> GetRolesWithCaptions()
        {
            Dictionary<string, string> result = new Dictionary<string, string>();

            foreach (FieldInfo field in typeof(RoleNames).GetFields().Where(x => x.IsPublic && x.IsLiteral && x.Name.EndsWith("Role")))
            {
                string name = field.GetValue(null) as string;
                string caption = name;

                object[] attrs = field.GetCustomAttributes(typeof(PermissionCaptionAttribute), false);
                if (attrs.Length > 0)
                    caption = ((PermissionCaptionAttribute)attrs[0]).Caption;

                result.Add(name, caption);
            }

            return result;
        }

        public static string GetCaptionByFieldName(string fieldName)
        {
            return typeof(RoleNames)
                .GetField(fieldName)
                .GetCustomAttributes(typeof(PermissionCaptionAttribute), false)
                .Cast<PermissionCaptionAttribute>()
                .SingleOrDefault()?
                .Caption;
        }

        public static string GetCaptionByFieldValue(string fieldValue)
        {
            return typeof(RoleNames)
                .GetFields()
                .SingleOrDefault(x => x.GetValue(null).Equals(fieldValue))
                ?.GetCustomAttributes(typeof(PermissionCaptionAttribute), false)
                .Cast<PermissionCaptionAttribute>()
                .SingleOrDefault()
                ?.Caption;
        }

        public static bool CheckPermission(this IPrincipal principal, string operationName)
        {
            if (principal == null)
                throw new ArgumentNullException(nameof(principal));

            if (string.IsNullOrEmpty(operationName))
                throw new ArgumentNullException(nameof(operationName), "must not be null or empty.");
           
            string[] leafs = operationName.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);

            List<string> roots = new List<string> { "/" };

            for (int i = 0; i < leafs.Length; i++)
            {
                string[] root = new string[i + 2];
                root[0] = string.Empty;
                for (int j = 0; j < i + 1; j++)
                    root[j + 1] = leafs[j];

                roots.Add(string.Join("/", root));
            }

            foreach (string root in roots)
            {
                if (Thread.CurrentPrincipal.IsInRole(root))
                    return true;
            }

            return false;
        }

        public static bool HasPermission(this IPrincipal principal, params string[] operationNames)
        {
            return operationNames.Any(x => principal.CheckPermission(x));
        }

        public static bool IsArabic(this Thread thread)
        {
            return thread.CurrentUICulture.Name.StartsWith("ar");
        }
    }

    [AttributeUsage(AttributeTargets.Field, AllowMultiple = true)]
    public sealed class PermissionCaptionAttribute : Attribute
    {
        private string caption;
        // This is a positional argument
        public PermissionCaptionAttribute(string caption)
        {
            this.Caption = caption;
        }

        public PermissionCaptionAttribute(Type resourceType, string caption)
        {
            this.Caption = caption;
            this.ResourceType = resourceType;
        }

        public string Caption
        {
            get
            {
                if (ResourceType == null)
                    return this.caption;

                try
                {
                    PropertyInfo property = ResourceType.GetProperty(caption, BindingFlags.Public | BindingFlags.Static);
                    if (property != null)
                        return property.GetValue(null, null) as string;
                    return string.Empty;
                }
                catch (Exception)
                {
                    return this.caption;
                }
            }
            set => this.caption = value;
        }

        public Type ResourceType { get; set; }
    }
}