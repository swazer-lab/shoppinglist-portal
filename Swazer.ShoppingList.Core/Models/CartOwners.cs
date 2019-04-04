using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

        public double CartIndex { get; set; }

        public static CartOwner Create(Cart cart, User owner, AccessLevel accessLevel = 0)
        {
            return new CartOwner
            {
                Cart = cart,
                CartId = cart.CartId,
                User = owner,
                UserId = owner.Id,
                AccessLevel = accessLevel
            };
        }

        public CartOwner UpdateAccessLevel(AccessLevel accessLevel)
        {
            this.AccessLevel = accessLevel;

            return this;
        }

        public CartOwner SetCartIndex(double index)
        {
            this.CartIndex = index;

            return this;
        }
    }

    public enum AccessLevel
    {
        [Display(Name ="Owner")]
        Owner,

        [Display(Name = "ReadWrite")]
        ReadWrite,

        [Display(Name = "Read")]
        Read
    }
}
