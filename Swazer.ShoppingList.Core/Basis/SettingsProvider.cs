using System.Configuration;

namespace Swazer.ShoppingList.Core
{
    public class SettingsProvider : ISettingsProvider
    {
        public string CacheProvider => ConfigurationManager.AppSettings["CacheProvider"];

        public string EmailAddress => ConfigurationManager.AppSettings["EmailAddress"];

        public string EmailPassword => ConfigurationManager.AppSettings["EmailPassword"];

        public string DbProvider => ConfigurationManager.AppSettings["DbProvider"];

        public string WebSvcProviderName => ConfigurationManager.AppSettings["WebSvcProvider"];

        public string RedisServerHost
        {
            get
            {
                string retVal = "localhost";

                if (string.IsNullOrEmpty(ConfigurationManager.AppSettings["Redis-Server:Host"]) == false)
                    retVal = ConfigurationManager.AppSettings["Redis-Server:Host"];

                return retVal;
            }
        }

        public string RedisServerPassword
        {
            get
            {
                string retVal = null;

                if (string.IsNullOrEmpty(ConfigurationManager.AppSettings["Redis-Server:Password"]) == false)
                    retVal = ConfigurationManager.AppSettings["Redis-Server:Password"];

                return retVal;
            }
        }

        public int RedisServerPort
        {
            get
            {
                int retVal = 6379;

                if (int.TryParse(ConfigurationManager.AppSettings["Redis-Server:Port"], out int result))
                    retVal = result;

                return retVal;
            }
        }

        public bool RedisServerSSL
        {
            get
            {
                bool retVal = false;

                if (bool.TryParse(ConfigurationManager.AppSettings["Redis-Server:SSL"], out bool result))
                    retVal = result;

                return retVal;
            }
        }

        public int SnackbarDangerMessageTimeout => 5000;

        public int SnackbarSuccessMessageTimeout => 3000;

        public int SnackbarInfoMessageTimeout => 4000;

        public int SnackbarWarningMessageTimeout => 4000;

        public int PageSize
        {
            get
            {
                // if the parse success, then the value of page size will updated, otherwise the value will still as the default.
                bool result = int.TryParse(ConfigurationManager.AppSettings["PageSize"], out int pagesize);
                return result ? pagesize : 10;
            }
        }

        public string Twitter_consumerKey => ConfigurationManager.AppSettings["Twitter_consumerKey"];

        public string Twitter_consumerSecret => ConfigurationManager.AppSettings["Twitter_consumerSecret"];

        public string Facebook_AppId => ConfigurationManager.AppSettings["Facebook_AppId"];

        public string Facebook_AppSecret => ConfigurationManager.AppSettings["Facebook_AppSecret"];

        public string Goggle_ClientId => ConfigurationManager.AppSettings["Goggle_ClientId"];

        public string Goggle_ClientSecret => ConfigurationManager.AppSettings["Goggle_ClientSecret"];

        public string GoogleStoreLink => ConfigurationManager.AppSettings["GoogleStoreLink"];

        public string AppleStoreLink => ConfigurationManager.AppSettings["AppleStoreLink"];
    }
}
