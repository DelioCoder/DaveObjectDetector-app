export interface DetectorResponse {
    objects: DetectedObject[];
}

export interface DetectedObject {
    label: string;
    bbox:  number[];
}
