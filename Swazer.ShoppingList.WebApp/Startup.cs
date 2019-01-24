using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Swazer.ShoppingList.WebApp.Startup))]
namespace Swazer.ShoppingList.WebApp
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
