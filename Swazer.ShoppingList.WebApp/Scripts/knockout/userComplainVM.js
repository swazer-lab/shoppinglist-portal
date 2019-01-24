function UserComplainVM(){
    var self = this;

    self.Id = ko.observable();
    self.Status = ko.observable();
    self.Type = ko.observable();
    self.Description = ko.observable();
    self.Statement = ko.observable();
    self.CreateAt = ko.observable();
}

function UserComplainMainVM(options) {
    var self = this;

    self.IsModalVisible = ko.observable(false);

    self.UserComplains = ko.observable(options.items);

    self.SelectedElement = ko.observable(new UserComplainVM());

    self.openModal = function (complain) {
        self.SelectedElement().Id(complain.ComplainId);
        self.SelectedElement().Status(complain.ComplainStatusName);
        self.SelectedElement().Type(complain.LocalizedComplainTypeName);
        self.SelectedElement().Description(complain.Description);
        self.SelectedElement().Statement(complain.ComplainStatementName);
        self.SelectedElement().CreateAt(complain.CreateAt);
        self.IsModalVisible(true);
    };
}