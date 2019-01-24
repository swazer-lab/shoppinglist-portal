using System;

namespace Swazer.ShoppingList.Core
{
    [Serializable]
    public class WebServiceException : Exception
    {
        //public ErrorCode ErrorCode { get; private set; }
        public WebServiceException() { }
        public WebServiceException(string message) : base(message) { }

        public WebServiceException(string message, Exception inner) : base(message, inner) { }

        protected WebServiceException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context)
            : base(info, context) { }
    }
}