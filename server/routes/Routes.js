const express = require('express');
const router = express.Router();
const userController = require('../controllers/User');
const postController = require('../controllers/Posts');

router.post('/createUser' , userController.createNewUser);
router.get('/getUser/:id' , userController.readUser);
router.put('/updateUser/:id' , userController.updateUser);
router.delete('/deleteUser/:id' , userController.deleteUser);

router.post('/createPost/:user_id', postController.createPost);
router.get('/getAllPosts', postController.getAllPosts);
router.put('/updatePost/:id', postController.updatePostById);
router.delete('/deletePost/:id', postController.deletePostById);



module.exports = router ;




