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
}

export default adminRepository;
