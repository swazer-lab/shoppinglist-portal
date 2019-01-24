using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Swazer.ShoppingList.Core
{
    public class UserVerificationReason : BaseEntity
    {
        public int UserVerificationReasonId { get; private set; }

        [StringLength(50)]
        public string Description { get; private set; }

        public static readonly UserVerificationReason Registeration = new UserVerificationReason { UserVerificationReasonId = 1, Description = "تسجيل مشترك" };
        public static readonly UserVerificationReason Login = new UserVerificationReason { UserVerificationReasonId = 2, Description = "تسجيل دخول" };
        public static readonly UserVerificationReason CreateReservation = new UserVerificationReason { UserVerificationReasonId = 3, Description = "إنشاء حجز جديد" };

        public static IEnumerable<UserVerificationReason> GetDefaults()
        {
            yield return Registeration;
            yield return Login;
            yield return CreateReservation;
        }
    }
}
