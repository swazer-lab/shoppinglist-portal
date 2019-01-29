using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class ItemService : BaseDomainService
    {
        public static ItemService Obj { get; }

        static ItemService()
        {
            Obj = new ItemService();
        }

        private ItemService()
        {
        }

        public Item Create(Item entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            Item createdEntity = repository.Create(entity);
            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(Item), createdEntity.ItemId);

            return createdEntity;
        }

        public Item Update(Item entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            repository.Update(entity);

            Item uptadedEntity = repository.Update(entity);

            Tracer.Log.EntityUpdated(nameof(Item), entity.ItemId);

            return uptadedEntity ?? entity;
        }

        public Item GetById(int entityId)
        {
            IQueryConstraints<Item> constraint = new QueryConstraints<Item>()
                .Where(x => x.ItemId == entityId);

            Item founded = queryRepository.SingleOrDefault(constraint);
            if (founded == null)
                throw new BusinessRuleException(BusinessRuleExceptionType.NotFound);

            Tracer.Log.EntityRetrieved(nameof(Item), founded.ItemId);

            return founded;
        }

        public IQueryResult<Item> Find(ItemSearchCriteria criterias)
        {
            if (criterias == null)
                throw new ArgumentNullException(nameof(criterias));

            IQueryConstraints<Item> constraints = new QueryConstraints<Item>()
                .PageAndSort(criterias, x => x.ItemId);

            IQueryResult<Item> result = queryRepository.Find(constraints);

            Tracer.Log.EntitiesRetrieved(nameof(Item), result.Items.Count(), result.TotalCount);

            return result;
        }

        public void Delete(int itemId)
        {
            Item entity = GetById(itemId);

            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            bool isSuccessed = repository.Delete(entity);
            if (!isSuccessed)
                throw new RepositoryException("Fail deleting entity");

            Tracer.Log.EntityDeleted(nameof(Item), entity.ItemId);
        }
    }
}
