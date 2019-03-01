using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain.BusinessRuleResource;

namespace Swazer.ShoppingList.Domain
{
    public class BusinessRules
    {
        public static BusinessRule PasswordInCorrect => new BusinessRule(nameof(PasswordInCorrect), ErrorMessageString.InCorrectPassword);
        public static BusinessRule EmailAlreadyExists => new BusinessRule(nameof(EmailAlreadyExists), ErrorMessageString.EmailAlreadyExists);
        public static BusinessRule ConfirmEmailIncorrect => new BusinessRule(nameof(ConfirmEmailIncorrect), CoreStrings.ConfirmEmailIncorrect);
        public static BusinessRule UserNotFound => new BusinessRule(nameof(UserNotFound), ErrorMessageString.UserNotFound);
        public static BusinessRule ValidationCodeIncorrect => new BusinessRule(nameof(ValidationCodeIncorrect), ErrorMessageString.IncorrectValidationCode);
        public static BusinessRule ExpiredDateForResetPassword => new BusinessRule(nameof(ExpiredDateForResetPassword), ErrorMessageString.ExpiredDateForResetPassword);
        public static BusinessRule ResetPasswordIncorrect => new BusinessRule(nameof(ResetPasswordIncorrect), ErrorMessageString.ResetPasswordIncorrect);
    }
}