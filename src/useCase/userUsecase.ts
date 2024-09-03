import UserRepository from "../infrastructure/repository/userRepository";
import EncryptPassword from "../infrastructure/services/bcryptPassword";
import GenerateOtp from "../infrastructure/services/generateOtp";
import EmailService from "../infrastructure/services/emailService";
import JWTTOKEN from "../infrastructure/services/generateToken";
import Cloudinary from "../infrastructure/services/cloudinary";
import { User } from "../domain/user";
import { UserDetails } from "../domain/user";
import { postdetails } from "../domain/dogPost";
import { commentDetails } from "../domain/Comment";

class UserUseCase {
  private UserRepository;
  private EncryptPassword;
  private JwtToken;
  private generateOtp;
  private generateEmail;
  private Cloudinary;

  constructor(
    UserRepository: UserRepository,
    encryptPassword: EncryptPassword,
    jwtToken: JWTTOKEN,
    genrateOtp: GenerateOtp,
    generateEmail: EmailService,
    cloudinary: Cloudinary
  ) {
    this.UserRepository = UserRepository;
    this.EncryptPassword = encryptPassword;
    this.JwtToken = jwtToken;
    this.generateOtp = genrateOtp;
    this.generateEmail = generateEmail;
    this.Cloudinary = cloudinary;
  }

  async checkExist(email: string) {
    const userExist = await this.UserRepository.findByEmail(email);
    const data = {
      _id: userExist?._id,
      name: userExist?.name,
      email: userExist?.email,
      phone: userExist?.phone,
      isAdmin: userExist?.isAdmin,
      isBlocked: userExist?.isBlocked,
    };

    if (userExist) {
      return {
        status: 400,
        data: {
          status: false,
          message: "User already exists",
          details: data,
        },
      };
    } else {
      return {
        status: 200,
        data: {
          status: true,
          message: "User does not exist",
        },
      };
    }
  }

  async signup(data:UserDetails) {
    const { name, email, password, phone } = data;
    const otp = this.generateOtp.createOtp();
    const hashedPassword = await this.EncryptPassword.encryptPassword(password);
    const details = { name, email,  password: hashedPassword, phone, otp };
    await this.UserRepository.saveOtp(details);
    this.generateEmail.sendOtp(email, otp);

    return {
      status: 200,
      data: {
        status: true,
        message: "verification otp sent to your email",
      },
    };
  }

  async verifyOtp(email: string, otp: number) {
    const otpRecord = await this.UserRepository.findOtpByEmail(email);
    if (!otpRecord) {
      return { status: 400, message: "invalid or expired OTP" };
    }
    let data: { name: string; email: string; password: string; phone: string } = 
      {
        name: otpRecord?.name,
        email: otpRecord?.email,
        password: otpRecord?.password,
        phone: otpRecord?.phone,
      };
 
    const now = new Date().getTime();
    const otpGeneratedAt = new Date(otpRecord.otpGeneratedAt).getTime();
    const otpExpiration = 2 * 60 * 1000;
    if (now - otpGeneratedAt > otpExpiration) {
      await this.UserRepository.deleteOtpByEmail(email);
      return { status: 400, message: "OTP has expired" };
    }
    if (otpRecord.otp !== otp) {
      return { status: 400, message: "Invalid OTP" };
    }
    await this.UserRepository.deleteOtpByEmail(email);
    return { status: 200, message: "OTP verified succesfully", data: data };
  }

  async verifyOtpUser(user: any) {
    if (user?.isGoogle) {
      const hashedPassword = await this.EncryptPassword.encryptPassword(
        user.password
      );
      const newUser = { ...user, password: hashedPassword };
      const userData = await this.UserRepository.save(newUser);
      let data = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        isBlocked: userData.isBlocked,
      };
      const token = this.JwtToken.generateToken(userData._id, "user");

      return {
        status: 200,
        data: data,
        token,
      };
    }

    const newUser = { ...user };
    const userData = await this.UserRepository.save(newUser);
    let data = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      isBlocked: userData.isBlocked,
    };
    const token = this.JwtToken.generateToken(userData._id, "user");
    return {
      status: 200,
      data: data,
      message: "otp verified successfully",
      token,
    };
  }

  async resendOtp(data:UserDetails) {
    const otp = this.generateOtp.createOtp();
    const hashedPassword = await this.EncryptPassword.encryptPassword(data.password);
    const details = {name:data.name,email:data.email,password: hashedPassword, phone:data.phone, otp };
    await this.UserRepository.saveOtp(details);
    this.generateEmail.sendOtp(data.email, otp);
    return {
      status: 200,
      data: {
        status: true,
        message: "verification otp has been sent to the email",
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.UserRepository.findByEmail(email);
    
    let token = "";
    if (user) {
      let data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isBlocked: user.isBlocked,
      };
      if (user.isBlocked) {
        return {
          status: 400,
          data: {
            status: false,
            message: "you have been blocked by admin",
            token: "",
          },
        };
      }
      const passwordMatch = await this.EncryptPassword.compare(
        password,
        user.password
      );
      if (passwordMatch && user.isAdmin) {
        token = this.JwtToken.generateToken(user._id, "admin");
        return {
          status: 200,
          data: {
            status: true,
            message: data,
            token,
            isAdmin: true,
          },
        };
      }
      if (passwordMatch) {
        token = this.JwtToken.generateToken(user._id, "user");
        return {
          status: 200,
          data: {
            status: true,
            message: data,
            token,
          },
        };
      } else {
        return {
          status: 400,
          data: {
            status: false,
            message: "invalid email or password",
            token: "",
          },
        };
      }
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "Invalid email or password",
          token: "",
        },
      };
    }
  }

  async forgotPassword(email: string) {
    const Response = await this.UserRepository.findByEmail(email);
    if (Response) {
      const otp = this.generateOtp.createOtp();
      const { name, email: userEmail, password, phone } = Response;
      const details = { name, email,  password, phone, otp };
      await this.UserRepository.saveOtp(details);
      this.generateEmail.sendOtp(email, otp);
    }

    if (Response) {
      return {
        status: 200,
        data: {
          status: false,
          message: "valid email",
        },
      };
    } else {
      return {
        status: 400,
        data: {
          status: false,
          message: "invalid email",
        },
      };
    }
  }

  async forgotResendOtp(email: string) {
    const userdata = await this.UserRepository.findByEmail(email);
    if (userdata) {
      const otp = this.generateOtp.createOtp();
      const { name, email, password, phone } = userdata;
      const details = { name, email,  password, phone, otp };
      await this.UserRepository.saveOtp(details);
    }
    return {
      status: 200,
      data: {
        status: true,
        message: "verification otp has been send to your email",
      },
    };
  }

  async resetPassword(email: string, password: string) {
    const hashedPassword = await this.EncryptPassword.encryptPassword(password);
    const changedPassword = await this.UserRepository.changePassword(
      email,
      hashedPassword
    );

    if (changedPassword) {
      return {
        status: 200,
        message: "Password changed successfully",
      };
    } else {
      return {
        status: 400,
        message: "Failed please try again!",
      };
    }
  }

  async checkgoogleExist(email: string) {
    const verifyuser = await this.UserRepository.findByEmail(email);
    let token = "";
    if (verifyuser) {
      let data = {
        _id: verifyuser._id,
        name: verifyuser.name,
        email: verifyuser.email,
        phone: verifyuser.phone,
        isBlocked: verifyuser.isBlocked,
      };
      if (verifyuser.isBlocked) {
        return {
          status: 400,
          data: {
            status: false,
            message: "you have been blocked by admin",
            token: "",
          },
        };
      }
      token = this.JwtToken.generateToken(verifyuser._id, "user");
      return {
        status: 200,
        data: {
          status: true,
          message: data,
          token,
        },
      };
    }
  }

  async getProfile(id: string) {
    const profileData = await this.UserRepository.getProfile(id);
    let data = {
      _id: profileData?._id,
      name: profileData?.name,
      email: profileData?.email,
      phone: profileData?.phone,
      isBlocked: profileData?.isBlocked,
      image: profileData?.image,
    };
    if (profileData) {
      return {
        status: 200,
        data: {
          status: true,
          message: data,
        },
      };
    } else {
      return {
        status: 400,
        message: "failed to get data",
      };
    }
  }

  async findById(Id: string) {
    const owner = await this.UserRepository.findById(Id);
    if (owner) {
      return {
        data: owner,
      };
    } else {
      return {
        status: 400,
        message: "owner not found",
      };
    }
  }

  async editProfile(id: string, data: any, filePath: string) {
    let finalImage;
    if (filePath) {
      const newImagePath = await this.Cloudinary.uploadImage(filePath, "user");
      finalImage = newImagePath;
    }
    data.image = finalImage;
    const updateOwner = await this.UserRepository.updateProfile(id, data);
    if (updateOwner) {
      return {
        status: 200,
        message: "profile updated succesfully",
      };
    } else {
      return {
        status: 400,
        message: "failed to update profile",
      };
    }
  }

  async addUserPost(data:postdetails,filepath: string[]){
     const imageUrls = await this.Cloudinary.uploadMultipleimages(
      filepath,
      "userpost"
    );
    data.image = imageUrls;
    const response = await this.UserRepository.addPost(data)
     if(response){
      return {
        status:200,
         data:{
          message:"post added succesfully"
         }
      }
     }else{
        return{
          status:400,
          data:{
              message:'failed to add post'
          }
        }
     }
  }
  async getAllPosts(){
    const response = await this.UserRepository.getAllPost()

    if(response){
      return{
        status:200,
        data:{
          data:response,
          message:'fetch all posts succesfully'
        }
      }
    }else{
      return{
        status:400,
        data:{
          message:'failed to fetch all posts'
        }
      }
    }
  }

  async likePost(userId:string,postId:string){
    const response = await this.UserRepository.likePost(userId,postId)
    if(response){
      return{
        status:200,
        data:{
          message:'post liked succesfully'
        }
      }
    }else{
      return{
        status:400,
        data:{
          message:'failed to like post'
        }
      }
    }

  }

  async commentPost(data:commentDetails){
    
    
   const response = await this.UserRepository.commentPost(data)
   if(response){
    return {
      status:200,
      data:{
        message:'comment added succesfully'
      }
    }
   }else{
      return{
        status:400,
        data:{
          message:'failed to add comment'
        }
      }
   }
  }

  async getAllComments(postId:string){
    const response = await this.UserRepository.getAllComments(postId)
    if(response){
      return{
        status:200,
        data:{
          message:'fetch all comments succesfully',
          data:response
        }
      }
    }else{
      return{
        status:400,
        data:{
          message:'failed to fetch all comments'
        }
      }
    }
  }

async follow(userId:string,targetId:string){
   const response = await this.UserRepository.follow(userId,targetId)
   if(response){
    return{
      status:200,
      data:{
        message:'user followed/unfollowed succesfully'
      }
    }
   }else{
     return{
      status:200,
      data:{
        message:'failed to follow/unfollow user'
      }
     }
   }
}

async userNotFollow(userId:string){
  const response = await this.UserRepository.userNotFollow(userId)
  console.log(response);
  
  if (response && response.length > 0) {
    return {
      status: 200,
      data: response.map(user => ({
        _id: user._id,
        name: user.name,
        image: user.image
      }))
    };
  } else {
    return {
      status: 200,
      data: [] 
    };
  }
  
}

}

export default UserUseCase;
