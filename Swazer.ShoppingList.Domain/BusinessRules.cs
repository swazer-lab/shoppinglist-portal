using Swazer.ShoppingList.Core;

namespace Swazer.ShoppingList.Domain
{
    public class BusinessRules
    {
        public static readonly BusinessRule NoAvialbleAppointment = new BusinessRule(nameof(NoAvialbleAppointment), "الطبيب المراد النقل اليه لايملك الوقت الكافي", "The destination doctor has no avaiable appointments");
    }
}