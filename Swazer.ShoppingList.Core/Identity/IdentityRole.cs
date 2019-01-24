using Microsoft.AspNet.Identity;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Swazer.ShoppingList.Core
{
    /// <inheritdoc />
    /// <summary>
    /// Represents a Role entity
    /// </summary>
    public class IdentityRole : IRole<int>
    {
        public IdentityRole()
        {
            Claims = new List<IdentityRoleClaim>();
        }

        /// <summary>
        ///     Constructor
        /// </summary>
        /// <param name="roleName"></param>
        public IdentityRole(string roleName)
            : this()
        {
            Name = roleName;
        }

        /// <summary>
        /// Navigation property for users in the role
        /// </summary>
        public virtual ICollection<IdentityUser> Users { get; private set; }

        /// <summary>
        /// Navigation property for claims in the role
        /// </summary>
        public virtual ICollection<IdentityRoleClaim> Claims { get; private set; }

        /// <summary>
        /// Role name
        /// </summary>
        public virtual string Name { get; set; }
        public virtual string ArabicName { get; set; }
        public virtual string EnglishName { get; set; }
        public string LocalizedName => System.Threading.Thread.CurrentThread.IsArabic() ? ArabicName : EnglishName;

        /// <summary>
        /// A random value that should change whenever a role is persisted to the store
        /// </summary>
        public virtual byte[] ConcurrencyStamp { get; set; }

        public virtual int Id { get; private set; }

        public IdentityRole SetNames(string roles, string arabicName, string englishName)
        {
            this.Name = roles;
            this.ArabicName = arabicName;
            this.EnglishName = englishName;

            return this;
        }
    }
}
