
using System;
using Swazer.ShoppingList.Core;

namespace Swazer.ShoppingList.RepositoryInterface
{
    public interface INotificationRepository
    {
        int SendEmailConfirmation(string email, string clientName, string url);

        int SendSMS(SendSMSRequest request);

        int SendEmail(SendEmailRequest request);

        int SendEmailAddSubAdmin(string adminUserName, string adminPassword, string adminEmail);

        int SendForgetPasswordEmail(string email, string clientName, string url);

        int SendEmailPaymentReminderNotification(string email, string clientName, string billNumber);

        int SendSMSPaymentReminderNotification(string mobileNumber, string clientName, string billNumber);

        int SendEmailPaymentExpiredNotification(string email, string clientName, string billNumber);

        int SendSMSPaymentExpiredNotification(string mobileNumber, string clientName, string billNumber);

        int SendEmailRenewalReminderNotification(string email, string firstName, string mCIBillingSadadNumber);

        int SendSMSRenewalReminderNotification(string mobile, string firstName, string mCIBillingSadadNumber);

        int SendEmailRenewalPeriodExpiredNotification(string email, string firstName, string mCIBillingSadadNumber);

        int SendSMSRenewalPeriodExpiredNotification(string mobile, string firstName, string mCIBillingSadadNumber);
    }
}
