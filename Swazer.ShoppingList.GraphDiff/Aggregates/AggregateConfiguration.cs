﻿using System;
using System.Linq.Expressions;
using Swazer.ShoppingList.GraphDiff.Internal;
using Swazer.ShoppingList.GraphDiff.Internal.Caching;
using Swazer.ShoppingList.GraphDiff.Internal.GraphBuilders;

namespace Swazer.ShoppingList.GraphDiff.Aggregates
{
    /// <summary>Allows creation of default mappings via a fluent interface</summary>
    public sealed class AggregateConfiguration
    {
        private static readonly AggregateConfiguration _aggregates = new AggregateConfiguration();

        public static AggregateConfiguration Aggregates
        {
            get { return _aggregates; }
        }

        private readonly IAggregateRegister _register;

        private AggregateConfiguration() 
        {
            _register = new AggregateRegister(new CacheProvider());
        }

        /// <summary>Clears all mappings from the register</summary>
        public AggregateConfiguration ClearAll()
        {
            _register.ClearAll();
            return this;
        }

        /// <summary>Add a default aggregate type mapping to the register</summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="mapping">Default aggregate mapping</param>
        public AggregateConfiguration Register<T>(Expression<Func<IUpdateConfiguration<T>, object>> mapping) where T : class
        {
            return Register(null, mapping);
        }

        /// <summary>Add a named aggregate type mapping to the register</summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="scheme">The name of the mapping scheme</param>
        /// <param name="mapping">Default aggregate mapping</param>
        public AggregateConfiguration Register<T>(string scheme, Expression<Func<IUpdateConfiguration<T>, object>> mapping) where T : class
        {
            var root = new ConfigurationGraphBuilder().BuildGraph(mapping);
            _register.Register<T>(root, scheme);
            return this;
        }
    }
}
