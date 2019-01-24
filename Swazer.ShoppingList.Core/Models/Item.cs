using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class Item : BaseEntity
    {
        public int ItemId { get; set; }

        public string Name { get; set; }

        public static Item Create(string name)
        {
            return new Item
            {
                Name = name
            };
        }
    }
}
