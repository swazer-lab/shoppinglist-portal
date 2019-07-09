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

        public DateTime? Date { get; set; }

        public bool IsActive { get; set; }

        public CartStatus Status { get; set; }

        public List<CartOwner> Owners { get; set; }

        public static Cart Create(string title, string notes, DateTime? date)
        {
            return new Cart
            {
                Title = title,
                Notes = notes,
                Date = date,
                CreatedAt = DateTime.Now,
                Status = CartStatus.NotArchived
            };
        }

        public Cart Update(string title, string notes, DateTime? date)
        {
            Title = title;
            Notes = notes;
            Date = date;
            CreatedAt = DateTime.Now;

            return this;
        }

        public Cart MakeArchived()
        {
            Status = CartStatus.Archived;

            return this;
        }

        public Cart RevokeArchived()
        {
            Status = CartStatus.NotArchived;

            return this;
        }
    }

    public enum CartStatus
    {
        NotArchived,
        Archived,
    }
}
