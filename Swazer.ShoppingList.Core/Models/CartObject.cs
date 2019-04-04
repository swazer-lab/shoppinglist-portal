using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class CartObjectDB
    {
        public int? ItemId { get; set; }

        public string ItemTitle { get; set; }

        public int? ItemStatus { get; set; }

        public int CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime? Date { get; set; }

        public double CartIndex { get; set; }
    }

    public class CartItemObject
    {
        public int ItemId { get; set; }

        public string Title { get; set; }

        public ItemStatus Status { get; set; }
    }

    public class CartObject
    {
        public CartObject()
        {
            Items = new List<CartItemObject>();
        }

        public int CartId { get; set; }

        public string Title { get; set; }

        public string Notes { get; set; }

        public DateTime? Date { get; set; }

        public bool IsActive { get; set; }

        public double CartIndex { get; set; }

        public List<CartItemObject> Items { get; set; }
    }
}
