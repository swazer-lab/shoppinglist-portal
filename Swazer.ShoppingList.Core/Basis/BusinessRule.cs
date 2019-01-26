using System.Threading;

namespace Swazer.ShoppingList.Core
{
    public class BusinessRule
    {
        public string RuleName { get; private set; }
        public string LocalizedMessage { get; private set; }

        public BusinessRule(string ruleName, string localizedMessage)
        {
            RuleName = ruleName;
            LocalizedMessage = localizedMessage;
        }
    }
}