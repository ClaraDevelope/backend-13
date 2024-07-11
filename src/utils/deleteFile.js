const cloudinary = require('cloudinary').v2;

const deleteImgCloudinary = (imgUrl) => {

  const regex = /\/v\d+\/(.*)\.(.*)$/;
  const match = imgUrl.match(regex);

  if (!match) {
    console.error('URL de imagen de Cloudinary no válida:', imgUrl);
    return;
  }

  const public_id = match[1]; 

  cloudinary.uploader.destroy(public_id, (error, result) => {
    if (error) {
      console.error('Error al eliminar la imagen de Cloudinary:', error);
    } else {
      console.log('Imagen eliminada de Cloudinary:', result);
    }
  });
};

module.exports = { deleteImgCloudinary };




