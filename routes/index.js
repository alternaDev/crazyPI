var models = require("../models.js"),
    random = require("mersenne");

var BATCH_SIZE = 5000;

exports.index = function(req, res) {
  models.getUserAndDigitAmount(function(data) {
    res.render('index', {title: 'crazy π', digitAmount: data.digitAmount, peopleAmount: data.peopleAmount});
  });
};

exports.getDayGraphData = function(req, res) {
  models.getDayGraphData(function(data) {
    res.send(data);
  });
}

exports.getStats = function(req, res) {
  models.getUserAndDigitAmount(function(data) {
    res.send({peopleAmount: data.peopleAmount, digitAmount: data.digitAmount});
  });
}

exports.getDigitIndex = function(req, res) {
  var amount = req.query["amount"];
  if(typeof amount != 'undefined') {
    getNextDigitIndexes(parseInt(amount), function(indexes) {
      res.send(JSON.stringify(indexes));
    })
  } else
    res.send([-1]);
};

exports.submitDigits = function(req, res) {
  var values = req.body.values;
  var ip = req.ip;
  if(typeof values != 'undefined') {
    var count = 0;
    values.forEach(function(val) {
      
      var index = val.index,
      piVal = val.value;
    
      models.Digit.find({where: {
        digitIndex: index
      }})
      .success(function(digit) {
        if(digit == null) return;
        var hamWaSchon = digit.digitValue != null;
        if(hamWaSchon) {
          count++;
          if(count >= values.length)
            res.send("okay, aber wir hatten schon was....");
          return;
        }
        digit.digitValue = piVal;
        digit.userIP = ip;
        digit.save().success(function() {
          count++;
          if(count >= values.length)
            res.send("okay");
        }).error(function(error) {
          res.send("fail: "+error);
        });
      })
      .error(function(error) {
        res.send("fail: " + error);
      });
    });
  }
}

exports.getPi = function(req, res) {
  var pi = "3.";
  models.Digit.all({order: "digitIndex ASC"}).success(function(digits) {
    var stopped = false;
    digits.forEach(function(digit) {
      if(stopped) return;
      if(digit.digitValue == null){ stopped = true; return; }
      pi += digit.digitValue.substring(0, 1);
    });
    res.send(pi);
  });
};

function getNextDigitIndexes(amount, callback) {
  var getAmount = amount * 10;
  models.Digit.findAll({where: {digitValue: null}, limit: getAmount}).success(function(digits) {
    if(digits.length < getAmount) {
      generateMoreDigits();
      getNextDigitIndexes(amount, callback);
    } else {
      var resp = [];
      for(var i = 0; i < amount; i++) {
        var index = random.rand(digits.length);
        var digit = digits[index];
        digits.splice(index, 1);
        resp.push(digits[index].digitIndex);
      }
      callback(resp);
    }
    
  });
}

function generateMoreDigits() {
  models.Digit.findAll({order: 'digitIndex DESC'}).success(function(digits) {
    var highestDigit;
    
    if(typeof digits[0] != 'undefined') {
      highestDigit = digits[0].digitIndex;
    } else {
      highestDigit = 0;
    }
    
    for(var i = highestDigit + 1; i < highestDigit + BATCH_SIZE; i++) {
      models.Digit.build({
        digitIndex: i,
        digitValue: null,
        userIP: null
      })
      .save();
    }
  });
}