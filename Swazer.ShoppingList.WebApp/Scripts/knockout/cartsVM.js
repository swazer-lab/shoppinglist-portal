function CartSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));

    self.toSubmitModel = function () {
        return self.Paging().toSubmitModel();
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

function UserVM(name, email, mobile, accessLevel) {
    var self = this;

    self.Name = ko.observable(name);
    self.Email = ko.observable(email);
    self.Mobile = ko.observable(mobile);
    self.AccessLevel = ko.observable(accessLevel);
}

function ItemVM(id, title, completedStatus) {
    var self = this;

    self.ItemId = ko.observable(id);
    self.Title = ko.observable(title);
    self.IsCompletedStatus = ko.observable(completedStatus);

    self.copy = function () {
        return new ItemVM(self.ItemId(), self.Title(), self.IsCompletedStatus());
    };

    self.toSubmitModel = function () {
        var status = self.IsCompletedStatus() ? 1 : 0;
        return {
            ItemId: self.ItemId(),
            Title: self.Title(),
            Status: status
        };
    };
}

function CartVM(id, title, note, endDate, items, completedPercentage, accessLevel, users) {
    var self = this;

    self.CartId = ko.observable(id);
    self.Title = ko.observable(title).extend({ required: true });
    self.Note = ko.observable(note);
    self.AccessLevel = ko.observable(accessLevel);
    self.CompletedPercentage = ko.observable(completedPercentage);

    self.EndDateJs = ko.observable(endDate);
    
    self.EndDate = ko.pureComputed({
        read: function () {
            return moment(self.EndDateJs());
        },
        write: function (value) {
            var s = convertMomentToUnix(value);
            self.EndDateJs(s);
        }
    });

    self.EndDateDisplay = ko.pureComputed(function () {
        if (!self.EndDate())
            return '';
        return self.EndDate().format("M/D/YYYY");
    });

    self.ValidateOnlyWhenSubmit = ko.observable(false);
    self.Items = ko.observableArray(items).extend({ isThereEmptyItem: { onlyIf: self.ValidateOnlyWhenSubmit } });
    self.Users = ko.observableArray(users);

    self.IsItemsEmpty = ko.pureComputed(function () {
        return self.Items().length === 0;
    });

    self.IsUsersEmpty = ko.pureComputed(function () {
        return self.Users().length === 0;
    });

    self.IsAccessLevelRead = ko.pureComputed(function () {
        return self.AccessLevel() === 2;
    });

    self.IsAccessLevelOwner = ko.pureComputed(function () {
        return self.AccessLevel() === 0;
    });

    self.DeleteItem = function (item) {
        self.Items.remove(item);
    };

    self.CreateItemVM = function () {
        return new ItemVM(0, '', false);
    };

    self.NewItem = ko.observable(self.CreateItemVM());

    self.AddNewItem = function () {
        self.ValidateOnlyWhenSubmit(false);
        var item = self.NewItem();
        var createdItem = new ItemVM(item.ItemId(), item.Title(), item.IsCompletedStatus());

        self.Items.push(createdItem);
    };

    self.copy = function () {
        var items = [];

        ko.utils.arrayForEach(self.Items(), function (c) {
            items.push(c.copy());
        });

        return new CartVM(self.CartId(), self.Title(), self.Note(), self.EndDate(), items);
    };

    self.toSubmitModel = function () {
        var model = {
            CartId: self.CartId(),
            Title: self.Title(),
            Notes: self.Note(),
            Date: self.EndDate().format("MM/DD/YYYY"),
            Items: []
        };

        ko.utils.arrayForEach(self.Items(), function (item) {
            model.Items.push(item.toSubmitModel());
        });

        return model;
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    };

    self.FullValidation = function () {
        if (self.Title() === undefined || self.Title() === '')
            return false;

        var isThereEmptyItem = ko.utils.arrayFilter(self.Items(), function (item) {
            return (item.Title() === '' || item.Title() === undefined);
        }).length;

        if (!(isThereEmptyItem === 0)) {
            self.ValidateOnlyWhenSubmit(true);
            return false;
        }

        return true;
    };
}

function CartMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;
    self.GenerateShareUrl = options.generateShareUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.mapItems = function (collection) {

        var result = [];

        for (var i = 0; i < collection.length; i++) {
            var it = collection[i];

            var completedPercentage;

            if (it.Items.length !== 0) {
                var completedItemLength = ko.utils.arrayFilter(it.Items,
                    function (item) {
                        return item.Status === 1;
                    }).length;

                completedPercentage = ((completedItemLength / it.Items.length) * 100).toFixed(3);
            }

            var items = [];
            ko.utils.arrayForEach(it.Items, function (itemObj) {

                var isStatusComplete = itemObj.Status === 1;

                items.push(new ItemVM(itemObj.ItemId, itemObj.Title, isStatusComplete));
            });

            var users = [];
            ko.utils.arrayForEach(it.Users, function (userObj) {
                users.push(new UserVM(userObj.Name, userObj.Email, userObj.Mobile, userObj.DisplayAccessLevel));
            });
            
            var op = new CartVM(it.CartId, it.Title, it.Notes, it.Date, items, completedPercentage, it.AccessLevel, users);

            result.push(op);
        }

        return result;
    };

    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);

    // Access Levels
    self.AllAccessLevels = ko.observableArray(options.accessLevels);

    self.AccessLevelForUsers = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.AllAccessLevels(), function (accessLevel) {
            return accessLevel.value !== 0;
        });
    });

    self.SelectedAccessLevel = ko.observable();

    self.GeneratedUrl = ko.observable();

    self.CopyShareLink = function () {
        var copyText = document.getElementById("generatedUrl");

        copyText.select();
        document.execCommand("copy");
    };
    //

    self.Carts = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Carts().length === 0);
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
        return new CartVM(0, '', '', '');
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
    };

    self.FindSelectedElement = function () {
        if (!self.SelectedElement())
            return undefined;

        return ko.utils.arrayFirst(self.Carts(), function (element) {
            return element.CartId() === self.SelectedElement().CartId();
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
            return self.Carts()[0];
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

    self.GetSharingLink = function () {
        self.GenerateShare();
        $('#share-Modal').modal('show');
    };

    self.SelectRow = function (row) {
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
        if (self.Mode() === self.CreateMode)
            return self.CreateUrl;
        else if (self.Mode() === self.EditMode)
            return self.CreateUrl;
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
        self.Carts(observableItems);

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
    };

    self.FindById = function (id) {
        return ko.utils.arrayFirst(self.Carts(), function (temp) {
            return temp.CartId() === id;
        });
    };

    self.Delete = function () {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.DeleteUrl,
            data: {
                id: self.SelectedElement().CartId(),
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
                id: self.SelectedElement().CartId(),
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

    self.GenerateShare = function () {
        $.ajax({
            async: true,
            method: 'GET',
            dataType: "json",
            contentType: "application/json",
            url: self.GenerateShareUrl,
            data: { CartId: self.SelectedElement().CartId(), AccessLevel: self.SelectedAccessLevel().value },
            success: function (e) {
                self.GeneratedUrl(e);
            },
            error: self.HandleError
        });
    };

    self.HandleSuccess = function (e) {
        var observableItems = self.mapItems(e.Items);
        self.Carts(observableItems);
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

    self.accessLevelSubscription = self.SelectedAccessLevel.subscribe(function () {
        if (self.SelectedElement()) {
            self.GenerateShare();
        }
    });

    self.dispose = function () {
        disposeComputedProperties();
        self.currentPageSubscription.dispose();
    };

    self.Search();
}