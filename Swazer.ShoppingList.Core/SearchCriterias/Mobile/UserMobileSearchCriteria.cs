using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class UserMobileSearchCriteria : SearchCriteria
    {
        public int UserId { get; set; }

        public string Name { get; set; }
    }
}
