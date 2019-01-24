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

        public Item Update(Item entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

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

        //public IQueryResult<Item> Find(ItemSearchCriterias criterias)
        //{
        //    if (criterias == null)
        //        throw new ArgumentNullException(nameof(criterias));

        //    if (!HasPermission(RoleNames.AdminRole, RoleNames.ItemPermission))
        //        throw new PermissionException(RoleNames.AdminRole);

        //    IQueryConstraints<Item> constraints = new QueryConstraints<Item>()
        //        .PageAndSort(criterias, x => x.EnglishName)
        //        .AndAlsoIf(x => x.EnglishName.Contains(criterias.EnglishName), !string.IsNullOrEmpty(criterias.EnglishName))
        //        .AndAlsoIf(x => x.ArabicName.Contains(criterias.ArabicName), !string.IsNullOrEmpty(criterias.ArabicName))
        //        .AndAlsoIf(x => x.IsActive == criterias.IsActive, criterias.IsActive.HasValue);

        //    IQueryResult<Item> result = queryRepository.Find(constraints);

        //    Tracer.Log.EntitiesRetrieved(nameof(Item), result.Items.Count(), result.TotalCount);

        //    return result;
        //}

        public List<Item> FindAll()
        {
            IQueryConstraints<Item> constraints = new QueryConstraints<Item>();

            IQueryResult<Item> result = queryRepository.Find(constraints);

            return result.Items.ToList();
        }

        public void Delete(int id)
        {
            IQueryConstraints<Item> constraints = new QueryConstraints<Item>()
                .Where(x => x.ItemId == id);

            Item item = queryRepository.Find(constraints).Items.SingleOrDefault();

            repository.Delete(item);
        }
    }
}

