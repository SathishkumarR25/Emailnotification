function submitform(){
    var to=$('#to').val();
    var subject=$('#subject').val();
    var text=$('#text').val();
    if(!to){
        alert("Please Enter Email");
        return;
    }
    $.ajax({
        url: '/send-email',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            to:to,
            subject:subject,
            text:text 
        }),
        success: function(data) {
            console.log('Success:', data);
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
}