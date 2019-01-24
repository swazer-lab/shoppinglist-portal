using Swazer.ShoppingList.Core;
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

        public Cart Create(Cart entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            Cart createdEntity = repository.Create(entity);
            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(Cart), createdEntity.CartId);

            return createdEntity;
        }

        public Cart Update(Cart entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            Cart uptadedEntity = repository.Update(entity);

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

        public List<Cart> FindAll()
        {
            IQueryConstraints<Cart> constraints = new QueryConstraints<Cart>();

            IQueryResult<Cart> result = queryRepository.Find(constraints);

            return result.Items.ToList();
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
