using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class CartOwner : BaseEntity
    {
        public int CartOwnerId { get; set; }

        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        public int CartId { get; set; }

        [ForeignKey(nameof(CartId))]
        public Cart Cart { get; set; }

        public AccessLevel AccessLevel { get; set; }

        public static CartOwner Create(Cart cart, User owner)
        {
            return new CartOwner
            {
                Cart = cart,
                CartId = cart.CartId,
                User = owner,
                UserId = owner.Id
            };
        }
    }


    public enum AccessLevel
    {
        Owner,
        ReadWrite,
        Read
    }
}
