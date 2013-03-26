$("input[name=toggleOptions]").click(function() {
  if($("input[name=toggleOptions]:checked").val() == "on") $("#yolo-button").fadeIn();
  else $("#yolo-button").fadeOut();
  return true;
});

var doneDigits = 0;
var doing = 0;
var CHUNK_SIZE = 10;

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
  
  doStuff();
}

function doStuff(){
  var max = CHUNK_SIZE;
  if(max > doing - doneDigits) max = doing - doneDigits;
  console.log(max);
  for(var i = 0; i < max; i++)
    doDigit();
} 

function doDigit() {
  getDigitIndex(function(index) {
    calculateDigit(index-1, submitDigit);
  });
}

function getDigitIndex(callback) {
  $.get("/get-new-index/"+Math.random(), function(data) {
    callback(parseInt(data));
  });
}

function calculateDigit(index, callback) {
  var d = generateDigit(index);
  d = d.replace(".", "");
  callback(index + 1, d);
}

function submitDigit(index, digit) {
  $.post("/submit-new-digit", {index: index, value: digit}).success( function(data) {
    console.log(data);
    
    if(data == "okay") {
      doneDigits++;
      updateStuff();
    } else if(data != "hamWaSchon") doDigit();
  }).fail(function(){
    doDigit();
  });
}

function updateStuff() {
  if(doneDigits >= doing) {
    $(".btn").removeAttr("disabled");
    $(".btn").removeClass("disabled");
  } else if(doneDigits % CHUNK_SIZE == 0 && doneDigits > 0) doStuff();
  
  $("#bar").css("width", ((doneDigits/doing)*100)+"%");
  
}

$(function(){
  doDigits(1);
});