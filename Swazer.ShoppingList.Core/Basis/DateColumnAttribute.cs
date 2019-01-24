using System.ComponentModel.DataAnnotations.Schema;

namespace Swazer.ShoppingList.Core
{
    //https://stackoverflow.com/a/5660382
    public class DateColumnAttribute : ColumnAttribute
    {
        public DateColumnAttribute()
        {
            TypeName = "date";
        }
    }
}