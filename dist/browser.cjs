'use strict';

var BrowserAztecCodeReader = require('./browser/BrowserAztecCodeReader');
var BrowserBarcodeReader = require('./browser/BrowserBarcodeReader');
var BrowserCodeReader = require('./browser/BrowserCodeReader');
var BrowserDatamatrixCodeReader = require('./browser/BrowserDatamatrixCodeReader');
var BrowserMultiFormatReader = require('./browser/BrowserMultiFormatReader');
var BrowserPDF417Reader = require('./browser/BrowserPDF417Reader');
var BrowserQRCodeReader = require('./browser/BrowserQRCodeReader');
var BrowserQRCodeSvgWriter = require('./browser/BrowserQRCodeSvgWriter');
var DecodeContinuouslyCallback = require('./browser/DecodeContinuouslyCallback');
var HTMLCanvasElementLuminanceSource = require('./browser/HTMLCanvasElementLuminanceSource');
var HTMLVisualMediaElement = require('./browser/HTMLVisualMediaElement');
var VideoInputDevice = require('./browser/VideoInputDevice');



Object.keys(BrowserAztecCodeReader).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return BrowserAztecCodeReader[k]; }
	});
});
Object.keys(BrowserBarcodeReader).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return BrowserBarcodeReader[k]; }
	});
});
Object.keys(BrowserCodeReader).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return BrowserCodeReader[k]; }
	});
});
Object.keys(BrowserDatamatrixCodeReader).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return BrowserDatamatrixCodeReader[k]; }
	});
});
Object.keys(BrowserMultiFormatReader).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return BrowserMultiFormatReader[k]; }
	});
});
Object.keys(BrowserPDF417Reader).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return BrowserPDF417Reader[k]; }
	});
});
Object.keys(BrowserQRCodeReader).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return BrowserQRCodeReader[k]; }
	});
});
Object.keys(BrowserQRCodeSvgWriter).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return BrowserQRCodeSvgWriter[k]; }
	});
});
Object.keys(DecodeContinuouslyCallback).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return DecodeContinuouslyCallback[k]; }
	});
});
Object.keys(HTMLCanvasElementLuminanceSource).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return HTMLCanvasElementLuminanceSource[k]; }
	});
});
Object.keys(HTMLVisualMediaElement).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return HTMLVisualMediaElement[k]; }
	});
});
Object.keys(VideoInputDevice).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return VideoInputDevice[k]; }
	});
});
//# sourceMappingURL=browser.cjs.map
//# sourceMappingURL=browser.cjs.map