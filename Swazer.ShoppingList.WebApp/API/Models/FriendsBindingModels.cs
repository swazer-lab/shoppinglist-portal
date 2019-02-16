using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Swazer.ShoppingList.WebApp.API.Models
{
    public class FriendSearchCriteriaBindingModel : SearchCriteriaBindingModel
    {

    }

    public class UserSearchCriteriaBindingModel : SearchCriteriaBindingModel
    {
        public string Name { get; set; }
    }

    public class CreateFriendBindingModel
    {
        [Required(ErrorMessage = "Friend to be added has not been sent")]
        public int FriendId { get; set; }
    }

    public class BlockFriendBindingModel
    {
        [Required]
        public int UserId { get; set; }
    }
}