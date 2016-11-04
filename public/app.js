$.getJSON('/articles', function(data) {
    for (var i = 0; i < data.length; i++) {

        $('#articles').append('<h2 data-id="' + data[i]._id + '">' + data[i].title + '<br /><img src="' + data[i].image + '"><a href="' + data[i].link + '"target="_blank""> Read the Article</a></h2><p>' + data[i].summary + '</p><hr>');
    }
});



$(document).on('click', 'h2', function() {
    $('#notes').empty();
    var thisId = $(this).attr('data-id');

    var thisTitle

    $.ajax({
            method: "GET",
            url: "/articles/" + thisId,
        })

        .done(function(data) {
            console.log("data" + data);
            $('#notes').append('<h2>' + data.title + '</h2>');
           
            $('#notes').append('<textarea id="bodyinput" name="body"></textarea>');

            $('#notes').append('<button data-id="' + data._id + '" id="savenote">Add Reaction</button>');

            if (data.note) {
                $('#bodyinput').val(data.note.body);
            }
        });
});

$(document).on('click', '#savenote', function() {
    var thisId = $(this).attr('data-id');

    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                title: $('#titleinput').val(), 
                body: $('#bodyinput').val() 
            }
        })
        .done(function(data) {
            console.log(data);
            $('#notes').empty();
        });

    $('#titleinput').val("");
    $('#bodyinput').val("");
});
