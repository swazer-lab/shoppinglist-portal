using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class ItemMobileService : BaseDomainService
    {
        public static ItemMobileService Obj { get; }

        static ItemMobileService()
        {
            Obj = new ItemMobileService();
        }

        private ItemMobileService()
        {
        }

        public Item Create(Item entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            if (!entity.IsItemNameUnique())
                return GetByName(entity.Title);

            Item createdEntity = repository.Create(entity);
            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(Item), createdEntity.ItemId);

            return createdEntity;
        }

        public void MultipleCreate(List<CartItem> items, int cartId)
        {
            List<CartItem> itemList = new List<CartItem>();

            if (items != null)
            {
                foreach (var item in items)
                {
                    var createdItem = Create(item.Item);
                    itemList.Add(new CartItem() { Item = createdItem, Status = item.Status });
                }
            }

            ItemCardMobileService.Obj.Create(itemList, cartId);

        }

        public Item GetByName(string name)
        {
            IQueryConstraints<Item> constraint = new QueryConstraints<Item>()
                .Where(x => x.Title == name);

            Item founded = queryRepository.SingleOrDefault(constraint);
            if (founded == null)
                throw new BusinessRuleException(BusinessRuleExceptionType.NotFound);

            Tracer.Log.EntityRetrieved(nameof(Item), founded.ItemId);

            return founded;
        }

        public List<Item> GetItemsByCard(int cardId)
        {
            IQueryConstraints<CartItem> constraints = new QueryConstraints<CartItem>()
               .Where(x => x.CartId == cardId);

            List<int> itemIds = queryRepository.Find(constraints).Items.ToList().Select(x => x.ItemId).ToList();

            IQueryConstraints<Item> constraintsItems = new QueryConstraints<Item>()
               .IncludePath(x => x.CartItems)
               .Where(x => itemIds.Contains(x.ItemId));

            List<Item> items = queryRepository.Find(constraintsItems).Items.ToList();

            return items;
        }
    }
}

