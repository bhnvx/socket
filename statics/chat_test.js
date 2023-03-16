(function () {
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        var getMessageText, message_side, sendMessage;
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = message_side === 'left' ? 'right' : 'left';
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();
            $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 3000);

            if (message_side === 'right') {
                $.post("/test", {
                    message: message.text
                }, function(data, status) {
                    if (status === "success") {
                        sendMessage(data);
                    } else {
                        sendMessage("Sorry, i don't understand your q.");
                    }
                });
                $("#message_input").prop("disabled", true);
                } else if (message_side === 'left') {
                $("#message_input").prop("disabled", false);
            };
        };

        sendMessage("Hi! I'm Chat-GPT. How can I help you?");

        $('.send_message').click(function (e) {
            sendMessage(getMessageText());
        });

        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                sendMessage(getMessageText());
            }
        });
    });
}.call(this));