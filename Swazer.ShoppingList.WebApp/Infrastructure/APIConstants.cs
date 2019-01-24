namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public static class ApiConstants
    {
        #region Mobile
        public const string MobileRoot = "api/mobile";

        public const string CouponRoot = "api/coupon";

        public const string NearestMedicalcenters = "medicalcenters/nearest";
        public const string MedicalVisitReasons = "medicalvisitreasons";

        public const string Doctors = "doctors";
        public const string Regions = "regions";

        public const string ExcludeMedicalCenters = "excludemedicalcenters";
        public const string MedicalCenters = "medicalcenters";
        public const string GetMedicalClinic = "getMedicalClinic";
        public const string GetMedicalCenter = "getMedicalCenter";
        public const string MedicalClinics = "medicalclinics";

        public const string RandomOffers = "offers/random";
        public const string Offers = "offers";

        public const string Complains = "complains";
        public const string ComplainsTypes = "complains/types";
        public const string CreateComplain = "complains/create";
        public const string CreateComplainAnonymous = "complains/create/anonymous";

        public const string FamilyMembers = "familymembers";
        public const string ShallowFamilyMembers = "familymembers/shallow";
        public const string CreateFamilyMember = "familymembers/create";
        public const string EditFamilyMember = "familymembers/edit";
        public const string DeleteFamilyMember = "familymembers/delete";

        public const string Reservations = "reservations";
        public const string UserReservations = "user/reservations";
        public const string ReservationsCancel = "reservations/cancel";
        public const string CreateCompletedReservation = "reservation/create/completed";
        public const string CreateUncompletedReservation = "reservation/create/uncompleted";
        public const string ReservationSendCode = "reservation/sendcode";
        public const string CreateReservationCoupon = "reservation/create";


        public const string ContactReasons = "contactreasons";
        public const string Newsitems = "newsitems";
        public const string Photo = "photo";
        public const string ExternalMedicalClinics = "externalMedicalClinics";
        public const string Brief = "brief";
        public const string CreateConversation = "conversation/create";

        #endregion
    }
}