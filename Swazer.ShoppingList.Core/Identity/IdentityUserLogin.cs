﻿namespace Swazer.ShoppingList.Core
{
    /// <summary>
    /// Entity type for a user's login (i.e. facebook, google)
    /// </summary>
    public class IdentityUserLogin
    {
        /// <summary>
        ///     The login provider for the login (i.e. facebook, google)
        /// </summary>
        public virtual string LoginProvider { get; set; }

        /// <summary>
        ///     Key representing the login for the provider
        /// </summary>
        public virtual string ProviderKey { get; set; }

        /// <summary>
        ///     Display name for the login
        /// </summary>
        public virtual string ProviderDisplayName { get; set; }

        /// <summary>
        ///     User Id for the user who owns this login
        /// </summary>
        public virtual int UserId { get; set; }
    }
}
