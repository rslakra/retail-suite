export interface StoreLocation {
  x: number;
  y: number;
}

export interface StoreAddress {
  city: string;
  zip?: string;
  location: StoreLocation;
}

export interface Store {
  id?: string;
  name: string;
  address: StoreAddress;
  latitude?: number;
  longitude?: number;
  icon?: string;
}

export interface StoreResponse {
  _embedded: {
    stores: Store[];
  };
}

