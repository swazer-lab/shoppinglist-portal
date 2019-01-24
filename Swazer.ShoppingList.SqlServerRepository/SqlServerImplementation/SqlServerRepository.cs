using System;
using System.Collections.Generic;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.GraphDiff;
using Swazer.ShoppingList.RepositoryInterface;
using Swazer.ShoppingList.SqlServerRepository.Caching;

namespace Swazer.ShoppingList.SqlServerRepository
{
    public class SqlServerRepository : IGenericRepository
    {
        #region IGenericRepository Members

        /// <summary>
        /// Creates (insert) an entity of the Generic Parameter in the corresponding table in the database.
        /// </summary>
        /// <typeparam name="TBusinessEntity">An Entity type to insert the entity object in.</typeparam>
        /// <param name="entity">An entity object to be inserted in the table corresponding to Entity type.</param>
        /// <returns>New entity after insert it in the database.</returns>
        /// <exception cref="BusinessRuleException">When a constraints on database level is voilated due to current INSERT statement.</exception>
        /// <exception cref="RepositoryException">When an error on the database level is occurred and couldn't be recovered.</exception>
        public virtual TBusinessEntity Create<TBusinessEntity>(TBusinessEntity entity)
            where TBusinessEntity : class, new()
        {
            try
            {
                using (ShoppingListContext context = new ShoppingListContext())
                {
                    TBusinessEntity updatedEntity = context.UpdateGraph(entity);

                    int erc = context.SaveChanges();

                    var result = erc > 0 ? updatedEntity : null;

                    if (result != null)
                    {
                        // update the generation
                        Cache.NextGeneration<TBusinessEntity>();
                    }

                    return result;
                }
            }
            catch (Exception ex)
            {
                throw ThrowHelper.ReThrow<TBusinessEntity>(ex);
            }
        }

        /// <summary>
        /// Update an entity of Generic Parameter in the corresponding table in the database.
        /// </summary>
        /// <typeparam name="TBusinessEntity">An Entity type to insert the entity object in.</typeparam>
        /// <param name="entity">An entity object to be updated in the table corresponding to Entity type.</param>
        /// <returns>New entity object after update it in the database.</returns>
        /// <exception cref="BusinessRuleException">When a constraints on database level is voilated due to current UPDATE statement.</exception>
        /// <exception cref="RepositoryException">When an error on the database level is occurred and couldn't be recovered.</exception>
        public virtual TBusinessEntity Update<TBusinessEntity>(TBusinessEntity entity)
            where TBusinessEntity : class, new()
        {
            try
            {
                using (ShoppingListContext context = new ShoppingListContext())
                {
                    TBusinessEntity updatedEntity = context.UpdateGraph<TBusinessEntity>(entity);

                    int erc = context.SaveChanges();

                    var result = erc > 0 ? updatedEntity : null;

                    if (result != null)
                    {
                        // update the generation
                        Cache.NextGeneration<TBusinessEntity>();
                    }

                    return result;
                }
            }
            catch (Exception ex)
            {
                throw ThrowHelper.ReThrow<TBusinessEntity>(ex);
            }
        }

        /// <summary>
        /// Delete an entity of Generic Parameter from the corresponding table in the database.
        /// </summary>
        /// <typeparam name="TBusinessEntity">An Entity type to delete the entity object from.</typeparam>
        /// <param name="entity">An entity object to be deleted from the table corresponding to Entity type.</param>
        /// <returns>True, if object deleted successfully. False, otherwise.</returns>
        /// <exception cref="BusinessRuleException">When a constraints on database level is voilated due to current DELETE statement.</exception>
        /// <exception cref="RepositoryException">When an error on the database level is occurred and couldn't be recovered.</exception>
        public virtual bool Delete<TBusinessEntity>(TBusinessEntity entity)
            where TBusinessEntity : class, new()
        {
            try
            {
                using (ShoppingListContext context = new ShoppingListContext())
                {
                    context.Set<TBusinessEntity>().Attach(entity);
                    context.Set<TBusinessEntity>().Remove(entity);

                    int erc = context.SaveChanges();

                    var result = erc > 0;

                    if (result == true)
                    {
                        // update the generation
                        Cache.NextGeneration<TBusinessEntity>();
                    }

                    return result;
                }
            }
            catch (Exception ex)
            {
                throw ThrowHelper.ReThrow<TBusinessEntity>(ex);
            }
        }

        /// <summary>
        /// Delete entities of Generic Parameter from the corresponding table in the database.
        /// </summary>
        /// <typeparam name="TBusinessEntity">An Entity type to delete the entity object from.</typeparam>
        /// <param name="entities">An entities objects to be deleted from the table corresponding to Entity type.</param>
        /// <returns>True, if object deleted successfully. False, otherwise.</returns>
        /// <exception cref="BusinessRuleException">When a constraints on database level is voilated due to current DELETE statement.</exception>
        /// <exception cref="RepositoryException">When an error on the database level is occurred and couldn't be recovered.</exception>
        public bool Delete<TBusinessEntity>(IEnumerable<TBusinessEntity> entities)
            where TBusinessEntity : class, new()
        {
            try
            {
                using (ShoppingListContext context = new ShoppingListContext())
                {
                    foreach (TBusinessEntity item in entities)
                    {
                        var i = context.UpdateGraph(item);
                        context.Set<TBusinessEntity>().Attach(i);
                        context.Set<TBusinessEntity>().Remove(i);
                    }

                    int erc = context.SaveChanges();

                    var result = erc > 0;

                    if (result == true)
                    {
                        // update the generation
                        Cache.NextGeneration<TBusinessEntity>();
                    }

                    return result;
                }
            }
            catch (Exception ex)
            {
                throw ThrowHelper.ReThrow<TBusinessEntity>(ex);
            }
        }

        #endregion
    }
}
