using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace Swazer.ShoppingList.Core
{
    [Serializable]
    public class ValidationException : Exception
    {
        public IEnumerable<ValidationResult> ValidationResults { get; private set; }

        public ValidationException() { }

        public ValidationException(IEnumerable<ValidationResult> validationResults)
            : this("Entity is not valid", validationResults)
        {
        }

        public ValidationException(string message, IEnumerable<ValidationResult> validationResults)
            : this(message)
        {
            this.ValidationResults = validationResults;
        }

        public ValidationException(string message) : base(message) { }

        public ValidationException(string message, Exception inner) : base(message, inner) { }

        protected ValidationException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
            ValidationResults = (IEnumerable<ValidationResult>)info.GetValue(nameof(ValidationResults), typeof(IEnumerable<ValidationResult>));
        }

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            base.GetObjectData(info, context);

            // TODO: this will not working right now, because the ValidationResult class is not [Serializable]
            info.AddValue(nameof(ValidationResult), ValidationResults);
        }
    }
}
