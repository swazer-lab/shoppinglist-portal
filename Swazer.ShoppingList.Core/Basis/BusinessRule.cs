using System.Threading;

namespace Swazer.ShoppingList.Core
{
    public class BusinessRule
    {
        public string RuleName { get; private set; }
        public string ArabicMessage { get; private set; }
        public string EnglishMessage { get; private set; }

        public string LocalizedMessage => Thread.CurrentThread.IsArabic() ? ArabicMessage : EnglishMessage;

        public BusinessRule(string ruleName, string arabicMessage, string englishMessage)
        {
            RuleName = ruleName;
            ArabicMessage = arabicMessage;
            EnglishMessage = englishMessage;
        }
    }
}