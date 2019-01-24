using Swazer.ShoppingList.WebApp.Resources;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.Infrastructure
{
    public class PasswordRegex : RegularExpressionAttribute
    {
        public PasswordRegex() : base(@"^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,30}$")
        {

        }
    }
}