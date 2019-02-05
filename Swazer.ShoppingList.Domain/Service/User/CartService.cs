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
    public class CartService : BaseDomainService
    {
        public static CartService Obj { get; }

        static CartService()
        {
            Obj = new CartService();
        }

        private CartService()
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
                Create(cartOwner);

                Service.User.ItemService.Obj.MultipleCreate(items, createdEntity.CartId);

                uow.Complete();
            }

            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(Cart), createdEntity.CartId);

            return createdEntity;
        }

        public Cart Update(Cart entity, List<CartItem> items)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            Cart uptadedEntity = null;

            using (IUnitOfWork uow = RepositoryFactory.CreateUnitOfWork())
            {
                uptadedEntity = repository.Update(entity);

                Service.User.ItemService.Obj.MultipleCreate(items, uptadedEntity.CartId);

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

        public IQueryResult<Cart> Find(CartSearchCriterias criterias)
        {
            if (criterias == null)
                throw new ArgumentNullException(nameof(criterias));

            List<CartOwner> carts = GetCartsByUser(criterias.UserId);

            var cartIds = carts.Select(x => x.CartId).ToList();

            IQueryConstraints<Cart> constraints = new QueryConstraints<Cart>()
                .PageAndSort(criterias, x => x.CartId)
                .AndAlso(x => cartIds.Contains(x.CartId));

            IQueryResult<Cart> result = queryRepository.Find(constraints);

            Tracer.Log.EntitiesRetrieved(nameof(Cart), result.Items.Count(), result.TotalCount);

            return result;
        }

        public void Delete(int id)
        {
            IQueryConstraints<Cart> constraints = new QueryConstraints<Cart>()
                .Where(x => x.CartId == id);

            Cart Cart = queryRepository.Find(constraints).Items.SingleOrDefault();

            repository.Delete(Cart);
        }

        public List<CartOwner> GetCartsByUser(int userId)
        {
            if (userId == 0)
                throw new ArgumentNullException(nameof(userId));

            IQueryConstraints<CartOwner> constraints = new QueryConstraints<CartOwner>()
               .Where(x => x.UserId == userId);

            List<CartOwner> items = queryRepository.Find(constraints).Items.ToList();

            return items;
        }

        public List<CartOwner> GetUsersByCart(int cartId)
        {
            if (cartId == 0)
                throw new ArgumentNullException(nameof(cartId));

            IQueryConstraints<CartOwner> constraints = new QueryConstraints<CartOwner>()
               .Where(x => x.CartId == cartId);

            List<CartOwner> items = queryRepository.Find(constraints).Items.ToList();

            return items;
        }


        public CartOwner GetCartUser(int cartId, int ownerId)
        {
            if (cartId == 0)
                throw new ArgumentNullException(nameof(cartId));

            if (ownerId == 0)
                throw new ArgumentNullException(nameof(ownerId));

            IQueryConstraints<CartOwner> constraints = new QueryConstraints<CartOwner>()
               .AndAlso(x => x.CartId == cartId)
               .AndAlso(x => x.UserId == ownerId);

            CartOwner founded = queryRepository.SingleOrDefault(constraints);

            return founded;
        }

        public CartOwner Create(CartOwner entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            CartOwner cartOwner = GetCartUser(entity.CartId, entity.UserId);

            if (cartOwner != null)
                if (cartOwner.AccessLevel == entity.AccessLevel)
                {
                    return cartOwner;
                }
                else
                {
                    cartOwner.UpdateAccessLevel(entity.AccessLevel);
                    Update(cartOwner);
                    return cartOwner;
                }

            CartOwner createdEntity = repository.Create(entity);

            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(CartOwner), createdEntity.CartId);

            return createdEntity;
        }

        public CartOwner Update(CartOwner entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            CartOwner uptadedEntity = repository.Update(entity);

            Tracer.Log.EntityUpdated(nameof(CartOwner), entity.CartOwnerId);

            return uptadedEntity ?? entity;
        }
    }
}
