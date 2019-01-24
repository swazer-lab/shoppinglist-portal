using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Swazer.ShoppingList.Core
{
    public class UserVerificationStatus : BaseEntity
    {
        public int UserVerificationStatusId { get; private set; }

        [StringLength(50)]
        public string Description { get; private set; }

        public static readonly UserVerificationStatus Sent = new UserVerificationStatus { UserVerificationStatusId = 1, Description = "أرسلت" };
        public static readonly UserVerificationStatus Pending = new UserVerificationStatus { UserVerificationStatusId = 2, Description = "قيد الإرسال" };
        public static readonly UserVerificationStatus Fail = new UserVerificationStatus { UserVerificationStatusId = 3, Description = "فشلت" };

        public static IEnumerable<UserVerificationStatus> GetDefaults()
        {
            yield return Sent;
            yield return Pending;
            yield return Fail;
        }
    }
}