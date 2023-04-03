const InvariantError = require('../../exceptions/InvariantError');
const { ImageHeadersSchema, ImageSizeSchema } = require('./schema');
 
const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);
 
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateImageSize: (size) => {    
    const validationResult = ImageSizeSchema.validate(size);
 
    if (validationResult.error) {
      throw new InvariantError('Ukuran file terlalu besar. Max 512 KB!', 413);
    }
  }
};
 
module.exports = UploadsValidator;