using System;
using System.Configuration;

namespace Swazer.ShoppingList.Core
{
    /// <summary>
    /// Holds main reference to <see cref="ISettingsProvider"/> instance that will be used all over the application.
    /// </summary>
    public static class Settings
    {
        /// <summary>
        /// Gets <see cref="ISettingsProvider"/> object.
        /// </summary>
        public static ISettingsProvider Provider { get; set; }
    }
}