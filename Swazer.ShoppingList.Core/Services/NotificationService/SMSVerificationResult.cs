namespace Swazer.ShoppingList.Core
{
    public enum VerificationRequestTypeEnum
    {
        Valid = 0,
        Expired = 1,
        FailureLimitExceeded = 2,
        Invalid = 3
    }

    public class VerificationRequestResult
    {
        public VerificationRequestTypeEnum VerificationRequestType { get; set; }
        public string Message { get; set; }
        public int ResendTimeout { get; set; }
        public int FailureTimeout { get; set; }
        public int RemainingTries { get; set; }
        public bool IsValid { get; set; }

        public VerificationRequestResult()
        {
            this.ResendTimeout = -1;
            this.FailureTimeout = -1;
        }
    }
}
