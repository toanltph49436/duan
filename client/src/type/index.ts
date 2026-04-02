export interface Destination {
    _id: string;
    locationName: string;
    country: string;
}

export interface Tour {
    _id: number;
    nameTour: string;
    destination: Destination;
    departure_location: string;
    duration: number;
    price: number;
    finalPrice: number;
    discountPercent: number;
    discount_expiry_date: string;
    remainingSlots: number;
    max_people: number;
    imageTour: string;
    status: string;
    description: string;
    tour_type: string;
    featured: boolean;
    total_sold: number;
  }




export interface User {
    user_id: number;
    name: string;
    email: string;
    phone: string;
}

export interface Hotel {
    hotel_id: number;
    name: string;
    address: string;
    rating: number;
    image: string;

}
