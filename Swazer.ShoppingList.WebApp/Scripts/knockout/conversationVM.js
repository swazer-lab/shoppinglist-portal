function ConversationSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        return self.Paging().toSubmitModel();
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function ConversationVM(id, conversationId, message, userType, conversationStatus) {
    var self = this;

    self.ConversationDetailId = ko.observable(id);
    self.ConversationId = ko.observable(conversationId);
    self.Message = ko.observable(message);
    self.UserType = ko.observable(userType);
    self.ConversationStatus = ko.observable(conversationStatus);

    self.copy = function () {
        return new ConversationVM(self.ConversationDetailId(), self.ConversationId(), self.Message(), self.UserType(), self.ConversationStatus());
    }

    self.toSubmitModel = function () {
        return {

        };
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {

        return true;
    }
}

function ConversationMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.ConversationStatuses = ko.observableArray(options.conversationStatuses);

    self.SearchConversationStatuses = function (conversationStatusValue) {
        return ko.utils.arrayFirst(self.ConversationStatuses(), function (conversationStatus) {
            return conversationStatus.value === conversationStatusValue;
        });
    };

    self.UserTypes = ko.observableArray(options.userTypes);

    self.SearchUserTypes = function (userTypeValue) {
        return ko.utils.arrayFirst(self.UserTypes(), function (userType) {
            return userType.value === userTypeValue;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var conversationStatus = self.SearchConversationStatuses(item.ConversationStatus);
            var userType = self.SearchUserTypes(item.UserType);
            return new ConversationVM(item.ConversationDetailId, item.ConversationId, item.Message, userType, conversationStatus);
        });
    };

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Conversations = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Conversations().length === 0);
    });

    self.IsCreateOrEditMode = ko.pureComputed(function () {
        var mode = self.Mode();
        return (mode === self.CreateMode || mode === self.EditMode);
    });

    self.IsNoResultMode = ko.pureComputed(function () {
        return self.Mode() === self.NoResultMode;
    });

    self.IsDisplayMode = ko.pureComputed(function () {
        return !self.IsCreateOrEditMode() && !self.IsNoResultMode();
    });

    self.CreateNewElement = function () {
        return new ConversationVM(0, '', undefined, undefined);
    };

    self.EnterEditMode = function () {
        self.PanelTitle(self.EditModePanelTitle);
        self.Mode(self.EditMode);
        self.EditedElement(self.SelectedElement().copy());
    };

    self.EnterCreateMode = function () {
        self.PanelTitle(self.CreateModePanelTitle);
        self.Mode(self.CreateMode);
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

        return ko.utils.arrayFirst(self.Conversations(), function (element) {
            return element.ConversationId() === self.SelectedElement().ConversationId();
        });
    };

    self.GetSelectedElementOrFirstOrNew = function () {
        var newEl = self.CreateNewElement();
        self.EditedElement(newEl);

        var founded = self.FindSelectedElement();
        if (founded) {
            self.EnterDetailsMode();
            return founded;
        }

        if (self.IsItemsEmpty() === false) {
            self.EnterDetailsMode();
            return self.Conversations()[0];
        }

        self.EnterNoResultMode();
        return newEl;
    };

    self.PressCreate = function () {
        self.EnterCreateMode();
        var newEl = self.CreateNewElement();
        self.EditedElement(newEl);
        self.SelectedElement(newEl);
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
        if (self.Mode() === self.CreateMode)
            return self.CreateUrl;
        else if (self.Mode() === self.EditMode)
            return self.EditUrl;
        else
            return '';
    };

    self.Cancel = function () {
        if (self.Mode() === self.EditMode)
            self.EnterDetailsMode();
        else if (self.Mode() === self.CreateMode)
            self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
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
                if (self.Mode() === self.CreateMode)
                    self.HandleCreateSuccess(e);
                else
                    self.HandleSuccess(e);

                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });

        return false;
    };

    self.HandleCreateSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.Conversations(observableItems);

        var founded = self.SelectedTheNewCreatedElement(e);
        if (founded !== null) {
            self.SelectedElement(founded);
            self.EnterDetailsMode();
        }
        else
            self.SelectedElement(self.GetSelectedElementOrFirstOrNew());

        self.SearchCriteria().updateSearchCriteria(e);
        self.HideSpinning();
    };

    self.SelectedTheNewCreatedElement = function (e) {
        var selectedId = e.SelectedRowId;
        if (selectedId === undefined)
            return;

        return self.FindById(selectedId);
    }

    self.FindById = function (id) {
        return ko.utils.arrayFirst(self.Conversations(), function (temp) {
            return temp.ConversationId() === id;
        });
    }

    self.Delete = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.DeleteUrl,
            data: {
                id: self.SelectedElement().ConversationId(),
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
    };

    self.ChangeStatus = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.ChangeStatusUrl,
            data: {
                id: self.SelectedElement().ConversationId(),
                isActive: !self.SelectedElement().IsActive(),
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
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
        self.Conversations(observableItems);
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
    }

    self.Search();

    self.SelectedElement(self.GetSelectedElementOrFirstOrNew());
}