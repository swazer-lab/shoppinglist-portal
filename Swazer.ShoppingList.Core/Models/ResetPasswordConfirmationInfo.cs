using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class ResetPasswordConfirmationInfo : BaseEntity
    {
        public int ResetPasswordConfirmationInfoId { get; set; }

        public string Token { get; set; }

        public string Email { get; set; }

        public string Code { get; set; }

        public static ResetPasswordConfirmationInfo Create(string token, string email, string code)
        {
            return new ResetPasswordConfirmationInfo()
            {
                Code = code,
                Token = token,
                Email = email,
                CreatedAt = DateTime.Now
            };
        }
    }
}
