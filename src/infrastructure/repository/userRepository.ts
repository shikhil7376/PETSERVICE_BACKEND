import UserModel from "../database/userModel";
import UserRepo from "../../useCase/interface/userRepo";
import OtpModel from "../database/otpModel";
import { Post, User, UserNotFollow } from "../../domain/user";
import Otp from "../../domain/otp";
import { OtpDetails } from "../../domain/user";
import { dogPost, postdetails } from "../../domain/dogPost";
import DogPost from "../database/dogPostModel";
import errorHandle from "../middleware/errorHandle";
import mongoose, { Types } from 'mongoose';
import { commentDetails, getComments } from "../../domain/Comment";
import CommentModel from "../database/commentModel";

 

class UserRepository implements UserRepo {
  async findByEmail(email: string): Promise<User | null> {
    const userData = await UserModel.findOne({ email: email });
    return userData;
  }
  async saveOtp(data: OtpDetails): Promise<Otp> {
    const otpDoc = new OtpModel({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      otp: data.otp,
      role: "user",
      otpGeneratedAt: new Date(),
    });
    const savedDoc = await otpDoc.save();
    return savedDoc as Otp;
  }

  async saveKennelOtp(data: OtpDetails): Promise<Otp> {
    const otpDoc = new OtpModel({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      otp: data.otp,
      role: "kennelOwner",
      otpGeneratedAt: new Date(),
    });
    const savedDoc = await otpDoc.save();
    return savedDoc as Otp;
  }

  async findOtpByEmail(email: string): Promise<Otp | null> {
    const otpDoc = await OtpModel.findOne({ email, role: "user" })
      .sort({ otpGeneratedAt: -1 })
      .exec();
    return otpDoc as Otp;
  }
  async findKennelOtpByEmail(email: string): Promise<Otp | null> {
    const otpDoc = await OtpModel.findOne({ email, role: "kennelOwner" }).sort({
      otpGeneratedAt: -1,
    });
    return otpDoc as Otp;
  }
  async deleteOtpByEmail(email: string): Promise<void> {
    console.log('user otp delter');
    
   await OtpModel.deleteMany({ email, role: "user" });
  }
  async deleteKennelOtpByEmail(email: string): Promise<void> {
    console.log('delete otp');
    
   await OtpModel.deleteMany({ email, role: "kennelOwner" });
  }
  async save(user: User): Promise<User> {
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();
    return savedUser;
  }

  async changePassword(email: string, password: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      {
        email: email,
      },
      { $set: { password: password } }
    );
    return result.modifiedCount > 0;
  }

  async  getProfile(id: string): Promise<User | null> {
    const data = await UserModel.findOne({ _id: id })
    return data
  }

  async getUserPost(id: string): Promise<Post[] | null> {
      try {
        if (id) {
          const posts = await DogPost.aggregate([
              {
                  $match: { user: new mongoose.Types.ObjectId(id) }
              },
              {
                  $lookup: {
                      from: 'users',
                      localField: 'user',
                      foreignField: '_id',
                      as: 'userDetails'
                  }
              },
              {
                  $unwind: '$userDetails'
              },
              {
                  $project: {
                      _id: 1,
                      images: '$image',
                      description: 1,
                      likeCount: { $size: "$likes" },
                      commentCount: { $size: "$comments" },
                      likes: 1,
                      "userDetails._id": 1,
                      "userDetails.name": 1,
                      "userDetails.email": 1,
                      "userDetails.image": 1,
                      "userDetails.followers": 1,
                  }
              }
          ]);

          return posts.map(post => ({
              id: post._id.toString(),
              images: post.images,
              description: post.description,
              likeCount: post.likeCount,
              commentCount: post.commentCount,
              likes: post.likes,
              user: {
                  userid: post.userDetails._id.toString(),
                  name: post.userDetails.name,
                  email: post.userDetails.email,
                  image: post.userDetails.image,
                  followers: post.userDetails.followers,
              }
          }));
      } else {
          return null;
      }
      } catch (error) {
        throw new Error(error as string)
      }
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById({ _id: id });
    return user;
  }

  async updateProfile(id: string, data: User): Promise<User | null> {
    const updatedProfile = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updatedProfile;
  }
   async addPost(data: postdetails): Promise<boolean> {
      try {
        const newPost = new DogPost({
          user:data.id,
          description:data.description,
          image:data.image,
        })
        await newPost.save()
        return true
      } catch (error) {
        throw new Error(error as string)
      }  
   }
   async getAllPost(): Promise<postdetails[]> {
       try {
            const posts = await DogPost.aggregate([
              {
                $lookup:{
                  from:'users',
                  localField:'user',
                  foreignField:"_id",
                  as:'userDetails'
                }
              },
              {
                $unwind:'$userDetails'
              },
              {
                $project:{
                  _id:1,
                  images:'$image',
                  description: 1,
                  likeCount: { $size: "$likes" },
                  commentCount: { $size: "$comments" }, 
                  likes:1,
                  createdAt: 1, 
                  "userDetails._id": 1,
                  "userDetails.name": 1,
                  "userDetails.email": 1,
                  "userDetails.image": 1,
                  "userDetails.followers": 1,
                  
                }
              },
              {
                $sort:{
                  createdAt: -1
                }
              }
            ])
            return posts.map(post => ({
              id: post._id.toString(),
              images: post.images,
              description: post.description,
              likeCount: post.likeCount,
              commentCount: post.commentCount,
              likes: post.likes, 
              createdAt: post.createdAt,
              user: {
                userid:post.userDetails._id.toString(),
                name: post.userDetails.name,
                email: post.userDetails.email,
                image: post.userDetails.image,
                followers: post.userDetails.followers,
              }
            }));

       } catch (error) {
         throw new Error(error as string)
         return []
       }
   }
  async likePost(userId: string, postId: string): Promise<boolean> {
       try {
           const post = await DogPost.findById(postId)
           if(!post) throw new Error("Post not found")
            const userObjectId = new Types.ObjectId(userId);
            const hasLiked = post.likes.includes(userObjectId)
            if (hasLiked) {
              post.likes = post.likes.filter(id => !id.equals(userObjectId));
          } else {
              post.likes.push(userObjectId);
          }
          await post.save();
          return true
       } catch (error) {
         throw new Error(error as string)
       }
   }
   async commentPost(data: commentDetails): Promise<boolean> {
      const {userId,postId,comment} = data
      const userObjectId = new Types.ObjectId(userId);
      const postObjectId = new Types.ObjectId(postId);
      try {   
        const newComment = new CommentModel({
          user:userObjectId,
          post:postObjectId,
          text:comment
        })        
        const savedComment = await newComment.save();
         return true
      } catch (error) {
        throw new Error(error as string)
      }
   }

   async getAllComments(postId: string): Promise<getComments[]> {
    try {
      const comments = await CommentModel.aggregate([
          {
              $match: { post: new mongoose.Types.ObjectId(postId) }  
          },
          {
              $lookup: {
                  from: 'users',  
                  localField: 'user',
                  foreignField: '_id',
                  as: 'userDetails'
              }
          },
          {
              $unwind: '$userDetails' 
          },
          {
              $project: {
                  _id: 1,
                  text: 1,
                  createdAt: 1,
                  'user.name': '$userDetails.name',
                  'user.email': '$userDetails.email',
                  'user.image': '$userDetails.image'
              }
          }
      ]).exec();

      const typedComments = comments.map(comment => ({
          _id: comment._id.toString(),
          text: comment.text,
          createdAt: comment.createdAt,
          user: {
              name: comment.user.name,
              email: comment.user.email,
              image: comment.user.image,
          }
      })) as getComments[];

      return typedComments;
  } catch (error) {
      throw new Error(error as string);
  }
   }

   async follow(userId: string, targetId: string): Promise<boolean> {
      try {
        if(userId ==targetId){
          return false
        }
        const user = await UserModel.findById(userId);
        const targetUser = await UserModel.findById(targetId);

        if (!user || !targetUser) {
          return false
      }
      const targetObjectId = new Types.ObjectId(targetId);
      const userObjectId = new Types.ObjectId(userId);
      const isFollowing = user.following.includes(targetObjectId);

      if(isFollowing){
        user.following = user.following.filter(
          (id: Types.ObjectId) => !id.equals(targetObjectId)
        );
        targetUser.followers = targetUser.followers.filter(
          (id: Types.ObjectId) => !id.equals(user._id)
        );
        await user.save()
        await targetUser.save()
        return true
      } else{
        user.following.push(targetObjectId)
        targetUser.followers.push(userObjectId);
        await user.save()
        await targetUser.save()
        return true
      }
      } catch (error) {
        throw new Error(error as string);
        
      }
   }
   async userNotFollow(userId: string): Promise<UserNotFollow[]> {
     try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const currentUser = await UserModel.findById(userObjectId).select('followers following');
      if (!currentUser) {
        throw new Error("User not found");
    }

    const excludeIds = [...currentUser.followers, ...currentUser.following, userObjectId];

    const usersNotInFollowersOrFollowing = await UserModel.find({
      _id: { $nin: excludeIds }, 
      isAdmin: false 
  })
      .select('_id name image') 
      .limit(4) 
      .lean<UserNotFollow[]>(); 

      return usersNotInFollowersOrFollowing.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        image: user.image,
    }));
     } catch (error) {
      throw new Error(error as string);
     }
   }

    async allUsers(userId: string, keyword: string): Promise<User[]|[]> {
         const words = keyword
         ?{
          $or:[
            {name:{$regex:keyword,$options:'i'}},
            {email:{$regex:keyword,$options:'i'}},

          ]
         }:{}
         const users = await UserModel.find(words).find({_id:{$ne:userId},isAdmin:false}).select('-password')
         return users
    }

    async getPostById(id: string): Promise<dogPost|null> {
      try {
        if(id){
          const post = await DogPost.findById(id)
          return post
        }else{
          return null
        }
      } catch (error) {
        console.error('Error fetching post:', error); 
        return null;
      }
    }

    async updatePost(postId: string, updatedPost: dogPost): Promise<void> {
      try {
         const updatedData = await DogPost.findByIdAndUpdate(postId,updatedPost,{new:true})
      } catch (error) {
        console.error('Error updating post:', error);
        throw new Error('Failed to update post');
      }
    }
   async getPostDetailsById(postId: string): Promise<Post | null> {
     try {
      const postAggregation = await DogPost.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(postId) } // Match the post by ID
        },
        {
          $lookup: {
            from: 'users', // Join the users collection
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails' // Flatten the userDetails array
        },
        {
          $project: {
            _id: 1,
            images: '$image',
            description: 1,
            likeCount: { $size: '$likes' }, // Count likes
            commentCount: { $size: '$comments' }, // Count comments
            likes: 1,
            'userDetails._id': 1,
            'userDetails.name': 1,
            'userDetails.email': 1,
            'userDetails.image': 1,
            'userDetails.followers': 1 // Include user followers if available
          }
        }
      ]);
  
      // If no post is found, return null
      if (!postAggregation || postAggregation.length === 0) {
        return null;
      }
  
      const post = postAggregation[0]; // Get the first result
  
      // Return the formatted post details
      return {
        id: post._id.toString(),
        images: post.images,
        description: post.description,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        likes: post.likes?.map((like: any) => like.toString()), // Convert ObjectIds to strings
        user: {
          userid: post.userDetails._id.toString(),
          name: post.userDetails.name,
          email: post.userDetails.email,
          image: post.userDetails.image,
          followers: post.userDetails.followers, // Assuming followers is available
        }
      };
     } catch (error) {
      console.error('Error fetching post details:', error);
      throw new Error('Failed to fetch post details');
     }
   } 

   async deletePost(postId: string): Promise<boolean> {
      try {
         if(postId){
           const deletePost = await DogPost.findByIdAndDelete(postId)
           return true
         }
         return false
      } catch (error) {
        throw new Error('Failed to fetch post details');
      }
   }

   async getFollowers(userId: string): Promise<User[] | []> {
    try {
      const result = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } }, 
        {
          $lookup: {
            from: 'users', 
            localField: 'followers', 
            foreignField: '_id', 
            as: 'followers', 
          },
        },
        {
          $project: {
            _id: 0, 
            followers: {
              name: 1,
              email: 1,
              image: 1, 
            },
          },
        },
      ]);
  
      if (result.length === 0) {
        return []; 
      }
      return result[0].followers as User[];
    } catch (error) {
      throw new Error('Failed to fetch followers');
    }
  }

  async getFollowing(userId: string): Promise<User[] | []> {
    try {
      const result = await UserModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } }, 
        {
          $lookup: {
            from: 'users', 
            localField: 'following', 
            foreignField: '_id', 
            as: 'following', 
          },
        },
        {
          $project: {
            _id: 0, 
            following: {
              name: 1,
              email: 1,
              image: 1, 
            },
          },
        },
      ]);
  
      if (result.length === 0) {
        return []; 
      }
  
      return result[0].following as User[];
    } catch (error) {
      throw new Error('Failed to fetch following users');
    }
  }
}

export default UserRepository;
