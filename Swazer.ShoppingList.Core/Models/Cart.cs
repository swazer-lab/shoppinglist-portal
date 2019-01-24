using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class Cart : BaseEntity
    {
        public int CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }
    }

    public enum AccessLevel
    {
        Owner,
        ReadWrite,
        Read
    }
}
