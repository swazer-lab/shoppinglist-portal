using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class ItemCardMobileService : BaseDomainService
    {
        public static ItemCardMobileService Obj { get; }

        static ItemCardMobileService()
        {
            Obj = new ItemCardMobileService();
        }

        private ItemCardMobileService()
        {
        }

        public CartItem Update(CartItem entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            CartItem uptadedEntity = repository.Update(entity);

            Tracer.Log.EntityUpdated(nameof(CartItem), entity.ItemId);

            return uptadedEntity ?? entity;
        }

        public void Create(List<CartItem> items, int cardId)
        {
            Delete(cardId);

            Cart cart = CartMobileService.Obj.GetById(cardId);

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


        public CartItem GetByCartIdAndItemId(int cartId, int itemId)
        {
            if (cartId == 0 || itemId == 0)
                throw new ArgumentNullException(nameof(cartId));

            IQueryConstraints<CartItem> constraint = new QueryConstraints<CartItem>()
                .AndAlso(x => x.ItemId == itemId)
                .AndAlso(x => x.CartId == cartId);

            CartItem founded = queryRepository.SingleOrDefault(constraint);
            if (founded == null)
                throw new BusinessRuleException(BusinessRuleExceptionType.NotFound);

            Tracer.Log.EntityRetrieved(nameof(CartItem), founded.ItemId);

            return founded;
        }
    }
}
