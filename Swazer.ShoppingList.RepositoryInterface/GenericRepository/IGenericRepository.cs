﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Swazer.ShoppingList.Core;

namespace Swazer.ShoppingList.RepositoryInterface
{
    /// <summary>
    /// Provides generic API to Create, Update and Delete operation for Business Entity in the corresponding database tables.
    /// </summary>
    public interface IGenericRepository
    {
        /// <summary>
        /// Creates (insert) an entity of the Generic Parameter in the corresponding table in the database.
        /// </summary>
        /// <typeparam name="TBusinessEntity">An Entity type to insert the entity object in.</typeparam>
        /// <param name="entity">An entity object to be inserted in the table corresponding to Entity type.</param>
        /// <returns>New entity after insert it in the database.</returns>
        /// <exception cref="ValidationException">When trying to persists business entity that has invalid data.</exception>
        /// <exception cref="BusinessRuleException">When a constraints on database level is voilated due to current INSERT statement.</exception>
        /// <exception cref="RepositoryException">When an error on the database level is occurred and couldn't be recovered.</exception>
        TBusinessEntity Create<TBusinessEntity>(TBusinessEntity entity) where TBusinessEntity : class, new();

        /// <summary>
        /// Update an entity of Generic Parameter in the corresponding table in the database.
        /// </summary>
        /// <typeparam name="TBusinessEntity">An Entity type to insert the entity object in.</typeparam>
        /// <param name="entity">An entity object to be updated in the table corresponding to Entity type.</param>
        /// <returns>New entity object after update it in the database.</returns>
        /// <exception cref="ValidationException">When trying to persists business entity that has invalid data.</exception>
        /// <exception cref="BusinessRuleException">When a constraints on database level is voilated due to current UPDATE statement.</exception>
        /// <exception cref="RepositoryException">When an error on the database level is occurred and couldn't be recovered.</exception>
        TBusinessEntity Update<TBusinessEntity>(TBusinessEntity entity) where TBusinessEntity : class, new();

        /// <summary>
        /// Delete an entity of Generic Parameter from the corresponding table in the database.
        /// </summary>
        /// <typeparam name="TBusinessEntity">An Entity type to delete the entity object from.</typeparam>
        /// <param name="entity">An entity object to be deleted from the table corresponding to Entity type.</param>
        /// <returns>True, if object deleted successfully. False, otherwise.</returns>
        /// <exception cref="BusinessRuleException">When a constraints on database level is voilated due to current DELETE statement.</exception>
        /// <exception cref="RepositoryException">When an error on the database level is occurred and couldn't be recovered.</exception>
        bool Delete<TBusinessEntity>(TBusinessEntity entity) where TBusinessEntity : class, new();

        /// <summary>
        /// Delete entities of Generic Parameter from the corresponding table in the database.
        /// </summary>
        /// <typeparam name="TBusinessEntity">An Entity type to delete the entity object from.</typeparam>
        /// <param name="entities">An entities objects to be deleted from the table corresponding to Entity type.</param>
        /// <returns>True, if object deleted successfully. False, otherwise.</returns>
        /// <exception cref="BusinessRuleException">When a constraints on database level is voilated due to current DELETE statement.</exception>
        /// <exception cref="RepositoryException">When an error on the database level is occurred and couldn't be recovered.</exception>
        bool Delete<TBusinessEntity>(IEnumerable<TBusinessEntity> entities) where TBusinessEntity : class, new();
    }
}
