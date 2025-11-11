export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city?: string;
  zipCode?: string;
  location: Location;
}

export interface Customer {
  id?: string;
  firstname: string;
  lastname: string;
  address: Address;
  _links?: {
    'stores-nearby'?: {
      href: string;
    };
  };
}

export interface CustomerResponse {
  _embedded: {
    customers: Customer[];
  };
}

