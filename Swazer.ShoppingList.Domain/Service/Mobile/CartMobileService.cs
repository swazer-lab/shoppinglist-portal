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
    public class CartMobileService : BaseDomainService
    {
        public static CartMobileService Obj { get; }

        static CartMobileService()
        {
            Obj = new CartMobileService();
        }

        private CartMobileService()
        {
        }

        public Cart Create(Cart entity, User user, List<CartItem> items)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            Cart createdEntity = null;

            using (IUnitOfWork uow = RepositoryFactory.CreateUnitOfWork())
            {
                createdEntity = repository.Create(entity);

                CartOwner cartOwner = CartOwner.Create(createdEntity, user);
                CartOwnerMobileService.Obj.Create(cartOwner);

                ItemMobileService.Obj.MultipleCreate(items, createdEntity.CartId);

                uow.Complete();
            }

            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(Cart), createdEntity.CartId);

            return createdEntity;
        }

        public Cart Update(Cart entity, List<CartItem> items, List<CartOwner> users)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            Cart uptadedEntity = null;

            using (IUnitOfWork uow = RepositoryFactory.CreateUnitOfWork())
            {
                uptadedEntity = repository.Update(entity);

                CartOwnerMobileService.Obj.UpdateCartUsers(users, uptadedEntity.CartId);

                ItemMobileService.Obj.MultipleCreate(items, uptadedEntity.CartId);

                uow.Complete();
            }

            Tracer.Log.EntityUpdated(nameof(Cart), entity.CartId);

            return uptadedEntity ?? entity;
        }

        public Cart GetById(int entityId)
        {
            IQueryConstraints<Cart> constraint = new QueryConstraints<Cart>()
                .Where(x => x.CartId == entityId);

            Cart founded = queryRepository.SingleOrDefault(constraint);
            if (founded == null)
                throw new BusinessRuleException(BusinessRuleExceptionType.NotFound);

            Tracer.Log.EntityRetrieved(nameof(Cart), founded.CartId);

            return founded;
        }

        public IQueryResult<Cart> Find(CartMobileSearchCriteria criterias)
        {
            if (criterias == null)
                throw new ArgumentNullException(nameof(criterias));

            List<CartOwner> carts = CartOwnerMobileService.Obj.GetCartsByUser(criterias.UserId);

            var cartIds = carts.Select(x => x.CartId).ToList();

            IQueryConstraints<Cart> constraints = new QueryConstraints<Cart>()
                .PageAndSort(criterias, x => x.CartId)
                .AndAlso(x => cartIds.Contains(x.CartId))
                .AndAlsoIf(x => x.Title.Contains(criterias.Title), !string.IsNullOrEmpty(criterias.Title));

            IQueryResult<Cart> result = queryRepository.Find(constraints);

            Tracer.Log.EntitiesRetrieved(nameof(Cart), result.Items.Count(), result.TotalCount);

            return result;
        }

        public List<Cart> Find(string title, int userId)
        {
            List<CartOwner> carts = CartOwnerMobileService.Obj.GetCartsByUser(userId);

            var cartIds = carts.Select(x => x.CartId).ToList();

            IQueryConstraints<Cart> constraints = new QueryConstraints<Cart>()
                .AndAlso(x => cartIds.Contains(x.CartId))
                .AndAlsoIf(x => x.Title.Contains(title), !string.IsNullOrEmpty(title));

            return queryRepository.Find(constraints).Items.Take(3).ToList();
        }

        public void Delete(int id)
        {
            IQueryConstraints<Cart> constraints = new QueryConstraints<Cart>()
                .Where(x => x.CartId == id);

            Cart Cart = queryRepository.Find(constraints).Items.SingleOrDefault();

            repository.Delete(Cart);
        }
    }
}
