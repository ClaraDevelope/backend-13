const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

const createStorage = (folderName, fieldName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'webP','webp']
    }
  })
}

const upload = (storage, fieldName) => {
  return multer({ storage }).single(fieldName)
}

const uploadPerfil = upload(createStorage('profileImage', 'img'), 'img')
const uploadImagePost = upload(createStorage('postImage', 'img'), 'img')

module.exports = { uploadPerfil , uploadImagePost}
