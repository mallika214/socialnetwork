const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user'); // Assuming the User model is in the models folder

// Directory where profile images will be stored
const uploadDir = path.join(__dirname, '../uploads/user_images');

// Ensure the directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Directory to save user profile images
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
}).single('profile'); // Expecting 'profile' as the field name for the file in the form

// Controller to create a new user
exports.createNewUser = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading file', error: err.message });
        }

        const { username, email, password, bio } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            // Create the new user
            const newUser = new User({
                username,
                email,
                password, // Ensure to hash passwords in a real application!
                profile: req.file ? req.file.filename : '', // Save the file name for the profile image
                bio
            });

            // Save the user to the database
            await newUser.save();

            return res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    profile: newUser.profile,
                    bio: newUser.bio,
                    createdAt: newUser.createdAt
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    });
};




exports.readUser = async (req, res) => {
  try {
    // Destructure the id from req.params
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data if found
    return res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error reading user', error: error.message });
  }
};






// Controller to update a user by ID (including profile image)
exports.updateUser = (req, res) => {
  upload(req, res, async (err) => {
      if (err) {
          return res.status(400).json({ message: 'Error uploading file', error: err.message });
      }

      const { username, email, password, bio } = req.body;

      try {
          // Find the user by ID and update fields
          const {id} = req.params;
          const updatedUser = await User.findById(id);

          console.log(id);
          console.log(updatedUser);

          if (!updatedUser) {
              return res.status(404).json({ message: 'User not found' });
          }

          // Update user fields
          updatedUser.username = username || updatedUser.username;
          updatedUser.email = email || updatedUser.email;
          updatedUser.password = password || updatedUser.password; // You would hash password in a real app
          updatedUser.bio = bio || updatedUser.bio;

          // If a new profile image was uploaded, update it and remove the old one
          if (req.file) {
              const oldImagePath = path.join(uploadDir, updatedUser.profile);

              // Delete old image if it exists
              if (fs.existsSync(oldImagePath)) {
                  fs.unlinkSync(oldImagePath); // Delete the old profile image
              }

              // Update the profile image field with the new file name
              updatedUser.profile = req.file.filename;
          }

          // Save the updated user
          await updatedUser.save();

          return res.status(200).json({
              message: 'User updated successfully',
              user: {
                  id: updatedUser._id,
                  username: updatedUser.username,
                  email: updatedUser.email,
                  profile: updatedUser.profile,
                  bio: updatedUser.bio,
                  updatedAt: updatedUser.updatedAt
              }
          });
      } catch (error) {
          return res.status(500).json({ message: 'Error updating user', error: error.message });
      }
  });
};




// Controller to delete a user by ID (and remove the profile image from storage)
exports.deleteUser = async (req, res) => {
  try {
      // Find the user by ID
      const {id} = req.params;
      const userToDelete = await User.findById(id);

      if (!userToDelete) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Delete the profile image from the storage if it exists
      const imagePath = path.join(uploadDir, userToDelete.profile);
      if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Remove the image file from the storage
      }

      // Remove the user from the database
      await User.findByIdAndDelete(req.params.id);

      return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
      return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

exports.loginUser = async (req,res) => {
    try {

        const {email,password} = req.body;

        //validate inputs
        if(!email || !password){
            return res.status(400).json({message: 'Email and Password is required'})
        }

        const user = await user.findOne({email});
        if(!user){
            return res.status(401).json({message: 'Invalid Email and Password'})
        }

        if(user.password != password){
            return res.status(401).json({message: 'Invalid Email or Password'})
        }

        res.status(200).json({
            message: 'user login is successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio
            }
        }) ;

    }//end of try 
    catch(error){
        //handle server errors
        console.error('Login error:',error);
        res.status(500).json({
            message:'An error occured during login',
            error: error.message

        });
    }

};

exports.changePassword = async (req,res) => {
    try{
        const {id} = req.params;
        const {oldpassword,newpassword} = req.body ;

        if(!oldpassword || !newpassword){
            req.status(401).json({message: 'Please enter old and new password'});
        }

        const {user} = User.findById(id) ;

        if(!user){
            req.status(404).json({message: 'user not found'});
        }
        if(user.password === oldpassword){
            req.status(400).json({message: 'Password is incorrect'});
        }
         
        user.password = newpassword;
        await user.save();
        req.status(200).json({message: 'Password updated successfully'});
    }
    catch(error){
        res.status(500).json({
            message: 'An error occurred',
            error: error.message 
        });
    }
};