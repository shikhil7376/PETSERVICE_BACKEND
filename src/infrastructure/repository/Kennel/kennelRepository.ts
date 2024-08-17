import KennelOwnerModel from "../../database/kennelOwnerModel";
import KennelRepo from "../../../useCase/interface/Kennel/KennelRepo";
import kennelOwner from "../../../domain/kennelOwner";

class KennelRepository implements KennelRepo{
   async findByEmail(email: string): Promise<kennelOwner | null> {
       const data = await KennelOwnerModel.findOne({email:email})
       return data
   }
   async save(user: kennelOwner): Promise<kennelOwner> {
       const newKennelOwner = new KennelOwnerModel(user)
       const savedUser = newKennelOwner.save()
       return savedUser

   }
  
}

export default KennelRepository