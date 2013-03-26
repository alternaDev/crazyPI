$("input[name=toggleOptions]").click(function() {
  if($("input[name=toggleOptions]:checked").val() == "on") $("#yolo-button").fadeIn();
  else $("#yolo-button").fadeOut();
  return true;
});

var doneDigits = 0;
var doing = 0;

$("#calc5").click(function() {
  if($("#calc5").attr("disabled")!="disabled")
    doDigits(5);
});

$("#calc25").click(function() {
  if($("#calc25").attr("disabled")!="disabled")
    doDigits(25);
});

$("#calc100").click(function() {
  if($("#calc100").attr("disabled")!="disabled")  
    doDigits(100);
});

$("#calc5000").click(function() {
  if($("#calc5000").attr("disabled")!="disabled")
    doDigits(5000);
});

function doDigits(amount) {
  doneDigits = 0;
  $("#bar").css("width", ((doneDigits/doing)*100)+"%");
  
  doing = amount;
  $(".btn").attr("disabled", "disabled");
  $(".btn").addClass("disabled");
  
  doDigit();
}

function doDigit() {
  if(doneDigits >= doing) return;
  getDigitIndex(function(index) {
    var digit = calculateDigit(index-1);
    submitDigit(index, digit);
  });
}

function getDigitIndex(callback) {
  $.get("/get-new-index/"+Math.random(), function(data) {
    callback(parseInt(data));
  });
}

function calculateDigit(index) {
  return generateDigit(index);
}

function submitDigit(index, digit) {
  $.post("/submit-new-digit", {index: index, value: digit}, function(data) {
    console.log(data);
    
    if(data == "okay") {
      doneDigits++;
      updateStuff();
    }
    doDigit();
  });
}

function updateStuff() {
  if(doneDigits >= doing) {
    $(".btn").removeAttr("disabled");
    $(".btn").removeClass("disabled");
  }
  $("#bar").css("width", ((doneDigits/doing)*100)+"%");
}

$(function(){
  doDigit();
});