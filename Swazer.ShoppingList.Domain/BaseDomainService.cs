using Swazer.ShoppingList.RepositoryInterface;
using Swazer.ShoppingList.Core;
using System.Threading;

namespace Swazer.ShoppingList.Domain
{
    public abstract class BaseDomainService
    {
        protected static IGenericRepository repository { get; }
        protected static IGenericQueryRepository queryRepository { get; }

        static BaseDomainService()
        {
            repository = RepositoryFactory.CreateRepository();
            queryRepository = RepositoryFactory.CreateQueryRepository();
        }

        protected bool HasPermission(params string[] roles)
        {
            return Thread.CurrentPrincipal.HasPermission(roles);
        }
    }
}