using System;
using System.Collections.Generic;
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
}