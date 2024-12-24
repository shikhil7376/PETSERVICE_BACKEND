import adminRepo from "../../useCase/interface/adminRepo";
import UserModel from "../database/userModel";
import KennelOwnerModel from "../database/kennelOwnerModel";
import VerifiedKennelOwnerModel from "../database/VerifiedKennelownerModel";
import Booking from "../database/bookingModel";
import approve from "../../domain/approve";
import {
  searchAndPagination,
  kennelSearchAndPagination,
} from "../../utils/reuse";
import { AdminDashboardData } from "../../domain/Booking";
import { ReportedPost, reportPost } from "../../domain/reportPost";
import ReportModel from "../database/reportModel";
import DogPost from "../database/dogPostModel";

class adminRepository implements adminRepo {
  async getUsers(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ users: {}[]; total: number }> {
    const { query, skip } = searchAndPagination(searchTerm, page, limit);

    const users = await UserModel.find(query)
      .skip(skip)
      .limit(limit)
      .lean()
      .select("-password");

    const total = await UserModel.countDocuments(query);
    return { users, total };
  }
  async blockUser(userId: string): Promise<boolean> {
    let result = await UserModel.updateOne(
      { _id: userId },
      { $set: { isBlocked: true } }
    );
    return result.modifiedCount > 0;
  }
  async unBlockUser(userId: string): Promise<boolean> {
    let result = await UserModel.updateOne(
      { _id: userId },
      { $set: { isBlocked: false } }
    );
    return result.modifiedCount > 0;
  }
  async getkennelRequest(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ users: {}[]; total: number }> {
    const { query, skip } = kennelSearchAndPagination(searchTerm, page, limit);

    const users = await KennelOwnerModel.find(query)
      .skip(skip)
      .limit(limit)
      .lean()
      .select("-password");
    const total = await KennelOwnerModel.countDocuments(query);
    return { users, total };
  }

  async getVerifiedKennelOwner(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ users: {}[]; total: number }> {
    const { query, skip } = kennelSearchAndPagination(searchTerm, page, limit);
    const users = await VerifiedKennelOwnerModel.find(query)
      .skip(skip)
      .limit(limit)
      .lean()
      .select("-password");
    const total = await VerifiedKennelOwnerModel.countDocuments(query);
    return { users, total };
  }

  async approveKennelRequest(reqId: string): Promise<approve | boolean> {
    let data = await KennelOwnerModel.findOne({ _id: reqId });
    if (data) {
      let exist = await VerifiedKennelOwnerModel.findOne({ _id: reqId });
      if (exist) {
        return false;
      }
      let approve = await KennelOwnerModel.deleteOne({ _id: reqId });
      const details = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      };
      return details;
    }
    return false;
  }

  async rejectKennelRequest(
    reqId: string
  ): Promise<{ status: boolean; email: string }> {
    let data = await KennelOwnerModel.findOne({ _id: reqId });
    if (data) {
      let reject = await KennelOwnerModel.deleteOne({ _id: reqId });
      return {
        status: true,
        email: data.email,
      };
    }
    return {
      status: false,
      email: "",
    };
  }
  async blockKennelOwner(reqId: string): Promise<boolean> {
    const block = await VerifiedKennelOwnerModel.updateOne(
      { _id: reqId },
      { $set: { isBlocked: true } }
    );
    return block.modifiedCount > 0;
  }

  async UnblockKennelOwner(reqId: string): Promise<boolean> {
    const unblock = await VerifiedKennelOwnerModel.updateMany(
      { _id: reqId },
      { $set: { isBlocked: false } }
    );
    return unblock.modifiedCount > 0;
  }

   async getAdminDashboardData(): Promise<AdminDashboardData> {
    // Calculate Daily Profit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyProfitResult = await Booking.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalProfit: { $sum: "$adminCommission" } } }
    ]);
    const dailyProfit = dailyProfitResult[0]?.totalProfit || 0;

    // Calculate Monthly Profit
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyProfitResult = await Booking.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalProfit: { $sum: "$adminCommission" } } }
    ]);
    const monthlyProfit = monthlyProfitResult[0]?.totalProfit || 0;

    // Calculate Daily Bookings
    const dailyBookings = await Booking.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: "cancelled" }
    });

    // Calculate Monthly Bookings
    const monthlyBookings = await Booking.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $ne: "cancelled" }
    });

    // Return the dashboard data
    return {
        dailyBookings,
        monthlyBookings,
        dailyProfit,
        monthlyProfit
    };
  }

  async getReportedPost(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ reportedPosts: ReportedPost[]; total: number }> {
    const skip = (page - 1) * limit;
  
    // Perform the aggregation with search and pagination
    const result = await ReportModel.aggregate([
      // Step 1: Lookup for post details
      {
        $lookup: {
          from: "dogposts",
          localField: "postId",
          foreignField: "_id",
          as: "postDetails",
        },
      },
      { $unwind: "$postDetails" },
  
      // Step 2: Lookup for reporter details
      {
        $lookup: {
          from: "users",
          localField: "reporterId",
          foreignField: "_id",
          as: "reporterDetails",
        },
      },
      { $unwind: "$reporterDetails" },
  
      // Step 3: Lookup for post user details
      {
        $lookup: {
          from: "users",
          localField: "postDetails.user",
          foreignField: "_id",
          as: "postUserDetails",
        },
      },
      { $unwind: "$postUserDetails" },
  
      // Step 4: Filter by search term (e.g., filtering on reporter or post user name)
      {
        $match: {
          $or: [
            { "reporterDetails.name": { $regex: searchTerm, $options: "i" } },
            { "postUserDetails.name": { $regex: searchTerm, $options: "i" } },
            { reason: { $regex: searchTerm, $options: "i" } },
          ],
        },
      },
  
      // Step 5: Project required fields
      {
        $project: {
          postId: 1,
          "postDetails.image": 1,
          "postUserDetails.name": 1,
          "reporterDetails.name": 1,
          "postDetails.is_block": 1,
          reason: 1,
          status: 1,
          createdAt: 1,
        },
      },
  
      // Step 6: Pagination with facet
      {
        $facet: {
          reportedPosts: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);
  
    // Extract results and total count
    const reportedPosts = result[0]?.reportedPosts || [];
    const total = result[0]?.totalCount[0]?.count || 0;
  
    return { reportedPosts, total };
  }

  async blockPost(postId: string): Promise<boolean> {
    try {
      const post = await DogPost.findById(postId);
     if(!post){
      throw new Error("post not found")
     }
     post.is_block=true
     await post.save();
     await ReportModel.updateMany(
      { postId: postId },
      {
          $set: { status: "Resolved", updatedAt: new Date() }
      }
  );
  return true;
     } catch (error) {
      throw new Error('error occured while blocking post');
     }
  }

  async unblockPost(postId: string): Promise<boolean> {
       try {
        const post = await DogPost.findById(postId)
        if(!post){
          throw new Error("post not found")
        }
        post.is_block = false
        await post.save()
        return true
       } catch (error) {
        throw new Error('error occured while blocking post');
       }
  }
}

export default adminRepository;
