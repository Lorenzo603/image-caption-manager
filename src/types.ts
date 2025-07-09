/**
 * Type definitions for the Image Caption Manager extension
 */

export interface ImageCaptionPair {
    /** Full path to the image file */
    imagePath: string;
    
    /** Full path to the caption text file */
    captionPath: string;
    
    /** Base name without extension */
    baseName: string;
    
    /** Current caption text content */
    caption: string;
    
    /** Whether the caption has been modified */
    isDirty: boolean;
}

export interface ImageCaptionManagerState {
    /** List of all image-caption pairs found */
    pairs: ImageCaptionPair[];
    
    /** Index of currently selected pair */
    currentIndex: number;
    
    /** Root folder being watched */
    rootFolder: string;
}

export interface WebviewMessage {
    type: 'navigateNext' | 'navigatePrevious' | 'navigateNext10' | 'navigatePrevious10' | 'navigateNext100' | 'navigatePrevious100' | 'saveCaption' | 'refresh' | 'updateCaption' | 'countTokens';
    payload?: any;
}

export interface WebviewStateUpdate {
    type: 'updatePair' | 'updateIndex' | 'updateList' | 'tokenCount';
    payload: {
        currentPair?: ImageCaptionPair;
        currentIndex?: number;
        totalCount?: number;
        pairs?: ImageCaptionPair[];
        count?: number;
    };
}

export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
