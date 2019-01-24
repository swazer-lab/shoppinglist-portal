function ContentListSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        return self.Paging().toSubmitModel();
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function ContentListVM(id, arabicName, englishName, arabicContent, englishContent, updatedAt, contentListType) {
    var self = this;

    self.ContentListId = ko.observable(id);
    self.ArabicName = ko.observable(arabicName).extend({ required: true });
    self.EnglishName = ko.observable(englishName).extend({ required: true });
    self.ArabicContent = ko.observable(arabicContent).extend({ required: true });
    self.EnglishContent = ko.observable(englishContent).extend({ required: true });
    self.UpdatedAt = ko.observable();
    if (updatedAt !== null)
        self.UpdatedAt(moment(updatedAt));

    self.ContentListType = ko.observable(contentListType);

    self.UpdatedAtDisplay = ko.pureComputed(function () {
        if (!self.UpdatedAt())
            return '';
        return self.UpdatedAt().format("M/D/YYYY");
    });

    self.copy = function () {
        return new ContentListVM(self.ContentListId(), self.ArabicName(), self.EnglishName(), self.ArabicContent(), self.EnglishContent(), self.UpdatedAt(), self.ContentListType());
    }

    self.toSubmitModel = function () {
        return {
            ContentListId: self.ContentListId(),

            ArabicName: self.ArabicName(),
            EnglishName: self.EnglishName(),
            ArabicContent: self.ArabicContent(),
            EnglishContent: self.EnglishContent(),
        };
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {
        if (self.ArabicName() === undefined || self.ArabicName() === '')
            return false;

        if (self.EnglishName() === undefined || self.EnglishName() === '')
            return false;

        if (self.ArabicContent() === undefined || self.ArabicContent() === '')
            return false;

        if (self.EnglishContent() === undefined || self.EnglishContent() === '')
            return false;

        return true;
    }
}

function ContentListMainVM(options) {
    var self = this;

    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;
    self.GetContentUrl = options.getContentUrl;

    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.ContentListTypes = ko.observableArray(options.contentListType);

    self.SearchContentListType = function (contentListTypeValue) {
        return ko.utils.arrayFirst(self.ContentListTypes(), function (contentListType) {
            return contentListType.value === contentListTypeValue;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var contentListType = self.SearchContentListType(item.ContentListType);
            return new ContentListVM(item.ContentListId, item.ArabicName, item.EnglishName, item.ArabicContent, item.EnglishContent, item.UpdatedAt, contentListType);
        });
    };

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.ContentList = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.ContentList().length === 0);
    });

    self.IsEditMode = ko.pureComputed(function () {
        return (self.Mode() === self.EditMode);
    });

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsEditMode() && !self.IsNoResultMode();
    });

    self.EnterEditMode = function () {
        self.PanelTitle(self.EditModePanelTitle);
        self.Mode(self.EditMode);
        self.EditedElement(self.SelectedElement().copy());
    };

    self.EnterDetailsMode = function () {
        self.PanelTitle(self.DisplayModePanelTitle);
        self.Mode(self.DisplayMode);
    };

    self.EnterNoResultMode = function () {
        self.Mode(self.NoResultMode);
    }

    self.FindSelectedElement = function () {
        if (!self.SelectedElement())
            return undefined;

        return ko.utils.arrayFirst(self.ContentList(), function (element) {
            return element.ContentListId() === self.SelectedElement().ContentListId();
        });
    };

    self.GetSelectedElementOrFirstOrNew = function () {

        var founded = self.FindSelectedElement();
        if (founded) {
            self.EnterDetailsMode();
            return founded;
        }

        if (self.IsItemsEmpty() === false) {
            self.EnterDetailsMode();
            return self.ContentList()[0];
        }

        self.EnterNoResultMode();
        return undefined;
    };

    self.SelectRow = function (row) {
        row.ArabicContent(undefined);
        row.EnglishContent(undefined);
        self.EnterDetailsMode();
        self.SelectedElement(row);
    };

    self.ShowSpinning = function () {
        self.Spinning(true);
    };

    self.HideSpinning = function () {
        self.Spinning(false);
    };

    self.onSearchCriteriaPress = function (d, e) {
        if (e.keyCode === 13)
            self.Search();
        return true;
    };

    self.GetUrl = function () {
        if (self.Mode() === self.EditMode)
            return self.EditUrl;
        else
            return '';
    };

    self.Cancel = function () {
        if (self.Mode() === self.EditMode)
            self.EnterDetailsMode();
    };

    self.Save = function (form) {
        if (self.Mode() === self.DisplayMode)
            return false;

        if (!self.EditedElement().FullValidation()) {
            self.EditedElement().ShowErrors();
            return false;
        }

        self.ShowSpinning();
        $.ajax({
            async: true,
            method: 'POST',
            url: self.GetUrl(),
            data: {
                viewModel: self.EditedElement().toSubmitModel(),
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });

        return false;
    };

    self.Search = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.SearchUrl,
            data: self.SearchCriteria().toSubmitModel(),
            success: function (e) {
                self.HandleSuccess(e);
            },
            error: self.HandleError
        });
    };

    self.HandleSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.ContentList(observableItems);
        self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.HandleError = function (message) {
        self.HideSpinning();
        ShowErrorMessage(message.responseJSON);

        handle401Error(message);
    };

    self.currentPageSubscription = self.SearchCriteria().Paging().CurrentPage.subscribe(function (newValue) {
        self.Search();
    });

    self.dispose = function () {
        disposeComputedProperties();
        self.currentPageSubscription.dispose();
        self.SelectedElementSubscription.dispose();
    }

    self.GetContent = function (lng, newSE) {
        var temp = newSE;

        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GetContentUrl,
            data:
            {
                contentType: lng,
                id: self.SelectedElement().ContentListId()
            },
            success: function (e) {
                if (lng === 0) {
                    if (temp.ContentListId() === self.SelectedElement().ContentListId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().ArabicContent(e);
                        self.SelectedElement().ArabicContent(e);
                    }
                }
                else if (lng === 1) {
                    if (temp.ContentListId() === self.SelectedElement().ContentListId()) {
                        if (self.Mode() === self.EditMode)
                            self.EditedElement().EnglishContent(e);
                        self.SelectedElement().EnglishContent(e);
                    }
                }
            },
            error: self.HandleError
        });
    }

    self.SelectedElementSubscription = self.SelectedElement.subscribe(function (newSE) {
        self.GetContent(0, newSE);
        self.GetContent(1, newSE);
    });

    self.Search();

}