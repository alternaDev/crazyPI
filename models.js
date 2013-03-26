var Sequelize = require("sequelize"),
    config    = require("./config.json");

var dbOptions = {};

dbOptions.name     = config.db.name;
dbOptions.user     = config.db.user;
dbOptions.pass     = config.db.password;
dbOptions.host     = config.db.host;
dbOptions.port     = config.db.port;
dbOptions.dialect  = config.db.dialect;
dbOptions.protocol = config.db.protocol;

var sequelize = new Sequelize(dbOptions.name, dbOptions.user, dbOptions.pass, {
  host: dbOptions.host,
  port: dbOptions.port,
  dialect: dbOptions.dialect,
  protocol: dbOptions.protocol,
  storage: dbOptions.storage
});

exports.Digit = sequelize.define("PiDigit", {
  digitIndex: Sequelize.INTEGER,
  digitValue: Sequelize.STRING,
  userIP: Sequelize.STRING
});

exports.Digit.sync();

exports.getUserAmount = function(callback) {
  
  exports.Digit.all().success(function(digits) {
    var ips = [];
    
    digits.forEach(function(digit) {
      if(!(ips.indexOf(digit.userIP)>-1))
        if(digit.userIP != "")
          ips.push(digit.userIP);
    });
    callback(ips.length - 1);
  });
}

exports.getDigitAmount = function(callback) {
  exports.Digit.all().success(function(digits) {
    var count = 0;
    digits.forEach(function(digit) {
      if(digit.digitValue != null) count++;
    });
    callback(count);
  });
}