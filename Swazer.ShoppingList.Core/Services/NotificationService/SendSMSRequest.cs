namespace Swazer.ShoppingList.Core
{
    public class SendSMSRequest
    {
        public string TemplateCode { get; set; }

        public string[] TemplateParams { get; set; }

        public string MobileNo { get; set; }

        public string RefID { get; set; }
    }
}
