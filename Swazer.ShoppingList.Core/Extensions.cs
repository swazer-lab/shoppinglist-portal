using System;

namespace Swazer.ShoppingList.Core
{
    public static class Extensions
    {
        public static T GetValue<T>(this System.Data.IDataReader reader, string column)
        {
            if (reader[column] == DBNull.Value)
                return default(T);

            Type t = typeof(T);
            Type u = Nullable.GetUnderlyingType(t);

            if (u != null)
                return (T)Convert.ChangeType(reader[column], u);

            return (T)Convert.ChangeType(reader[column], t);
        }
    }
}