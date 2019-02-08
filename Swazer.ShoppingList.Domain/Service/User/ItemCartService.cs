using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain.Service.User
{
    public class ItemCartService : BaseDomainService
    {
        public static ItemCartService Obj { get; }

        static ItemCartService()
        {
            Obj = new ItemCartService();
        }

        private ItemCartService()
        {
        }

        public void Create(List<CartItem> items, int cardId)
        {
            Delete(cardId);

            Cart cart = CartService.Obj.GetById(cardId);

            foreach (var item in items)
            {
                CartItem cartItem = CartItem.Create(cart, item.Item, item.Status);

                var createdItem = repository.Create(cartItem);
            }
        }

        public void Delete(int cartId)
        {
            if (cartId == 0)
                throw new ArgumentNullException(nameof(cartId));

            IQueryConstraints<CartItem> constraints = new QueryConstraints<CartItem>()
               .Where(x => x.CartId == cartId);

            IEnumerable<CartItem> items = queryRepository.Find(constraints).Items;

            repository.Delete(items);
        }
    }
}
