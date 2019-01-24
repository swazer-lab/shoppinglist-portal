namespace Swazer.ShoppingList.Core
{
    public class EmailRequest
    {
        public string TemplateCode { get; set; }

        public string[] TemplateParams { get; set; }

        public string EmailTo { get; set; }

        public string RefID { get; set; }
    }
}
