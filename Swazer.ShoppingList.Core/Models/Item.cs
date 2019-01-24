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

        public string Title { get; set; }

        public ItemStatus Status { get; set; }

        public static Item Create(string title, ItemStatus itemStatus)
        {
            return new Item
            {
                Title = title,
                Status = itemStatus
            };
        }
    }

    public enum ItemStatus
    {
        Active,
        Completed, 
        Canceled
    }
}
