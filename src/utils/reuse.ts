

 export function searchAndPagination(searchTerm:string,page:number,limit:number){
    const skip = (page-1) * limit
    const query = searchTerm?
    {
        isAdmin:false,$or:[
            {name:{$regex:searchTerm,$options:'i'}},
            {email:{$regex:searchTerm,$options:'i'}}
        ]
    }
    :{ isAdmin:false}
    return {query,skip}
}


export function kennelSearchAndPagination(searchTerm:string,page:number,limit:number){
    const skip = (page-1)*limit
    let query = {};

    if (searchTerm) {
      query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }
    return {query,skip}
}