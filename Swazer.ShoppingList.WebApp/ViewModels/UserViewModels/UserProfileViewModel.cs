using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.Models
{
    public class UserProfileViewModel
    {
        public string Name { get; set; }

        public string Email { get; set; }

        public string Mobile { get; set; }

        public AccessLevel AccessLevel { get; set; }
    }
}