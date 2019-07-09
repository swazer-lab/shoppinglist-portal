using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class CartObjectDB
    {
        // Item

        public int? ItemId { get; set; }

        public string ItemTitle { get; set; }

        public int? ItemStatus { get; set; }

        // Cart

        public int CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime? Date { get; set; }

        public double CartIndex { get; set; }

        public int CartStatus { get; set; }

        // User

        public int UserId { get; set; }

        public int? PhotoId { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public string Mobile { get; set; }

        public int AccessLevel { get; set; }

        public bool IsConfirmed { get; set; }
    }

    public class UserObject
    {
        public int UserId { get; set; }

        public int? PhotoId { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public string Mobile { get; set; }

        public AccessLevel AccessLevel { get; set; }

        public bool IsConfirmed { get; set; }
    }

    public class CartItemObject
    {
        public int? ItemId { get; set; }

        public string Title { get; set; }

        public ItemStatus? Status { get; set; }
    }

    public class CartObject
    {
        public CartObject()
        {
            Items = new List<CartItemObject>();
            Users = new List<UserObject>();
        }

        public int CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime? Date { get; set; }

        public bool IsActive { get; set; }

        public double CartIndex { get; set; }

        public List<CartItemObject> Items { get; set; }

        public List<UserObject> Users { get; set; }
    }
}
