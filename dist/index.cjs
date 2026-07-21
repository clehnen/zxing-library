'use strict';

var browser = require('./browser');
var ArgumentException = require('./core/ArgumentException');
var ArithmeticException = require('./core/ArithmeticException');
var ChecksumException = require('./core/ChecksumException');
var Exception = require('./core/Exception');
var FormatException = require('./core/FormatException');
var IllegalArgumentException = require('./core/IllegalArgumentException');
var IllegalStateException = require('./core/IllegalStateException');
var NotFoundException = require('./core/NotFoundException');
var ReaderException = require('./core/ReaderException');
var ReedSolomonException = require('./core/ReedSolomonException');
var UnsupportedOperationException = require('./core/UnsupportedOperationException');
var WriterException = require('./core/WriterException');
var BarcodeFormat = require('./core/BarcodeFormat');
var Binarizer = require('./core/Binarizer');
var BinaryBitmap = require('./core/BinaryBitmap');
var DecodeHintType = require('./core/DecodeHintType');
var InvertedLuminanceSource = require('./core/InvertedLuminanceSource');
var LuminanceSource = require('./core/LuminanceSource');
var MultiFormatReader = require('./core/MultiFormatReader');
var MultiFormatWriter = require('./core/MultiFormatWriter');
var PlanarYUVLuminanceSource = require('./core/PlanarYUVLuminanceSource');
var Reader = require('./core/Reader');
var Result = require('./core/Result');
var ResultMetadataType = require('./core/ResultMetadataType');
var ResultPointCallback = require('./core/ResultPointCallback');
var RGBLuminanceSource = require('./core/RGBLuminanceSource');
var Writer = require('./core/Writer');
var ResultPoint = require('./core/ResultPoint');
var ZXingSystem = require('./core/util/ZXingSystem');
var StringBuilder = require('./core/util/StringBuilder');
var ZXingStringEncoding = require('./core/util/ZXingStringEncoding');
var ZXingCharset = require('./core/util/ZXingCharset');
var ZXingArrays = require('./core/util/ZXingArrays');
var ZXingStandardCharsets = require('./core/util/ZXingStandardCharsets');
var ZXingInteger = require('./core/util/ZXingInteger');
var BitArray = require('./core/common/BitArray');
var BitMatrix = require('./core/common/BitMatrix');
var BitSource = require('./core/common/BitSource');
var CharacterSetECI = require('./core/common/CharacterSetECI');
var DecoderResult = require('./core/common/DecoderResult');
var DefaultGridSampler = require('./core/common/DefaultGridSampler');
var DetectorResult = require('./core/common/DetectorResult');
var EncodeHintType = require('./core/EncodeHintType');
var GlobalHistogramBinarizer = require('./core/common/GlobalHistogramBinarizer');
var GridSampler = require('./core/common/GridSampler');
var GridSamplerInstance = require('./core/common/GridSamplerInstance');
var HybridBinarizer = require('./core/common/HybridBinarizer');
var PerspectiveTransform = require('./core/common/PerspectiveTransform');
var StringUtils = require('./core/common/StringUtils');
var MathUtils = require('./core/common/detector/MathUtils');
var WhiteRectangleDetector = require('./core/common/detector/WhiteRectangleDetector');
var GenericGF = require('./core/common/reedsolomon/GenericGF');
var GenericGFPoly = require('./core/common/reedsolomon/GenericGFPoly');
var ReedSolomonDecoder = require('./core/common/reedsolomon/ReedSolomonDecoder');
var ReedSolomonEncoder = require('./core/common/reedsolomon/ReedSolomonEncoder');
var DataMatrixReader = require('./core/datamatrix/DataMatrixReader');
var DataMatrixDecodedBitStreamParser = require('./core/datamatrix/decoder/DataMatrixDecodedBitStreamParser');
var DataMatrixDefaultPlacement = require('./core/datamatrix/encoder/DataMatrixDefaultPlacement');
var DataMatrixErrorCorrection = require('./core/datamatrix/encoder/DataMatrixErrorCorrection');
var DataMatrixHighLevelEncoder = require('./core/datamatrix/encoder/DataMatrixHighLevelEncoder');
var DataMatrixSymbolInfo = require('./core/datamatrix/encoder/DataMatrixSymbolInfo');
var constants = require('./core/datamatrix/encoder/constants');
var DataMatrixWriter = require('./core/datamatrix/DataMatrixWriter');
var PDF417Reader = require('./core/pdf417/PDF417Reader');
var PDF417ResultMetadata = require('./core/pdf417/PDF417ResultMetadata');
var PDF417DecodedBitStreamParser = require('./core/pdf417/decoder/PDF417DecodedBitStreamParser');
var PDF417DecoderErrorCorrection = require('./core/pdf417/decoder/ec/PDF417DecoderErrorCorrection');
var QRCodeReader = require('./core/qrcode/QRCodeReader');
var QRCodeWriter = require('./core/qrcode/QRCodeWriter');
var QRCodeDecoderErrorCorrectionLevel = require('./core/qrcode/decoder/QRCodeDecoderErrorCorrectionLevel');
var QRCodeDecoderFormatInformation = require('./core/qrcode/decoder/QRCodeDecoderFormatInformation');
var QRCodeVersion = require('./core/qrcode/decoder/QRCodeVersion');
var QRCodeMode = require('./core/qrcode/decoder/QRCodeMode');
var QRCodeDecodedBitStreamParser = require('./core/qrcode/decoder/QRCodeDecodedBitStreamParser');
var QRCodeDataMask = require('./core/qrcode/decoder/QRCodeDataMask');
var QRCodeEncoder = require('./core/qrcode/encoder/QRCodeEncoder');
var QRCodeEncoderQRCode = require('./core/qrcode/encoder/QRCodeEncoderQRCode');
var QRCodeMatrixUtil = require('./core/qrcode/encoder/QRCodeMatrixUtil');
var QRCodeByteMatrix = require('./core/qrcode/encoder/QRCodeByteMatrix');
var QRCodeMaskUtil = require('./core/qrcode/encoder/QRCodeMaskUtil');
var MicroQRCodeReader = require('./core/microqr/MicroQRCodeReader');
var MicroQRVersion = require('./core/microqr/decoder/MicroQRVersion');
var MicroQRFormatInformation = require('./core/microqr/decoder/MicroQRFormatInformation');
var MicroQRDetector = require('./core/microqr/detector/MicroQRDetector');
var MaxiCodeReader = require('./core/maxicode/MaxiCodeReader');
var MaxiCodeDecoder = require('./core/maxicode/decoder/MaxiCodeDecoder');
var MaxiCodeDecodedBitStreamParser = require('./core/maxicode/decoder/MaxiCodeDecodedBitStreamParser');
var AztecCodeReader = require('./core/aztec/AztecCodeReader');
var AztecCodeWriter = require('./core/aztec/AztecCodeWriter');
var AztecDetectorResult = require('./core/aztec/AztecDetectorResult');
var AztecEncoder = require('./core/aztec/encoder/AztecEncoder');
var AztecHighLevelEncoder = require('./core/aztec/encoder/AztecHighLevelEncoder');
var AztecCode = require('./core/aztec/encoder/AztecCode');
var AztecDecoder = require('./core/aztec/decoder/AztecDecoder');
var AztecDetector = require('./core/aztec/detector/AztecDetector');
var OneDReader = require('./core/oned/OneDReader');
var EAN13Reader = require('./core/oned/EAN13Reader');
var Code128Reader = require('./core/oned/Code128Reader');
var ITFReader = require('./core/oned/ITFReader');
var Code39Reader = require('./core/oned/Code39Reader');
var Code93Reader = require('./core/oned/Code93Reader');
var RSS14Reader = require('./core/oned/rss/RSS14Reader');
var RSSExpandedReader = require('./core/oned/rss/expanded/RSSExpandedReader');
var AbstractExpandedDecoder = require('./core/oned/rss/expanded/decoders/AbstractExpandedDecoder');
var AbstractExpandedDecoderComplement = require('./core/oned/rss/expanded/decoders/AbstractExpandedDecoderComplement');
var MultiFormatOneDReader = require('./core/oned/MultiFormatOneDReader');
var CodaBarReader = require('./core/oned/CodaBarReader');
var FinderPattern = require('./core/oned/rss/FinderPattern');



Object.defineProperty(exports, "ArgumentException", {
  enumerable: true,
  get: function () { return ArgumentException.ArgumentException; }
});
Object.defineProperty(exports, "ArithmeticException", {
  enumerable: true,
  get: function () { return ArithmeticException.ArithmeticException; }
});
Object.defineProperty(exports, "ChecksumException", {
  enumerable: true,
  get: function () { return ChecksumException.ChecksumException; }
});
Object.defineProperty(exports, "Exception", {
  enumerable: true,
  get: function () { return Exception.Exception; }
});
Object.defineProperty(exports, "FormatException", {
  enumerable: true,
  get: function () { return FormatException.FormatException; }
});
Object.defineProperty(exports, "IllegalArgumentException", {
  enumerable: true,
  get: function () { return IllegalArgumentException.IllegalArgumentException; }
});
Object.defineProperty(exports, "IllegalStateException", {
  enumerable: true,
  get: function () { return IllegalStateException.IllegalStateException; }
});
Object.defineProperty(exports, "NotFoundException", {
  enumerable: true,
  get: function () { return NotFoundException.NotFoundException; }
});
Object.defineProperty(exports, "ReaderException", {
  enumerable: true,
  get: function () { return ReaderException.ReaderException; }
});
Object.defineProperty(exports, "ReedSolomonException", {
  enumerable: true,
  get: function () { return ReedSolomonException.ReedSolomonException; }
});
Object.defineProperty(exports, "UnsupportedOperationException", {
  enumerable: true,
  get: function () { return UnsupportedOperationException.UnsupportedOperationException; }
});
Object.defineProperty(exports, "WriterException", {
  enumerable: true,
  get: function () { return WriterException.WriterException; }
});
Object.defineProperty(exports, "BarcodeFormat", {
  enumerable: true,
  get: function () { return BarcodeFormat.BarcodeFormat; }
});
Object.defineProperty(exports, "Binarizer", {
  enumerable: true,
  get: function () { return Binarizer.Binarizer; }
});
Object.defineProperty(exports, "BinaryBitmap", {
  enumerable: true,
  get: function () { return BinaryBitmap.BinaryBitmap; }
});
Object.defineProperty(exports, "DecodeHintType", {
  enumerable: true,
  get: function () { return DecodeHintType.DecodeHintType; }
});
Object.defineProperty(exports, "InvertedLuminanceSource", {
  enumerable: true,
  get: function () { return InvertedLuminanceSource.InvertedLuminanceSource; }
});
Object.defineProperty(exports, "LuminanceSource", {
  enumerable: true,
  get: function () { return LuminanceSource.LuminanceSource; }
});
Object.defineProperty(exports, "MultiFormatReader", {
  enumerable: true,
  get: function () { return MultiFormatReader.MultiFormatReader; }
});
Object.defineProperty(exports, "MultiFormatWriter", {
  enumerable: true,
  get: function () { return MultiFormatWriter.MultiFormatWriter; }
});
Object.defineProperty(exports, "PlanarYUVLuminanceSource", {
  enumerable: true,
  get: function () { return PlanarYUVLuminanceSource.PlanarYUVLuminanceSource; }
});
Object.defineProperty(exports, "Reader", {
  enumerable: true,
  get: function () { return Reader.Reader; }
});
Object.defineProperty(exports, "Result", {
  enumerable: true,
  get: function () { return Result.Result; }
});
Object.defineProperty(exports, "ResultMetadataType", {
  enumerable: true,
  get: function () { return ResultMetadataType.ResultMetadataType; }
});
Object.defineProperty(exports, "ResultPointCallback", {
  enumerable: true,
  get: function () { return ResultPointCallback.ResultPointCallback; }
});
Object.defineProperty(exports, "RGBLuminanceSource", {
  enumerable: true,
  get: function () { return RGBLuminanceSource.RGBLuminanceSource; }
});
Object.defineProperty(exports, "Writer", {
  enumerable: true,
  get: function () { return Writer.Writer; }
});
Object.defineProperty(exports, "ResultPoint", {
  enumerable: true,
  get: function () { return ResultPoint.ResultPoint; }
});
Object.defineProperty(exports, "ZXingSystem", {
  enumerable: true,
  get: function () { return ZXingSystem.ZXingSystem; }
});
Object.defineProperty(exports, "ZXingStringBuilder", {
  enumerable: true,
  get: function () { return StringBuilder.ZXingStringBuilder; }
});
Object.defineProperty(exports, "ZXingStringEncoding", {
  enumerable: true,
  get: function () { return ZXingStringEncoding.ZXingStringEncoding; }
});
Object.defineProperty(exports, "ZXingCharset", {
  enumerable: true,
  get: function () { return ZXingCharset.ZXingCharset; }
});
Object.defineProperty(exports, "ZXingArrays", {
  enumerable: true,
  get: function () { return ZXingArrays.ZXingArrays; }
});
Object.defineProperty(exports, "ZXingStandardCharsets", {
  enumerable: true,
  get: function () { return ZXingStandardCharsets.ZXingStandardCharsets; }
});
Object.defineProperty(exports, "ZXingInteger", {
  enumerable: true,
  get: function () { return ZXingInteger.ZXingInteger; }
});
Object.defineProperty(exports, "BitArray", {
  enumerable: true,
  get: function () { return BitArray.BitArray; }
});
Object.defineProperty(exports, "BitMatrix", {
  enumerable: true,
  get: function () { return BitMatrix.BitMatrix; }
});
Object.defineProperty(exports, "BitSource", {
  enumerable: true,
  get: function () { return BitSource.BitSource; }
});
Object.defineProperty(exports, "CharacterSetECI", {
  enumerable: true,
  get: function () { return CharacterSetECI.CharacterSetECI; }
});
Object.defineProperty(exports, "DecoderResult", {
  enumerable: true,
  get: function () { return DecoderResult.DecoderResult; }
});
Object.defineProperty(exports, "DefaultGridSampler", {
  enumerable: true,
  get: function () { return DefaultGridSampler.DefaultGridSampler; }
});
Object.defineProperty(exports, "DetectorResult", {
  enumerable: true,
  get: function () { return DetectorResult.DetectorResult; }
});
Object.defineProperty(exports, "EncodeHintType", {
  enumerable: true,
  get: function () { return EncodeHintType.EncodeHintType; }
});
Object.defineProperty(exports, "GlobalHistogramBinarizer", {
  enumerable: true,
  get: function () { return GlobalHistogramBinarizer.GlobalHistogramBinarizer; }
});
Object.defineProperty(exports, "GridSampler", {
  enumerable: true,
  get: function () { return GridSampler.GridSampler; }
});
Object.defineProperty(exports, "GridSamplerInstance", {
  enumerable: true,
  get: function () { return GridSamplerInstance.GridSamplerInstance; }
});
Object.defineProperty(exports, "HybridBinarizer", {
  enumerable: true,
  get: function () { return HybridBinarizer.HybridBinarizer; }
});
Object.defineProperty(exports, "PerspectiveTransform", {
  enumerable: true,
  get: function () { return PerspectiveTransform.PerspectiveTransform; }
});
Object.defineProperty(exports, "StringUtils", {
  enumerable: true,
  get: function () { return StringUtils.StringUtils; }
});
Object.defineProperty(exports, "MathUtils", {
  enumerable: true,
  get: function () { return MathUtils.MathUtils; }
});
Object.defineProperty(exports, "WhiteRectangleDetector", {
  enumerable: true,
  get: function () { return WhiteRectangleDetector.WhiteRectangleDetector; }
});
Object.defineProperty(exports, "GenericGF", {
  enumerable: true,
  get: function () { return GenericGF.GenericGF; }
});
Object.defineProperty(exports, "GenericGFPoly", {
  enumerable: true,
  get: function () { return GenericGFPoly.GenericGFPoly; }
});
Object.defineProperty(exports, "ReedSolomonDecoder", {
  enumerable: true,
  get: function () { return ReedSolomonDecoder.ReedSolomonDecoder; }
});
Object.defineProperty(exports, "ReedSolomonEncoder", {
  enumerable: true,
  get: function () { return ReedSolomonEncoder.ReedSolomonEncoder; }
});
Object.defineProperty(exports, "DataMatrixReader", {
  enumerable: true,
  get: function () { return DataMatrixReader.DataMatrixReader; }
});
Object.defineProperty(exports, "DataMatrixDecodedBitStreamParser", {
  enumerable: true,
  get: function () { return DataMatrixDecodedBitStreamParser.DataMatrixDecodedBitStreamParser; }
});
Object.defineProperty(exports, "DataMatrixDefaultPlacement", {
  enumerable: true,
  get: function () { return DataMatrixDefaultPlacement.DataMatrixDefaultPlacement; }
});
Object.defineProperty(exports, "DataMatrixErrorCorrection", {
  enumerable: true,
  get: function () { return DataMatrixErrorCorrection.DataMatrixErrorCorrection; }
});
Object.defineProperty(exports, "DataMatrixHighLevelEncoder", {
  enumerable: true,
  get: function () { return DataMatrixHighLevelEncoder.DataMatrixHighLevelEncoder; }
});
Object.defineProperty(exports, "DataMatrixSymbolInfo", {
  enumerable: true,
  get: function () { return DataMatrixSymbolInfo.DataMatrixSymbolInfo; }
});
Object.defineProperty(exports, "DataMatrixSymbolShapeHint", {
  enumerable: true,
  get: function () { return constants.SymbolShapeHint; }
});
Object.defineProperty(exports, "DataMatrixWriter", {
  enumerable: true,
  get: function () { return DataMatrixWriter.DataMatrixWriter; }
});
Object.defineProperty(exports, "PDF417Reader", {
  enumerable: true,
  get: function () { return PDF417Reader.PDF417Reader; }
});
Object.defineProperty(exports, "PDF417ResultMetadata", {
  enumerable: true,
  get: function () { return PDF417ResultMetadata.PDF417ResultMetadata; }
});
Object.defineProperty(exports, "PDF417DecodedBitStreamParser", {
  enumerable: true,
  get: function () { return PDF417DecodedBitStreamParser.PDF417DecodedBitStreamParser; }
});
Object.defineProperty(exports, "PDF417DecoderErrorCorrection", {
  enumerable: true,
  get: function () { return PDF417DecoderErrorCorrection.PDF417DecoderErrorCorrection; }
});
Object.defineProperty(exports, "QRCodeReader", {
  enumerable: true,
  get: function () { return QRCodeReader.QRCodeReader; }
});
Object.defineProperty(exports, "QRCodeWriter", {
  enumerable: true,
  get: function () { return QRCodeWriter.QRCodeWriter; }
});
Object.defineProperty(exports, "QRCodeDecoderErrorCorrectionLevel", {
  enumerable: true,
  get: function () { return QRCodeDecoderErrorCorrectionLevel.QRCodeDecoderErrorCorrectionLevel; }
});
Object.defineProperty(exports, "QRCodeDecoderFormatInformation", {
  enumerable: true,
  get: function () { return QRCodeDecoderFormatInformation.QRCodeDecoderFormatInformation; }
});
Object.defineProperty(exports, "QRCodeVersion", {
  enumerable: true,
  get: function () { return QRCodeVersion.QRCodeVersion; }
});
Object.defineProperty(exports, "QRCodeMode", {
  enumerable: true,
  get: function () { return QRCodeMode.QRCodeMode; }
});
Object.defineProperty(exports, "QRCodeDecodedBitStreamParser", {
  enumerable: true,
  get: function () { return QRCodeDecodedBitStreamParser.QRCodeDecodedBitStreamParser; }
});
Object.defineProperty(exports, "QRCodeDataMask", {
  enumerable: true,
  get: function () { return QRCodeDataMask.QRCodeDataMask; }
});
Object.defineProperty(exports, "QRCodeEncoder", {
  enumerable: true,
  get: function () { return QRCodeEncoder.QRCodeEncoder; }
});
Object.defineProperty(exports, "QRCodeEncoderQRCode", {
  enumerable: true,
  get: function () { return QRCodeEncoderQRCode.QRCodeEncoderQRCode; }
});
Object.defineProperty(exports, "QRCodeMatrixUtil", {
  enumerable: true,
  get: function () { return QRCodeMatrixUtil.QRCodeMatrixUtil; }
});
Object.defineProperty(exports, "QRCodeByteMatrix", {
  enumerable: true,
  get: function () { return QRCodeByteMatrix.QRCodeByteMatrix; }
});
Object.defineProperty(exports, "QRCodeMaskUtil", {
  enumerable: true,
  get: function () { return QRCodeMaskUtil.QRCodeMaskUtil; }
});
Object.defineProperty(exports, "MicroQRCodeReader", {
  enumerable: true,
  get: function () { return MicroQRCodeReader.MicroQRCodeReader; }
});
Object.defineProperty(exports, "MicroQRVersion", {
  enumerable: true,
  get: function () { return MicroQRVersion.MicroQRVersion; }
});
Object.defineProperty(exports, "MicroQRFormatInformation", {
  enumerable: true,
  get: function () { return MicroQRFormatInformation.MicroQRFormatInformation; }
});
Object.defineProperty(exports, "MicroQRDetector", {
  enumerable: true,
  get: function () { return MicroQRDetector.MicroQRDetector; }
});
Object.defineProperty(exports, "MaxiCodeReader", {
  enumerable: true,
  get: function () { return MaxiCodeReader.MaxiCodeReader; }
});
Object.defineProperty(exports, "MaxiCodeDecoder", {
  enumerable: true,
  get: function () { return MaxiCodeDecoder.MaxiCodeDecoder; }
});
Object.defineProperty(exports, "MaxiCodeDecodedBitStreamParser", {
  enumerable: true,
  get: function () { return MaxiCodeDecodedBitStreamParser.MaxiCodeDecodedBitStreamParser; }
});
Object.defineProperty(exports, "AztecCodeReader", {
  enumerable: true,
  get: function () { return AztecCodeReader.AztecCodeReader; }
});
Object.defineProperty(exports, "AztecCodeWriter", {
  enumerable: true,
  get: function () { return AztecCodeWriter.AztecCodeWriter; }
});
Object.defineProperty(exports, "AztecDetectorResult", {
  enumerable: true,
  get: function () { return AztecDetectorResult.AztecDetectorResult; }
});
Object.defineProperty(exports, "AztecEncoder", {
  enumerable: true,
  get: function () { return AztecEncoder.AztecEncoder; }
});
Object.defineProperty(exports, "AztecHighLevelEncoder", {
  enumerable: true,
  get: function () { return AztecHighLevelEncoder.AztecHighLevelEncoder; }
});
Object.defineProperty(exports, "AztecCode", {
  enumerable: true,
  get: function () { return AztecCode.AztecCode; }
});
Object.defineProperty(exports, "AztecDecoder", {
  enumerable: true,
  get: function () { return AztecDecoder.AztecDecoder; }
});
Object.defineProperty(exports, "AztecDetector", {
  enumerable: true,
  get: function () { return AztecDetector.AztecDetector; }
});
Object.defineProperty(exports, "AztecPoint", {
  enumerable: true,
  get: function () { return AztecDetector.AztecPoint; }
});
Object.defineProperty(exports, "OneDReader", {
  enumerable: true,
  get: function () { return OneDReader.OneDReader; }
});
Object.defineProperty(exports, "EAN13Reader", {
  enumerable: true,
  get: function () { return EAN13Reader.EAN13Reader; }
});
Object.defineProperty(exports, "Code128Reader", {
  enumerable: true,
  get: function () { return Code128Reader.Code128Reader; }
});
Object.defineProperty(exports, "ITFReader", {
  enumerable: true,
  get: function () { return ITFReader.ITFReader; }
});
Object.defineProperty(exports, "Code39Reader", {
  enumerable: true,
  get: function () { return Code39Reader.Code39Reader; }
});
Object.defineProperty(exports, "Code93Reader", {
  enumerable: true,
  get: function () { return Code93Reader.Code93Reader; }
});
Object.defineProperty(exports, "RSS14Reader", {
  enumerable: true,
  get: function () { return RSS14Reader.RSS14Reader; }
});
Object.defineProperty(exports, "RSSExpandedReader", {
  enumerable: true,
  get: function () { return RSSExpandedReader.RSSExpandedReader; }
});
Object.defineProperty(exports, "AbstractExpandedDecoder", {
  enumerable: true,
  get: function () { return AbstractExpandedDecoder.AbstractExpandedDecoder; }
});
Object.defineProperty(exports, "createAbstractExpandedDecoder", {
  enumerable: true,
  get: function () { return AbstractExpandedDecoderComplement.createAbstractExpandedDecoder; }
});
Object.defineProperty(exports, "MultiFormatOneDReader", {
  enumerable: true,
  get: function () { return MultiFormatOneDReader.MultiFormatOneDReader; }
});
Object.defineProperty(exports, "CodaBarReader", {
  enumerable: true,
  get: function () { return CodaBarReader.CodaBarReader; }
});
Object.defineProperty(exports, "FinderPattern", {
  enumerable: true,
  get: function () { return FinderPattern.FinderPattern; }
});
Object.keys(browser).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return browser[k]; }
  });
});
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map