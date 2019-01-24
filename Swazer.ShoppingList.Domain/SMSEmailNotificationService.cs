using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface;
using System;

namespace Swazer.ShoppingList.Domain
{
    public class SMSEmailNotificationService : BaseDomainService
    {
        public static SMSEmailNotificationService Obj { get; }

        private static INotificationRepository notificationRepository;

        static SMSEmailNotificationService()
        {
            Obj = new SMSEmailNotificationService();
        }

        private SMSEmailNotificationService()
        {
            notificationRepository = Factory.CreateWebSvc<INotificationRepository>("NotificationRepository");
        }

        public bool SendSMS(SendSMSRequest smsRequest)
        {
            if (smsRequest == null)
                throw new ArgumentNullException(nameof(smsRequest), "Must not be null");

            return notificationRepository.SendSMS(smsRequest) > 0;
        }

        public bool SendEmail(SendEmailRequest emailRequest)
        {
            if (emailRequest == null)
                throw new ArgumentNullException(nameof(emailRequest), "Must not be null");

            return notificationRepository.SendEmail(emailRequest) > 0;
        }
    }
}
