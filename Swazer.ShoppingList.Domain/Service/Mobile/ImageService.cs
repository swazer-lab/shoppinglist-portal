using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class ImageService : BaseDomainService
    {
        public static ImageService Obj { get; }

        static ImageService()
        {
            Obj = new ImageService();
        }

        private ImageService()
        {
        }

        public Image Create(Image entity)
        {
            Image createdEntity = repository.Create(entity);
            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(Image), createdEntity.ImageId);

            return createdEntity;
        }

        public Image Update(Image entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            if (!entity.Validate())
                throw new ValidationException(entity.ValidationResults);

            Image uptadedEntity = repository.Update(entity);

            Tracer.Log.EntityUpdated(nameof(Image), entity.ImageId);

            return uptadedEntity ?? entity;
        }

        public Image FindByUserId(int userId)
        {
            IQueryConstraints<Image> constraint = new QueryConstraints<Image>()
             .Where(x => x.UserId == userId);

            Image founded = queryRepository.SingleOrDefault(constraint);

            return founded;
        }

        public Image FindById(int photoId)
        {
            IQueryConstraints<Image> constraint = new QueryConstraints<Image>()
             .Where(x => x.ImageId == photoId);

            Image founded = queryRepository.SingleOrDefault(constraint);

            return founded;
        }

        public void Delete(Image entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            bool isSuccessed = repository.Delete(entity);
            if (!isSuccessed)
                throw new RepositoryException("Fail deleting entity");

            Tracer.Log.EntityDeleted(nameof(Image), entity.ImageId);
        }
    }
}
