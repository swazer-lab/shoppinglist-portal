using System;
using System.Transactions;
using Swazer.ShoppingList.RepositoryInterface;

namespace Swazer.ShoppingList.SqlServerRepository
{
    public class UnitOfWork : IUnitOfWork
    {
        private TransactionScope scope;

        public UnitOfWork()
        {
            scope = new TransactionScope();
        }

        #region IUnitOfWork Members

        public void Complete()
        {
            if (scope == null)
                throw new InvalidOperationException("Complete method need UnitOfWork that support MultiCommit.");

            scope.Complete();
        }

        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            if (scope != null)
            {
                scope.Dispose();
                scope = null;
            }
        }

        #endregion
    }
}
