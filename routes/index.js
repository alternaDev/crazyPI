var models = require("../models.js"),
    random = require("mersenne");

var BATCH_SIZE = 5000;

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

exports.getDayGraphData = function(req, res) {
  models.getDayGraphData(function(data) {
    res.send(data);
  });
}

exports.submitDigit = function(req, res) {
  var digit = req.body.index,
      value = req.body.value,
      ip    = req.ip;
  if(!(/^[0-9]+$/.test(digit))) {
    res.send("invalid digit-id");
    return;
  }
  if(!(/^[0-9a-fA-F]+$/.test(value))) {
    res.send("invalid digit-value");
    return;
  }
  
  models.Digit.find({where: {
    digitIndex: digit
  }})
  .success(function(digit) {
    var hamWaSchon = digit.digitValue != null;
    if(hamWaSchon) {
      res.send("hamWaSchon");
      return;
    }
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
};

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
  models.Digit.findAll({where: {digitValue: null}, limit: amount}).success(function(digits) {
    if(digits.length < amount) {
      generateMoreDigits();
      getNextDigitIndexes(amount, callback);
    } else {
      var resp = [];
      for(var i = 0; i < amount; i++) resp.push(digits[i].digitIndex);
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