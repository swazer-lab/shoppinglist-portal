using System;
using System.Threading;

namespace Swazer.ShoppingList.Core
{
    public class BaseEntity : ValidatableEntity
    {
        public int CreatedByID { get; set; }

        public virtual int? UpdatedByID { get; set; }

        /// <summary>
        /// System creation date time of this entity, set by the system.
        /// </summary>
        public DateTime CreatedAt { get; protected set; }

        /// <summary>
        /// The user who create the entity, set by the system.
        /// </summary>
        public User CreatedBy { get; protected set; }

        /// <summary>
        /// System update date time of this entity, set by the system.
        /// </summary>
        public virtual DateTime? UpdatedAt { get; protected set; }

        /// <summary>
        /// The user who update the entity, set by the system.
        /// </summary>
        public virtual User UpdatedBy { get; protected set; }

        protected bool IsArabic => Thread.CurrentThread.IsArabic();
    }
}
