export class Reservation {
  constructor(
    public hotelName: string,
    public checkIn: string,
    public checkOut: string,
    public roomType: string,
    public bedrooms: number,
    public guests: number,
    public imageUrl: string,
    public status?: 'upcoming' | 'checkedin' | 'completed' | 'cancelled'
  ) {}
}