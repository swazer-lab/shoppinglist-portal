using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Collections.ObjectModel;
using Microsoft.AspNet.Identity;
using Swazer.ShoppingList.GraphDiff.Aggregates.Attributes;

namespace Swazer.ShoppingList.Core
{
    /// <summary>
    /// Represents the User information of the Notifier system.
    /// </summary>
    public class User : IdentityUser, IDataErrorInfo
    {
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<User, int> manager)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            ClaimsIdentity userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            // Add custom user claims here
            userIdentity.AddClaim(new Claim("Id", this.Id.ToString()));
            userIdentity.AddClaim(new Claim("Name", this.Name ?? ""));
            userIdentity.AddClaim(new Claim("Mobile", this.Mobile ?? ""));
            userIdentity.AddClaim(new Claim("Email", this.Email ?? ""));
            userIdentity.AddClaim(new Claim("UserName", this.UserName ?? ""));
            userIdentity.AddClaim(new Claim("IsActive", this.IsActive.ToString()));
            return userIdentity;
        }

        public bool IsActive { get; protected set; }

        [StringLength(250)]
        public string Name { get; protected set; }
   
        [Display(Name = "الجوال")]
        [StringLength(15)]
        //[RegularExpression(@"^05\d{8}$")]
        public string Mobile { get; protected set; }

        public DateTime? LastLoginTime { get; set; }

        public int? CreatedByID { get; set; }

        public int? UpdatedByID { get; set; }

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
        public DateTime? UpdatedAt { get; protected set; }

        /// <summary>
        /// The user who update the entity, set by the system.
        /// </summary>
        public User UpdatedBy { get; protected set; }

        #region Constructors
        public User()
        {
        }

        public User(int id)
                : this()
        {
            this.Id = id;
        }


        public User(string name, string mobile, string email)
                : this()
        {
            this.Name = name;
            this.Mobile = mobile;
            this.Email = email;
            this.UserName = email;
            
            this.CreatedAt = DateTime.Now;
            this.CreatedBy = Thread.CurrentPrincipal.Identity as User;
            this.CreatedByID = this.CreatedBy?.Id;
        }

        #endregion


        public User UpdateLastLoginTime()
        {
            this.LastLoginTime = DateTime.Now;
            return this;
        }

        public User UpdateRoles(List<IdentityRole> newRoles)
        {
            this.Roles = newRoles;
            return this;
        }

        public User Activate()
        {
            this.IsActive = true;

            this.UpdatedAt = DateTime.Now;
            this.UpdatedBy = Thread.CurrentPrincipal.Identity as User;
            this.UpdatedByID = this.UpdatedBy?.Id;

            return this;
        }

        public User Deactivate()
        {
            this.IsActive = false;

            this.UpdatedAt = DateTime.Now;
            this.UpdatedBy = Thread.CurrentPrincipal.Identity as User;
            this.UpdatedByID = this.UpdatedBy?.Id;

            return this;
        }

        public static readonly User SuperAdmin = new User("Administrator", "0555555555", "Admin@admin.com");

        #region IDataErrorInfo Members

        /// <summary>
        /// Determines if current business object has no validation issue or error.
        /// </summary>
        [NotMapped]
        public bool IsValid { get; private set; }

        /// <summary>
        /// Represents all the validation result of current business object.
        /// This property is influenced by Validate method call.
        /// </summary>
        [NotMapped]
        public ObservableCollection<ValidationResult> ValidationResults { get; private set; }

        /// <summary>
        /// Validates all properties of current business object.
        /// This method influence IsValid, and ValidationResults properties.
        /// </summary>
        public bool Validate()
        {
            ValidationResults = new ObservableCollection<ValidationResult>();

            return IsValid = Validator.TryValidateObject(this, new ValidationContext(this, null, null), ValidationResults, true);
        }

        /// <summary>
        /// Gets an error message indicating what is wrong with this object.
        /// Invoking this properties will influence IsValid, and ValidationResults properties.
        /// </summary>
        [NotMapped]
        public string Error
        {
            get
            {
                Validate();

                IEnumerable<char> result = from x in ValidationResults
                                           from y in x.ErrorMessage
                                           select y;

                return string.Join(Environment.NewLine, result);
            }
        }

        /// <summary>
        /// Gets the error message for the property with the given name.
        /// Invoking this indexer will influence IsValid, and ValidationResults properties.
        /// </summary>
        /// <param name="propertyName">The name of the property whose error message to get.</param>
        /// <returns>The error message for the property. The default is an empty string ("").</returns>
        public string this[string propertyName]
        {
            get
            {
                Validate();

                ValidationResult result = (from x in ValidationResults
                                           from y in x.MemberNames
                                           where y == propertyName
                                           select x).FirstOrDefault();

                return (result != null) ? result.ErrorMessage : string.Empty;
            }
        }

        #endregion

        public string GetLastPart()
        {
            if (Mobile.Length - 4 < 0)
                return "";
            return Mobile.Substring(Mobile.Length - 4);
        }
    }
}