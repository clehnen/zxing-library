import { Exception } from '../core/Exception.cjs';
import { Result } from '../core/Result.cjs';
import 'ts-custom-error';
import '../core/ResultPoint.cjs';
import '../customTypings.cjs';
import '../core/BarcodeFormat.cjs';
import '../core/ResultMetadataType.cjs';

/**
 * Callback format for continuous decode scan.
 */
type DecodeContinuouslyCallback = (result: Result, error?: Exception) => any;

export type { DecodeContinuouslyCallback };
