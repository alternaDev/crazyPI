var models = require("../models.js");

var BATCH_SIZE = 100;

/*
 * GET home page.
 */

exports.index = function(req, res) {
  models.getUserAmount(function(userAmount) {
    models.getDigitAmount(function(digitAmount) {
      res.render('index', { title: 'crazy π', digitAmount: digitAmount, peopleAmount: userAmount });
    });
  })
};

exports.submitDigit = function(req, res) {
  var digit = req.body.index,
      value = req.body.value,
      ip    = req.connection.remoteAddress;
  if(!(/^[0-9]+$/.test(digit))) {
    res.send(400, "invalid digit-id");
    return;
  }
  if(!(/^[0-9a-fA-F]+$/.test(value))) {
    res.send(400, "invalid digit-value");
    return;
  }
  
  models.Digit.find({where: {
    digitIndex: digit
  }})
  .success(function(digit) {
    digit.digitValue = value;
    digit.userIP = ip;
    digit.save().success(function() {
      res.send("okay");
    }).error(function(error) {
      res.send("fail: "+error);
    });
  })
  .error(function(error) {
    res.send("fail: " + error);
  });
}

exports.getDigitIndex = function(req, res) {
  getNextDigitIndex(function(index) {
    res.send(index.toString());
  });
  
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
}

function getNextDigitIndex(callback) {
  models.Digit.findAll({where: {digitValue: null}}).success(function(digits) {
    if(digits.length <= 0) {
      generateMoreDigits();
      getNextDigitIndex(callback);
    } else {
      callback(digits[Math.floor(Math.random()*digits.length)].digitIndex);
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