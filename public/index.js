$(".addMark").on("mouseover", function(event) {
    $(event.target).addClass("active");
});

$(".addMark").on("mouseout", function(event) {
    $(event.target).removeClass("active");
});
