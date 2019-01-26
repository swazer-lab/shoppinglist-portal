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

        public void MultipleCreate(List<Item> items, int cartId)
        {
            List<Item> itemList = new List<Item>();

            using (IUnitOfWork uow = RepositoryFactory.CreateUnitOfWork())
            {
                if (items != null)
                {
                    foreach (var item in items)
                    {
                        var createdItem = Create(item);
                        itemList.Add(createdItem);
                    }

                    ItemCardMobileService.Obj.Create(itemList, cartId);
                }

                uow.Complete();
            }
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

        public void Delete(int id)
        {
            IQueryConstraints<Item> constraints = new QueryConstraints<Item>()
                .Where(x => x.ItemId == id);

            Item item = queryRepository.Find(constraints).Items.SingleOrDefault();

            repository.Delete(item);
        }

        public List<Item> GetItemsByCard(int cardId)
        {
            IQueryConstraints<CartItem> constraints = new QueryConstraints<CartItem>()
               .Where(x => x.CartId == cardId);

            List<int> itemIds = queryRepository.Find(constraints).Items.ToList().Select(x=>x.ItemId).ToList();

            IQueryConstraints<Item> constraintsItems = new QueryConstraints<Item>()
               .Where(x => itemIds.Contains(x.ItemId));

            List<Item> items = queryRepository.Find(constraintsItems).Items.ToList();

            return items;
        }
    }
}

