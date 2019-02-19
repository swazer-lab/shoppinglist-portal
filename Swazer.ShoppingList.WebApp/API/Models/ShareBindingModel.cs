using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class ShareBindingModel
    {
        public int CartId { get; set; }
        
        public AccessLevel AccessLevel { get; set; }

        public List<string> Emails { get; set; }
    }
}