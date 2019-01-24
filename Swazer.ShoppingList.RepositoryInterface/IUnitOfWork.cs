using System;

namespace Swazer.ShoppingList.RepositoryInterface
{
    /// <summary>
    /// Represent a unit of work on the database over generic repositories.
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        /// <summary>
        /// Finish the transaction and persists all committed operation that already written to database by Commit method.
        /// </summary>
        void Complete();
    }
}
