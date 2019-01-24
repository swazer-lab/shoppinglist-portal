namespace Swazer.ShoppingList.Core
{
    /// <summary>
    /// Represents all application specific settings that may be used though out all application layers.
    /// </summary>
    public interface ISettingsProvider
    {
        string GoogleStoreLink { get; }
        string AppleStoreLink { get; }

        string Twitter_consumerKey { get; }
        string Twitter_consumerSecret { get; }
        string Facebook_AppId { get; }
        string Facebook_AppSecret { get; }
        string Goggle_ClientId { get; }
        string Goggle_ClientSecret { get; }

        /// <summary>
        /// Gets Email Address which will be used to sending the emails to the clients.
        /// </summary>
        string EmailAddress { get; }

        /// <summary>
        /// Gets Email password which will for the Email Address which will be used to sending the emails to the clients.
        /// </summary>
        string EmailPassword { get; }

        /// <summary>
        /// Gets database specifics implementation for IRepository interfaces.
        /// </summary>
        string DbProvider { get; }

        /// <summary>
        /// Gets web-service specifics implementation for IRepository interfaces.
        /// </summary>
        string WebSvcProviderName { get; }

        /// <summary>
        /// Gets caching provider implementation assembly for ICachingProvider interface.
        /// </summary>
        string CacheProvider { get; }

        /// <summary>
        /// Gets redis server host name or ip address.
        /// </summary>
        string RedisServerHost { get; }

        /// <summary>
        /// Gets redis server host port.
        /// </summary>
        int RedisServerPort { get; }

        /// <summary>
        /// Gets redis server password.
        /// </summary>
        string RedisServerPassword { get; }

        /// <summary>
        /// Gets value determines whether SSL is used to connect redis server or not
        /// </summary>
        bool RedisServerSSL { get; }

        /// <summary>
        /// Gets Danger Snackbar Message life time timeout.
        /// </summary>
        int SnackbarDangerMessageTimeout { get; }

        /// <summary>
        /// Gets Success Snackbar Message life time timeout.
        /// </summary>
        int SnackbarSuccessMessageTimeout { get; }

        /// <summary>
        /// Gets Info Snackbar Message life time timeout.
        /// </summary>
        int SnackbarInfoMessageTimeout { get; }

        /// <summary>
        /// Gets Warning Snackbar Message life time timeout.
        /// </summary>
        int SnackbarWarningMessageTimeout { get; }

        /// <summary>
        /// Gets the count of the items in each page (For Paging)
        /// </summary>
        int PageSize { get; }
    }
}
