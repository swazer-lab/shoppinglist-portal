using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Swazer.ShoppingList.Domain
{
    public class ResetPasswordInformationService : BaseDomainService
    {
        public static ResetPasswordInformationService Obj { get; }

        static ResetPasswordInformationService()
        {
            Obj = new ResetPasswordInformationService();
        }

        private ResetPasswordInformationService()
        {
        }

        public ResetPasswordConfirmationInfo Create(ResetPasswordConfirmationInfo entity)
        {
            ResetPasswordConfirmationInfo createdEntity = repository.Create(entity);
            if (createdEntity == null)
                throw new RepositoryException("Entity not created");

            Tracer.Log.EntityCreated(nameof(ResetPasswordConfirmationInfo), createdEntity.ResetPasswordConfirmationInfoId);

            return createdEntity;
        }

        public ResetPasswordConfirmationInfo GetConfirmationInfo(string email)
        {
            IQueryConstraints<ResetPasswordConfirmationInfo> constraints = new QueryConstraints<ResetPasswordConfirmationInfo>()
                .Where(x => x.Email == email);

            ResetPasswordConfirmationInfo result = queryRepository.Find(constraints).Items.ToList().LastOrDefault();

            return result;
        }
    }
}
