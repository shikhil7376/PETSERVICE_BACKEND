import mongoose from "mongoose"


export interface Report {
    reporterId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    reason: string;
    status?: 'Pending' | 'Resolved'; 
    createdAt?: Date;  
    updatedAt?: Date;  
  }

  export interface reportPost{
    userId:string,
    postId:string,
    description:string
  }

  export interface ReportedPost{
    postId: string; 
    postDetails:{
      image:string,
      is_block: boolean;
    },
    postUserDetails:{
      name:string
    },
    reporterDetails:{
      name:string
    },
    reason:string,
    status:string,
    createdAt:Date
  }