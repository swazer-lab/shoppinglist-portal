using Swazer.ShoppingList.Core;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.Models
{
    public class UserProfileViewModel
    {
        public int UserId { get; set; }

        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; }

        public string Email { get; set; }

        public string Mobile { get; set; }

        public string Photo { get; set; }
    }
}