﻿using System;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace Swazer.ShoppingList.Core
{
    /// <summary>
    /// Represents errors that occurs during Business Rules checking.
    /// </summary>
    [Serializable]
    public class BusinessRuleException : Exception
    {
        public BusinessRuleExceptionType Type { get; private set; }

        /// <summary>
        /// Gets the Business Rule which is not satisfied.
        /// </summary>
        public string RuleName { get; private set; }

        /// <summary>
        /// Gets Business Entity name that violated <see cref="RuleName"/>.
        /// </summary>
        public string EntityName { get; private set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleException"/> class.
        /// </summary>
        public BusinessRuleException() { }

        public BusinessRuleException(string message) : base(message) { }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleException"/> class with specified business rule name and business entity name.
        /// </summary>
        /// <param name="ruleName">business rule name which is not satisfied.</param>
        /// <param name="entityName">business entity name that violated the business rule.</param>
        public BusinessRuleException(string ruleName, string entityName)
            : base($"The {ruleName} business rule is not satisfied in {entityName} business entity.")
        {
            this.RuleName = ruleName;
            this.EntityName = entityName;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleException"/> class with specified custom error message, business rule name, and business entity name.
        /// </summary>
        /// <param name="message">custom message that describes the error.</param>
        /// <param name="ruleName">business rule name which is not satisfied.</param>
        /// <param name="entityName">business entity name that violated the business rule.</param>
        public BusinessRuleException(string message, string ruleName, string entityName)
            : base(message)
        {
            this.RuleName = ruleName;
            this.EntityName = entityName;
        }

        public BusinessRuleException(string entityName, BusinessRule businessRule, [CallerMemberName] string businessOperation = "")
            : base(businessRule.LocalizedMessage)
        {
            RuleName = businessOperation + businessRule.RuleName;
            EntityName = entityName;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleException"/> class with specified custom error message, business rule name, business entity name, and a reference to the inner exception that is the cause of this exception.
        /// </summary>
        /// <param name="message">custom message that describes the error.</param>
        /// <param name="ruleName">business rule name which is not satisfied.</param>
        /// <param name="entityName">business entity name that violated the business rule.</param>
        /// <param name="inner">The exception that is the cause of the current exception, or a null reference if no inner exception is specified.</param>
        public BusinessRuleException(string message, string ruleName, string entityName, Exception inner)
            : base(message, inner)
        {
            this.RuleName = ruleName;
            this.EntityName = entityName;
        }

        public BusinessRuleException(BusinessRuleExceptionType type)
            : base(message : type == BusinessRuleExceptionType.NotFound ? CoreStrings.NotFound : "General Business Exception")
        {
            this.Type = type;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleException"/> class with serialized data.
        /// </summary>
        /// <param name="info">The <see cref="SerializationInfo"/> that holds the serialized object data about the exception being thrown.</param>
        /// <param name="context">The <see cref="StreamingContext"/> that contains contextual information about the source or destination.</param>
        protected BusinessRuleException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
            RuleName = info.GetString(nameof(RuleName));
            EntityName = info.GetString(nameof(EntityName));
            Type = (BusinessRuleExceptionType)info.GetInt32(nameof(Type));
        }

        public override void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            base.GetObjectData(info, context);
            info.AddValue(nameof(RuleName), RuleName);
            info.AddValue(nameof(EntityName), EntityName);
            info.AddValue(nameof(Type), Type);
        }
    }

    [Serializable]
    public enum BusinessRuleExceptionType
    {
        General,
        NotFound,
    }
}
