import { Exception } from '../core/Exception.js';
import { Result } from '../core/Result.js';
import 'ts-custom-error';
import '../core/ResultPoint.js';
import '../customTypings.js';
import '../core/BarcodeFormat.js';
import '../core/ResultMetadataType.js';

/**
 * Callback format for continuous decode scan.
 */
type DecodeContinuouslyCallback = (result: Result, error?: Exception) => any;

export type { DecodeContinuouslyCallback };
