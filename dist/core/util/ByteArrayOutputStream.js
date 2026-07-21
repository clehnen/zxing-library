import { ZXingArrays } from './ZXingArrays';
import { OutputStream } from './OutputStream';
import { ZXingInteger } from './ZXingInteger';
import { IllegalArgumentException } from '../IllegalArgumentException';
import { OutOfMemoryError } from '../OutOfMemoryError';
import { ZXingSystem } from './ZXingSystem';
import { IndexOutOfBoundsException } from '../IndexOutOfBoundsException';

class ByteArrayOutputStream extends OutputStream {
  /**
   * The buffer where data is stored.
   */
  buf;
  /**
   * The number of valid bytes in the buffer.
   */
  count = 0;
  /**
   * Creates a new byte array output stream. The buffer capacity is
   * initially 32 bytes, though its size increases if necessary.
   */
  // public constructor() {
  //     this(32);
  // }
  /**
   * Creates a new byte array output stream, with a buffer capacity of
   * the specified size, in bytes.
   *
   * @param   size   the initial size.
   * @exception  IllegalArgumentException if size is negative.
   */
  constructor(size = 32) {
    super();
    if (size < 0) {
      throw new IllegalArgumentException("Negative initial size: " + size);
    }
    this.buf = new Uint8Array(size);
  }
  /**
   * Increases the capacity if necessary to ensure that it can hold
   * at least the number of elements specified by the minimum
   * capacity argument.
   *
   * @param minCapacity the desired minimum capacity
   * @throws OutOfMemoryError if {@code minCapacity < 0}.  This is
   * interpreted as a request for the unsatisfiably large capacity
   * {@code (long) Integer.MAX_VALUE + (minCapacity - Integer.MAX_VALUE)}.
   */
  ensureCapacity(minCapacity) {
    if (minCapacity - this.buf.length > 0)
      this.grow(minCapacity);
  }
  /**
   * Increases the capacity to ensure that it can hold at least the
   * number of elements specified by the minimum capacity argument.
   *
   * @param minCapacity the desired minimum capacity
   */
  grow(minCapacity) {
    let oldCapacity = this.buf.length;
    let newCapacity = oldCapacity << 1;
    if (newCapacity - minCapacity < 0)
      newCapacity = minCapacity;
    if (newCapacity < 0) {
      if (minCapacity < 0)
        throw new OutOfMemoryError();
      newCapacity = ZXingInteger.MAX_VALUE;
    }
    this.buf = ZXingArrays.copyOfUint8Array(this.buf, newCapacity);
  }
  /**
   * Writes the specified byte to this byte array output stream.
   *
   * @param   b   the byte to be written.
   */
  write(b) {
    this.ensureCapacity(this.count + 1);
    this.buf[this.count] = /*(byte)*/
    b;
    this.count += 1;
  }
  /**
   * Writes <code>len</code> bytes from the specified byte array
   * starting at offset <code>off</code> to this byte array output stream.
   *
   * @param   b     the data.
   * @param   off   the start offset in the data.
   * @param   len   the number of bytes to write.
   */
  writeBytesOffset(b, off, len) {
    if (off < 0 || off > b.length || len < 0 || off + len - b.length > 0) {
      throw new IndexOutOfBoundsException();
    }
    this.ensureCapacity(this.count + len);
    ZXingSystem.arraycopy(b, off, this.buf, this.count, len);
    this.count += len;
  }
  /**
   * Writes the complete contents of this byte array output stream to
   * the specified output stream argument, as if by calling the output
   * stream's write method using <code>out.write(buf, 0, count)</code>.
   *
   * @param      out   the output stream to which to write the data.
   * @exception  IOException  if an I/O error occurs.
   */
  writeTo(out) {
    out.writeBytesOffset(this.buf, 0, this.count);
  }
  /**
   * Resets the <code>count</code> field of this byte array output
   * stream to zero, so that all currently accumulated output in the
   * output stream is discarded. The output stream can be used again,
   * reusing the already allocated buffer space.
   *
   * @see     java.io.ByteArrayInputStream#count
   */
  reset() {
    this.count = 0;
  }
  /**
   * Creates a newly allocated byte array. Its size is the current
   * size of this output stream and the valid contents of the buffer
   * have been copied into it.
   *
   * @return  the current contents of this output stream, as a byte array.
   * @see     java.io.ByteArrayOutputStream#size()
   */
  toByteArray() {
    return ZXingArrays.copyOfUint8Array(this.buf, this.count);
  }
  /**
   * Returns the current size of the buffer.
   *
   * @return  the value of the <code>count</code> field, which is the number
   *          of valid bytes in this output stream.
   * @see     java.io.ByteArrayOutputStream#count
   */
  size() {
    return this.count;
  }
  toString(param) {
    if (!param) {
      return this.toString_void();
    }
    if (typeof param === "string") {
      return this.toString_string(param);
    }
    return this.toString_number(param);
  }
  /**
   * Converts the buffer's contents into a string decoding bytes using the
   * platform's default character set. The length of the new <tt>String</tt>
   * is a function of the character set, and hence may not be equal to the
   * size of the buffer.
   *
   * <p> This method always replaces malformed-input and unmappable-character
   * sequences with the default replacement string for the platform's
   * default character set. The {@linkplain java.nio.charset.CharsetDecoder}
   * class should be used when more control over the decoding process is
   * required.
   *
   * @return String decoded from the buffer's contents.
   * @since  JDK1.1
   */
  toString_void() {
    return new String(
      this.buf
      /*, 0, this.count*/
    ).toString();
  }
  /**
   * Converts the buffer's contents into a string by decoding the bytes using
   * the specified {@link java.nio.charset.Charset charsetName}. The length of
   * the new <tt>String</tt> is a function of the charset, and hence may not be
   * equal to the length of the byte array.
   *
   * <p> This method always replaces malformed-input and unmappable-character
   * sequences with this charset's default replacement string. The {@link
   * java.nio.charset.CharsetDecoder} class should be used when more control
   * over the decoding process is required.
   *
   * @param  charsetName  the name of a supported
   *              {@linkplain java.nio.charset.Charset </code>charset<code>}
   * @return String decoded from the buffer's contents.
   * @exception  UnsupportedEncodingException
   *             If the named charset is not supported
   * @since   JDK1.1
   */
  toString_string(charsetName) {
    return new String(
      this.buf
      /*, 0, this.count, charsetName*/
    ).toString();
  }
  /**
   * Creates a newly allocated string. Its size is the current size of
   * the output stream and the valid contents of the buffer have been
   * copied into it. Each character <i>c</i> in the resulting string is
   * constructed from the corresponding element <i>b</i> in the byte
   * array such that:
   * <blockquote><pre>
   *     c == (char)(((hibyte &amp; 0xff) &lt;&lt; 8) | (b &amp; 0xff))
   * </pre></blockquote>
   *
   * @deprecated This method does not properly convert bytes into characters.
   * As of JDK&nbsp;1.1, the preferred way to do this is via the
   * <code>toString(String enc)</code> method, which takes an encoding-name
   * argument, or the <code>toString()</code> method, which uses the
   * platform's default character encoding.
   *
   * @param      hibyte    the high byte of each resulting Unicode character.
   * @return     the current contents of the output stream, as a string.
   * @see        java.io.ByteArrayOutputStream#size()
   * @see        java.io.ByteArrayOutputStream#toString(String)
   * @see        java.io.ByteArrayOutputStream#toString()
   */
  // @Deprecated
  toString_number(hibyte) {
    return new String(
      this.buf
      /*, hibyte, 0, this.count*/
    ).toString();
  }
  /**
   * Closing a <tt>ByteArrayOutputStream</tt> has no effect. The methods in
   * this class can be called after the stream has been closed without
   * generating an <tt>IOException</tt>.
   * <p>
   *
   * @throws IOException
   */
  close() {
  }
}

export { ByteArrayOutputStream };
//# sourceMappingURL=ByteArrayOutputStream.js.map
//# sourceMappingURL=ByteArrayOutputStream.js.map