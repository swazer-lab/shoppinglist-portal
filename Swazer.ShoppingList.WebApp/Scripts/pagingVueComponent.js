var m = {
    data: {
        PageSize: 10,
        CurrentPage: 1,
        TotalCount: 20,
        SortingDirection: 1,
        SortColumn: '',

        Asc: 0,
        Desc: 1,
        FirstPage: 1,
        maxPageCount: 7,
    },
    methods: {
        ToggleDirection: function () {
            if (this.SortingDirection === this.Asc)
                return this.SortingDirection = this.Desc;
            else if (SortingDirection() === Desc)
                return SortingDirection(Asc);
        },
        SortBy: function (columnName) {
            if (this.SortColumn === columnName)
                this.ToggleDirection();
            else
                this.SortColumn = columnName;
        },
        SetCurrentPage: function (page) {
            if (page < this.FirstPage)
                page = this.FirstPage;

            if (this.LastPage > 0 && page > this.LastPage)
                page = this.LastPage;

            this.CurrentPage = page;
        },
        GetPages: function () {
            var d = this.CurrentPage;
            var a = this.TotalCount;

            if (this.PageCount <= this.maxPageCount)
                return generateAllPages();
            else
                return generateMaxPage();
        }
    },
    computed: {
        IsAscending: function () {
            return (SortingDirection() === Asc);
        },
        IsDescending: function () {
            return (SortingDirection() === Desc);
        },
        PageCount: function () {
            if (PageSize() !== 0)
                return Math.ceil(this.TotalCount / this.PageSize);
            else
                return 0;
        },
        LastPage: function () {
            return PageCount;
        },
        NextPage: function () {
            var next = CurrentPage + 1;
            if (next > LastPage)
                return null;
            return next;
        },
        PreviousPage: function () {
            var previous = CurrentPage - 1;
            if (previous < FirstPage)
                return null;
            return previous;
        },
        NeedPaging: function () {
            return PageCount > 1;
        },
        NextPageActive: function () {
            return NextPage !== null;
        },
        PreviousPageActive: function () {
            return this.PreviousPage !== null;
        },
        LastPageActive: function () {
            return this.LastPage !== this.CurrentPage;
        },
        FirstPageActive: function () {
            return this.FirstPage !== this.CurrentPage;
        },
        generateAllPages: function () {
            var pages = [];
            for (var i = this.FirstPage; i <= this.LastPage; i++)
                pages.push(i);

            return pages;
        },
        generateMaxPage: function () {
            var current = this.CurrentPage;
            var pageCount = this.PageCount;
            var first = this.FirstPage;

            var upperLimit = current + parseInt((maxPageCount - 1) / 2);
            var downLimit = current - parseInt((maxPageCount - 1) / 2);

            while (upperLimit > pageCount) {
                upperLimit--;
                if (downLimit > first)
                    downLimit--;
            }

            while (downLimit < first) {
                downLimit++;
                if (upperLimit < pageCount)
                    upperLimit++;
            }

            var pages = [];
            for (var i = downLimit; i <= upperLimit; i++) 
                pages.push(i);
            
            return pages;
        },
        toSubmitModel: function () {
            return {
                CurrentPage: CurrentPage,
                SortingDirection: SortingDirection,
                SortColumn: SortColumn,
            };
        },
        updateSearchCriteria: function (e) {
            this.TotalCount = e.TotalCount;
            this.PageSize = e.PageSize;
            this.SetCurrentPage = e.SearchCriteriaModel.CurrentPage;
        },
        GoToPage: function (page) {
            if (page >= this.FirstPage && page <= this.LastPage)
                this.SetCurrentPage(page);
        },
        GoToFirst: function () {
            this.SetCurrentPage(this.FirstPage);
        },
        GoToPrevious: function () {
            var previous = this.PreviousPage;
            if (previous != null)
                SetCurrentPage(previous);
        },
        GoToNext: function () {
            var next = this.NextPage;
            if (next != null)
                SetCurrentPage(next);
        },
        GoToLast: function () {
            SetCurrentPage(this.LastPage);
        }
    }
}