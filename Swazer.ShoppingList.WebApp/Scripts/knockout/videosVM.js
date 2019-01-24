function VideoSearchCriteriaVM(options) {
    var self = this;

    self.Paging = ko.observable(new PagingVM(options));
    self.ArabicTitle = ko.observable();
    self.EnglishTitle = ko.observable();
    self.SelectedStatus = ko.observable();
    self.MedicalCenter = ko.observable();

    self.toSubmitModel = function () {
        var criteria = self.Paging().toSubmitModel();
        criteria.ArabicTitle = self.ArabicTitle();
        criteria.EnglishTitle = self.EnglishTitle();

        if (self.MedicalCenter())
            criteria.MedicalCenterId = self.MedicalCenter().MedicalCenterId;

        if (self.SelectedStatus())
            criteria.PublihsingStatus = self.SelectedStatus().value;

        return criteria;
    };

    self.updateSearchCriteria = function (e) {
        self.Paging().updateSearchCriteria(e);
    };
}

var baseVideoDownload = '';
function VideoVM(id, supportArabic, supportEnglish, arabicTitle, englishTitle, publishingStatus, medicalCenters, medicalCenterIds, arabicVideoUrl, englishVideoUrl, isActive) {
    var self = this;

    self.VideoId = ko.observable(id);
    self.IsMarked = ko.observable();
    self.IsActive = ko.observable(isActive);
    self.SupportArabic = ko.observable(supportArabic);
    self.SupportEnglish = ko.observable(supportEnglish);
    self.BothSupport = ko.observable({
        a: self.SupportArabic,
        b: self.SupportEnglish
    }).extend({ oneLangAtLeast: true });

    self.ArabicTitle = ko.observable(arabicTitle).extend({ required: true });
    self.EnglishTitle = ko.observable(englishTitle).extend({ required: true });
    self.PublishingStatus = ko.observable(publishingStatus).extend({ required: true });
    self.MedicalCenters = ko.observableArray(medicalCenters).extend({ required: true });
    self.ArabicVideoUrl = ko.observable(arabicVideoUrl).extend({ required: true, url: true });
    self.EnglishVideoUrl = ko.observable(englishVideoUrl).extend({ required: true, url: true });

    self.getYoutubeId = function (url_string) {
        var url = new URL(url_string);
        return url.searchParams.get("v");
    }

    self.getDailymotionId = function (url_string) {
        return url_string.split('/')[4];
    }

    self.webSiteName = function (url_string) {
        return new URL(url_string).host;
    }

    self.checkIfUrl = function (url) {
        try {
            new URL(url);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    self.determineEmbedUrl = function (url) {
        try {
            var host = self.webSiteName(url);

            if (host === "www.dailymotion.com")
                return `https://www.dailymotion.com/embed/video/` + self.getDailymotionId(url);
            else if (host === "www.youtube.com")
                return `https://www.youtube.com/embed/` + self.getYoutubeId(url);
        }
        catch (e) {
            String.empty;
        }
    }

    self.ComputedArabic = ko.pureComputed(function () {
        var url = self.ArabicVideoUrl();
        if (!url)
            return;

        return self.determineEmbedUrl(url);
    });

    self.ComputedEnglish = ko.pureComputed(function () {
        var url = self.EnglishVideoUrl();
        if (!url)
            return;

        return self.determineEmbedUrl(url);
    });

    self.MedicalCentersIds = ko.observableArray(medicalCenterIds).extend({ required: true });

    self.MedicalCentersNames = ko.pureComputed(function () {
        return ko.utils.arrayMap(self.MedicalCenters(), function (m) {
            return m.LocalizedName;
        }).join();
    });

    self.copy = function () {
        return new VideoVM(self.VideoId(), self.SupportArabic(), self.SupportEnglish(), self.ArabicTitle(), self.EnglishTitle(), self.PublishingStatus(), self.MedicalCenters(), self.MedicalCentersIds(), self.ArabicVideoUrl(), self.EnglishVideoUrl(), self.IsActive());
    }

    self.toSubmitModel = function () {
        var model = {
            VideoId: self.VideoId(),
            ArabicTitle: self.ArabicTitle(),
            EnglishTitle: self.EnglishTitle(),
            SupportArabic: self.SupportArabic(),
            SupportEnglish: self.SupportEnglish(),
            PublishingStatus: self.PublishingStatus().value,
            MedicalCenters: [],
            ArabicVideoUrl: self.ArabicVideoUrl(),
            EnglishVideoUrl: self.EnglishVideoUrl(),
        };

        ko.utils.arrayForEach(self.MedicalCentersIds(), function (id) {
            model.MedicalCenters.push(id);
        });

        return model;
    };

    self.ShowErrors = function () {
        var errors = ko.validation.group(self, { deep: true });
        if (errors().length !== 0) {
            return errors.showAllMessages();
        }
    }

    self.FullValidation = function () {

        if (self.SupportEnglish() === false && self.SupportArabic() === false) {
            return false;
        }

        if (self.SupportEnglish() === true) {
            if (self.EnglishTitle() === undefined || self.EnglishTitle() === '')
                return false;

            if (self.EnglishVideoUrl() === undefined || self.EnglishVideoUrl() === '')
                return false;

            if (self.checkIfUrl(self.EnglishVideoUrl()) === false)
                return false;
        }

        if (self.SupportArabic() === true) {
            if (self.ArabicTitle() === undefined || self.ArabicTitle() === '')
                return false;

            if (self.ArabicVideoUrl() === undefined || self.ArabicVideoUrl() === '')
                return false;

            if (self.checkIfUrl(self.ArabicVideoUrl()) === false)
                return false;
        }

        if (self.MedicalCentersIds().length === 0)
            return false;

        if (self.PublishingStatus() === undefined)
            return false;

        return true;
    }
}

function VideoMainVM(options) {
    var self = this;

    self.CreateUrl = options.createUrl;
    self.EditUrl = options.editUrl;
    self.DeleteUrl = options.deleteUrl;
    self.ChangeStatusUrl = options.changeStatusUrl;
    self.SearchUrl = options.searchUrl;
    baseVideoDownload = options.downloadUrl;

    self.CreateModePanelTitle = options.createModePanelTitle;
    self.EditModePanelTitle = options.editModePanelTitle;
    self.DisplayModePanelTitle = options.displayModePanelTitle;
    self.SavePageUrl = options.savePageUrl;

    self.CreateMode = 0;
    self.EditMode = 1;
    self.DisplayMode = 2;
    self.NoResultMode = 3;

    self.PublishingStatuses = ko.observableArray(options.publishingStatuses);
    self.MedicalCenters = ko.observableArray(options.medicalCenters);

    self.ActiveMedicalCenters = ko.pureComputed(function () {
        return ko.utils.arrayFilter(self.MedicalCenters(), function (e) {
            return e.IsActive === true;
        });
    });

    self.SearchPublishingStatus = function (publishingStatusValue) {
        return ko.utils.arrayFirst(self.PublishingStatuses(), function (publishingStatus) {
            return publishingStatus.value === publishingStatusValue;
        });
    };

    self.SearchMedicalCenters = function (mcId) {
        return ko.utils.arrayFirst(self.MedicalCenters(), function (mc) {
            return mc.MedicalCenterId === mcId;
        });
    };

    self.mapItems = function (collection) {
        return ko.utils.arrayMap(collection, function (item) {
            var mcs = ko.utils.arrayMap(item.MedicalCenters, function (e) {
                return self.SearchMedicalCenters(e);
            });

            var mcsIds = ko.utils.arrayMap(item.MedicalCenters, function (e) {
                return self.SearchMedicalCenters(e).MedicalCenterId;
            });

            var ps = self.SearchPublishingStatus(item.PublishingStatus);
            var result = new VideoVM(item.VideoId, item.SupportArabic, item.SupportEnglish, item.ArabicTitle, item.EnglishTitle, ps, mcs, mcsIds, item.ArabicVideoUrl, item.EnglishVideoUrl, item.IsActive);

            if (self.IsMarkedVideo(item.VideoId))
                result.IsMarked(true);
            else
                result.IsMarked(false);

            return result;
        });
    };

    self.IsMarkedVideo = function (id) {
        return ko.utils.arrayFirst(self.SelectedItemsIds(), function (selectedId) {
            if (selectedId === id)
                return true;
        });
    };

    self.IsMultipleDelete = ko.observable(false);
    self.ShowDeleteModal = ko.observable(false);
    self.PanelTitle = ko.observable(self.DisplayModePanelTitle);
    self.Mode = ko.observable(self.DisplayMode);
    self.SearchCriteria = ko.observable(options.searchCriteria);
    self.Videos = ko.observableArray();
    self.Spinning = ko.observable(false);
    self.EditedElement = ko.observable();
    self.SelectedElement = ko.observable();

    self.IsItemsEmpty = ko.pureComputed(function () {
        return (self.Videos().length === 0);
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
        return new VideoVM(0, false, false, '', '', undefined, [], [], undefined, undefined, undefined, false);
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

        return ko.utils.arrayFirst(self.Videos(), function (element) {
            return element.VideoId() === self.SelectedElement().VideoId();
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
            return self.Videos()[0];
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
        self.Videos(observableItems);

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
        return ko.utils.arrayFirst(self.Videos(), function (temp) {
            return temp.VideoId() === id;
        });
    }

    self.SelectedItems = ko.pureComputed(function () {
        self.SelectedItemsIds([]);
        return ko.utils.arrayFilter(self.Videos(), function (r) {
            if (r.IsMarked() === true)
                self.SelectedItemsIds().push(r.VideoId());
            return r.IsMarked() === true;
        });
    });

    self.SelectedItemsIds = ko.observableArray();

    self.IsThereMultipleSelected = ko.pureComputed(function () {
        return self.SelectedItems().length !== 0;
    });

    self.ActivateMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.ChangeStatus(ids, true);
    };

    self.DeactivateMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.ChangeStatus(ids, false);
    };

    self.ChangeStatusSingle = function () {
        var id = [self.SelectedElement().VideoId()];
        self.ChangeStatus(id, !self.SelectedElement().IsActive());
    };

    self.ChangeStatus = function (ids, isActive) {
        self.ShowSpinning();

        $.ajax({
            async: true,
            method: 'POST',
            url: self.ChangeStatusUrl,
            data: {
                ids: ids,
                isActive: isActive,
                criteria: self.SearchCriteria().toSubmitModel()
            },
            success: function (e) {
                self.HandleSuccess(e);
                ShowSuccessMessage(e.Message);
            },
            error: self.HandleError
        });
    };

    self.DeleteMultiple = function () {
        var ids = self.SelectedItemsIds();
        self.DeleteSingleOrMultiple(ids);
    };

    self.Delete = function () {
        var id = [self.SelectedElement().VideoId()];
        self.DeleteSingleOrMultiple(id);
    };

    self.DeleteSingleOrMultiple = function (ids) {
        self.ShowSpinning();
        $.ajax({
            async: true,
            method: 'POST',
            url: self.DeleteUrl,
            data: {
                ids: ids,
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
        self.Videos(observableItems);
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
}