export const VIDEO_ASSET_PROVIDERS = ['cloudinary'] as const
export type VideoAssetProvider = (typeof VIDEO_ASSET_PROVIDERS)[number]

export const VIDEO_ASSET_STATUSES = ['uploading', 'processing', 'ready', 'failed'] as const
export type VideoAssetStatus = (typeof VIDEO_ASSET_STATUSES)[number]

export interface VideoAssetDto {
    id: string
    provider: VideoAssetProvider
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
    uploadedBy: string
    createdAt: string
    updatedAt: string
}