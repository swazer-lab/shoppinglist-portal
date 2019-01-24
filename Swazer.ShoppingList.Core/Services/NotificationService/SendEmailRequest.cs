
namespace Swazer.ShoppingList.Core
{
    public class SendEmailRequest
    {
        public string Title { get; set; }
    
        public string Content { get; set; }

        public string EmailTo { get; set; }

        public string RefID { get; set; }
    }
}
