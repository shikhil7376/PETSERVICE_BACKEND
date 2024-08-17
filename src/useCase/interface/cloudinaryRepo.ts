interface cloudinaryI{
    uploadImage(image:any,folderName:string):Promise<string>,
    uploadMultipleimages(images:any[],folderName:string):Promise<string[]>
}

export default cloudinaryI