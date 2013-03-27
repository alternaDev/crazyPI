$("input[name=toggleOptions]").click(function() {
  if($("input[name=toggleOptions]:checked").val() == "on") $("#yolo-button").fadeIn();
  else $("#yolo-button").fadeOut();
  return true;
});

var doneDigitBatches = 0;
var doing = 0;

var totalDigitAmount = 0;
var doneDigitAmount = 0;

var BATCH_SIZE = 50;

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
  doneDigitAmount = 0;
  totalDigitAmount = digitAmount; 
  
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
  $("#bar").css("width", ((doneDigitAmount/totalDigitAmount)*100)+"%");

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

    doGenerateDigits(indexes, values, function(values) {
      callback();
      submitDigits(values, function() {
        
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
    doneDigitAmount++;
    updateUI();
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

function showChart() {
  $.get("/get-day-graph-data", {}, function(reponseData) {
    var labels = [];
    var graphData = [];
    $.each(reponseData, function(index, value) {
      index = new Date(index);
      var dayName = index.getDay()+'. '+index.getMonth()+'.';
      labels.push(dayName);
      graphData.push(value);
    });
    
    var data = {
    	labels : labels,
    	datasets : [
    		{
    			fillColor : "rgba(26, 188, 156, 0.3)",
    			strokeColor : "rgba(22, 160, 133, 1)",
    			pointColor : "rgba(39, 174, 96, 1)",
    			pointStrokeColor : "rgba(46, 204, 113, 0.2)",
    			data : graphData
    		}
    	]
    }
    var ctx = document.getElementById("dayChart").getContext("2d");
    var dayChart = new Chart(ctx).Line(data);
  
    $("#dayChart").css("width", "100%");
  });
  
  
  
  
}

$(document).ready(function(){
  doDaStuff(1);
  showChart();
});