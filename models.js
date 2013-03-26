var Sequelize = require("sequelize");

var dbOptions = {};

switch(process.env.NODE_ENV) {
  case 'production':
  var url	= require('url'),
  dbUrl   = url.parse(process.env.DATABASE_URL),
  authArr = dbUrl.auth.split(':');

  dbOptions.name     = dbUrl.path.substring(1);
  dbOptions.user     = authArr[0];
  dbOptions.pass     = authArr[1];
  dbOptions.host     = dbUrl.host;
  dbOptions.port     = null;
  dbOptions.dialect  = 'postgres';
  dbOptions.protocol = 'postgres';
  break;
  default:
  dbOptions.name = "pi";
  dbOptions.user = "user";
  dbOptions.dialect = "sqlite";
  dbOptions.storage = "sqlite.db";
  break;
}

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
    callback(ips.length-1);
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