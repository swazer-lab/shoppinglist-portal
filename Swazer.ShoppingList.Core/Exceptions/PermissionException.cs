using System;
using System.Runtime.Serialization;

namespace Swazer.ShoppingList.Core
{
    [Serializable]
    public class PermissionException : Exception
    {
        public string PermissionCode { get; private set; }

        public PermissionException() : base(string.Format(CoreStrings.NoPermission))
        { }

        public PermissionException(string permissionCode) : base(string.Format($"{CoreStrings.NoPermission} {RoleNames.GetCaptionByFieldValue(permissionCode)}"))
        {
            this.PermissionCode = permissionCode;
        }

        public PermissionException(string message, string permissionCode)
            : base(message)
        {
            this.PermissionCode = permissionCode;
        }

        public PermissionException(string message, string permissionCode, Exception inner)
            : base(message, inner)
        {
            this.PermissionCode = permissionCode;
        }

        protected PermissionException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
            PermissionCode = info.GetString(nameof(PermissionCode));
        }

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            base.GetObjectData(info, context);
            info.AddValue(nameof(PermissionCode), PermissionCode);
        }
    }
}