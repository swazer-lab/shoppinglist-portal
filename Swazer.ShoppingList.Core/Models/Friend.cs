using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class Friend : BaseEntity
    {
        public int Id { get; set; }

        public int RequestedById { get; set; }

        [ForeignKey(nameof(RequestedById))]
        public User RequestedBy { get; set; }

        public int RequestedToId { get; set; }

        [ForeignKey(nameof(RequestedToId))]
        public User RequestedTo { get; set; }

        public DateTime RequestTime { get; set; }

        public FriendRequestFlag FriendRequestFlag { get; set; }

        public static Friend Create(User requestedBy, User requestedTo)
        {
            return new Friend
            {
                RequestedBy = requestedBy,
                RequestedById = requestedBy.Id,
                RequestedTo = requestedTo,
                RequestedToId = requestedTo.Id,
                FriendRequestFlag = FriendRequestFlag.Approved,
                RequestTime = DateTime.Now,
                CreatedAt = DateTime.Now
            };
        }

        public Friend Blocked()
        {
            this.FriendRequestFlag = FriendRequestFlag.Blocked;

            return this;
        }
    }

    public enum FriendRequestFlag
    {
        Approved,
        Blocked
    };
}
