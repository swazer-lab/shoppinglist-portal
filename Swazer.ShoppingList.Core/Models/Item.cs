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

        public bool IsActive { get; set; }

        public List<CartItem> CartItems { get; set; }

        public static Item Create(string title, User createdBy)
        {
            return new Item
            {
                Title = title,
                CreatedByID = createdBy.Id,
                CreatedBy = createdBy,
                IsActive = true
            };
        }

        public Item Update(string title, bool isActive)
        {
            this.Title = title;
            this.IsActive = isActive;

            return this;
        }

        public Item Activate()
        {
            this.IsActive = true;

            return this;
        }

        public Item Deactivate()
        {
            this.IsActive = false;

            return this;
        }
    }

    public enum ItemStatus
    {
        Active,
        Completed,
        Canceled
    }
}
