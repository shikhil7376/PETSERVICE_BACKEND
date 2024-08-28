import UserModel from "../database/userModel";
import UserRepo from "../../useCase/interface/userRepo";
import OtpModel from "../database/otpModel";
import { User } from "../../domain/user";
import Otp from "../../domain/otp";
import { OtpDetails } from "../../domain/user";

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

  async getProfile(id: string): Promise<User | null> {
    const data = await UserModel.findOne({ _id: id });
    return data;
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
}

export default UserRepository;
