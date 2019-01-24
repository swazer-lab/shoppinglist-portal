using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class CustomPasswordValidator : PasswordValidator
    {
        public bool RequireLetter { get; set; }

        public override async Task<IdentityResult> ValidateAsync(string item)
        {
            var baseResult = await base.ValidateAsync(item);

            if (!baseResult.Succeeded)
            {
                if (baseResult.Errors.Contains("Passwords must have at least one non letter or digit character."))
                    return await Task.FromResult(IdentityResult.Failed(new string[] { "كلمة المرور يجب أن تحتوي على رقم أو حرف واحد على الأقل" }));

                if (baseResult.Errors.Contains("Passwords must have at least one digit ('0'-'9')."))
                    return await Task.FromResult(IdentityResult.Failed(new string[] { "Passwords must have at least one digit arabic" }));

                return baseResult;
            }

            if (RequireLetter)
                if (!item.Any(x => char.IsLetter(x)))
                    return await Task.FromResult(IdentityResult.Failed("Password should has one letter chars"));

            return await Task.FromResult(IdentityResult.Success);
        }
    }
}
