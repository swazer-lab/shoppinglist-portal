using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class CartOwnerMobileService : BaseDomainService
    {
        public static CartOwnerMobileService Obj { get; }

        static CartOwnerMobileService()
        {
            Obj = new CartOwnerMobileService();
        }

        private CartOwnerMobileService()
        {
        }

        public CartOwner Create(CartOwner entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            CartOwner createdEntity = repository.Create(entity);
            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(CartOwner), createdEntity.CartId);

            return createdEntity;
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

        public void DeleteCartUser(int cartId)
        {
            User currentUser = UserService.Obj.FindByName(Thread.CurrentPrincipal.Identity.Name);

            IQueryConstraints<CartOwner> constraints = new QueryConstraints<CartOwner>()
              .AndAlso(x => x.CartId == cartId)
              .AndAlso(x => x.UserId != currentUser.Id);

            List<CartOwner> users = queryRepository.Find(constraints).Items.ToList();

            foreach (var user in users)
            {
                repository.Delete(user);
            }
        }

        public void UpdateCartUsers(List<CartOwner> users, int cartId)
        {
            DeleteCartUser(cartId);

            foreach (var user in users)
            {
                repository.Create(user);
            }

        }
    }
}
