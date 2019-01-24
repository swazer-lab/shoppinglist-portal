using System;
using System.Linq;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;

namespace Swazer.ShoppingList.Domain
{
    public class UserSmsVerificationService : BaseDomainService
    {
        public static UserSmsVerificationService Obj { get; }

        private UserSmsVerificationService()
        {
        }

        static UserSmsVerificationService()
        {
            Obj = new UserSmsVerificationService();
        }

        public UserSmsVerification Create(UserSmsVerification entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Must not be null");

            if (!entity.Validate())
                throw new ValidationException(nameof(UserSmsVerification), entity.ValidationResults);

            entity.SMSRefId = Guid.NewGuid();
            UserSmsVerification result = repository.Create(entity);

            return result;
        }

        public UserSmsVerification FindSmsVerification(int userId, UserVerificationReason reason)
        {
            if (userId == 0)
                throw new ArgumentOutOfRangeException(nameof(userId), "Must not be null");

            IQueryConstraints<UserSmsVerification> constraints = new QueryConstraints<UserSmsVerification>()
                .Where(v => v.UserId == userId)
                .AndAlso(v => v.UserVerificationReasonId == reason.UserVerificationReasonId);

            return queryRepository.Find(constraints).Items.FirstOrDefault();
        }

        public UserSmsVerification SendSmsVerification(User user, UserVerificationReason reason)
        {
            if (FindSmsVerification(user.Id, reason) != null)
                return ResendVerificationRequest(user.Id, reason);

            UserSmsVerification verificationRequest = new UserSmsVerification(user, reason, UserVerificationStatus.Sent);

            SendSms(verificationRequest.Code, user.Mobile);

            return Create(verificationRequest);
        }

        public UserSmsVerification SendSmsVerificationForApi(UserVerificationReason reason)
        {
            UserSmsVerification verificationRequest = new UserSmsVerification(reason, UserVerificationStatus.Sent);

            return Create(verificationRequest);
        }

        public UserSmsVerification ResendVerificationRequest(string mobile, Guid smsRefId)
        {
            IQueryConstraints<UserSmsVerification> constraints = new QueryConstraints<UserSmsVerification>()
                .Where(v => v.SMSRefId == smsRefId);

            UserSmsVerification verificationRequest = queryRepository.Find(constraints).Items.OrderBy(v => v.CreatedAt).LastOrDefault();
            if (verificationRequest == null)
                throw new BusinessRuleException(nameof(UserSmsVerification), "");

            verificationRequest.RenewIfNecessary();
            verificationRequest.IncrementResendCount();

            SendSms(verificationRequest.Code, mobile);

            return repository.Update(verificationRequest);
        }

        public UserSmsVerification ResendVerificationRequest(int userId, UserVerificationReason reason)
        {
            if (userId == 0)
                throw new ArgumentOutOfRangeException(nameof(userId), "must not be null");

            if (reason == null)
                throw new ArgumentOutOfRangeException(nameof(reason), "must not be null");

            IQueryConstraints<UserSmsVerification> constraints = new QueryConstraints<UserSmsVerification>()
                .Where(v => v.UserId == userId)
                .AndAlso(v => v.UserVerificationReasonId == reason.UserVerificationReasonId);

            UserSmsVerification verificationRequest = queryRepository.Find(constraints).Items.OrderBy(v => v.CreatedAt).LastOrDefault();
            if (verificationRequest == null)
                throw new BusinessRuleException(nameof(UserSmsVerification), "");

            verificationRequest.RenewIfNecessary();
            verificationRequest.IncrementResendCount();

            //Send the verification code to the user by SMS
            IQueryConstraints<User> userConstraints = new QueryConstraints<User>()
                .Where(u => u.Id == userId);
            User user = queryRepository.Single(userConstraints);

            SendSms(verificationRequest.Code, user.Mobile);

            return repository.Update(verificationRequest);
        }

        public void ThrowExceptionIfInvalidVerficationCode(int userId, string verficationCode, UserVerificationReason reason)
        {
            VerificationRequestResult result = CheckVerificationCode(userId, verficationCode, reason);
            if (!result.IsValid)
                throw new BusinessRuleException(result.Message);
        }


        public void ThrowExceptionIfInvalidVerficationCode(Guid smsRef, string verficationCode, UserVerificationReason reason)
        {
            VerificationRequestResult result = CheckVerificationCode(smsRef, verficationCode, reason);
            if (!result.IsValid)
                throw new BusinessRuleException(result.Message);
        }

        public VerificationRequestResult CheckVerificationCode(Guid smsRef, string verificationCode, UserVerificationReason reason)
        {
            VerificationRequestResult result = new VerificationRequestResult();

            if (string.IsNullOrWhiteSpace(verificationCode))
                throw new BusinessRuleException(nameof(UserSmsVerification), "");

            IQueryConstraints<UserSmsVerification> constraints = new QueryConstraints<UserSmsVerification>()
                .Where(v => v.SMSRefId == smsRef)
                .AndAlso(v => v.Code == verificationCode.Trim())
                .AndAlso(v => v.UserVerificationReasonId == reason.UserVerificationReasonId);

            UserSmsVerification verificationRequest = queryRepository.SingleOrDefault(constraints);
            if (verificationRequest == null)
            {
                result.IsValid = false;
                result.Message = "الرجاء التأكد من رمز التحقق المدخل";
            }
            else if (!verificationRequest.IsAlive)
            {
                result.IsValid = false;
                result.Message = "انتهى الوقت المخصص لهذا الرمز، الرجاء إعادة إرسال رمز التحقق وإدخاله فور وصوله";
            }
            else
            {
                result.IsValid = true;
                result.Message = "";
            }

            if (!result.IsValid)
            {
                constraints = new QueryConstraints<UserSmsVerification>()
                    .Where(v => v.SMSRefId == smsRef)
                    .AndAlso(v => v.UserVerificationReasonId == reason.UserVerificationReasonId);

                UserSmsVerification userVerificationRequest = queryRepository.Single(constraints);
                result.ResendTimeout = userVerificationRequest.ResendTimeout;
            }

            return result;
        }

        public VerificationRequestResult CheckVerificationCode(int userId, string verificationCode, UserVerificationReason reason)
        {
            VerificationRequestResult result = new VerificationRequestResult();
            if (userId == 0)
                throw new ArgumentNullException(nameof(userId), "Must not be null");

            if (string.IsNullOrWhiteSpace(verificationCode))
                throw new BusinessRuleException(nameof(UserSmsVerification), "");

            IQueryConstraints<UserSmsVerification> constraints = new QueryConstraints<UserSmsVerification>()
                .Where(v => v.UserId == userId)
                .AndAlso(v => v.Code == verificationCode.Trim())
                .AndAlso(v => v.UserVerificationReasonId == reason.UserVerificationReasonId);

            UserSmsVerification verificationRequest = queryRepository.SingleOrDefault(constraints);
            if (verificationRequest == null)
            {
                result.IsValid = false;
                result.Message = "الرجاء التأكد من رمز التحقق المدخل";
            }
            else if (!verificationRequest.IsAlive)
            {
                result.IsValid = false;
                result.Message = "انتهى الوقت المخصص لهذا الرمز، الرجاء إعادة إرسال رمز التحقق وإدخاله فور وصوله";
            }
            else
            {
                result.IsValid = true;
                result.Message = "";
            }

            if (!result.IsValid)
            {
                constraints = new QueryConstraints<UserSmsVerification>()
                    .Where(v => v.UserId == userId)
                    .AndAlso(v => v.UserVerificationReasonId == reason.UserVerificationReasonId);

                UserSmsVerification userVerificationRequest = queryRepository.Single(constraints);
                result.ResendTimeout = userVerificationRequest.ResendTimeout;
            }

            return result;
        }

        private void SendSms(string verificationCode, string mobile)
        {
            SendSMSRequest smsRequest = new SendSMSRequest
            {
                MobileNo = mobile,
                TemplateCode = "wathi00001",
                TemplateParams = new string[] { verificationCode },
                RefID = Guid.NewGuid().ToString(),
            };

            SMSEmailNotificationService.Obj.SendSMS(smsRequest);
        }
    }
}