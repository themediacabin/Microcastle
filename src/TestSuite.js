var jsdom = require('jsdom').jsdom;


global.document = jsdom('');
global.window = document.defaultView;

Object.keys(document.defaultView).forEach((property) => {
    if (typeof global[property] === 'undefined') {
          global[property] = document.defaultView[property];
        }
});

global.navigator = {
    userAgent: 'node.js'
};

global.React = require('react');


var sinonChai = require("sinon-chai");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var chaiImmutable = require("chai-immutable");

chai.use(chaiImmutable);
chai.use(sinonChai);
chai.use(chaiAsPromised);
global.expect = chai.expect;


global.mount = require('enzyme').mount;
global.sinon = require('sinon');

