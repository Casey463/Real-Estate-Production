export type BackendListing = {
  id: number;
  listing_price: string;
  street_name: string;
  geocoded_address: string;
  latitude: string;
  longitude: string;
  property_sub_type?: string;
  current_price?: string;
  bedrooms: number;
  bathrooms: string;
  square_footage: string;
  year_built: number;
  marketing_remarks: string;
  lot_sqft: string;
  parking_type: string;
  heating_cooling_type: string;
  floor_covering: string;
  association_dues: string;
  roof: string;
  // image_urls?: string[];
  // ...add more fields as needed
};

export type Listing = {
  id: number;
  name: string;
  price: number;
  address: string;
  type: string;
  rating: number;
  coordinates: { lat: number; lng: number };
  imageUrl: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  description: string;
  lotSize: string;
  parking: string;
  heating: string;
  flooring: string;
  hoa: string;
  roof: string;
  // ...add more fields as needed
};

export type ZipItem = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    GEOID: string;
  };
};
