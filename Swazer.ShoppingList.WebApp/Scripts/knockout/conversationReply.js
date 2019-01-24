
function ConversationReplayMainVM(options) {
    var self = this;
    self.ConversationId = ko.observable(options.conversationId);
    self.Message = ko.observable();
    self.Conversations = ko.observableArray(options.conversations);
    self.CreateUrl = options.createUrl;


    self.Save = function (form) {
        $.ajax({
            async: true,
            method: 'POST',
            url: self.CreateUrl,
            data: {
                ConversationId: self.ConversationId(),
                Message: self.Message(),
            },
            success: function (e) {
                self.Conversations(e.Conversations);
                self.Message("");
            },
        });

        return false;
    };
} 