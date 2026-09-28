export interface TravelerOnboardingData {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  interests: string[];
}

export interface FarmerStep1Data {
  farmName: string;
  tagline: string;
  address: string;
  municipality: string;
  province: string;
  region: string;
}

export interface FarmerStep2Data {
  farmType: string;
  landArea: string;
  crops: string;
  livestock: string;
  facilities: string;
  offersStays: boolean;
  offersTours: boolean;
  storyAndTerroir: string;
}

export interface FarmerStep3Data {
  farmerBio: string;
  farmDescription: string;
  avatarUrl?: string;
  coverImageUrl?: string;
}

export interface FarmerFullOnboardingData extends FarmerStep1Data, FarmerStep2Data, FarmerStep3Data {}
