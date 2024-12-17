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

        const { title, body } = req.body;
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
                image: req.file ? req.file.filename : '', // Save the file name for the image if uploaded
            });

            // Save the post to the database
            await newPost.save();

            const imageUrl = req.file ? `/uploads/post_images/${req.file.filename}` : ''; // Construct the URL for the image

            return res.status(201).json({
                message: 'Post created successfully',
                post: {
                    id: newPost._id,
                    title: newPost.title,
                    body: newPost.body,
                    user_id: newPost.user_id,
                    image: imageUrl, // Return the image URL
                    like_count: newPost.like_count,
                    created_at: newPost.created_at,
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error creating post', error: error.message });
        }
    });
};




// Controller to get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('user_id'); // Populate user info if needed

        if (!posts.length) {
            return res.status(404).json({ message: 'No posts found' });
        }

        // Format image URL for each post
        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            body: post.body,
            user_id: post.user_id, // Assuming user information is needed
            image: post.image ? `/uploads/post_images/${post.image}` : '',
            like_count: post.like_count,
            created_at: post.created_at,
            status: post.status,
            comments: post.comment
        }));

        return res.status(200).json({
            message: 'Posts retrieved successfully',
            posts: formattedPosts
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};






// Controller to get posts by user ID
exports.getPostsByUserId = async (req, res) => {
    const { user_id } = req.params; // Get user_id from URL params

    try {
        const posts = await Post.find({ user_id }).populate('user_id'); // Find posts by user_id

        if (!posts.length) {
            return res.status(404).json({ message: `No posts found for user ${user_id}` });
        }

        // Format image URL for each post
        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            body: post.body,
            user_id: post.user_id, // Assuming user information is needed
            image: post.image ? `/uploads/post_images/${post.image}` : '',
            like_count: post.like_count,
            created_at: post.created_at,
            status: post.status,
            comments: post.comment
        }));

        return res.status(200).json({
            message: 'Posts retrieved successfully for user',
            posts: formattedPosts
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};




// Controller to update a post by ID
exports.updatePostById = (req, res) => {
    const { id } = req.params; // Get post ID from URL params

    // Use Multer to handle image upload if present
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading file', error: err.message });
        }

        const { title, body, status } = req.body;

        // Validate required fields
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        try {
            // Find the post by ID and update it
            const updatedPost = await Post.findByIdAndUpdate(
                id,
                {
                    title,
                    body,
                    status: status || 'draft', // If status is provided, update it, else default to 'draft'
                    image: req.file ? req.file.filename : undefined, // If a new image is uploaded, update it
                },
                { new: true } // Return the updated document
            );

            if (!updatedPost) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const imageUrl = updatedPost.image ? `/uploads/post_images/${updatedPost.image}` : '';

            return res.status(200).json({
                message: 'Post updated successfully',
                post: {
                    id: updatedPost._id,
                    title: updatedPost.title,
                    body: updatedPost.body,
                    status: updatedPost.status,
                    image: imageUrl,
                    like_count: updatedPost.like_count,
                    created_at: updatedPost.created_at,
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error updating post', error: error.message });
        }
    });
};




// Controller to delete a post by ID
exports.deletePostById = async (req, res) => {
    const { id } = req.params; // Get post ID from URL params

    try {
        // Find the post by ID and remove it
        const post = await Post.findByIdAndDelete(id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // If the post had an image, delete the image file from the server
        if (post.image) {
            const imagePath = path.join(__dirname, '../uploads/post_images', post.image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                }
            });
        }

        return res.status(200).json({
            message: 'Post deleted successfully',
            post: {
                id: post._id,
                title: post.title,
                body: post.body,
                user_id: post.user_id,
                image: post.image,
                like_count: post.like_count,
                created_at: post.created_at,
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};
