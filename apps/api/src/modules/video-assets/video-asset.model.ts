import { Schema, model } from 'mongoose'
import { VIDEO_ASSET_PROVIDERS, VIDEO_ASSET_STATUSES } from '@interactive-video-platform/shared'

const videoAssetSchema = new Schema(
    {
        provider: {
            type: String,
            enum: VIDEO_ASSET_PROVIDERS,
            required: true,
            default: 'cloudinary',
            index: true
        },
        publicId: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true
        },
        secureUrl: {
            type: String,
            required: true,
            trim: true
        },
        playbackUrl: {
            type: String,
            required: true,
            trim: true
        },
        thumbnailUrl: {
            type: String,
            trim: true
        },
        durationSec: {
            type: Number,
            min: 0
        },
        format: {
            type: String,
            trim: true
        },
        bytes: {
            type: Number,
            min: 0
        },
        width: {
            type: Number,
            min: 0
        },
        height: {
            type: Number,
            min: 0
        },
        version: {
            type: Number,
            min: 0
        },
        status: {
            type: String,
            enum: VIDEO_ASSET_STATUSES,
            required: true,
            default: 'processing',
            index: true
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        }
    },
    {
        timestamps: true
    }
)

export const VideoAssetModel = model('VideoAsset', videoAssetSchema)