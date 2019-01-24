using Swazer.ShoppingList.Core;
using System;

namespace Swazer.ShoppingList.Core
{
    public class UserSearchCriterias : SearchCriteria
    {
        public string Email { get; set; }

        public string ArabicName { get; set; }

        public string EnglishName { get; set; }

        public IdentityRole Role { get; set; }

        public bool? IsActive { get; set; }

        public int? MedicalCenterId { get; set; }

        public int? MedicalClinicId { get; set; }
    }

    public class UserLogsSearchCriteria : SearchCriteria
    {
        public DateTime? From { get; set; }

        public DateTime? To { get; set; }
    }
}
