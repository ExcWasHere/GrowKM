import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { EnvBindings } from "../../types/env";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from "../../middlewares/error.middleware";

export const storageService = {

    async generatePresignedUrl(
        env: Partial<EnvBindings>,
        fileName: string,
        contentType: string,
        folder: string = 'receipts'
    ) {
        try {

            const s3Client = new S3Client({
                region: 'auto',
                endpoint: env.R2_ENDPOINT!,
                credentials: {
                    accessKeyId: env.R2_ACCESS_KEY_ID!,
                    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
                },
            });

            const uniqueFileName = `${folder}/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

            // generate a presigned URL for uploading the file
            const command = new PutObjectCommand({
                Bucket: env.R2_BUCKET_NAME!,
                Key: uniqueFileName,
                ContentType: contentType,
            });

            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); 
            const publicUrl = `${env.R2_PUBLIC_URL}/${uniqueFileName}`;

            return {
                uploadUrl,
                publicUrl,
                fileKey: uniqueFileName,
            };


        } catch (error) {
            console.error('Error generating presigned URL:', error);
            throw new AppError(500,'Failed to generate presigned URL');
        }

        } 
}
