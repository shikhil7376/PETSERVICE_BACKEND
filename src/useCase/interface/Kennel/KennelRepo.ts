import kennelOwner from "../../../domain/kennelOwner";


interface KennelRepo{
    findByEmail(email:string):Promise<kennelOwner|null>
    save(user:kennelOwner):Promise<kennelOwner>
}

export default KennelRepo