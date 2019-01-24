namespace Swazer.ShoppingList.Core
{
    /// <summary>
    /// Represent the base criteria parameters that are used in Searching methods.
    /// </summary>
    public abstract class SearchCriteria
    {
        /// <summary>
        /// The size of page that is intended to be retrieved.
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// The number of page to be retrieved.
        /// </summary>
        public int PageNumber { get; set; }

        /// <summary>
        /// The property name to sort with
        /// </summary>
        public string Sort { get; set; }

        /// <summary>
        /// The sort direction
        /// </summary>
        public SortOrderEnum SortDirection { get; set; }

        protected SearchCriteria()
        {
            PageSize = 10;
            PageNumber = 1;
        }
    }
}
