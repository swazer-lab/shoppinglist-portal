using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.Domain.BusinessRuleResource;

namespace Swazer.ShoppingList.Domain
{
    public class BusinessRules
    {
        public static BusinessRule PasswordInCorrect => new BusinessRule(nameof(PasswordInCorrect), ErrorMessageString.InCorrectPassword);
        public static BusinessRule EmailAlreadyExists => new BusinessRule(nameof(EmailAlreadyExists), ErrorMessageString.EmailAlreadyExists);
    }
}