using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Swazer.ShoppingList.Core;
using Swazer.ShoppingList.RepositoryInterface.Queries;

namespace Swazer.ShoppingList.SqlServerRepository.Queries
{
    /// <summary>
    /// Extensions for <see cref="QueryConstraints"/>
    /// </summary>
    public static class QueryConstraintsExtensions
    {
        public static T ToSingleOrDefaultSearchResult<T>(this DbQuery<T> dbQuery, IQueryConstraints<T> constraints)
            where T : class
        {
            if (dbQuery == null)
                throw new ArgumentNullException(nameof(dbQuery));

            if (constraints == null)
                throw new ArgumentNullException(nameof(constraints));

            foreach (string item in constraints.IncludePaths)
                dbQuery = dbQuery.Include(item);

            IQueryable<T> query = dbQuery.AsNoTracking();

            if (constraints.Predicate != null)
                return query.SingleOrDefault(constraints.Predicate);

            return query.SingleOrDefault();
        }

        /// <summary>
        /// Apply the query information to a LINQ statement
        /// </summary>
        /// <typeparam name="T">Model type</typeparam>
        /// <param name="instance">constraints instance</param>
        /// <param name="dbQuery">LINQ queryable</param>
        /// <returns>Modified query</returns>
        public static IQueryable<T> ApplyTo<T>(this IQueryConstraints<T> instance, DbQuery<T> dbQuery) where T : class
        {
            if (instance == null)
                throw new ArgumentNullException(nameof(instance));

            if (dbQuery == null)
                throw new ArgumentNullException(nameof(dbQuery));

            foreach (string item in instance.IncludePaths)
            {
                dbQuery = dbQuery.Include(item);
            }

            IQueryable<T> query = dbQuery.AsNoTracking();

            if (instance.Predicate != null)
            {
                query = query.Where(instance.Predicate);
            }

            IOrderedQueryable<T> orderedQuery = null;

            for (int i = 0; i < instance.SortOrder.Count(); i++)
            {
                SortOrderEntry item = instance.SortOrder.ElementAt(i);
                if (i == 0)
                    orderedQuery = item.SortOrder == SortOrderEnum.Ascending
                        ? query.OrderBy(item.SortPropertyName)
                        : query.OrderByDescending(item.SortPropertyName);
                else
                    orderedQuery = item.SortOrder == SortOrderEnum.Ascending
                        ? orderedQuery.ThenBy(item.SortPropertyName)
                        : orderedQuery.ThenByDescending(item.SortPropertyName);
            }

            query = orderedQuery ?? query;

            if (instance.SortOrder.Any() && instance.PageNumber >= 1)
            {
                query = query.Skip(instance.StartRecord).Take(instance.PageSize);
            }

            return query;
        }

        public static DbQuery ApplyIncludedPath<T>(this DbQuery<T> dbQuery, IQueryConstraints<T> instance) where T : class
        {
            foreach (string item in instance.IncludePaths)
            {
                dbQuery = dbQuery.Include(item);
            }

            return dbQuery;
        }

        /// <summary>
        /// Execute LINQ query and fill a result.
        /// </summary>
        /// <typeparam name="T">Model type</typeparam>
        /// <param name="dbQuery">The dbQuery.</param>
        /// <param name="constraints">The constraints.</param>
        /// <returns>Search result</returns>
        public static IQueryResult<T> ToSearchResult<T>(this DbQuery<T> dbQuery, IQueryConstraints<T> constraints)
            where T : class
        {
            if (dbQuery == null)
                throw new ArgumentNullException(nameof(dbQuery));

            if (constraints == null)
                throw new ArgumentNullException(nameof(constraints));

            int totalCount = constraints.Predicate == null
                                ? dbQuery.Count()
                                : dbQuery.Count(constraints.Predicate);

            List<T> limitedQuery = constraints.ApplyTo(dbQuery).ToList();

            return new QueryResult<T>(limitedQuery, totalCount);
        }

        /// <summary>
        /// Execute LINQ query and fill a result.
        /// </summary>
        /// <typeparam name="TFrom">Database Model type</typeparam>
        /// <typeparam name="TTo">Query result item type</typeparam>
        /// <param name="dbQuery">The dbQuery.</param>
        /// <param name="constraints">The constraints.</param>
        /// <param name="converter">Method used to convert the result </param>
        /// <returns>Search result</returns>
        public static IQueryResult<TTo> ToSearchResult<TFrom, TTo>(this DbQuery<TFrom> dbQuery, IQueryConstraints<TFrom> constraints, Func<TFrom, TTo> converter)
            where TFrom : class
            where TTo : class
        {
            if (dbQuery == null)
                throw new ArgumentNullException(nameof(dbQuery));

            if (constraints == null)
                throw new ArgumentNullException(nameof(constraints));

            int totalCount = constraints.Predicate == null
                                ? dbQuery.Count()
                                : dbQuery.Count(constraints.Predicate);

            IQueryable<TFrom> limitedQuery = constraints.ApplyTo(dbQuery);

            return new QueryResult<TTo>(limitedQuery.Select(converter), totalCount);
        }

        /// <summary>
        /// Apply ordering to a LINQ query
        /// </summary>
        /// <typeparam name="T">Model type</typeparam>
        /// <param name="source">Linq query</param>
        /// <param name="propertyName">Property to sort by</param>
        /// <param name="values">DUNNO?</param>
        /// <returns>Ordered query</returns>
        public static IOrderedQueryable<T> OrderBy<T>(this IQueryable<T> source, string propertyName, params object[] values)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (propertyName == null)
                throw new ArgumentNullException(nameof(propertyName));

            Type type = typeof(T);
            PropertyInfo property = type.GetProperty(propertyName);
            ParameterExpression parameter = Expression.Parameter(type, "p");
            MemberExpression propertyAccess = Expression.MakeMemberAccess(parameter, property);
            LambdaExpression orderByExp = Expression.Lambda(propertyAccess, parameter);
            MethodCallExpression resultExp = Expression.Call(typeof(Queryable), "OrderBy", new[] { type, property.PropertyType }, source.Expression, Expression.Quote(orderByExp));

            return source.Provider.CreateQuery<T>(resultExp) as IOrderedQueryable<T>;
        }

        /// <summary>
        /// Apply ordering to a LINQ query
        /// </summary>
        /// <typeparam name="T">Model type</typeparam>
        /// <param name="source">Linq query</param>
        /// <param name="propertyName">Property to sort by</param>
        /// <param name="values">DUNNO?</param>
        /// <returns>Ordered query</returns>
        public static IOrderedQueryable<T> OrderByDescending<T>(this IQueryable<T> source, string propertyName, params object[] values)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (propertyName == null)
                throw new ArgumentNullException(nameof(propertyName));

            Type type = typeof(T);
            PropertyInfo property = type.GetProperty(propertyName);
            ParameterExpression parameter = Expression.Parameter(type, "p");
            MemberExpression propertyAccess = Expression.MakeMemberAccess(parameter, property);
            LambdaExpression orderByExp = Expression.Lambda(propertyAccess, parameter);
            MethodCallExpression resultExp = Expression.Call(typeof(Queryable), "OrderByDescending", new[] { type, property.PropertyType }, source.Expression, Expression.Quote(orderByExp));

            return source.Provider.CreateQuery<T>(resultExp) as IOrderedQueryable<T>;
        }

        public static IOrderedQueryable<T> ThenBy<T>(this IOrderedQueryable<T> source, string propertyName)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (string.IsNullOrEmpty(propertyName))
                throw new ArgumentNullException(nameof(propertyName));

            Type type = typeof(T);
            PropertyInfo property = type.GetProperty(propertyName);
            ParameterExpression parameter = Expression.Parameter(type, "p");
            MemberExpression propertyAccess = Expression.MakeMemberAccess(parameter, property);
            LambdaExpression thenByExp = Expression.Lambda(propertyAccess, parameter);
            MethodCallExpression resultExp = Expression.Call(typeof(Queryable), "ThenBy", new[] { type, property.PropertyType }, source.Expression, Expression.Quote(thenByExp));

            return source.Provider.CreateQuery<T>(resultExp) as IOrderedQueryable<T>;
        }

        public static IOrderedQueryable<T> ThenByDescending<T>(this IOrderedQueryable<T> source, string propertyName)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (string.IsNullOrEmpty(propertyName))
                throw new ArgumentNullException(nameof(propertyName));

            Type type = typeof(T);
            PropertyInfo property = type.GetProperty(propertyName);
            ParameterExpression parameter = Expression.Parameter(type, "p");
            MemberExpression propertyAccess = Expression.MakeMemberAccess(parameter, property);
            LambdaExpression thenByExp = Expression.Lambda(propertyAccess, parameter);
            MethodCallExpression resultExp = Expression.Call(typeof(Queryable), "ThenByDescending", new[] { type, property.PropertyType }, source.Expression, Expression.Quote(thenByExp));

            return source.Provider.CreateQuery<T>(resultExp) as IOrderedQueryable<T>;
        }
    }
}
