/*
Name: stream.js
Description: This file is used to read the bytes from the color swatch file. 
 */

Stream = function(str) {
  var self = this;
  self.str = (str ? str : []); // the actual bytes
  self.ptr = 0;                // the current index into the stream
};
Stream.prototype.typename = "Stream";
Stream.EOF = -1;

/**
 * Open color swatch file (.aco) and read its content.
 * @param fptr {Object} File pointer.
 * @returns str {String} Content of files.
 */
Stream.readFromFile = function(fptr) {
  var file = fptr;
  file.open("r");
  file.encoding = 'BINARY';
  var str = '';
  str = file.read(file.length);
  file.close();
  return str;
};

/**
 * Call the function to read the file after creating 
 * a stream class object.
 * @param fptr {Object} File pointer.
 * @returns stream {Object} Stram class object.
 */
Stream.readStream = function(fptr) {
  var stream = new Stream();
  stream.str = Stream.readFromFile(fptr);
  return stream;
};

/**
 * Tell about the end of file reached or not.
 * @returns true or false.
 */
Stream.prototype.eof = function() {
  return this.ptr == this.str.length;
};

/**
 * Read the byte of the .aco file.
 */
Stream.prototype.readByte = function() {
  var self = this;
  if (self.ptr >= self.str.length) {
    return Stream.EOF;
  }
  var c = self.str.charCodeAt(self.ptr++);
  return c;
};

/**
 * Convert bytes into char of the .aco file.
 */
Stream.prototype.readInt16 = function() {
  var self = this;
  var hi = self.readByte();
  var lo = self.readByte();
  return (hi << 8) + lo;
};

/**
 * Read words from .aco file.
 */
Stream.prototype.readWord = function() {
  var self = this;
  var hi = self.readInt16();
  var lo = self.readInt16();
  return (hi << 16) + lo;
};

/**
 * Retrieve color swatches name from .aco file.
 */
Stream.prototype.readUnicode = function(readPad) {
  var self = this;

  var len = self.readWord();
  if (readPad != false) {
    len--;
  }
  var s = '';
  for (var i = 0; i < len; i++) {
    var uc = self.readInt16();
    if (uc != 0) {
      s += String.fromCharCode(uc);
    }
  }
  if (readPad != false) {
    self.readInt16();
  }
  return s;
};
