const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directory for post images (if you want to handle post images)
const uploadDir = path.join(__dirname, '../uploads/post_images');

// Ensure the directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Directory to save post images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
    }
}).single('image'); // Optional: Expecting 'image' as the field name for post images



const Post = require('../models/posts'); // Assuming Post model is in the models folder

// Controller to create a new post
exports.createPost = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading file', error: err.message });
        }

        const { title, body, status } = req.body;
        const { user_id } = req.params; // Get user_id from URL params

        // Validate required fields
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        try {
            // Create the new post
            const newPost = new Post({
                title,
                body,
                user_id, // Associate post with user
                status: status || 'draft',
                image: req.file ? req.file.filename : '', // Save the file name for the image if uploaded
            });

            // Save the post to the database
            await newPost.save();

            return res.status(201).json({
                message: 'Post created successfully',
                post: {
                    id: newPost._id,
                    title: newPost.title,
                    body: newPost.body,
                    user_id: newPost.user_id,
                    status: newPost.status,
                    image: newPost.image,
                    like_count: newPost.like_count,
                    created_at: newPost.created_at,
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error creating post', error: error.message });
        }
    });
};
