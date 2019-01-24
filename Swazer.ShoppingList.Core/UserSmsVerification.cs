using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Swazer.ShoppingList.Core
{
    public class UserSmsVerification : BaseEntity
    {
        public static readonly int VerificationRequestTimeout = 1;  // in minutes
        public static readonly int RequestsCount = 3;

        public int UserSmsVerificationId { get; set; }

        public Guid SMSRefId { get; set; }

        public int ResendCounter { get; private set; }

        [StringLength(10)]
        [Column(TypeName = "varchar")]
        public string Code { get; private set; }

        public DateTime ExpiredAt { get; private set; }

        public DateTime UpdatedTime { get; set; }

        [NotMapped]
        public bool IsAlive => DateTime.Now < ExpiredAt;

        [NotMapped]
        private bool ExceededResendCount => ResendCounter >= RequestsCount;

        [NotMapped]
        public int ResendTimeout
        {
            get
            {
                int resendTimeout = Int32.Parse((UpdatedTime.AddMinutes(VerificationRequestTimeout) - DateTime.Now).TotalSeconds.ToString("0000000"));

                if (resendTimeout < 0)
                    resendTimeout = -1;
                return resendTimeout;
            }
        }

        public int UserVerificationStatusId { get; private set; }
        public UserVerificationStatus UserVerificationStatus { get; private set; }

        public int UserVerificationReasonId { get; private set; }
        public UserVerificationReason UserVerificationReason { get; private set; }

        public int? UserId { get; private set; }
        public User User { get; private set; }

        private DateTime CalculateExpirationDate() => UpdatedTime.AddMinutes(VerificationRequestTimeout);

        public UserSmsVerification()
        {
        }

        public UserSmsVerification(User user, UserVerificationReason reason, UserVerificationStatus status)
        {
            this.CreatedAt = DateTime.Now;
            this.UpdatedTime = DateTime.Now;
            this.ExpiredAt = CalculateExpirationDate();

            this.Code = GenerateNewRandomVerificationCode();

            this.User = user;
            this.UserId = user.Id;

            this.UserVerificationReason = reason;
            this.UserVerificationReasonId = reason.UserVerificationReasonId;

            this.UserVerificationStatus = status;
            this.UserVerificationStatusId = status.UserVerificationStatusId;
        }

        public UserSmsVerification(UserVerificationReason reason, UserVerificationStatus status)
        {
            this.CreatedAt = DateTime.Now;
            this.UpdatedTime = DateTime.Now;
            this.ExpiredAt = CalculateExpirationDate();

            this.Code = GenerateNewRandomVerificationCode();

            this.UserVerificationReason = reason;
            this.UserVerificationReasonId = reason.UserVerificationReasonId;

            this.UserVerificationStatus = status;
            this.UserVerificationStatusId = status.UserVerificationStatusId;
        }

        private UserSmsVerification Renew()
        {
            this.CreatedAt = DateTime.Now;
            this.UpdatedTime = DateTime.Now;
            this.ExpiredAt = CalculateExpirationDate();
            this.Code = GenerateNewRandomVerificationCode();
            this.ResendCounter = 0;
            //this.SMSRefId = Guid.NewGuid();

            return this;
        }

        public UserSmsVerification IncrementResendCount()
        {
            this.ResendCounter += 1;

            return this;
        }

        public void RenewIfNecessary()
        {
            if (!IsAlive || ExceededResendCount)
                Renew();
        }

        private string GenerateNewRandomVerificationCode()
        {
            return "11111";
            return new Random().Next(1000, 9999).ToString();
        }
    }
}