using Swazer.ShoppingList.Core;
using System;
using System.Configuration;
using System.Reflection;

namespace Swazer.ShoppingList.RepositoryInterface
{
    /// <summary>
    /// Encapsulate <see cref="Factory"/> generic class and specialize instantiation of Repositories, and Providers.
    /// </summary>
    public class RepositoryFactory
    {
        /// <summary>
        /// Instantiate new instance of <see cref="ICachingProvider"/>.
        /// </summary>
        /// <returns>New Instance of <see cref="ICachingProvider"/>.</returns>
        public static ICachingProvider CreateCacheProvider()
        {
            if ("NoCachingProvider".Equals(Settings.Provider.CacheProvider))
                return new NoCachingProvider();

            if (Settings.Provider.CacheProvider.Contains("Redis"))
            {
                var args = new object[] {
                    Settings.Provider.RedisServerHost,
                    Settings.Provider.RedisServerPort,
                    Settings.Provider.RedisServerPassword,
                    Settings.Provider.RedisServerSSL
                };

                return Factory.CreateCacheProvider<ICachingProvider>("CachingProvider", args);
            }

            // In case of InMemory Caching not arguments required.
            return Factory.CreateCacheProvider<ICachingProvider>("CachingProvider");
        }

        /// <summary>
        /// Create new instance of <see cref="IGenericRepository"/> interface.
        /// </summary>
        /// <returns>New Instance of <see cref="IGenericRepository"/>.</returns>
        public static IGenericRepository CreateRepository()
        {
            if (Settings.Provider == null)
                throw new InvalidOperationException("Settings.Provider is not initialized, you have to invoke Initialize() method first.");

            return Factory.CreateDbRepository<IGenericRepository>("SqlServerRepository");
        }

        /// <summary>
        /// Create new instance of <see cref="IGenericQueryRepository"/> interface.
        /// </summary>
        /// <returns>New instance of <see cref="IGenericQueryRepository"/>.</returns>
        public static IGenericQueryRepository CreateQueryRepository()
        {
            if (Settings.Provider == null)
                throw new InvalidOperationException("Settings.Provider is not initialized, you have to invoke Initialize() method first.");

            return Factory.CreateDbRepository<IGenericQueryRepository>("SqlServerQueryRepository");
        }

        /// <summary>
        /// Create new instance of <see cref="IUnitOfWork"/> interface.
        /// </summary>
        /// <returns>New instance of <see cref="IUnitOfWork"/>.</returns>
        public static IUnitOfWork CreateUnitOfWork()
        {
            if (Settings.Provider == null)
                throw new InvalidOperationException("Settings.Provider is not initialized, you have to invoke Initialize() method first.");

            return Factory.CreateDbRepository<IUnitOfWork>("UnitOfWork");
        }

        public static ICartRepository CreateCartRepository()
        {
            if (Settings.Provider == null)
                throw new InvalidOperationException("Settings.Provider is not initialized, you have to invoke Initialize() method first.");

            return Factory.CreateDbRepository<ICartRepository>("CartRepository");
        }
    }
}
