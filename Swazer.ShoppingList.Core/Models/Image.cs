using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Core
{
    public class Image : BaseEntity
    {
        public int ImageId { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [Required]
        public byte[] BlobContent { get; set; }

        public static Image Create(User user, byte[] content)
        {
            return new Image
            {
                User = user,
                UserId = user.Id,
                BlobContent = content
            };
        }
    }
}
