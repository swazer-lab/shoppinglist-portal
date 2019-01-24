using System;

namespace Swazer.ShoppingList.GraphDiff.Aggregates.Attributes
{
    /// <summary>Marks this property as owned by the parent type or by the chosen AggregateType</summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class OwnedAttribute : AggregateDefinitionAttribute
    {
    }
}
