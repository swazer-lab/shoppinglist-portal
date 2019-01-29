using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class CartItem : BaseEntity
    {
        public int CartItemId { get; set; }

        public int CartId { get; set; }

        [ForeignKey(nameof(CartId))]
        public Cart Cart { get; set; }

        public int ItemId { get; set; }

        [ForeignKey(nameof(ItemId))]
        public Item Item { get; set; }

        public ItemStatus Status { get; set; }

        public static CartItem Create(Cart cart, Item item, ItemStatus status)
        {
            return new CartItem
            {
                Cart = cart,
                CartId = cart.CartId,
                Item = item,
                ItemId = item.ItemId,
                Status = status
            };
        }
    }
}
