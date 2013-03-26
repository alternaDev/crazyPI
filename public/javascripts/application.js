$("input[name=toggleOptions]").click(function() {
  if($("input[name=toggleOptions]:checked").val() == "on") $("#yolo-button").fadeIn();
  else $("#yolo-button").fadeOut();
  return true;
});

var doneDigitBatches = 0;
var doing = 0;
var BATCH_SIZE = 25;

$("#calc50").click(function() {
  if($("#calc50").attr("disabled")!="disabled")
    doDaStuff(50);
});

$("#calc100").click(function() {
  if($("#calc100").attr("disabled")!="disabled")
    doDaStuff(100);
});

$("#calc500").click(function() {
  if($("#calc500").attr("disabled")!="disabled")  
    doDaStuff(500);
});

$("#calc5000").click(function() {
  if($("#calc5000").attr("disabled")!="disabled")
    doDaStuff(5000);
});

function doDaStuff(digitAmount){
  var rest = digitAmount % BATCH_SIZE;
  digitAmount -= rest;

  doneDigitBatches = 0; 
  
  if(digitAmount > 0) {
    doing = digitAmount / BATCH_SIZE;
    doing += rest > 0 ? 1 : 0;
    doDigitBatches(BATCH_SIZE);
  } else {
    doing = 1;
    doDigitBatches(rest);
  }  
  
}
function doDigitBatches(batchSize) {
  updateUI();
  if(doneDigitBatches < doing) {
    setTimeout(function() {
      doDigitBatch(batchSize, function() {
        doneDigitBatches++;
        doDigitBatches(batchSize);
      });
    }, 0);
  }
}

function updateUI() {
  $("#bar").css("width", ((doneDigitBatches/doing)*100)+"%");

  if(doneDigitBatches >= doing) {
    $(".btn").removeAttr("disabled");
    $(".btn").removeClass("disabled");
  } else {
    $(".btn").attr("disabled", "disabled");
    $(".btn").addClass("disabled");
  }
}

function doDigitBatch(amount, callback) {
  if(amount <= 0) return;
  
  getDigitIndexes(amount, function(indexes) {
    var values = [];

    doGenerateDigits(indexes, values, function(values){
      submitDigits(values, function() {
        callback();
      }); 
    });
  });
}

function doGenerateDigits(indices, values, callback) {
  if(indices.length <= 0) {
    callback(values);
    return;
  }
  
  var index = indices[0];
  indices = indices.slice(1);
  
  Parallel.require(modPow, S);
  
  var r = Parallel.spawn(generateDigit, index);
  
  r.fetch(function(digit) {
    values.push({index: index, value: digit});
    r.terminate();
    doGenerateDigits(indices, values, callback);
  });
}

function submitDigits(digits, callback) {
  $.post("/submit-new-digits", {values: digits})
  .success(function(data) {
    console.log(data);
    if(data != "okay") doing++;
    callback();
  }).fail(function(){
    console.log("fail");
    doing++;
    callback();
  });
}

function getDigitIndexes(amount, callback) {
  $.getJSON("/get-new-index?amount="+amount, function(data) {
    callback((data));
  }).fail(function() {
    getDigitIndexes(amount, callback);
  });
}

$(document).ready(function(){
  
  
  doDaStuff(1);
});