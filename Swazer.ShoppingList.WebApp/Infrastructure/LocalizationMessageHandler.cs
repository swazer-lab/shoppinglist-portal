using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    //https://damienbod.com/2014/03/20/web-api-localization/
    public class LocalizationMessageHandler : DelegatingHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            SetCulture(request);
            return await base.SendAsync(request, cancellationToken);
        }

        private void SetCulture(HttpRequestMessage request)
        {
            StringWithQualityHeaderValue lang = request.Headers.AcceptLanguage.FirstOrDefault();
            if (lang != null)
                Thread.CurrentThread.CurrentUICulture = new CultureInfo(lang.Value);
        }
    }
}