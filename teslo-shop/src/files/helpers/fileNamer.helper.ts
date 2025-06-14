
export const fileNamer: (req: Request, file: Express.Multer.File, callback: Function) => void = (req: Request, file: Express.Multer.File, callback: Function) => {
    if (!file) return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];

    const fileName = `Holamundo.${fileExtension}`;
    
    return callback(null, fileName);
}