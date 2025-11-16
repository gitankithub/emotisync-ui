export class Reservation {
  constructor(
    public propertyName: string,
    public roomNumber: number,
    public checkInDate: string,
    public checkOutDate: string,
    public roomType: string,
    public bedrooms: number,
    public numberOfOccupants: number,
    public imageUrl: string,
    public status?: 'upcoming' | 'checkedin' | 'completed' | 'cancelled',
    public guestId?: string
  ) {}
}