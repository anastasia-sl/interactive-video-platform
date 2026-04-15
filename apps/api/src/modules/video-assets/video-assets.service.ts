import type { VideoAssetDto, VideoAssetStatus } from '@interactive-video-platform/shared'
import { Types } from 'mongoose'
import { VideoAssetModel } from './video-asset.model'
import { HttpError } from '../../utils/http-error'

type CreateVideoAssetInput = {
    provider?: 'cloudinary'
    publicId: string
    secureUrl: string
    playbackUrl: string
    thumbnailUrl?: string
    durationSec?: number
    format?: string
    bytes?: number
    width?: number
    height?: number
    version?: number
    status?: VideoAssetStatus
    uploadedBy: string
}

type DbVideoAsset = {
    _id: Types.ObjectId | string
    provider: 'cloudinary'
    publicId: string
    secureUrl: string
    playbackUrl: string
    thumbnailUrl?: string
    durationSec?: number
    format?: string
    bytes?: number
    width?: number
    height?: number
    version?: number
    status: VideoAssetStatus
    uploadedBy: Types.ObjectId | string
    createdAt: Date | string
    updatedAt: Date | string
}

const toIso = (value: Date | string): string => new Date(value).toISOString()

export const toVideoAssetDto = (asset: DbVideoAsset): VideoAssetDto => {
    return {
        id: asset._id.toString(),
        provider: asset.provider,
        publicId: asset.publicId,
        secureUrl: asset.secureUrl,
        playbackUrl: asset.playbackUrl,
        thumbnailUrl: asset.thumbnailUrl,
        durationSec: asset.durationSec,
        format: asset.format,
        bytes: asset.bytes,
        width: asset.width,
        height: asset.height,
        version: asset.version,
        status: asset.status,
        uploadedBy: asset.uploadedBy.toString(),
        createdAt: toIso(asset.createdAt),
        updatedAt: toIso(asset.updatedAt)
    }
}

export class VideoAssetsService {
    static async create(input: CreateVideoAssetInput): Promise<VideoAssetDto> {
        const asset = await VideoAssetModel.create({
            provider: input.provider ?? 'cloudinary',
            publicId: input.publicId,
            secureUrl: input.secureUrl,
            playbackUrl: input.playbackUrl,
            thumbnailUrl: input.thumbnailUrl,
            durationSec: input.durationSec,
            format: input.format,
            bytes: input.bytes,
            width: input.width,
            height: input.height,
            version: input.version,
            status: input.status ?? 'ready',
            uploadedBy: input.uploadedBy
        })

        return toVideoAssetDto(asset.toObject() as DbVideoAsset)
    }

    static async getById(videoAssetId: string): Promise<DbVideoAsset> {
        if (!Types.ObjectId.isValid(videoAssetId)) {
            throw new HttpError(400, 'Invalid videoAssetId')
        }

        const asset = await VideoAssetModel.findById(videoAssetId)

        if (!asset) {
            throw new HttpError(400, 'Video asset not found')
        }

        return asset.toObject() as DbVideoAsset
    }

    static async validateReady(videoAssetId: string): Promise<DbVideoAsset> {
        const asset = await this.getById(videoAssetId)

        if (asset.status !== 'ready') {
            throw new HttpError(400, 'Video asset is not ready')
        }

        return asset
    }
}